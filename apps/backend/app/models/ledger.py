
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class HoldStatus(str, enum.Enum):
    PENDING = "PENDING"
    RELEASED = "RELEASED"
    REJECTED = "REJECTED"

class DepositStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    HELD = "HELD"
    FAILED = "FAILED"

class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=2), default=0, nullable=False)
    currency = Column(String, default="IDRX", nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # user = relationship("User", back_populates="balance") 

class Hold(Base):
    __tablename__ = "holds"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=2), nullable=False)
    reason = Column(String, nullable=False)
    status = Column(Enum(HoldStatus), default=HoldStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class PendingDeposit(Base):
    __tablename__ = "pending_deposits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=20, scale=2), nullable=False)
    tx_hash = Column(String, unique=True, index=True, nullable=False)
    status = Column(Enum(DepositStatus), default=DepositStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
