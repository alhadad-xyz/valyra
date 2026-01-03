"""View tracking service for analytics and trending calculations."""
import hashlib
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.listing import Listing
from app.models.view_log import ViewLog


class ViewTrackerService:
    """Service for tracking listing views and calculating trending scores."""
    
    @staticmethod
    def hash_ip(ip_address: str) -> str:
        """Hash IP address using SHA256 for privacy."""
        return hashlib.sha256(ip_address.encode()).hexdigest()
    
    @staticmethod
    async def track_view(
        listing_id: UUID,
        ip_address: str,
        db: Session
    ) -> bool:
        """
        Track a view if not already counted in last 24 hours.
        
        Args:
            listing_id: UUID of the listing
            ip_address: IP address of the viewer
            db: Database session
            
        Returns:
            bool: True if view was tracked, False if already counted recently
        """
        ip_hash = ViewTrackerService.hash_ip(ip_address)
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        # Check if this IP already viewed in last 24h
        recent_view = db.query(ViewLog).filter(
            ViewLog.listing_id == listing_id,
            ViewLog.viewer_ip_hash == ip_hash,
            ViewLog.viewed_at > cutoff_time
        ).first()
        
        if recent_view:
            return False  # Already counted
        
        # Create new view log
        view_log = ViewLog(
            listing_id=listing_id,
            viewer_ip_hash=ip_hash
        )
        db.add(view_log)
        
        # Update listing view count
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if listing:
            listing.view_count += 1
            listing.last_viewed_at = datetime.utcnow()
            
        db.commit()
        return True
    
    @staticmethod
    def calculate_trending_score(
        listing: Listing,
        offers_count: int = 0
    ) -> float:
        """
        Calculate composite trending score.
        
        Formula: recent_views_7d * 2.0 + offers_count * 5.0 + total_views * 0.1
        
        Args:
            listing: The listing object
            offers_count: Number of offers (optional, defaults to 0)
            
        Returns:
            float: Trending score
        """
        score = (
            float(listing.view_count_7d or 0) * 2.0 +
            float(offers_count) * 5.0 +
            float(listing.view_count or 0) * 0.1
        )
        return score
    
    @staticmethod
    async def update_7d_counts(db: Session) -> int:
        """
        Update 7-day rolling view counts for all listings.
        Should be run as a background job (e.g. hourly).
        
        Args:
            db: Database session
            
        Returns:
            int: Number of listings updated
        """
        cutoff_time = datetime.utcnow() - timedelta(days=7)
        
        # Get all listings
        listings = db.query(Listing).all()
        updated_count = 0
        
        for listing in listings:
            # Count views in last 7 days
            count_7d = db.query(func.count(ViewLog.id)).filter(
                ViewLog.listing_id == listing.id,
                ViewLog.viewed_at > cutoff_time
            ).scalar()
            
            listing.view_count_7d = count_7d or 0
            updated_count += 1
        
        db.commit()
        return updated_count
