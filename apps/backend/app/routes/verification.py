from fastapi import APIRouter, HTTPException, Depends
from app.schemas.verification import VerificationRequest, VerificationResponse
from app.services.identity_verification import IdentityVerificationService

router = APIRouter(tags=["verification"])

@router.post("/verification/verify-identity", response_model=VerificationResponse)
async def verify_identity(request: VerificationRequest):
    """
    Verifies a user's identity based on their GitHub profile and LinkedIn URL.
    Returns a trust score (0-100) and detailed breakdown.
    """
    service = IdentityVerificationService()
    try:
        result = await service.verify_user(request.github_username, str(request.linkedin_url))
        return VerificationResponse(**result)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
