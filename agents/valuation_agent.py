import asyncio
import os
import time
import json
from typing import List, Dict, Optional, Set
from datetime import datetime, timedelta

import httpx
import redis
import structlog
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from uagents import Agent, Context
from uagents.setup import fund_agent_if_low
from prometheus_client import Counter, Histogram, Gauge, start_http_server


# Configuration
class Config:
    LISTING_REGISTRY_URL = os.getenv("LISTING_REGISTRY_URL", "http://localhost:4943/api/v2/canisters/listing_registry")
    VALUATION_ENGINE_URL = os.getenv("VALUATION_ENGINE_URL", "http://localhost:4943/api/v2/canisters/valuation_engine")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    POLLING_INTERVAL = int(os.getenv("POLLING_INTERVAL", "300"))  # 5 minutes
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_BACKOFF_BASE = float(os.getenv("RETRY_BACKOFF_BASE", "2.0"))
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour
    HEALTH_CHECK_PORT = int(os.getenv("HEALTH_CHECK_PORT", "8080"))
    METRICS_PORT = int(os.getenv("METRICS_PORT", "8090"))


# Data Models
class DealNFT(BaseModel):
    id: int
    status: str
    website_url: str
    title: str
    updated_at: int
    ltv_usd: int
    cac_usd: int
    gross_margin_pct: float
    mrr_usd: int
    arr_usd: int
    attachments_cid: Optional[str]
    net_profit_usd: int
    description: str
    gdpr_compliant: bool
    created_at: int
    num_employees: int
    logo_url: str
    tax_id: str
    seller_principal: str
    registered_address: str
    business_structure: str
    customer_base: str
    annual_operating_expenses_usd: int
    tech_stack: str
    churn_pct: float


class ValuationResult(BaseModel):
    valuation_range_high: int
    market_comparable: Optional[int]
    valuation_range_low: int
    risk_factors: List[str]
    timestamp: int
    dcf_valuation: int
    deal_id: str
    arr_multiple: float
    confidence_score: float


class HealthStatus(BaseModel):
    status: str
    timestamp: str
    redis_connected: bool
    last_poll_time: Optional[str]
    processed_listings: int
    error_count: int


# Metrics
listings_processed = Counter('valuation_agent_listings_processed_total', 'Total listings processed')
listings_errors = Counter('valuation_agent_listings_errors_total', 'Total listing processing errors')
valuation_requests = Counter('valuation_agent_valuation_requests_total', 'Total valuation requests')
valuation_errors = Counter('valuation_agent_valuation_errors_total', 'Total valuation errors')
polling_duration = Histogram('valuation_agent_polling_duration_seconds', 'Time spent polling')
valuation_duration = Histogram('valuation_agent_valuation_duration_seconds', 'Time spent on valuations')
cached_valuations = Gauge('valuation_agent_cached_valuations', 'Number of cached valuations')
redis_operations = Counter('valuation_agent_redis_operations_total', 'Total Redis operations', ['operation', 'status'])


