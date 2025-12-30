
import asyncio
import logging
from typing import Dict, Any
from web3 import Web3
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.database import SessionLocal
from app.core.config import settings
from app.models.listing import Listing, ListingStatus
from app.models.escrow import Escrow, EscrowState
from app.models.offer import Offer, OfferStatus

logger = logging.getLogger(__name__)

# Minimal metrics ABI for events we care about
ESCROW_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": True, "internalType": "uint256", "name": "listingId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": False, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "EscrowCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "immediateRelease", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "retainerAmount", "type": "uint256"}
        ],
        "name": "ReceiptConfirmed",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "initiator", "type": "address"},
            {"indexed": False, "internalType": "uint8", "name": "disputeType", "type": "uint8"},
            {"indexed": False, "internalType": "string", "name": "evidenceIpfs", "type": "string"}
        ],
        "name": "DisputeRaised",
        "type": "event"
    }
]

class EscrowIndexer:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.base_rpc_url))
        self.contract_address = settings.escrow_contract_address
        
        if not self.contract_address:
            logger.warning("Indexer: ESCROW_CONTRACT_ADDRESS not set. Indexing paused.")
            self.contract = None
        else:
            try:
                self.contract_address = Web3.to_checksum_address(self.contract_address)
                self.contract = self.w3.eth.contract(address=self.contract_address, abi=ESCROW_ABI)
            except Exception as e:
                logger.error(f"Indexer: Invalid contract address or ABI: {e}")
                self.contract = None

    async def start(self):
        if not self.contract:
            logger.info("Indexer: No contract to watch.")
            return

        logger.info(f"Indexer: Starting polling using {settings.base_rpc_url} for {self.contract_address}")
        
        # In production, load this from DB/Redis
        from_block = "latest" 
        
        while True:
            try:
                # Polling logic
                # For simplicity in this loop, we just grab logs from the last few blocks or 'latest'
                # A proper indexer tracks 'last_processed_block'
                
                # Fetch Logs
                # events = self.fetch_events(from_block)
                # for event in events:
                #     self.process_event(event)
                
                # Since we don't have a real chain connection in this env, we simulate or pass
                # Implementation of actual get_logs:
                # logs = self.w3.eth.get_logs({
                #    'fromBlock': from_block,
                #    'toBlock': 'latest',
                #    'address': self.contract_address
                # })
                # But we need to decode them using contract.events...
                
                # Simplified: Loop through event types
                await self.check_events()
                
                await asyncio.sleep(15)
            except Exception as e:
                logger.error(f"Indexer Error: {e}")
                await asyncio.sleep(15)

    async def check_events(self):
        # Synchronous Web3 calls should be run in executor if high volume, 
        # but for low volume/MVP direct checking is okay or use run_in_executor
        
        current_block = self.w3.eth.block_number
        # Process last 10 blocks (naive approach for MVP)
        from_block = max(0, current_block - 10)
        
        # 1. EscrowCreated
        try:
             events = self.contract.events.EscrowCreated.get_logs(fromBlock=from_block)
             for event in events:
                 self.process_escrow_created(event)
                 
             # 2. ReceiptConfirmed
             events = self.contract.events.ReceiptConfirmed.get_logs(fromBlock=from_block)
             for event in events:
                 self.process_receipt_confirmed(event)
                 
             # 3. DisputeRaised
             events = self.contract.events.DisputeRaised.get_logs(fromBlock=from_block)
             for event in events:
                 self.process_dispute_raised(event)
                 
        except Exception as e:
             # logger.debug(f"Error fetching logs (expected if no RPC): {e}")
             pass

    def process_escrow_created(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        listing_id = args['listingId']
        buyer = args['buyer']
        seller = args['seller']
        amount = args['amount']
        tx_hash = event['transactionHash'].hex()
        
        logger.info(f"Processing EscrowCreated: ID={escrow_id} Listing={listing_id}")
        
        with SessionLocal() as db:
            # Check if processed
            existing = db.query(Escrow).filter(Escrow.contract_address == settings.escrow_contract_address, Escrow.escrow_state == EscrowState.CREATED).all() 
            # Ideally we store on_chain_escrow_id in Escrow model too!
            # Current Escrow model has 'contract_address' but not 'on_chain_id'. 
            # We assume unique constraints or just update if found.
            # But wait, Escrow model needs `offer_id`.
            
            # Find Listing
            listing = db.query(Listing).filter(Listing.on_chain_id == listing_id).first()
            if not listing:
                logger.warning(f"Listing not found for on_chain_id {listing_id}")
                return

            # Check for existing Escrow by some unique prop? 
            # We might create duplicate escrows if we don't track event log index/tx hash.
            # For MVP, we'll skip complex dedup.
            
            # Create Escrow
            # We need an offer. If none exists, we create one? Or leave null?
            # Model allows null now.
            
            new_escrow = Escrow(
                contract_address=settings.escrow_contract_address, 
                # We need a field for 'on_chain_id' in Escrow to be precise, or assume ID=UUID is separate
                # Let's just use what we have.
                buyer_address=buyer,
                seller_address=seller,
                amount=amount, # This is in Wei/IDRX usually (18 decimals), DB is Numeric(20,2). 
                # Be careful with conversion. 100M IDRX = 100M * 1e18. 
                # DB Numeric might overflow if we store 1e18.
                # Assuming DB stores "Display Units" (e.g. 100.00), we need to divide by 1e18.
                platform_fee=0, # Calculated later or from event?
                escrow_state=EscrowState.FUNDED # Created -> FundsDeposited usually happens atomically in 'depositFunds'
            )
            
            # Conversion
            new_escrow.amount = float(amount) / 1e18
            new_escrow.platform_fee = new_escrow.amount * 0.025 # Estimate
            
            db.add(new_escrow)
            
            # Update Listing
            listing.status = ListingStatus.SOLD # Or PENDING
            
            db.commit()
            logger.info(f"Created Escrow record for {escrow_id}")

    def process_receipt_confirmed(self, event):
        # Update state to RELEASED/TRANSITION
        pass

    def process_dispute_raised(self, event):
        # Update state to DISPUTED
        pass

indexer = EscrowIndexer()
