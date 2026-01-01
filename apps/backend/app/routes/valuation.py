from fastapi import APIRouter, HTTPException, Depends
from app.schemas.valuation import ValuationRequest, ValuationResponse
from app.services.valuation_service import valuation_service

router = APIRouter(prefix="/valuation", tags=["Valuation"])

@router.post("/analyze", response_model=ValuationResponse)
async def analyze_valuation(request: ValuationRequest):
    """
    Analyze a SaaS project and provide a valuation range.
    """
    try:
        metrics = request.model_dump()
        result = await valuation_service.generate_valuation(metrics)
        return ValuationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