class ValuationAgent:
    def __init__(self, name: str = "valuation_agent"):
        # Setup structured logging
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
        self.logger = structlog.get_logger()
        
        # Initialize Redis client
        try:
            self.redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
            self.redis_client.ping()
            self.logger.info("Redis connection established")
        except Exception as e:
            self.logger.error("Redis connection failed", error=str(e))
            self.redis_client = None
        
        # Initialize HTTP client with timeout and retries
        self.http_client = httpx.AsyncClient(
            timeout=30.0,
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=100)
        )
        
        # Tracking variables
        self.processed_listings: Set[int] = set()
        self.last_poll_time: Optional[datetime] = None
        self.error_count = 0
        self.processed_count = 0
        
        # Initialize uAgent
        self.agent = Agent(
            name=name,
            port=8001,
            seed="valuation_seed_phrase",
            endpoint=["http://127.0.0.1:8001/submit"]
        )
        
        fund_agent_if_low(self.agent.wallet.address())
        
        # Setup FastAPI for health checks
        self.app = FastAPI(title="Valuation Agent Health Check")
        self.setup_health_endpoints()
        
        # Setup agent event handlers
        self.setup_agent_handlers()
        
        # Start metrics server
        start_http_server(Config.METRICS_PORT)
        self.logger.info(f"Metrics server started on port {Config.METRICS_PORT}")
    
    def setup_health_endpoints(self):
        @self.app.get("/health", response_model=HealthStatus)
        async def health_check():
            redis_connected = False
            if self.redis_client:
                try:
                    self.redis_client.ping()
                    redis_connected = True
                except:
                    pass
            
            return HealthStatus(
                status="healthy" if redis_connected else "degraded",
                timestamp=datetime.utcnow().isoformat(),
                redis_connected=redis_connected,
                last_poll_time=self.last_poll_time.isoformat() if self.last_poll_time else None,
                processed_listings=self.processed_count,
                error_count=self.error_count
            )
        
        @self.app.get("/metrics")
        async def metrics():
            # Additional custom metrics endpoint if needed
            return {"message": "Prometheus metrics available at /metrics on port 8090"}
    
    def setup_agent_handlers(self):
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            self.logger.info("Valuation Agent starting up", agent_address=self.agent.address)
            
            # Start health check server
            import uvicorn
            config = uvicorn.Config(
                app=self.app,
                host="0.0.0.0",
                port=Config.HEALTH_CHECK_PORT,
                log_level="info"
            )
            server = uvicorn.Server(config)
            asyncio.create_task(server.serve())
            
            self.logger.info(f"Health check server started on port {Config.HEALTH_CHECK_PORT}")
            
        @self.agent.on_interval(period=Config.POLLING_INTERVAL)
        async def poll_listings(ctx: Context):
            """Poll ListingRegistry every 5 minutes for new/updated listings"""
            start_time = time.time()
            
            try:
                with polling_duration.time():
                    await self.poll_and_process_listings(ctx)
                self.last_poll_time = datetime.utcnow()
                self.logger.info("Polling cycle completed successfully")
                
            except Exception as e:
                self.error_count += 1
                self.logger.error("Polling cycle failed", error=str(e), error_type=type(e).__name__)
                listings_errors.inc()
            
            duration = time.time() - start_time
            self.logger.info("Polling cycle finished", duration_seconds=duration)
    
    async def poll_and_process_listings(self, ctx: Context):
        """Poll ListingRegistry and process all listings"""
        try:
            # Get all listing IDs
            listing_ids = await self.get_listing_ids()
            self.logger.info(f"Found {len(listing_ids)} listings to check")
            
            # Process each listing
            for listing_id in listing_ids:
                try:
                    await self.process_listing(ctx, listing_id)
                    await asyncio.sleep(0.1)  # Small delay to prevent overwhelming the system
                except Exception as e:
                    self.logger.error(f"Failed to process listing {listing_id}", error=str(e))
                    listings_errors.inc()
                    
        except Exception as e:
            self.logger.error("Failed to poll listings", error=str(e))
            raise
    
    async def get_listing_ids(self) -> List[int]:
        """Get all listing IDs from ListingRegistry"""
        for attempt in range(Config.MAX_RETRIES):
            try:
                response = await self.http_client.get(
                    f"{Config.LISTING_REGISTRY_URL}/query",
                    params={"method": "list_ids"}
                )
                response.raise_for_status()
                data = response.json()
                
                if isinstance(data, list):
                    return data
                else:
                    return data.get("ids", [])
                    
            except Exception as e:
                wait_time = Config.RETRY_BACKOFF_BASE ** attempt
                self.logger.warning(
                    f"Attempt {attempt + 1} failed to get listing IDs",
                    error=str(e),
                    retry_in_seconds=wait_time
                )
                if attempt < Config.MAX_RETRIES - 1:
                    await asyncio.sleep(wait_time)
                else:
                    raise
    
    async def process_listing(self, ctx: Context, listing_id: int):
        """Process a single listing: get data, check cache, trigger valuation if needed"""
        try:
            # Get listing details
            listing = await self.get_listing_details(listing_id)
            if not listing:
                return
            
            # Check if we need to update valuation
            cache_key = f"valuation:{listing_id}"
            cached_valuation = await self.get_cached_valuation(cache_key)
            
            needs_update = False
            if not cached_valuation:
                needs_update = True
                self.logger.info(f"No cached valuation for listing {listing_id}")
            else:
                # Check if listing was updated after last valuation
                cached_time = cached_valuation.get("timestamp", 0)
                listing_updated = listing.get("updated_at", 0)
                if listing_updated > cached_time:
                    needs_update = True
                    self.logger.info(f"Listing {listing_id} updated since last valuation")
            
            if needs_update:
                await self.trigger_valuation(ctx, listing)
                self.processed_count += 1
                listings_processed.inc()
            
        except Exception as e:
            self.logger.error(f"Failed to process listing {listing_id}", error=str(e))
            raise
    
    async def get_listing_details(self, listing_id: int) -> Optional[Dict]:
        """Get detailed listing information"""
        for attempt in range(Config.MAX_RETRIES):
            try:
                response = await self.http_client.get(
                    f"{Config.LISTING_REGISTRY_URL}/query",
                    params={"method": "get_deal", "deal_id": listing_id}
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("Ok"):
                    return data["Ok"]
                else:
                    self.logger.warning(f"Listing {listing_id} not found or error: {data.get('Err')}")
                    return None
                    
            except Exception as e:
                wait_time = Config.RETRY_BACKOFF_BASE ** attempt
                self.logger.warning(
                    f"Attempt {attempt + 1} failed to get listing {listing_id}",
                    error=str(e),
                    retry_in_seconds=wait_time
                )
                if attempt < Config.MAX_RETRIES - 1:
                    await asyncio.sleep(wait_time)
                else:
                    raise
    
    async def get_cached_valuation(self, cache_key: str) -> Optional[Dict]:
        """Get valuation from Redis cache"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            redis_operations.labels(operation='get', status='success').inc()
            
            if cached_data:
                return json.loads(cached_data)
            return None
            
        except Exception as e:
            redis_operations.labels(operation='get', status='error').inc()
            self.logger.error(f"Redis get failed for {cache_key}", error=str(e))
            return None
    
    async def cache_valuation(self, cache_key: str, valuation: Dict):
        """Cache valuation result in Redis"""
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(
                cache_key,
                Config.CACHE_TTL,
                json.dumps(valuation)
            )
            redis_operations.labels(operation='set', status='success').inc()
            cached_valuations.inc()
            
        except Exception as e:
            redis_operations.labels(operation='set', status='error').inc()
            self.logger.error(f"Redis set failed for {cache_key}", error=str(e))
    
    async def trigger_valuation(self, ctx: Context, listing: Dict):
        """Trigger valuation engine for a specific listing"""
        start_time = time.time()
        listing_id = listing.get("id")
        
        try:
            with valuation_duration.time():
                # Call ValuationEngine
                valuation_result = await self.call_valuation_engine(listing)
                
                if valuation_result:
                    # Cache the result
                    cache_key = f"valuation:{listing_id}"
                    await self.cache_valuation(cache_key, valuation_result)
                    
                    self.logger.info(
                        f"Valuation completed for listing {listing_id}",
                        dcf_valuation=valuation_result.get("dcf_valuation"),
                        confidence_score=valuation_result.get("confidence_score")
                    )
                    
                    valuation_requests.inc()
                else:
                    self.logger.warning(f"No valuation result for listing {listing_id}")
                    
        except Exception as e:
            valuation_errors.inc()
            self.logger.error(
                f"Valuation failed for listing {listing_id}",
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    async def call_valuation_engine(self, listing: Dict) -> Optional[Dict]:
        """Call ValuationEngine canister to calculate valuation"""
        listing_id = listing.get("id")
        
        for attempt in range(Config.MAX_RETRIES):
            try:
                # Prepare the listing data for the valuation engine
                deal_nft = {
                    "id": listing.get("id"),
                    "status": listing.get("status", "Active"),
                    "website_url": listing.get("website_url", ""),
                    "title": listing.get("title", ""),
                    "updated_at": listing.get("updated_at", int(time.time() * 1000000000)),
                    "ltv_usd": listing.get("ltv_usd", 0),
                    "cac_usd": listing.get("cac_usd", 0),
                    "gross_margin_pct": listing.get("gross_margin_pct", 0.0),
                    "mrr_usd": listing.get("mrr_usd", 0),
                    "arr_usd": listing.get("arr_usd", 0),
                    "attachments_cid": listing.get("attachments_cid"),
                    "net_profit_usd": listing.get("net_profit_usd", 0),
                    "description": listing.get("description", ""),
                    "gdpr_compliant": listing.get("gdpr_compliant", False),
                    "created_at": listing.get("created_at", int(time.time() * 1000000000)),
                    "num_employees": listing.get("num_employees", 1),
                    "logo_url": listing.get("logo_url", ""),
                    "tax_id": listing.get("tax_id", ""),
                    "seller_principal": listing.get("seller_principal", ""),
                    "registered_address": listing.get("registered_address", ""),
                    "business_structure": listing.get("business_structure", "LLC"),
                    "customer_base": listing.get("customer_base", ""),
                    "annual_operating_expenses_usd": listing.get("annual_operating_expenses_usd", 0),
                    "tech_stack": listing.get("tech_stack", ""),
                    "churn_pct": listing.get("churn_pct", 0.0)
                }
                
                response = await self.http_client.post(
                    f"{Config.VALUATION_ENGINE_URL}/update",
                    json={
                        "method": "calculate_valuation_from_deal",
                        "deal": deal_nft
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("Ok"):
                    return data["Ok"]
                else:
                    self.logger.error(
                        f"Valuation engine returned error for listing {listing_id}",
                        error=data.get("Err")
                    )
                    return None
                    
            except Exception as e:
                wait_time = Config.RETRY_BACKOFF_BASE ** attempt
                self.logger.warning(
                    f"Attempt {attempt + 1} failed to get valuation for listing {listing_id}",
                    error=str(e),
                    retry_in_seconds=wait_time
                )
                if attempt < Config.MAX_RETRIES - 1:
                    await asyncio.sleep(wait_time)
                else:
                    raise
    
    def run(self):
        """Start the valuation agent"""
        self.logger.info("Starting Valuation Agent", config={
            "polling_interval": Config.POLLING_INTERVAL,
            "redis_url": Config.REDIS_URL,
            "listing_registry_url": Config.LISTING_REGISTRY_URL,
            "valuation_engine_url": Config.VALUATION_ENGINE_URL,
            "health_check_port": Config.HEALTH_CHECK_PORT,
            "metrics_port": Config.METRICS_PORT
        })
        
        try:
            self.agent.run()
        except KeyboardInterrupt:
            self.logger.info("Shutting down Valuation Agent")
        except Exception as e:
            self.logger.error("Valuation Agent crashed", error=str(e))
            raise
        finally:
            asyncio.run(self.cleanup())
    
    async def cleanup(self):
        """Cleanup resources"""
        self.logger.info("Cleaning up resources")
        
        if self.http_client:
            await self.http_client.aclose()
        
        if self.redis_client:
            self.redis_client.close()


if __name__ == "__main__":
    agent = ValuationAgent()
    agent.run()