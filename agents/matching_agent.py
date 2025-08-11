from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import httpx
from typing import List, Dict
from pydantic import BaseModel


class BuyerPreferences(BaseModel):
    min_revenue: int
    max_valuation: int
    preferred_sectors: List[str]
    risk_tolerance: str


class MatchScore(BaseModel):
    deal_id: int
    buyer_id: str
    score: float
    reasoning: str


class MatchingAgent:
    def __init__(self, name: str = "matching_agent"):
        self.agent = Agent(
            name=name,
            port=8002,
            seed="matching_seed_phrase",
            endpoint=["http://127.0.0.1:8002/submit"]
        )
        
        fund_agent_if_low(self.agent.wallet.address())
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            ctx.logger.info("Matching Agent starting up...")
            
        @self.agent.on_interval(period=60.0)
        async def generate_matches(ctx: Context):
            """Generate matches based on buyer preferences and available deals"""
            try:
                deals = await self.fetch_active_deals()
                buyers = await self.fetch_buyer_preferences()
                
                for buyer in buyers:
                    matches = await self.calculate_matches(buyer, deals)
                    await self.push_matches(ctx, buyer["id"], matches)
                    
            except Exception as e:
                ctx.logger.error(f"Error generating matches: {e}")
    
    async def fetch_active_deals(self) -> List[Dict]:
        """Fetch active deals from listing registry"""
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:4943/api/v2/canisters/listing_registry/query")
            if response.status_code == 200:
                return response.json()
            return []
    
    async def fetch_buyer_preferences(self) -> List[Dict]:
        """Fetch buyer preferences from frontend/backend"""
        # Mock implementation - would integrate with user preferences storage
        return [
            {
                "id": "buyer_1",
                "min_revenue": 100000,
                "max_valuation": 5000000,
                "preferred_sectors": ["fintech", "ai"],
                "risk_tolerance": "medium"
            }
        ]
    
    async def calculate_matches(self, buyer: Dict, deals: List[Dict]) -> List[MatchScore]:
        """Calculate match scores between buyer and deals"""
        matches = []
        
        for deal in deals:
            score = 0.0
            reasoning = []
            
            # Revenue matching
            if deal["revenue"] >= buyer["min_revenue"]:
                score += 0.3
                reasoning.append("Revenue meets minimum requirement")
            
            # Valuation matching  
            if deal["valuation"] <= buyer["max_valuation"]:
                score += 0.3
                reasoning.append("Valuation within budget")
            
            # Risk assessment
            if buyer["risk_tolerance"] == "high" or deal["revenue"] > 500000:
                score += 0.2
                reasoning.append("Risk profile aligned")
            
            # Growth potential
            if deal["revenue"] > 0:
                score += 0.2
                reasoning.append("Positive revenue")
            
            if score > 0.5:  # Threshold for good matches
                matches.append(MatchScore(
                    deal_id=deal["id"],
                    buyer_id=buyer["id"],
                    score=score,
                    reasoning="; ".join(reasoning)
                ))
        
        return sorted(matches, key=lambda x: x.score, reverse=True)
    
    async def push_matches(self, ctx: Context, buyer_id: str, matches: List[MatchScore]):
        """Push match results to buyer interface"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "buyer_id": buyer_id,
                    "matches": [match.dict() for match in matches[:5]]  # Top 5 matches
                }
                response = await client.post(
                    f"http://localhost:5173/api/matches/{buyer_id}",
                    json=payload
                )
                if response.status_code == 200:
                    ctx.logger.info(f"Pushed {len(matches)} matches for buyer {buyer_id}")
        except Exception as e:
            ctx.logger.error(f"Error pushing matches: {e}")
    
    def run(self):
        self.agent.run()


if __name__ == "__main__":
    agent = MatchingAgent()
    agent.run()