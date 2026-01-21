from pydantic import BaseModel, Field
from typing import Optional

class ValuationRange(BaseModel):
    min: float
    max: float

class ValuationResponse(BaseModel):
    valuation_range: ValuationRange
    confidence: float = Field(..., ge=0.0, le=1.0)

class ValuationRequest(BaseModel):
    revenue: float = Field(..., gt=0, description="Annual Recurring Revenue (ARR) or Annual Revenue")
    growth_rate: Optional[float] = Field(None, description="Year-over-Year Growth Rate (e.g., 0.5 for 50%)")
    revenue_trend: Optional[str] = Field(None, description="Revenue trend (growing, stable, declining)")
    industry: Optional[str] = Field(None, description="Industry sector (e.g., SaaS, E-commerce)")
    description: Optional[str] = Field(None, description="Brief description of the project")

class AgentValuationResponse(ValuationResponse):
    signature: str
    attestation_message: str
    warnings: list[str] = []
