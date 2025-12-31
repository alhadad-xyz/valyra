from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class DisputeCreate(BaseModel):
    reason: str

class DisputeResolve(BaseModel):
    decision: str

class DisputeResponse(BaseModel):
    escrow_id: UUID
    escrow_state: str
    dispute_reason: Optional[str]
    arbitrator_decision: Optional[str]
    
    class Config:
        from_attributes = True
