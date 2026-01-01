import pytest
from app.main import app
from app.models.user import User
from app.models.listing import Listing, ListingStatus
from app.dependencies import get_current_user
from uuid import uuid4

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

@pytest.fixture
def mock_user_2(db):
    user = User(
        wallet_address="0xabcdef1234567890abcdef1234567890abcdef12",
        reputation_score=50
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_create_listing(client, db, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    payload = {
        "asset_name": "Test SaaS",
        "asset_type": "saas",
        "business_url": "https://example.com",
        "description": "A profitable SaaS",
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
    data = response.json()
    assert data["asset_name"] == "Test SaaS"
    assert data["seller_id"] is not None
    
    app.dependency_overrides.clear()

def test_get_listings(client, db, mock_user):
    # Create a listing directly in DB
    listing = Listing(
        seller_id=mock_user.id,
        asset_name="Existing Asset",
        asset_type="saas",
        business_url="https://existing.com",
        description="Desc",
        asking_price=1000,
        mrr=100,
        annual_revenue=1200,
        monthly_profit=50,
        monthly_expenses=50,
        revenue_trend="stable",
        status=ListingStatus.ACTIVE
    )
    db.add(listing)
    db.commit()

    response = client.get("/api/v1/listings/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["asset_name"] == "Existing Asset"

def test_update_listing_owner(client, db, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    listing = Listing(
        seller_id=mock_user.id,
        asset_name="My Asset",
        asset_type="saas",
        business_url="https://mine.com",
        description="Desc",
        asking_price=1000,
        mrr=100,
        annual_revenue=1200,
        monthly_profit=50,
        monthly_expenses=50,
        revenue_trend="stable"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    payload = {"asset_name": "Updated Asset Name"}
    response = client.put(f"/api/v1/listings/{listing.id}", json=payload)
    
    assert response.status_code == 200
    assert response.json()["asset_name"] == "Updated Asset Name"
    
    app.dependency_overrides.clear()

def test_update_listing_non_owner(client, db, mock_user, mock_user_2):
    # Mock user is logged in as mock_user_2, trying to edit mock_user's listing
    app.dependency_overrides[get_current_user] = lambda: mock_user_2
    
    listing = Listing(
        seller_id=mock_user.id,
        asset_name="User 1 Asset",
        asset_type="saas",
        business_url="https://u1.com",
        description="Desc",
        asking_price=1000,
        mrr=100,
        annual_revenue=1200,
        monthly_profit=50,
        monthly_expenses=50,
        revenue_trend="stable"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    payload = {"asset_name": "Hacked Asset"}
    response = client.put(f"/api/v1/listings/{listing.id}", json=payload)
    
    assert response.status_code == 403
    
    app.dependency_overrides.clear()
