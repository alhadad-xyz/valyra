from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Dict, Any

class VerificationRequest(BaseModel):
    github_username: str = Field(..., description="The GitHub username to verify")
    linkedin_url: HttpUrl = Field(..., description="The LinkedIn profile URL to scrape")

class VerificationResponse(BaseModel):
    trust_score: int = Field(..., ge=0, le=100, description="The calculated trust score (0-100)")
    details: Dict[str, Any] = Field(..., description="Detailed breakdown of the scoring factors")
    github_data: Optional[Dict[str, Any]] = Field(None, description="Data fetched from GitHub")
    linkedin_data: Optional[Dict[str, Any]] = Field(None, description="Data scraped from LinkedIn")
