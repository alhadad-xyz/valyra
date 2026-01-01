from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_listing_rate_limit():
    # Helper to clear limits if using memory, but checking behavior
    # We expect 100/minute.
    # It might be hard to test 100 requests in a unit test without being slow.
    # But checking if the headers are present or if we can hit it is good.
    # Or strict check?
    # Let's try hitting a low limit endpoint if we had one.
    # Agent valuation is 5/minute.
    
    # We need to mock the admin key or something?
    # Agent endpoint requires admin key.
    
    headers = {"X-Admin-Key": "secret"} # Assuming 'secret' is from .env or default? 
    # Actually in test env, config might be different.
    # We can mock config or use dependency override.
    
    # But let's check current config default.
    # app/core/config.py says admin_api_key: Optional[str] = None
    # If None, verify_admin_key raises 500.
    # We should set it.
    
    from app.core.config import settings
    settings.admin_api_key = "test_secret"
    
    # Hitting valuation endpoint 6 times.
    # The endpoint expects a body.
    data = {
        "revenue": 1000000,
        "growth_rate": 0.2,
        "industry": "SaaS",
        "description": "Test Project"
    }
    
    # We need to mock agent_service because it calls LLM/etc and we don't want that in rate limit test.
    from unittest.mock import AsyncMock, patch
    
    with patch("app.services.agent_service.agent_service.process_valuation", new_callable=AsyncMock) as mock_val:
        mock_val.return_value = {
            "valuation_range": {"min": 100, "max": 200},
            "confidence": 0.9,
            "signature": "test",
            "attestation_message": "test"
        }
        
        # Hit 5 times, should be OK
        for _ in range(5):
            response = client.post("/api/v1/agent/valuation", json=data, headers={"X-Admin-Key": "test_secret"})
            if response.status_code != 200:
                print(f"Failed at iteration: {response.status_code} {response.text}")
            assert response.status_code == 200
            
        # 6th time should fail
        response = client.post("/api/v1/agent/valuation", json=data, headers={"X-Admin-Key": "test_secret"})
        assert response.status_code == 429
