from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
from uagents.communication import make_request
import httpx
from typing import List, Dict, Optional
from pydantic import BaseModel


class NegotiationMessage(Model):
    deal_id: int
    offer_id: int
    sender: str
    message_type: str  # "offer", "counter_offer", "acceptance", "rejection"
    amount: Optional[int] = None
    equity_percentage: Optional[float] = None
    terms: Optional[str] = None


class NegotiationAgent:
    def __init__(self, name: str = "negotiation_agent"):
        self.agent = Agent(
            name=name,
            port=8003,
            seed="negotiation_seed_phrase",
            endpoint=["http://127.0.0.1:8003/submit"]
        )
        
        fund_agent_if_low(self.agent.wallet.address())
        
        @self.agent.on_event("startup")
        async def startup_handler(ctx: Context):
            ctx.logger.info("Negotiation Agent starting up...")
            
        @self.agent.on_message(model=NegotiationMessage)
        async def handle_negotiation(ctx: Context, sender: str, msg: NegotiationMessage):
            """Handle incoming negotiation messages"""
            ctx.logger.info(f"Received {msg.message_type} for deal {msg.deal_id} from {sender}")
            
            try:
                if msg.message_type == "offer":
                    await self.process_offer(ctx, msg)
                elif msg.message_type == "counter_offer":
                    await self.process_counter_offer(ctx, msg)
                elif msg.message_type == "acceptance":
                    await self.process_acceptance(ctx, msg)
                elif msg.message_type == "rejection":
                    await self.process_rejection(ctx, msg)
                    
            except Exception as e:
                ctx.logger.error(f"Error handling negotiation: {e}")
    
    async def process_offer(self, ctx: Context, msg: NegotiationMessage):
        """Process new offer and notify founder"""
        try:
            # Store offer in backend
            await self.store_offer(msg)
            
            # Notify founder via websocket/API
            await self.notify_founder(msg)
            
            ctx.logger.info(f"Processed offer {msg.offer_id} for deal {msg.deal_id}")
            
        except Exception as e:
            ctx.logger.error(f"Error processing offer: {e}")
    
    async def process_counter_offer(self, ctx: Context, msg: NegotiationMessage):
        """Process counter offer and notify buyer"""
        try:
            # Update offer in backend
            await self.update_offer(msg)
            
            # Notify buyer
            await self.notify_buyer(msg)
            
            ctx.logger.info(f"Processed counter offer for deal {msg.deal_id}")
            
        except Exception as e:
            ctx.logger.error(f"Error processing counter offer: {e}")
    
    async def process_acceptance(self, ctx: Context, msg: NegotiationMessage):
        """Process offer acceptance and initiate escrow"""
        try:
            # Update offer status
            await self.accept_offer(msg)
            
            # Trigger escrow setup
            await self.initiate_escrow(msg)
            
            ctx.logger.info(f"Accepted offer {msg.offer_id} - escrow initiated")
            
        except Exception as e:
            ctx.logger.error(f"Error processing acceptance: {e}")
    
    async def process_rejection(self, ctx: Context, msg: NegotiationMessage):
        """Process offer rejection"""
        try:
            await self.reject_offer(msg)
            ctx.logger.info(f"Rejected offer {msg.offer_id}")
            
        except Exception as e:
            ctx.logger.error(f"Error processing rejection: {e}")
    
    async def store_offer(self, msg: NegotiationMessage):
        """Store offer in backend canister"""
        async with httpx.AsyncClient() as client:
            payload = {
                "deal_id": msg.deal_id,
                "amount": msg.amount,
                "equity_percentage": msg.equity_percentage,
                "terms": msg.terms,
                "sender": msg.sender
            }
            await client.post(
                "http://localhost:4943/api/v2/canisters/listing_registry/update/create_offer",
                json=payload
            )
    
    async def update_offer(self, msg: NegotiationMessage):
        """Update existing offer"""
        async with httpx.AsyncClient() as client:
            payload = {
                "offer_id": msg.offer_id,
                "amount": msg.amount,
                "equity_percentage": msg.equity_percentage,
                "terms": msg.terms
            }
            await client.post(
                "http://localhost:4943/api/v2/canisters/listing_registry/update/update_offer",
                json=payload
            )
    
    async def accept_offer(self, msg: NegotiationMessage):
        """Mark offer as accepted"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"http://localhost:4943/api/v2/canisters/listing_registry/update/accept_offer/{msg.offer_id}"
            )
    
    async def reject_offer(self, msg: NegotiationMessage):
        """Mark offer as rejected"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"http://localhost:4943/api/v2/canisters/listing_registry/update/reject_offer/{msg.offer_id}"
            )
    
    async def initiate_escrow(self, msg: NegotiationMessage):
        """Initiate escrow process"""
        async with httpx.AsyncClient() as client:
            payload = {
                "offer_id": msg.offer_id,
                "amount": msg.amount
            }
            await client.post(
                "http://localhost:4943/api/v2/canisters/escrow/update/create_escrow",
                json=payload
            )
    
    async def notify_founder(self, msg: NegotiationMessage):
        """Notify founder of new offer"""
        # Implementation would depend on notification system (WebSocket, email, etc.)
        pass
    
    async def notify_buyer(self, msg: NegotiationMessage):
        """Notify buyer of counter offer"""
        # Implementation would depend on notification system
        pass
    
    def run(self):
        self.agent.run()


if __name__ == "__main__":
    agent = NegotiationAgent()
    agent.run()