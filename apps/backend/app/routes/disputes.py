from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user
from app.services.dispute_service import dispute_service
from app.services.listing_encryption_service import ListingEncryptionService
from app.schemas.dispute import DisputeCreate, DisputeResolve, DisputeResponse
from app.models.escrow import Escrow

router = APIRouter(prefix="/disputes", tags=["Disputes"])

@router.post("/{escrow_id}/file", response_model=DisputeResponse)
async def file_dispute(
    escrow_id: UUID,
    dispute: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    File a dispute for an escrow.
    """
    escrow = dispute_service.file_dispute(db, escrow_id, dispute.reason, current_user)
    return DisputeResponse(
        escrow_id=escrow.id,
        escrow_state=escrow.escrow_state.value,
        dispute_reason=escrow.dispute_reason,
        arbitrator_decision=escrow.arbitrator_decision
    )

@router.post("/{escrow_id}/resolve", response_model=DisputeResponse)
async def resolve_dispute(
    escrow_id: UUID,
    resolution: DisputeResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resolve a dispute (Arbitrator only).
    """
    escrow = dispute_service.resolve_dispute(db, escrow_id, resolution.decision, current_user)
    return DisputeResponse(
        escrow_id=escrow.id,
        escrow_state=escrow.escrow_state.value,
        dispute_reason=escrow.dispute_reason,
        arbitrator_decision=escrow.arbitrator_decision
    )

@router.get("/{escrow_id}/credentials", response_model=Dict)
async def get_credentials(
    escrow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get encrypted credentials bundle for the arbitrator.
    """
    escrow = dispute_service.get_dispute_details(db, escrow_id, current_user)
    
    # Check if escrow has an offer and listing
    if not escrow.offer or not escrow.offer.listing_id:
        raise HTTPException(status_code=404, detail="Listing not found for this escrow")
        
    listing_id = escrow.offer.listing_id
    
    # Get credentials for the current user (which should be an arbitrator if they are accessing this)
    # The get_dispute_details already ensures they are authorized to view dispute details.
    # But only someone with a VaultKey can explicitly decouple.
    
    bundle = ListingEncryptionService.get_encrypted_key_bundle(
        db, 
        listing_id,
        str(current_user.wallet_address)
    )
    
    if not bundle:
         raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No credential keys found for this user. You might not be the designated arbitrator."
            )
            
    return bundle
