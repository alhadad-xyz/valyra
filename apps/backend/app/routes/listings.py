from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.listing import Listing, ListingStatus, AssetType
from app.models.user import User
from app.models.offer import Offer
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from app.dependencies import get_current_user
from fastapi.encoders import jsonable_encoder
from app.websockets import manager
from app.core.rate_limiter import limiter
from fastapi import Request
from app.services.view_tracker import ViewTrackerService

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new listing.
    """
    new_listing = Listing(
        seller_id=current_user.id,
        **listing_data.model_dump()
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    # Broadcast new listing
    listing_data = jsonable_encoder(new_listing)
    await manager.broadcast({
        "type": "listing.create",
        "data": listing_data
    })
    
    return new_listing


@router.get("/", response_model=List[ListingResponse])
# @limiter.limit("100/minute")  # Temporarily disabled due to Redis connection issues on Koyeb
async def get_listings(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ListingStatus] = None,
    asset_type: Optional[AssetType] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    sort_by: str = Query("created_at", regex="^(created_at|trending|price|views)$"),
    db: Session = Depends(get_db)
):
    """
    Get a list of listings with optional filtering.
    """
    query = db.query(Listing)
    
    if status:
        query = query.filter(Listing.status == status)
    if asset_type:
        query = query.filter(Listing.asset_type == asset_type)
    if min_price:
        query = query.filter(Listing.asking_price >= min_price)
    if max_price:
        query = query.filter(Listing.asking_price <= max_price)
        
    # Apply sorting
    if sort_by == "trending":
        # Calculate trending score on-the-fly
        listings_with_scores = []
        for listing in query.all():
            offers_count = db.query(func.count(Offer.id)).filter(
                Offer.listing_id == listing.id
            ).scalar() or 0
            
            trending_score = ViewTrackerService.calculate_trending_score(
                listing, offers_count
            )
            listings_with_scores.append((listing, trending_score))
        
        # Sort by trending score
        listings_with_scores.sort(key=lambda x: x[1], reverse=True)
        listings = [item[0] for item in listings_with_scores[skip:skip+limit]]
    elif sort_by == "price":
        listings = query.order_by(Listing.asking_price.asc()).offset(skip).limit(limit).all()
    elif sort_by == "views":
        listings = query.order_by(desc(Listing.view_count)).offset(skip).limit(limit).all()
    else:  # created_at
        listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()
    
    return listings


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: UUID,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a listing. Only the owner can update.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
        
    update_data = listing_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(listing, field, value)
        
    db.commit()
    db.refresh(listing)

    # Broadcast listing update
    listing_data = jsonable_encoder(listing)
    await manager.broadcast({
        "type": "listing.update",
        "data": listing_data
    })

    return listing


@router.post("/{listing_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def track_listing_view(
    listing_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Track a view for analytics. Rate-limited by IP (24h window).
    Returns 204 No Content on success.
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Track the view (silently fails if IP already counted)
    await ViewTrackerService.track_view(listing_id, client_ip, db)
    
    return None
