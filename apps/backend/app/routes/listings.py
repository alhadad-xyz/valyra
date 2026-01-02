from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.listing import Listing, ListingStatus, AssetType
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from app.dependencies import get_current_user
from fastapi.encoders import jsonable_encoder
from app.websockets import manager
from app.core.rate_limiter import limiter
from fastapi import Request

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
@limiter.limit("100/minute")
async def get_listings(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ListingStatus] = None,
    asset_type: Optional[AssetType] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
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
        
    listings = query.offset(skip).limit(limit).all()
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
