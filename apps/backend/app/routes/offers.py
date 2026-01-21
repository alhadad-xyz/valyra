from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.offer import Offer, OfferStatus
from app.models.listing import Listing, ListingStatus
from app.schemas.offer import OfferCreate, OfferResponse, OfferResponseWithListing
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.post("/", response_model=OfferResponse)
async def create_offer(
    offer: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new offer on a listing.
    """
    # Check listing
    listing = db.query(Listing).filter(Listing.id == offer.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Listing is not active")

    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot make offer on your own listing")

    # Create offer
    # Note: Earnest deposit logic is simplified here. 
    # In real flow, this would be verified on-chain first involving 'earnest_tx_hash'
    earnest_deposit = float(offer.offer_amount) * 0.05
    
    new_offer = Offer(
        listing_id=offer.listing_id,
        buyer_id=current_user.id,
        offer_amount=offer.offer_amount,
        earnest_deposit=earnest_deposit, 
        earnest_tx_hash=offer.earnest_tx_hash,
        status=OfferStatus.PENDING
    )
    
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)
    return new_offer

@router.get("/me", response_model=list[OfferResponseWithListing])
async def get_my_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all offers made by the current user (sent offers).
    """
    offers = (
        db.query(Offer)
        .join(Listing, Offer.listing_id == Listing.id)
        .join(User, Listing.seller_id == User.id)
        .filter(Offer.buyer_id == current_user.id)
        .options(joinedload(Offer.listing).joinedload(Listing.seller))
        .order_by(Offer.created_at.desc())
        .all()
    )

    

    
    return [
        OfferResponseWithListing(
            id=offer.id,
            listing_id=offer.listing_id,
            listing_on_chain_id=offer.listing.on_chain_id,
            escrow_on_chain_id=offer.escrow.on_chain_id if offer.escrow else None,
            escrow_id=offer.escrow.id if offer.escrow else None,
            escrow_state=offer.escrow.escrow_state.value if offer.escrow else None,
            listing_title=offer.listing.asset_name,
            listing_image=None,  # Placeholder images will be generated on frontend
            buyer_address=current_user.wallet_address,
            seller_address=offer.listing.seller.wallet_address,
            offer_amount=offer.offer_amount,
            earnest_deposit=offer.earnest_deposit,
            on_chain_id=offer.on_chain_id,
            status=offer.status,
            created_at=offer.created_at,
            updated_at=offer.updated_at,
            expires_at=offer.expires_at,
        )
        for offer in offers
    ]

@router.get("/received", response_model=list[OfferResponseWithListing])
async def get_received_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all offers received on the current user's listings.
    """
    offers = (
        db.query(Offer)
        .join(Listing, Offer.listing_id == Listing.id)
        .join(User, Offer.buyer_id == User.id)
        .filter(Listing.seller_id == current_user.id)
        .options(joinedload(Offer.listing), joinedload(Offer.buyer), joinedload(Offer.escrow))
        .order_by(Offer.created_at.desc())
        .all()
    )

    
    return [
        OfferResponseWithListing(
            id=offer.id,
            listing_id=offer.listing_id,
            listing_on_chain_id=offer.listing.on_chain_id,
            escrow_on_chain_id=offer.escrow.on_chain_id if offer.escrow else None,
            escrow_id=offer.escrow.id if offer.escrow else None,
            escrow_state=offer.escrow.escrow_state.value if offer.escrow else None,
            listing_title=offer.listing.asset_name,
            listing_image=None,  # Placeholder images will be generated on frontend
            buyer_address=offer.buyer.wallet_address,
            seller_address=current_user.wallet_address,
            offer_amount=offer.offer_amount,
            earnest_deposit=offer.earnest_deposit,
            on_chain_id=offer.on_chain_id,
            status=offer.status,
            created_at=offer.created_at,
            updated_at=offer.updated_at,
            expires_at=offer.expires_at,
        )
        for offer in offers
    ]

@router.post("/{offer_id}/cancel", response_model=OfferResponse)
async def cancel_offer(
    offer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark an offer as cancelled (EXPIRED) by the buyer.
    """
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can cancel their offer")

    if offer.status != OfferStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot cancel offer in {offer.status.value} status")

    offer.status = OfferStatus.EXPIRED
    db.commit()
    db.refresh(offer)
    return offer

@router.post("/{offer_id}/reject", response_model=OfferResponse)
async def reject_offer(
    offer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject an offer on the current user's listing.
    """
    offer = (
        db.query(Offer)
        .join(Listing, Offer.listing_id == Listing.id)
        .filter(Offer.id == offer_id)
        .first()
    )
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can reject an offer")

    if offer.status != OfferStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot reject offer in {offer.status.value} status")

    offer.status = OfferStatus.REJECTED
    db.commit()
    db.refresh(offer)
    return offer
