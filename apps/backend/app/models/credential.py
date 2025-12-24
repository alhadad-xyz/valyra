"""User Credential model for WebAuthn/Passkeys."""
import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class UserCredential(Base):
    """Stores WebAuthn public key credentials."""
    __tablename__ = "user_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Use database ID or credential_id as PK
    # Typically credential_id is the unique identifier from WebAuthn
    credential_id = Column(String(1024), primary_key=True, index=True) 
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    public_key = Column(LargeBinary, nullable=False)
    sign_count = Column(Integer, default=0, nullable=False)
    transports = Column(String(255), nullable=True)  # Comma-separated list of transports

    user = relationship("User", back_populates="credentials")
