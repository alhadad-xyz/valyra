
from sqlalchemy.orm import Session
from app.models.ledger import Balance, Hold, PendingDeposit, HoldStatus, DepositStatus
from app.services.identity_verification import IdentityVerificationService
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class LedgerService:
    def __init__(self, db: Session):
        self.db = db
        self.kyc_service = IdentityVerificationService()

    def process_deposit(self, user_id: str, amount: float, tx_hash: str) -> dict:
        """
        Process a user deposit.
        1. Check JIT verification status.
        2. If OK -> Credit Balance.
        3. If RISKY -> Create Hold and PendingDeposit (status=HELD).
        """
        # Check for existing processed tx to avoid double spend
        existing_deposit = self.db.query(PendingDeposit).filter(PendingDeposit.tx_hash == tx_hash).first()
        if existing_deposit:
             logger.info(f"Deposit {tx_hash} already processed.")
             return {"status": "SKIPPED", "detail": "Transaction already processed"}

        # 1. JIT Verification Check
        kyc_result = self.kyc_service.check_status(user_id, self.db)
        
        # Create PendingDeposit record initially
        deposit_record = PendingDeposit(
            user_id=user_id,
            amount=amount,
            tx_hash=tx_hash,
            status=DepositStatus.PENDING
        )
        self.db.add(deposit_record)
        
        if kyc_result["status"] == "RISKY":
            # 2. Risk Detected -> Hold
            logger.warning(f"Deposit flagged for user {user_id}: {kyc_result.get('reasons')}")
            
            hold = Hold(
                user_id=user_id,
                amount=amount,
                reason=f"JIT Verification Flag: {kyc_result.get('reasons')}",
                status=HoldStatus.PENDING
            )
            deposit_record.status = DepositStatus.HELD
            
            self.db.add(hold)
            self.db.commit()
            
            # Emit Alert (simulated log)
            logger.error(f"[ALERT] High Risk Deposit HELD: User {user_id}, Amount {amount}, Tx {tx_hash}")
            
            return {
                "status": "HELD",
                "detail": "Deposit held for manual review due to risk flags.",
                "hold_id": hold.id
            }
            
        else:
            # 3. Safe -> Credit Balance
            deposit_record.status = DepositStatus.COMPLETED
            
            balance = self.db.query(Balance).filter(Balance.user_id == user_id).first()
            if not balance:
                balance = Balance(user_id=user_id, amount=0, currency="IDRX")
                self.db.add(balance)
            
            balance.amount += Decimal(str(amount)) # Use Decimal for precision
            
            self.db.commit()
            
            logger.info(f"Deposit processed successfully for user {user_id}. Amount: {amount}")
            return {
                "status": "COMPLETED",
                "detail": "Deposit credited to balance.",
                "new_balance": float(balance.amount)
            }
