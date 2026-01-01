import asyncio
import logging
from typing import Dict, Any, Optional
from web3 import Web3
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.database import SessionLocal
from app.core.config import settings
from app.models.listing import Listing, ListingStatus
from app.models.escrow import Escrow, EscrowState
from app.models.offer import Offer, OfferStatus
from app.models.user import User

logger = logging.getLogger(__name__)

# Minimal metrics ABI for Escrow events
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

# Marketplace V1 ABI (Events only)
MARKETPLACE_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "listingId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "title", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "askingPrice", "type": "uint256"},
            {"indexed": False, "internalType": "uint8", "name": "verificationLevel", "type": "uint8"}
        ],
        "name": "ListingCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "listingId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "ipfsMetadata", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "newPrice", "type": "uint256"}
        ],
        "name": "ListingUpdated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "listingId", "type": "uint256"}
        ],
        "name": "ListingCancelled",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "SellerStaked",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "StakeWithdrawn",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "genesisNumber", "type": "uint256"}
        ],
        "name": "GenesisSellerJoined",
        "type": "event"
    }
]

class IndexerService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.base_rpc_url))
        
        # Initialize Escrow Contract
        self.escrow_contract_address = settings.escrow_contract_address
        self.escrow_contract = None
        if not self.escrow_contract_address:
            logger.warning("Indexer: ESCROW_CONTRACT_ADDRESS not set. Escrow indexing paused.")
        else:
            try:
                addr = Web3.to_checksum_address(self.escrow_contract_address)
                self.escrow_contract = self.w3.eth.contract(address=addr, abi=ESCROW_ABI)
            except Exception as e:
                logger.error(f"Indexer: Invalid Escrow address or ABI: {e}")

        # Initialize Marketplace Contract
        self.marketplace_contract_address = settings.marketplace_contract_address
        self.marketplace_contract = None
        if not self.marketplace_contract_address:
            logger.warning("Indexer: MARKETPLACE_CONTRACT_ADDRESS not set. Marketplace indexing paused.")
        else:
            try:
                addr = Web3.to_checksum_address(self.marketplace_contract_address)
                self.marketplace_contract = self.w3.eth.contract(address=addr, abi=MARKETPLACE_ABI)
            except Exception as e:
                logger.error(f"Indexer: Invalid Marketplace address or ABI: {e}")

    async def start(self):
        if not self.escrow_contract and not self.marketplace_contract:
            logger.info("Indexer: No contracts to watch.")
            return

        logger.info(f"Indexer: Starting polling on {settings.base_rpc_url}")
        
        while True:
            try:
                await self.check_events()
                await asyncio.sleep(15)
            except Exception as e:
                logger.error(f"Indexer Error: {e}")
                await asyncio.sleep(15)

    async def check_events(self):
        # Poll recent blocks (Naive implementation)
        try:
            current_block = self.w3.eth.block_number
            from_block = max(0, current_block - 10) # Look back 10 blocks
        except Exception as e:
            logger.error(f"Indexer: Failed to get block number: {e}")
            return

        # 1. Process Escrow Events
        if self.escrow_contract:
            try:
                # EscrowCreated
                events = self.escrow_contract.events.EscrowCreated.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_escrow_created(event)
                
                # ReceiptConfirmed
                events = self.escrow_contract.events.ReceiptConfirmed.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_receipt_confirmed(event)
                
                # DisputeRaised
                events = self.escrow_contract.events.DisputeRaised.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_dispute_raised(event)
            except Exception as e:
                 logger.error(f"Indexer (Escrow) Error: {e}")

        # 2. Process Marketplace Events
        if self.marketplace_contract:
            try:
                # ListingCreated
                events = self.marketplace_contract.events.ListingCreated.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_listing_created(event)

                # ListingUpdated
                events = self.marketplace_contract.events.ListingUpdated.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_listing_updated(event)

                # ListingCancelled
                events = self.marketplace_contract.events.ListingCancelled.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_listing_cancelled(event)
                
                # SellerStaked
                events = self.marketplace_contract.events.SellerStaked.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_seller_staked(event)
                
                # StakeWithdrawn
                events = self.marketplace_contract.events.StakeWithdrawn.get_logs(fromBlock=from_block)
                for event in events:
                    self.process_stake_withdrawn(event)
                
                # GenesisSellerJoined
                events = self.marketplace_contract.events.GenesisSellerJoined.get_logs(fromBlock=from_block)
                for event in events:
                     self.process_genesis_seller_joined(event)

            except Exception as e:
                logger.error(f"Indexer (Marketplace) Error: {e}")

    # --- Escrow Handlers ---

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
            existing = db.query(Escrow).filter(Escrow.contract_address == settings.escrow_contract_address, Escrow.escrow_state == EscrowState.CREATED).all() # This query seems suspicious logic but keeping as original
            
            # Find Listing
            listing = db.query(Listing).filter(Listing.on_chain_id == listing_id).first()
            if not listing:
                logger.warning(f"Listing not found for on_chain_id {listing_id}")
                return

            # JIT Verification
            from app.services.ledger_service import LedgerService
            
            user = db.query(User).filter(User.wallet_address == buyer).first()
            if user:
                ledger = LedgerService(db)
                display_amount = float(amount) / 1e18
                try:
                    deposit_result = ledger.process_deposit(
                        user_id=str(user.id),
                        amount=display_amount,
                        tx_hash=tx_hash
                    )
                    logger.info(f"JIT Verification Result for {buyer}: {deposit_result}")
                    if deposit_result.get("status") == "HELD":
                        logger.warning(f"Escrow {escrow_id} involves risky buyer {buyer}. Deposit held internally.")
                except Exception as e:
                    logger.error(f"Error checking JIT verification: {e}")
            else:
                logger.warning(f"Buyer {buyer} not found in Users table. Skipping JIT check.")

            # Create Escrow record
            new_escrow = Escrow(
                contract_address=settings.escrow_contract_address, 
                buyer_address=buyer,
                seller_address=seller,
                amount=float(amount) / 1e18, 
                platform_fee=(float(amount) / 1e18) * 0.025,
                escrow_state=EscrowState.FUNDED
            )
            db.add(new_escrow)
            
            # Update Listing
            listing.status = ListingStatus.SOLD
            db.commit()
            logger.info(f"Created Escrow record for {escrow_id}")

    def process_receipt_confirmed(self, event):
        # Update state to RELEASED/TRANSITION
        pass

    def process_dispute_raised(self, event):
        # Update state to DISPUTED
        pass

    # --- Marketplace Handlers ---

    def process_listing_created(self, event):
        args = event['args']
        listing_id = args['listingId']
        seller_addr = args['seller']
        title = args['title']
        asking_price = args['askingPrice']
        
        logger.info(f"Processing ListingCreated: ID={listing_id} Title={title}")

        with SessionLocal() as db:
            # Try to match existing DRAFT listing by seller and title
            listing = db.query(Listing).join(User).filter(
                User.wallet_address == seller_addr,
                Listing.asset_name == title
                # Could also check status OR asking_price
            ).first()

            if listing:
                # Update existing
                listing.on_chain_id = listing_id
                listing.status = ListingStatus.ACTIVE
                # asking_price in event is Wei, DB is Unit
                # Only update if meaningful, or trust the event
                # listing.asking_price = float(asking_price) / 1e18
                logger.info(f"Linked Listing {listing.id} to on_chain_id {listing_id}")
            else:
                # Create new listing if not found??
                # For robust indexing, we might want to create it, but we lack metadata.
                # We will log warning for now.
                logger.warning(f"No matching local listing found for ListingCreated {listing_id}")
            
            db.commit()

    def process_listing_updated(self, event):
        args = event['args']
        listing_id = args['listingId']
        new_price = args['newPrice']
        ipfs_metadata = args['ipfsMetadata']
        
        logger.info(f"Processing ListingUpdated: ID={listing_id}")

        with SessionLocal() as db:
            listing = db.query(Listing).filter(Listing.on_chain_id == listing_id).first()
            if listing:
                listing.asking_price = float(new_price) / 1e18
                # If we parsed IPFS, we could update description etc.
                logger.info(f"Updated Listing {listing.id} Price to {listing.asking_price}")
                db.commit()

    def process_listing_cancelled(self, event):
        args = event['args']
        listing_id = args['listingId']
        
        logger.info(f"Processing ListingCancelled: ID={listing_id}")

        with SessionLocal() as db:
            listing = db.query(Listing).filter(Listing.on_chain_id == listing_id).first()
            if listing:
                listing.status = ListingStatus.PAUSED # Or specialized status
                logger.info(f"Cancelled/Paused Listing {listing.id}")
                db.commit()

    def process_seller_staked(self, event):
        args = event['args']
        seller = args['seller']
        amount = args['amount']
        logger.info(f"SellerStaked: {seller} staked {amount} Wei")
        # TODO: Update user model with staked amount

    def process_stake_withdrawn(self, event):
        args = event['args']
        seller = args['seller']
        amount = args['amount']
        logger.info(f"StakeWithdrawn: {seller} withdrew {amount} Wei")

    def process_genesis_seller_joined(self, event):
        args = event['args']
        seller = args['seller']
        num = args['genesisNumber']
        logger.info(f"GenesisSellerJoined: {seller} is Genesis #{num}")

indexer = IndexerService()
