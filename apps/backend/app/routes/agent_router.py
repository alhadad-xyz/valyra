from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.core.config import settings
from app.agent.executor import execute_agent_action
from app.schemas.valuation import ValuationRequest, AgentValuationResponse
from app.services.agent_service import agent_service
from app.core.rate_limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/agent", tags=["Agent"])

class AgentRequest(BaseModel):
    prompt: str

async def verify_admin_key(x_admin_key: str = Header(..., alias="X-Admin-Key")):
    """Verify the X-Admin-Key header."""
    if not settings.admin_api_key:
         raise HTTPException(status_code=500, detail="Admin Key not configured on server")
         
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=403, detail="Invalid Admin Key")

@router.post("/execute")
@limiter.limit("10/minute")
async def execute_command(
    request: Request,
    request_data: AgentRequest,
    _ = Depends(verify_admin_key)
):
    """Execute a natural language command via the Agent."""
    try:
        response = await execute_agent_action(request_data.prompt)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/valuation", response_model=AgentValuationResponse)
@limiter.limit("5/minute")
async def agent_valuation(
    request: Request,
    valuation_request: ValuationRequest,
    # Made public for frontend integration - consider adding user auth in production
):
    """
    Get a signed valuation attestation from the AI Agent.
    """
    try:
        metrics = valuation_request.model_dump()
        result = await agent_service.process_valuation(metrics)
        return AgentValuationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
