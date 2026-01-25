from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class VerificationRecordResponse(BaseModel):
    id: UUID
    verification_type: str
    status: str
    verified_at: Optional[datetime]
    verification_data: Optional[dict]
    
    class Config:
        from_attributes = True
