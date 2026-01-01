"""Escrow model."""
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, Numeric, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class EscrowState(PyEnum):
    """Escrow state machine."""
    CREATED = "created"
    FUNDED = "funded"
    DELIVERED = "delivered"
    CONFIRMED = "confirmed"
    DISPUTED = "disputed"
    RESOLVED = "resolved"
    COMPLETED = "completed"
    REFUNDED = "refunded"


class Escrow(Base):
    """Escrow model tracking on-chain escrow contracts."""
    
    __tablename__ = "escrows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=True, unique=True)
    
    # Smart Contract
    contract_address = Column(String(42), nullable=True, index=True)
    on_chain_id = Column(Numeric(20, 0), nullable=True, index=True) # Using Numeric for uint256 safety, though Integer might suffice for small counts
    escrow_state = Column(Enum(EscrowState), default=EscrowState.CREATED, nullable=False)
    
    # Parties
    buyer_address = Column(String(42), nullable=False)
    seller_address = Column(String(42), nullable=False)
    
    # Amounts
    amount = Column(Numeric(20, 2), nullable=False)
    platform_fee = Column(Numeric(20, 2), nullable=False)  # 2.5% of amount
    
    # Credentials
    credentials_ipfs_hash = Column(String(255), nullable=True)
    
    # Verification Period
    verification_deadline = Column(
        DateTime,
        nullable=True  # Set when credentials are delivered
    )
    
    # Dispute
    dispute_reason = Column(Text, nullable=True)
    arbitrator_decision = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    offer = relationship("Offer", back_populates="escrow")

    def set_verification_deadline(self, hours: int = 72) -> None:
        """Set verification deadline from now."""
        self.verification_deadline = datetime.utcnow() + timedelta(hours=hours)

    def __repr__(self) -> str:
        return f"<Escrow {self.contract_address or 'pending'} - {self.escrow_state.value}>"
