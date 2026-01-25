from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator, field_serializer
from app.models.offer import OfferStatus

class OfferBase(BaseModel):
    offer_amount: Decimal = Field(..., gt=0)

class OfferCreate(OfferBase):
    listing_id: UUID
    earnest_tx_hash: Optional[str] = None

class OfferResponse(OfferBase):
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    earnest_deposit: Decimal
    on_chain_id: Optional[str] = None
    status: OfferStatus
    created_at: datetime
    expires_at: datetime
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=False)
    
    @field_validator('status', mode='before')
    @classmethod
    def parse_status(cls, v):
        if isinstance(v, str):
            # Try to match case-insensitive
            try:
                return OfferStatus(v.lower())
            except ValueError:
                pass
        return v

    @field_serializer('status')
    def serialize_status(self, v: OfferStatus, _info):
        return v.name

class OfferResponseWithListing(BaseModel):
    """Enhanced offer response with listing details for UI display."""
    id: UUID
    listing_id: UUID
    listing_on_chain_id: Optional[int] = None
    escrow_on_chain_id: Optional[int] = None
    escrow_id: Optional[UUID] = None
    escrow_state: Optional[str] = None
    listing_title: str
    listing_image: Optional[str]
    buyer_address: str
    seller_address: str
    offer_amount: Decimal
    earnest_deposit: Decimal
    on_chain_id: Optional[str] = None
    status: OfferStatus
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=False)

    @field_validator('status', mode='before')
    @classmethod
    def parse_status(cls, v):
        if isinstance(v, str):
            try:
                return OfferStatus(v.lower())
            except ValueError:
                pass
        return v

    @field_serializer('status')
    def serialize_status(self, v: OfferStatus, _info):
        return v.name
