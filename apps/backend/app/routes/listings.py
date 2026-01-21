from typing import List, Optional, Literal
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
from app.models.verification import VerificationRecord, VerificationType, VerificationRecordStatus
from app.services.asset_verification import asset_verification_service
from datetime import datetime

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

    # Automatic GitHub Repo Verification
    if new_listing.tech_stack and isinstance(new_listing.tech_stack, dict):
        repo_url = new_listing.tech_stack.get("repo_url")
        if repo_url:
            # Verify the repo
            verify_result = await asset_verification_service.verify_repo(repo_url)
            
            if verify_result.get("is_verified"):
                # Create Verification Record
                record = VerificationRecord(
                    listing_id=new_listing.id,
                    verification_type=VerificationType.GITHUB_REPO,
                    status=VerificationRecordStatus.VERIFIED,
                    verification_data=verify_result,
                    verified_at=datetime.utcnow()
                )
                db.add(record)
                
                # Check if we should update listing verification level
                # For MVP, getting code verified upgrades to level 2 if not already
                if new_listing.verified_level < 2:
                    new_listing.verified_level = 2
                    
                db.commit()
    
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
    search: Optional[str] = Query(None, min_length=1),
    sort_by: str = Query("created_at", regex="^(created_at|trending|price|views)$"),
    revenue_trend: Optional[str] = Query(None, description="Comma-separated list of revenue trends"),
    min_mrr: Optional[Decimal] = None,
    max_mrr: Optional[Decimal] = None,
    verification_level: Optional[str] = Query(None, description="Comma-separated list of verification levels (1,2,3)"),
    on_chain_id: Optional[int] = None,
    seller_id: Optional[UUID] = None,
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
    if min_mrr:
        query = query.filter(Listing.mrr >= min_mrr)
    if max_mrr:
        query = query.filter(Listing.mrr <= max_mrr)
    if revenue_trend:
        trends = [t.strip() for t in revenue_trend.split(",") if t.strip()]
        if trends:
            # Case-insensitive match for enum values
            query = query.filter(Listing.revenue_trend.in_(trends))


    if verification_level:
        try:
            levels = [int(l.strip()) for l in verification_level.split(",") if l.strip().isdigit()]
            if levels:
                query = query.filter(Listing.verified_level.in_(levels))
        except ValueError:
            pass # Ignore invalid format
    if on_chain_id is not None:
        query = query.filter(Listing.on_chain_id == on_chain_id)
    if seller_id:
        query = query.filter(Listing.seller_id == seller_id)
    if search:
        # Case-insensitive search across asset_name and description
        search_pattern = f"%{search}%"
        query = query.filter(
            (Listing.asset_name.ilike(search_pattern)) |
            (Listing.description.ilike(search_pattern))
        )
        
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

@router.get("/{listing_id}/verification")
async def get_listing_verification(
    listing_id: str,
    db: Session = Depends(get_db)
):
    """
    Get verification records for a specific listing.
    """
    from app.models.verification import VerificationRecord
    from app.schemas.verification_record import VerificationRecordResponse
    
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Fetch verification records
    records = db.query(VerificationRecord).filter(
        VerificationRecord.listing_id == listing_id
    ).all()
    
    return {
        "listing_id": str(listing_id),
        "verified_level": listing.verified_level,
        "verification_status": listing.verification_status.value if listing.verification_status else "pending",
        "records": [VerificationRecordResponse.model_validate(r) for r in records]
    }



@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific listing by ID (UUID) or On-Chain ID (Integer).
    """
    listing = None
    
    # Try as UUID
    try:
        uuid_obj = UUID(listing_id)
        listing = db.query(Listing).filter(Listing.id == uuid_obj).first()
    except ValueError:
        # Not a UUID, try as On-Chain ID
        if listing_id.isdigit():
            listing = db.query(Listing).filter(Listing.on_chain_id == int(listing_id)).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
        
    # Generate mock revenue history if missing (for demo purposes)
    if not listing.revenue_history:
        from datetime import date, timedelta
        import random
        
        history = []
        # Fallback to annual_revenue or default if 0
        annual_rev = float(listing.annual_revenue) if listing.annual_revenue else 120000.0
        monthly_avg = annual_rev / 12.0
        
        # Use current date as baseline 
        today = date.today()
        
        for i in range(11, -1, -1):
            # Approximate date for previous months (1st of month)
            # Safe calculation using day=1 replacement
            d = today.replace(day=1) 
            # Subtract i months (rough approximation 30 days)
            month_date = d - timedelta(days=i*30)
            
            # Base variance (+- 10%)
            variance = random.uniform(0.9, 1.1)
            revenue = monthly_avg * variance
            
            # Trend adjustment
            trend = listing.revenue_trend.value if listing.revenue_trend else "stable"
            
            if trend == "growing":
                 # Past was lower (start at 70%, grow to 100%)
                 factor = 0.7 + (0.3 * ((12-i)/12))
                 revenue *= factor
            elif trend == "declining":
                 # Past was higher (start at 130%, decline to 100%)
                 factor = 1.3 - (0.3 * ((12-i)/12))
                 revenue *= factor
            
            expenses = revenue * 0.3 # Assume 30% expenses
            
            history.append({
                "date": month_date.isoformat(),
                "revenue": round(revenue, 2),
                "expenses": round(expenses, 2),
            })
            
        listing.revenue_history = history
        
    return listing


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

    # Automatic verification update on edit
    if listing.tech_stack and isinstance(listing.tech_stack, dict):
        repo_url = listing.tech_stack.get("repo_url")
        if repo_url:
            # Check if record exists
            existing_record = db.query(VerificationRecord).filter(
                VerificationRecord.listing_id == listing.id,
                VerificationRecord.verification_type == VerificationType.GITHUB_REPO
            ).first()
            
            # Re-verify if no record OR if repo url changed (simplified logic: just verify)
            verify_result = await asset_verification_service.verify_repo(repo_url)
            
            if verify_result.get("is_verified"):
                if existing_record:
                    existing_record.status = VerificationRecordStatus.VERIFIED
                    existing_record.verification_data = verify_result
                    existing_record.verified_at = datetime.utcnow()
                else:
                    new_record = VerificationRecord(
                        listing_id=listing.id,
                        verification_type=VerificationType.GITHUB_REPO,
                        status=VerificationRecordStatus.VERIFIED,
                        verification_data=verify_result,
                        verified_at=datetime.utcnow()
                    )
                    db.add(new_record)
                
                if listing.verified_level < 2:
                    listing.verified_level = 2
                    
                db.commit()

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
