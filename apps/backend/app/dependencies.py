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
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
