"""Credential Vault models for Zero-Trust security."""
import uuid
import enum
from sqlalchemy import Column, String, Integer, ForeignKey, LargeBinary, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.database import Base

class VaultRole(str, enum.Enum):
    """Role of the recipient in the transaction."""
    BUYER = "buyer"
    SELLER = "seller"
    ARBITRATOR = "arbitrator"

class VaultEntry(Base):
    """
    Stores the encrypted credentials for a listing.
    The credentials are encrypted with an Ephemeral Keypair (EK).
    """
    __tablename__ = "vault_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False, unique=True, index=True)
    
    # The actual credentials, encrypted with the Ephemeral Public Key
    encrypted_data = Column(LargeBinary, nullable=False)
    
    # The Ephemeral Public Key used for encryption (stored for verification/context)
    # Storing as hex string
    ephemeral_public_key = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    listing = relationship("Listing")
    keys = relationship("VaultKey", back_populates="entry", cascade="all, delete-orphan")

class VaultKey(Base):
    """
    Stores the Ephemeral Private Key, encrypted for a specific recipient.
    This allows 2-of-3 multi-encryption (Buyer, Seller, Arbitrator).
    """
    __tablename__ = "vault_keys"

    id = Column(Integer, primary_key=True, index=True)
    vault_entry_id = Column(UUID(as_uuid=True), ForeignKey("vault_entries.id"), nullable=False, index=True)
    
    # Wallet address of the recipient
    recipient_address = Column(String(42), nullable=False)
    
    # Role of the recipient
    recipient_role = Column(Enum(VaultRole), nullable=False)
    
    # The Ephemeral Private Key, encrypted with the Recipient's Public Key (ECIES)
    encrypted_ephemeral_private_key = Column(LargeBinary, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    entry = relationship("VaultEntry", back_populates="keys")
