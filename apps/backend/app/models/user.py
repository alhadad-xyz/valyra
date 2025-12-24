"""User model."""
import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class VerificationLevel(PyEnum):
    """User verification levels."""
    BASIC = "basic"
    STANDARD = "standard"
    ENHANCED = "enhanced"


class User(Base):
    """User model representing platform users (buyers and sellers)."""
    
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_address = Column(String(42), unique=True, nullable=False, index=True)
    basename = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    # stripe_account_id removed
    google_id = Column(String(255), nullable=True)  # Zero-storage: Only ID stored
    challenge = Column(String(1024), nullable=True) # WebAuthn challenge
    verification_level = Column(
        Enum(VerificationLevel, values_callable=lambda x: [e.value for e in x]),
        default=VerificationLevel.BASIC,
        nullable=False
    )
    reputation_score = Column(Integer, default=50, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    listings = relationship("Listing", back_populates="seller", foreign_keys="Listing.seller_id")
    offers = relationship("Offer", back_populates="buyer", foreign_keys="Offer.buyer_id")
    credentials = relationship("UserCredential", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.wallet_address[:10]}... (Score: {self.reputation_score})>"
