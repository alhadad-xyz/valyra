"""Listing model."""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, Numeric, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class AssetType(PyEnum):
    """Types of digital assets."""
    SAAS = "saas"
    ECOMMERCE = "ecommerce"
    CONTENT = "content"
    COMMUNITY = "community"
    OTHER = "other"


class RevenueTrend(PyEnum):
    """Revenue trend indicators."""
    GROWING = "growing"
    STABLE = "stable"
    DECLINING = "declining"


class VerificationStatus(PyEnum):
    """Listing verification status."""
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"


class ListingStatus(PyEnum):
    """Listing lifecycle status."""
    DRAFT = "draft"
    ACTIVE = "active"
    SOLD = "sold"
    PAUSED = "paused"


class Listing(Base):
    """Listing model representing digital assets for sale."""
    
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Asset Information
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False)
    business_url = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    asking_price = Column(Numeric(20, 2), nullable=False)
    tech_stack = Column(JSON, nullable=True)
    build_id = Column(String(255), nullable=True)
    
    # Financial Metrics
    mrr = Column(Numeric(20, 2), nullable=False)
    annual_revenue = Column(Numeric(20, 2), nullable=False)
    monthly_profit = Column(Numeric(20, 2), nullable=False)
    monthly_expenses = Column(Numeric(20, 2), nullable=False)
    revenue_trend = Column(Enum(RevenueTrend), nullable=False)
    
    # Verification
    verification_status = Column(
        Enum(VerificationStatus),
        default=VerificationStatus.PENDING,
        nullable=False
    )
    
    # IP Assignment
    ip_assignment_hash = Column(String(66), nullable=True)  # keccak256 hash
    seller_signature = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(ListingStatus), default=ListingStatus.DRAFT, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    offers = relationship("Offer", back_populates="listing")
    verification_records = relationship("VerificationRecord", back_populates="listing")

    def __repr__(self) -> str:
        return f"<Listing {self.asset_name} - {self.asking_price} IDRX>"
