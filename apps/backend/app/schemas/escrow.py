from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.escrow import EscrowState

class EscrowBase(BaseModel):
    pass

class EscrowResponse(EscrowBase):
    id: UUID
    on_chain_id: Optional[int]
    contract_address: Optional[str]
    escrow_state: EscrowState
    
    buyer_address: str
    seller_address: str
    
    amount: Decimal
    platform_fee: Decimal
    
    credentials_ipfs_hash: Optional[str] = None
    verification_deadline: Optional[datetime] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CredentialUploadRequest(BaseModel):
    """Request schema for uploading credentials to escrow vault."""
    domain_credentials: Optional[str] = None
    repo_url: Optional[str] = None
    repo_access_token: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None
    notes: Optional[str] = None

class PublicKeyRequest(BaseModel):
    """Request schema for sharing an encryption public key."""
    public_key: str
