from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from app.models.user import VerificationLevel

class UserBase(BaseModel):
    """Base user schema."""
    pass

class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    basename: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    wallet_address: str
    basename: Optional[str] = None
    email: Optional[str] = None
    verification_level: VerificationLevel
    reputation_score: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
