from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.core.config import settings
from app.agent.executor import execute_agent_action

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
async def execute_command(
    request: AgentRequest,
    _ = Depends(verify_admin_key)
):
    """Execute a natural language command via the Agent."""
    try:
        response = await execute_agent_action(request.prompt)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
