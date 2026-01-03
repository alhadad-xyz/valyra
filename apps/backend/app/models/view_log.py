"""View log model for tracking listing views."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class ViewLog(Base):
    """Track individual listing views with IP-based deduplication."""
    
    __tablename__ = "view_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    viewer_ip_hash = Column(String(64), nullable=False)  # SHA256 of IP for privacy
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_view_log_listing_ip', 'listing_id', 'viewer_ip_hash'),
        Index('idx_view_log_viewed_at', 'viewed_at'),
        Index('idx_view_log_listing_date', 'listing_id', 'viewed_at'),
    )

    def __repr__(self) -> str:
        return f"<ViewLog {self.listing_id} at {self.viewed_at}>"
