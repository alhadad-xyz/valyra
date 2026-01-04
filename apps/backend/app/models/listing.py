"""Listing model."""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, Numeric, DateTime, Enum, ForeignKey, JSON, Boolean, Integer
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
    
    # Smart Contract ID
    on_chain_id = Column(Integer, unique=True, nullable=True)
    
    # Asset Information
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(Enum(AssetType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    business_url = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    asking_price = Column(Numeric(20, 2), nullable=False)
    tech_stack = Column(JSON, nullable=True)
    build_id = Column(String(255), nullable=True)
    
    # Included Assets/Stats
    customer_count = Column(Integer, default=0)
    domain_included = Column(Boolean, default=False, nullable=False)
    source_code_included = Column(Boolean, default=False, nullable=False)
    customer_data_included = Column(Boolean, default=False, nullable=False)
    
    # Financial Metrics
    mrr = Column(Numeric(20, 2), nullable=False)
    annual_revenue = Column(Numeric(20, 2), nullable=False)
    monthly_profit = Column(Numeric(20, 2), nullable=False)
    monthly_expenses = Column(Numeric(20, 2), nullable=False)
    revenue_trend = Column(Enum(RevenueTrend, values_callable=lambda x: [e.value for e in x]), nullable=False)
    revenue_history = Column(JSON, nullable=True)  # List of {date: str, amount: float}

    # Verification
    verified_level = Column(Integer, default=0, nullable=False)  # 0=None, 1=Identity, 2=Finances, 3=Ownership
    verification_status = Column(
        Enum(VerificationStatus, values_callable=lambda x: [e.value for e in x]),
        default=VerificationStatus.PENDING,
        nullable=False
    )
    
    # IP Assignment
    ip_assignment_hash = Column(String(66), nullable=True)  # keccak256 hash
    seller_signature = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(ListingStatus, values_callable=lambda x: [e.value for e in x]), default=ListingStatus.DRAFT, nullable=False)
    
    # View Tracking for Trending
    view_count = Column(Integer, nullable=False, server_default='0')
    view_count_7d = Column(Integer, nullable=False, server_default='0')
    last_viewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    offers = relationship("Offer", back_populates="listing")
    verification_records = relationship("VerificationRecord", back_populates="listing")

    def __repr__(self) -> str:
        return f"<Listing {self.asset_name} - {self.asking_price} IDRX>"
