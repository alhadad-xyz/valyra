"""Offer model."""
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Numeric, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class OfferStatus(PyEnum):
    """Offer lifecycle status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Offer(Base):
    """Offer model representing buyer offers on listings."""
    
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Offer Details
    offer_amount = Column(Numeric(20, 2), nullable=False)
    earnest_deposit = Column(Numeric(20, 2), nullable=False)  # 5% of offer
    earnest_tx_hash = Column(String(66), nullable=True)  # On-chain transaction hash
    
    # Status
    status = Column(Enum(OfferStatus), default=OfferStatus.PENDING, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=24),
        nullable=False
    )

    # Relationships
    listing = relationship("Listing", back_populates="offers")
    buyer = relationship("User", back_populates="offers", foreign_keys=[buyer_id])
    escrow = relationship("Escrow", back_populates="offer", uselist=False)

    def __repr__(self) -> str:
        return f"<Offer {self.offer_amount} IDRX - {self.status.value}>"
