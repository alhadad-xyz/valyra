import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.listing import Listing, VerificationStatus, AssetType, ListingStatus
from app.models.user import User

@pytest.fixture
def mock_user(db: Session):
    user = User(
        wallet_address="0x" + "1" * 40,
        reputation_score=50
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_filter_listings_by_verification_level(client: TestClient, db: Session, mock_user: User):
    # Create listings with different verification levels
    listings = []
    for level in [0, 1, 2, 3]:
        listing = Listing(
            seller_id=mock_user.id,
            asset_name=f"Listing Level {level}",
            asset_type=AssetType.SAAS,
            business_url=f"http://example-{level}.com",
            description=f"Description {level}",
            asking_price=1000,
            mrr=100,
            annual_revenue=1200,
            monthly_profit=50,
            monthly_expenses=50,
            revenue_trend="growing",
            verified_level=level,
            verification_status=VerificationStatus.VERIFIED if level > 0 else VerificationStatus.PENDING,
            status=ListingStatus.ACTIVE
        )
        db.add(listing)
        listings.append(listing)
    db.commit()

    # Test filtering by level 1
    response = client.get("/api/v1/listings/?verification_level=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["verified_level"] == 1
    assert data[0]["asset_name"] == "Listing Level 1"

    # Test filtering by level 2 and 3
    response = client.get("/api/v1/listings/?verification_level=2,3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    levels = sorted([item["verified_level"] for item in data])
    assert levels == [2, 3]

    # Test filtering by non-existent level
    response = client.get("/api/v1/listings/?verification_level=99")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

    # Test invalid format (should be ignored)
    response = client.get("/api/v1/listings/?verification_level=invalid")
    assert response.status_code == 200

def test_filter_listings_by_revenue_trend(client: TestClient, db: Session, mock_user: User):
    # Create listings with different trends
    for trend in ["growing", "stable", "declining"]:
        listing = Listing(
            seller_id=mock_user.id,
            asset_name=f"Listing {trend}",
            asset_type=AssetType.SAAS,
            business_url=f"http://example-{trend}.com",
            description="Desc",
            asking_price=1000,
            mrr=100,
            annual_revenue=1200,
            monthly_profit=50,
            monthly_expenses=50,
            revenue_trend=trend,
            status=ListingStatus.ACTIVE
        )
        db.add(listing)
    db.commit()

    # Filter by growing
    response = client.get("/api/v1/listings/?revenue_trend=growing")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["revenue_trend"] == "growing"

    # Filter by multiple
    response = client.get("/api/v1/listings/?revenue_trend=growing,stable")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_filter_listings_by_mrr(client: TestClient, db: Session, mock_user: User):
    # Create listings with different MRR
    mrrs = [100, 500, 1000]
    for mrr in mrrs:
        listing = Listing(
            seller_id=mock_user.id,
            asset_name=f"Listing MRR {mrr}",
            asset_type=AssetType.SAAS,
            business_url=f"http://example-mrr-{mrr}.com",
            description="Desc",
            asking_price=1000,
            mrr=mrr,
            annual_revenue=mrr*12,
            monthly_profit=mrr/2,
            monthly_expenses=mrr/2,
            revenue_trend="stable",
            status=ListingStatus.ACTIVE
        )
        db.add(listing)
    db.commit()

    # Filter min MRR
    response = client.get("/api/v1/listings/?min_mrr=500")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2 # 500 and 1000

    # Filter max MRR
    response = client.get("/api/v1/listings/?max_mrr=500")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2 # 100 and 500

    # Filter range
    response = client.get("/api/v1/listings/?min_mrr=200&max_mrr=800")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert float(data[0]["mrr"]) == 500.0
