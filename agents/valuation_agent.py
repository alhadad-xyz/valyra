from uagents import Agent, Context
from uagents.setup import fund_agent_if_low
import httpx
import asyncio
from typing import List, Dict
from pydantic import BaseModel


class DealData(BaseModel):
    id: int
    company_name: str
    revenue: int
    valuation: int


class ValuationAgent:
    def __init__(self, name: str = "valuation_agent"):
        self.agent = Agent(
            name=name,
            port=8001,
            seed="valuation_seed_phrase",
            endpoint=["http://127.0.0.1:8001/submit"]
        )
        
        fund_agent_if_low(self.agent.wallet.address())
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            ctx.logger.info("Valuation Agent starting up...")
            
        @self.agent.on_interval(period=30.0)
        async def poll_listings(ctx: Context):
            """Poll ListingRegistry for new deals and trigger valuation"""
            try:
                async with httpx.AsyncClient() as client:
                    # Call ICP canister endpoint
                    response = await client.get("http://localhost:4943/api/v2/canisters/listing_registry/query")
                    if response.status_code == 200:
                        deals = response.json()
                        for deal in deals:
                            await self.trigger_valuation(ctx, deal)
            except Exception as e:
                ctx.logger.error(f"Error polling listings: {e}")
    
    async def trigger_valuation(self, ctx: Context, deal: Dict):
        """Trigger valuation engine for a specific deal"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "deal_id": deal["id"],
                    "revenue": deal["revenue"],
                    "market_data": {}
                }
                response = await client.post(
                    "http://localhost:4943/api/v2/canisters/valuation_engine/update",
                    json=payload
                )
                if response.status_code == 200:
                    ctx.logger.info(f"Triggered valuation for deal {deal['id']}")
                else:
                    ctx.logger.error(f"Failed to trigger valuation: {response.text}")
        except Exception as e:
            ctx.logger.error(f"Error triggering valuation: {e}")
    
    def run(self):
        self.agent.run()


if __name__ == "__main__":
    agent = ValuationAgent()
    agent.run()