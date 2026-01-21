from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.middleware.signature import verify_signature

async def get_current_user(
    wallet_address: str = Depends(verify_signature),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user based on wallet signature.
    """
    # Ensure wallet address is lowercase
    wallet_address = wallet_address.lower()
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        # Auto-create user for new wallets
        from app.models.user import VerificationLevel
        user = User(
            wallet_address=wallet_address,
            email=f"{wallet_address[:8]}@valyra.xyz", # Placeholder
            verification_level=VerificationLevel.BASIC
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
