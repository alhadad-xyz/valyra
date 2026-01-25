"""User management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse, PublicUserResponse, UserStatsResponse
from app.dependencies import get_current_user
import logging
from uuid import UUID

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    Only allows updating basename and email.
    """
    try:
        # Update allowed fields if provided
        if user_update.basename is not None:
            current_user.basename = user_update.basename
        if user_update.email is not None:
            current_user.email = user_update.email
            
        # Notification Preferences
        if user_update.email_on_offer is not None:
            current_user.email_on_offer = 1 if user_update.email_on_offer else 0
        if user_update.email_on_status is not None:
            current_user.email_on_status = 1 if user_update.email_on_status else 0
        if user_update.marketing_drops is not None:
            current_user.marketing_drops = 1 if user_update.marketing_drops else 0
            
        db.commit()
        db.refresh(current_user)
        return current_user
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )

@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics for the current user (spent, earned, trust score).
    """
    from app.models.offer import Offer, OfferStatus
    from app.models.listing import Listing
    from sqlalchemy import func

    # Calculate Total Spent (Offers bought by user that are ACCEPTED)
    total_spent = db.query(func.sum(Offer.offer_amount)).filter(
        Offer.buyer_id == current_user.id,
        Offer.status == OfferStatus.ACCEPTED
    ).scalar() or 0.0

    # Calculate Total Earned (Offers on user's listings that are ACCEPTED)
    total_earned = db.query(func.sum(Offer.offer_amount)).join(Listing).filter(
        Listing.seller_id == current_user.id,
        Offer.status == OfferStatus.ACCEPTED
    ).scalar() or 0.0

    return {
        "total_spent": float(total_spent),
        "total_earned": float(total_earned),
        "trust_score": current_user.reputation_score
    }

@router.get("/{user_id}/profile", response_model=PublicUserResponse)
async def get_user_profile(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a user's public profile.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/address/{wallet_address}", response_model=PublicUserResponse)
async def get_user_by_address(
    wallet_address: str,
    db: Session = Depends(get_db)
):
    """
    Get a user's public profile by wallet address.
    """
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
