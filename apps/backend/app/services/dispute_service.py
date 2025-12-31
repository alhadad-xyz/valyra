import logging
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.escrow import Escrow, EscrowState
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

class DisputeService:
    def file_dispute(self, db: Session, escrow_id: UUID, reason: str, user: User) -> Escrow:
        """
        File a dispute for an escrow.
        Only the buyer or seller can file a dispute.
        """
        escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise HTTPException(status_code=404, detail="Escrow not found")

        # Verify user is party to the escrow
        if str(user.wallet_address) not in [str(escrow.buyer_address), str(escrow.seller_address)]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only parties to the transaction can file a dispute"
            )

        # Verify escrow state (can only dispute if funded, delivered, confirmed, or completed? - maybe just up to confirmed?)
        # Let's say we can dispute up until it is RESOLVED or REFUNDED.
        # Actually usually disputes happen before completion.
        if escrow.escrow_state in [EscrowState.RESOLVED, EscrowState.REFUNDED]:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escrow is already resolved or refunded"
            )
        
        escrow.escrow_state = EscrowState.DISPUTED
        escrow.dispute_reason = reason
        db.commit()
        db.refresh(escrow)
        
        logger.info(f"Dispute filed for escrow {escrow_id} by {user.id}")
        return escrow

    def resolve_dispute(self, db: Session, escrow_id: UUID, decision: str, arbitrator: User) -> Escrow:
        """
        Resolve a dispute.
        Only an arbitrator can resolve a dispute.
        """
        if arbitrator.role != UserRole.ARBITRATOR:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an arbitrator can resolve disputes"
            )

        escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise HTTPException(status_code=404, detail="Escrow not found")

        if escrow.escrow_state != EscrowState.DISPUTED:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escrow is not in a disputed state"
            )

        escrow.arbitrator_decision = decision
        escrow.escrow_state = EscrowState.RESOLVED
        
        # In a real system, we might trigger fund movements here depending on the decision.
        # For now, we just update the state.
        
        db.commit()
        db.refresh(escrow)
        
        logger.info(f"Dispute resolved for escrow {escrow_id} by arbitrator {arbitrator.id}")
        return escrow

    def get_dispute_details(self, db: Session, escrow_id: UUID, user: User) -> Escrow:
        """
        Get dispute details.
        Only accessible by buyer, seller, or arbitrator.
        """
        escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise HTTPException(status_code=404, detail="Escrow not found")

        is_party = str(user.wallet_address) in [str(escrow.buyer_address), str(escrow.seller_address)]
        is_arbitrator = user.role == UserRole.ARBITRATOR

        if not (is_party or is_arbitrator):
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return escrow

dispute_service = DisputeService()
