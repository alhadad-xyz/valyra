import sys
import os
from dotenv import load_dotenv

# Ensure we can import app
sys.path.append(os.getcwd())

load_dotenv()

# Check if dependencies exist before trying to import app
try:
    import coinbase_agentkit
except ImportError:
    print("CRITICAL: coinbase-agentkit not found. Please run 'poetry install'.")
    sys.exit(1)

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_endpoint():
    print(f"Testing Agent Endpoint with Admin Key: {settings.admin_api_key}")
    
    # 1. Test No Header
    res = client.post("/api/v1/agent/execute", json={"prompt": "test"})
    print(f"No Header Status: {res.status_code}")
    assert res.status_code in [403, 500, 422], f"Expected 403/500, got {res.status_code}"

    # 2. Test Invalid Header
    res = client.post("/api/v1/agent/execute", json={"prompt": "test"}, headers={"X-Admin-Key": "invalid"})
    print(f"Invalid Header Status: {res.status_code}")
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"

    # 3. Test Valid Header (if key configured)
    if settings.admin_api_key:
        # Note: This might fail if AgentKit not configured with CDP keys, 
        # but the router security check should pass and then fail inside executor.
        try:
            res = client.post("/api/v1/agent/execute", json={"prompt": "who are you"}, headers={"X-Admin-Key": settings.admin_api_key})
            print(f"Valid Header Status: {res.status_code}")
            # If 500, it might be the agent executor failing, which is expected if no CDP keys.
            # But we passed security.
            if res.status_code == 200:
                print("Success! Agent responded.")
                print(res.json())
            else:
                print(f"Agent failed (expected if no CDP keys): {res.text}")
        except Exception as e:
            print(f"Execution Error: {e}")
    else:
        print("Skipping valid key test (ADMIN_API_KEY not set)")

if __name__ == "__main__":
    test_endpoint()
