import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.user import User, UserRole
from app.models.listing import Listing, AssetType, RevenueTrend
from app.models.offer import Offer, OfferStatus
from app.models.escrow import Escrow, EscrowState
from app.models.vault import VaultRole
from app.services.listing_encryption_service import ListingEncryptionService
from app.dependencies import get_current_user

# Setup helper
def create_test_data(db: Session):
    # Users
    seller = User(wallet_address="0xSeller", role=UserRole.USER)
    buyer = User(wallet_address="0xBuyer", role=UserRole.USER)
    arbitrator = User(wallet_address="0xArbitrator", role=UserRole.ARBITRATOR)
    rando = User(wallet_address="0xRando", role=UserRole.USER)
    
    db.add_all([seller, buyer, arbitrator, rando])
    db.commit()
    db.refresh(seller)
    db.refresh(buyer)
    db.refresh(arbitrator)
    db.refresh(rando)

    # Listing
    listing = Listing(
        seller_id=seller.id,
        asset_name="Test Asset",
        asset_type=AssetType.SAAS,
        business_url="https://example.com",
        description="A great SaaS business",
        asking_price=1000,
        mrr=100,
        annual_revenue=1200,
        monthly_profit=50,
        monthly_expenses=50,
        revenue_trend=RevenueTrend.GROWING,
        domain_included=True,
        source_code_included=True,
        customer_data_included=True
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Encryption (Vault)
    # We need to create a vault entry to test credential retrieval
    # recipient includes arbitrator
    # We need valid hex keys for ECIES
    # Generating ephemeral keys for test
    _, listing_pub = ListingEncryptionService.generate_ephemeral_keypair()
    _, buyer_pub = ListingEncryptionService.generate_ephemeral_keypair()
    _, arbitrator_pub = ListingEncryptionService.generate_ephemeral_keypair()

    recipients = [
        {"address": "0xBuyer", "public_key": buyer_pub, "role": VaultRole.BUYER},
        {"address": "0xArbitrator", "public_key": arbitrator_pub, "role": VaultRole.ARBITRATOR}
    ]
    
    vault_entry = ListingEncryptionService.create_vault_entry(
        db, listing.id, b"secret_credentials", recipients
    )

    # Offer
    offer = Offer(
        listing_id=listing.id,
        buyer_id=buyer.id,
        offer_amount=1000,
        earnest_deposit=50,
        status=OfferStatus.ACCEPTED
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)

    # Escrow
    escrow = Escrow(
        offer_id=offer.id,
        buyer_address=buyer.wallet_address,
        seller_address=seller.wallet_address,
        amount=1000,
        platform_fee=25,
        escrow_state=EscrowState.FUNDED
    )
    db.add(escrow)
    db.commit()
    db.refresh(escrow)

    return {
        "seller": seller,
        "buyer": buyer,
        "arbitrator": arbitrator,
        "rando": rando,
        "listing": listing,
        "offer": offer,
        "escrow": escrow,
        "vault_entry": vault_entry
    }

def test_file_dispute(client: TestClient, db: Session):
    data = create_test_data(db)
    buyer = data["buyer"]
    escrow = data["escrow"]
    
    # Override current_user
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: buyer
    
    response = client.post(
        f"/api/v1/disputes/{escrow.id}/file",
        json={"reason": "Test dispute"}
    )
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["escrow_state"] == "disputed"
    assert res_data["dispute_reason"] == "Test dispute"
    
    # Verify DB state
    db.refresh(escrow)
    assert escrow.escrow_state == EscrowState.DISPUTED

def test_file_dispute_unauthorized(client: TestClient, db: Session):
    data = create_test_data(db)
    rando = data["rando"]
    escrow = data["escrow"]
    
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: rando
    
    response = client.post(
        f"/api/v1/disputes/{escrow.id}/file",
        json={"reason": "Should fail"}
    )
    
    assert response.status_code == 403

def test_resolve_dispute(client: TestClient, db: Session):
    data = create_test_data(db)
    arbitrator = data["arbitrator"]
    escrow = data["escrow"]
    
    # First must be disputed
    escrow.escrow_state = EscrowState.DISPUTED
    db.commit()
    
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: arbitrator
    
    response = client.post(
        f"/api/v1/disputes/{escrow.id}/resolve",
        json={"decision": "Refund buyer"}
    )
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["escrow_state"] == "resolved"
    assert res_data["arbitrator_decision"] == "Refund buyer"

def test_resolve_dispute_not_arbitrator(client: TestClient, db: Session):
    data = create_test_data(db)
    buyer = data["buyer"]
    escrow = data["escrow"]
    
    escrow.escrow_state = EscrowState.DISPUTED
    db.commit()
    
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: buyer
    
    response = client.post(
        f"/api/v1/disputes/{escrow.id}/resolve",
        json={"decision": "I win"}
    )
    
    assert response.status_code == 403

def test_get_arbitrator_credentials(client: TestClient, db: Session):
    data = create_test_data(db)
    arbitrator = data["arbitrator"]
    escrow = data["escrow"]
    
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: arbitrator
    
    response = client.get(f"/api/v1/disputes/{escrow.id}/credentials")
    
    assert response.status_code == 200
    res_data = response.json()
    assert "encrypted_data_blob" in res_data
    assert "encrypted_ephemeral_private_key" in res_data
    # Should contain keys for the arbitrator
    
def test_get_credentials_unauthorized(client: TestClient, db: Session):
    data = create_test_data(db)
    rando = data["rando"]
    escrow = data["escrow"]
    
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: rando
    
    response = client.get(f"/api/v1/disputes/{escrow.id}/credentials")
    
    # Rando is not party to escrow, so should get 403 from get_dispute_details
    assert response.status_code == 403
