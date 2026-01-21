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
    email_on_offer: Optional[bool] = None
    email_on_status: Optional[bool] = None
    marketing_drops: Optional[bool] = None

class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    wallet_address: str
    basename: Optional[str] = None
    email: Optional[str] = None
    google_id: Optional[str] = None
    stripe_account_id: Optional[str] = None
    email_on_offer: int = 1
    email_on_status: int = 1
    marketing_drops: int = 1
    verification_level: VerificationLevel
    reputation_score: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PublicUserResponse(BaseModel):
    """Schema for public user profile."""
    id: UUID
    wallet_address: str
    basename: Optional[str] = None
    verification_level: VerificationLevel
    reputation_score: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserStatsResponse(BaseModel):
    """Schema for user dashboard statistics."""
    total_spent: float
    total_earned: float
    trust_score: int
