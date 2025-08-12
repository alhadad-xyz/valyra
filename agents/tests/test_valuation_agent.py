import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

import httpx
import redis

# Import the agent class (we need to mock some dependencies first)
with patch('redis.from_url'), \
     patch('uagents.Agent'), \
     patch('uagents.setup.fund_agent_if_low'), \
     patch('prometheus_client.start_http_server'):
    from valuation_agent import ValuationAgent, Config


class TestValuationAgent:
    
    @pytest.fixture
    def mock_redis(self):
        return MagicMock()
    
    @pytest.fixture  
    def mock_http_client(self):
        return AsyncMock()
    
    @pytest.fixture
    def agent(self, mock_redis, mock_http_client):
        with patch('redis.from_url', return_value=mock_redis), \
             patch('uagents.Agent'), \
             patch('uagents.setup.fund_agent_if_low'), \
             patch('prometheus_client.start_http_server'), \
             patch('httpx.AsyncClient', return_value=mock_http_client):
            
            agent = ValuationAgent()
            agent.redis_client = mock_redis
            agent.http_client = mock_http_client
            return agent
    
    def test_init_agent(self, agent):
        """Test agent initialization"""
        assert agent.processed_count == 0
        assert agent.error_count == 0
        assert len(agent.processed_listings) == 0
        assert agent.last_poll_time is None
    
    @pytest.mark.asyncio
    async def test_get_listing_ids_success(self, agent):
        """Test successful retrieval of listing IDs"""
        mock_response = MagicMock()
        mock_response.json.return_value = [1, 2, 3, 4, 5]
        mock_response.raise_for_status.return_value = None
        agent.http_client.get.return_value = mock_response
        
        listing_ids = await agent.get_listing_ids()
        
        assert listing_ids == [1, 2, 3, 4, 5]
        agent.http_client.get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_listing_ids_with_retries(self, agent):
        """Test listing IDs retrieval with retries on failure"""
        # First call fails, second succeeds
        mock_response_fail = MagicMock()
        mock_response_fail.raise_for_status.side_effect = httpx.HTTPError("Connection failed")
        
        mock_response_success = MagicMock()
        mock_response_success.json.return_value = [1, 2, 3]
        mock_response_success.raise_for_status.return_value = None
        
        agent.http_client.get.side_effect = [
            mock_response_fail,
            mock_response_success
        ]
        
        listing_ids = await agent.get_listing_ids()
        
        assert listing_ids == [1, 2, 3]
        assert agent.http_client.get.call_count == 2
    
    @pytest.mark.asyncio
    async def test_get_listing_details_success(self, agent):
        """Test successful retrieval of listing details"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "Ok": {
                "id": 1,
                "title": "Test Business",
                "arr_usd": 100000,
                "mrr_usd": 8333,
                "updated_at": 1234567890
            }
        }
        mock_response.raise_for_status.return_value = None
        agent.http_client.get.return_value = mock_response
        
        listing = await agent.get_listing_details(1)
        
        assert listing["id"] == 1
        assert listing["title"] == "Test Business"
        agent.http_client.get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_listing_details_not_found(self, agent):
        """Test handling of non-existent listing"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"Err": "Listing not found"}
        mock_response.raise_for_status.return_value = None
        agent.http_client.get.return_value = mock_response
        
        listing = await agent.get_listing_details(999)
        
        assert listing is None
    
    @pytest.mark.asyncio
    async def test_get_cached_valuation_success(self, agent):
        """Test successful cache retrieval"""
        cached_data = {
            "dcf_valuation": 500000,
            "confidence_score": 0.85,
            "timestamp": 1234567890
        }
        agent.redis_client.get.return_value = json.dumps(cached_data)
        
        result = await agent.get_cached_valuation("valuation:1")
        
        assert result == cached_data
        agent.redis_client.get.assert_called_once_with("valuation:1")
    
    @pytest.mark.asyncio
    async def test_get_cached_valuation_miss(self, agent):
        """Test cache miss"""
        agent.redis_client.get.return_value = None
        
        result = await agent.get_cached_valuation("valuation:1")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_get_cached_valuation_redis_error(self, agent):
        """Test Redis connection error handling"""
        agent.redis_client.get.side_effect = redis.ConnectionError("Connection failed")
        
        result = await agent.get_cached_valuation("valuation:1")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_cache_valuation_success(self, agent):
        """Test successful cache storage"""
        valuation_data = {
            "dcf_valuation": 500000,
            "confidence_score": 0.85,
            "timestamp": 1234567890
        }
        
        await agent.cache_valuation("valuation:1", valuation_data)
        
        agent.redis_client.setex.assert_called_once_with(
            "valuation:1",
            Config.CACHE_TTL,
            json.dumps(valuation_data)
        )
    
    @pytest.mark.asyncio
    async def test_cache_valuation_redis_error(self, agent):
        """Test Redis error handling during cache storage"""
        agent.redis_client.setex.side_effect = redis.ConnectionError("Connection failed")
        valuation_data = {"dcf_valuation": 500000}
        
        # Should not raise exception
        await agent.cache_valuation("valuation:1", valuation_data)
    
    @pytest.mark.asyncio
    async def test_call_valuation_engine_success(self, agent):
        """Test successful valuation engine call"""
        listing = {
            "id": 1,
            "title": "Test Business",
            "arr_usd": 100000,
            "mrr_usd": 8333,
            "net_profit_usd": 50000,
            "status": "Active"
        }
        
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "Ok": {
                "dcf_valuation": 500000,
                "valuation_range_low": 400000,
                "valuation_range_high": 600000,
                "confidence_score": 0.85,
                "timestamp": 1234567890,
                "deal_id": "1",
                "arr_multiple": 5.0,
                "risk_factors": ["High churn rate"],
                "market_comparable": 550000
            }
        }
        mock_response.raise_for_status.return_value = None
        agent.http_client.post.return_value = mock_response
        
        result = await agent.call_valuation_engine(listing)
        
        assert result["dcf_valuation"] == 500000
        assert result["confidence_score"] == 0.85
        agent.http_client.post.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_call_valuation_engine_error(self, agent):
        """Test valuation engine error response"""
        listing = {"id": 1, "title": "Test Business"}
        
        mock_response = MagicMock()
        mock_response.json.return_value = {"Err": "Invalid deal data"}
        mock_response.raise_for_status.return_value = None
        agent.http_client.post.return_value = mock_response
        
        result = await agent.call_valuation_engine(listing)
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_process_listing_needs_update(self, agent):
        """Test processing listing that needs valuation update"""
        # Mock listing details
        listing = {
            "id": 1,
            "title": "Test Business",
            "updated_at": 2000000000,  # Recent update
            "arr_usd": 100000
        }
        
        # Mock no cached valuation
        agent.get_listing_details = AsyncMock(return_value=listing)
        agent.get_cached_valuation = AsyncMock(return_value=None)
        agent.trigger_valuation = AsyncMock()
        
        # Mock context
        mock_ctx = MagicMock()
        
        await agent.process_listing(mock_ctx, 1)
        
        agent.trigger_valuation.assert_called_once_with(mock_ctx, listing)
        assert agent.processed_count == 1
    
    @pytest.mark.asyncio
    async def test_process_listing_no_update_needed(self, agent):
        """Test processing listing that doesn't need update"""
        # Mock listing details
        listing = {
            "id": 1,
            "title": "Test Business", 
            "updated_at": 1000000000,  # Old update
            "arr_usd": 100000
        }
        
        # Mock cached valuation that's newer
        cached_valuation = {
            "timestamp": 1500000000,  # Newer than listing update
            "dcf_valuation": 500000
        }
        
        agent.get_listing_details = AsyncMock(return_value=listing)
        agent.get_cached_valuation = AsyncMock(return_value=cached_valuation)
        agent.trigger_valuation = AsyncMock()
        
        # Mock context
        mock_ctx = MagicMock()
        
        await agent.process_listing(mock_ctx, 1)
        
        # Should not trigger valuation
        agent.trigger_valuation.assert_not_called()
        assert agent.processed_count == 0  # No processing done
    
    @pytest.mark.asyncio
    async def test_poll_and_process_listings(self, agent):
        """Test complete polling and processing cycle"""
        # Mock listing IDs
        agent.get_listing_ids = AsyncMock(return_value=[1, 2, 3])
        agent.process_listing = AsyncMock()
        
        # Mock context
        mock_ctx = MagicMock()
        
        await agent.poll_and_process_listings(mock_ctx)
        
        # Should process all listings
        assert agent.process_listing.call_count == 3
        agent.process_listing.assert_any_call(mock_ctx, 1)
        agent.process_listing.assert_any_call(mock_ctx, 2)
        agent.process_listing.assert_any_call(mock_ctx, 3)


