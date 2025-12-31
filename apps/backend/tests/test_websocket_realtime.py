import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_current_user
from app.models.user import User

@pytest.fixture
def mock_user(db):
    user = User(
        wallet_address="0x1234567890abcdef1234567890abcdef12345678",
        reputation_score=50
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_websocket_listing_create(db, mock_user):
    from app.database import get_db
    # Override auth and db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: db
    
    with TestClient(app) as client:
        # Connect to WebSocket
        with client.websocket_connect("/ws/listings") as websocket:
            # Create a listing
            payload = {
                "asset_name": "Realtime Asset",
                "asset_type": "saas",
                "business_url": "https://realtime.com",
                "description": "Realtime test",
                "asking_price": 5000.00,
                "mrr": 500.00,
                "annual_revenue": 6000.00,
                "monthly_profit": 400.00,
                "monthly_expenses": 100.00,
                "revenue_trend": "growing",
                "domain_included": True,
                "source_code_included": True
            }
            
            response = client.post("/api/v1/listings/", json=payload)
            assert response.status_code == 201
            
            # Check for WebSocket message
            data = websocket.receive_json()
            assert data["type"] == "listing.create"
            assert data["data"]["asset_name"] == "Realtime Asset"
            
    app.dependency_overrides.clear()
