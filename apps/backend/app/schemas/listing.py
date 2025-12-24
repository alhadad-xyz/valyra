from typing import Optional, Dict, Any, List
from decimal import Decimal
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl
from app.models.listing import AssetType, RevenueTrend, ListingStatus, VerificationStatus

class ListingBase(BaseModel):
    """Base Pydantic model for Listing."""
    asset_name: str = Field(..., max_length=255)
    asset_type: AssetType
    business_url: str = Field(..., max_length=512)
    description: str
    asking_price: Decimal = Field(..., ge=0)
    tech_stack: Optional[Dict[str, Any]] = None
    build_id: Optional[str] = Field(None, max_length=255)
    
    # Financials
    mrr: Decimal = Field(..., ge=0)
    annual_revenue: Decimal = Field(..., ge=0)
    monthly_profit: Decimal = Field(..., ge=0)
    monthly_expenses: Decimal = Field(..., ge=0)
    revenue_trend: RevenueTrend

    # Included Assets
    domain_included: bool = False
    source_code_included: bool = False
    customer_data_included: bool = False


class ListingCreate(ListingBase):
    """Schema for creating a listing."""
    pass


class ListingUpdate(BaseModel):
    """Schema for updating a listing."""
    asset_name: Optional[str] = Field(None, max_length=255)
    asset_type: Optional[AssetType] = None
    business_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = None
    asking_price: Optional[Decimal] = Field(None, ge=0)
    tech_stack: Optional[Dict[str, Any]] = None
    build_id: Optional[str] = Field(None, max_length=255)
    
    mrr: Optional[Decimal] = Field(None, ge=0)
    annual_revenue: Optional[Decimal] = Field(None, ge=0)
    monthly_profit: Optional[Decimal] = Field(None, ge=0)
    monthly_expenses: Optional[Decimal] = Field(None, ge=0)
    revenue_trend: Optional[RevenueTrend] = None

    domain_included: Optional[bool] = None
    source_code_included: Optional[bool] = None
    customer_data_included: Optional[bool] = None
    status: Optional[ListingStatus] = None


class ListingResponse(ListingBase):
    """Schema for listing response."""
    id: UUID
    seller_id: UUID
    customer_count: Optional[int] = 0
    verification_status: VerificationStatus
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    
    # Optional IP/Signature fields
    ip_assignment_hash: Optional[str] = None
    seller_signature: Optional[str] = None

    class Config:
        orm_mode = True
