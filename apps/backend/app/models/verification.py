"""Verification record model."""
import uuid
from datetime import datetime, timedelta
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class VerificationType(PyEnum):
    """Types of verification checks."""
    DNS = "dns"
    BUILD_ID = "build_id"
    OAUTH_STRIPE = "oauth_stripe"
    OAUTH_ANALYTICS = "oauth_analytics"
    GITHUB_REPO = "github_repo"
    EMAIL_DOMAIN = "email_domain"


class VerificationRecordStatus(PyEnum):
    """Verification status."""
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"


class VerificationRecord(Base):
    """Verification record tracking various verification checks."""
    
    __tablename__ = "verification_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False, index=True)
    
    # Verification Details
    verification_type = Column(Enum(VerificationType), nullable=False)
    status = Column(
        Enum(VerificationRecordStatus),
        default=VerificationRecordStatus.PENDING,
        nullable=False
    )
    
    # Verification Data (JSON for flexibility)
    verification_data = Column(JSON, nullable=True)
    
    # Timestamps
    verified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # For JIT re-verification
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="verification_records")

    def set_expiry(self, days: int = 30) -> None:
        """Set verification expiry for JIT re-verification."""
        self.expires_at = datetime.utcnow() + timedelta(days=days)

    def is_expired(self) -> bool:
        """Check if verification has expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at

    def __repr__(self) -> str:
        return f"<VerificationRecord {self.verification_type.value} - {self.status.value}>"