class TestHealthEndpoint:
    
    @pytest.mark.asyncio
    async def test_health_check_healthy(self):
        """Test health check when everything is working"""
        with patch('redis.from_url') as mock_redis_from_url, \
             patch('uagents.Agent'), \
             patch('uagents.setup.fund_agent_if_low'), \
             patch('prometheus_client.start_http_server'):
            
            mock_redis = MagicMock()
            mock_redis.ping.return_value = True
            mock_redis_from_url.return_value = mock_redis
            
            agent = ValuationAgent()
            agent.last_poll_time = datetime.utcnow()
            agent.processed_count = 5
            agent.error_count = 0
            
            # Test the health check endpoint
            from fastapi.testclient import TestClient
            client = TestClient(agent.app)
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["redis_connected"] == True
            assert data["processed_listings"] == 5
            assert data["error_count"] == 0
    
    @pytest.mark.asyncio 
    async def test_health_check_degraded(self):
        """Test health check when Redis is down"""
        with patch('redis.from_url') as mock_redis_from_url, \
             patch('uagents.Agent'), \
             patch('uagents.setup.fund_agent_if_low'), \
             patch('prometheus_client.start_http_server'):
            
            mock_redis = MagicMock()
            mock_redis.ping.side_effect = redis.ConnectionError("Connection failed")
            mock_redis_from_url.return_value = mock_redis
            
            agent = ValuationAgent()
            agent.error_count = 2
            
            # Test the health check endpoint
            from fastapi.testclient import TestClient
            client = TestClient(agent.app)
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "degraded"
            assert data["redis_connected"] == False
            assert data["error_count"] == 2


if __name__ == "__main__":
    pytest.main([__file__])