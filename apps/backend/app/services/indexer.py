import asyncio
import logging
from typing import Dict, Any, Optional
from web3 import Web3
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.database import SessionLocal
from app.core.config import settings
from app.models.listing import Listing, ListingStatus, AssetType, RevenueTrend
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
            {"indexed": True, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": False, "internalType": "uint8", "name": "encryptionMethod", "type": "uint8"}
        ],
        "name": "FundsDeposited",
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
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "offerId", "type": "uint256"},
            {"indexed": True, "internalType": "uint256", "name": "listingId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "offerPrice", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "depositAmount", "type": "uint256"}
        ],
        "name": "OfferMade",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "offerId", "type": "uint256"},
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "listingId", "type": "uint256"},
            {"indexed": False, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": False, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "OfferAccepted",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "offerId", "type": "uint256"}
        ],
        "name": "OfferRejected",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "AdminRetainerReleased",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "retainedAmount", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "releaseTime", "type": "uint256"}
        ],
        "name": "TransitionHoldCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "TransitionRetainerClaimed",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "issue", "type": "string"}
        ],
        "name": "TransitionIssueReported",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "offerId", "type": "uint256"}
        ],
        "name": "OfferCancelled",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "escrowId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "newDeadline", "type": "uint256"}
        ],
        "name": "VerificationExtended",
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
        # 0. Debug Check
        try:
            current_block = self.w3.eth.block_number
            # Hackathon Fix: Look back 5000 blocks (~3.5 hours on Base) to catch events after restart
            # In production, use a persisted last_processed_block in DB.
            from_block = max(0, current_block - 5000) 
            logger.info(f"Indexer Pulse: Checking events from block {from_block} to {current_block}")
        except Exception as e:
            logger.error(f"Indexer: Failed to get block number: {e}")
            return

        # 1. Process Escrow Events
        if self.escrow_contract:
            try:
                # EscrowCreated
                events = self.escrow_contract.events.EscrowCreated.get_logs(from_block=from_block)
                for event in events:
                    self.process_escrow_created(event)
                
                # FundsDeposited (for completeFunding calls)
                events = self.escrow_contract.events.FundsDeposited.get_logs(from_block=from_block)
                for event in events:
                    self.process_funds_deposited(event)
                
                # ReceiptConfirmed
                events = self.escrow_contract.events.ReceiptConfirmed.get_logs(from_block=from_block)
                for event in events:
                    self.process_receipt_confirmed(event)
                
                # TransitionRetainerClaimed
                events = self.escrow_contract.events.TransitionRetainerClaimed.get_logs(from_block=from_block)
                for event in events:
                    self.process_transition_retainer_claimed(event)
                
                # AdminRetainerReleased
                events = self.escrow_contract.events.AdminRetainerReleased.get_logs(from_block=from_block)
                for event in events:
                    self.process_admin_retainer_released(event)
                
                # TransitionIssueReported
                events = self.escrow_contract.events.TransitionIssueReported.get_logs(from_block=from_block)
                for event in events:
                    self.process_transition_issue_reported(event)
                
                # DisputeRaised
                events = self.escrow_contract.events.DisputeRaised.get_logs(from_block=from_block)
                for event in events:
                    self.process_dispute_raised(event)
                
                # OfferMade
                events = self.escrow_contract.events.OfferMade.get_logs(from_block=from_block)
                for event in events:
                    self.process_offer_made(event)
                
                # OfferAccepted
                events = self.escrow_contract.events.OfferAccepted.get_logs(from_block=from_block)
                for event in events:
                    self.process_offer_accepted(event)
                
                # OfferRejected
                events = self.escrow_contract.events.OfferRejected.get_logs(from_block=from_block)
                for event in events:
                    self.process_offer_rejected(event)
                
                # OfferCancelled
                events = self.escrow_contract.events.OfferCancelled.get_logs(from_block=from_block)
                for event in events:
                    self.process_offer_cancelled(event)

                # VerificationExtended
                events = self.escrow_contract.events.VerificationExtended.get_logs(from_block=from_block)
                for event in events:
                    self.process_verification_extended(event)
            except Exception as e:
                 logger.error(f"Indexer (Escrow) Error: {e}")

        # 2. Process Marketplace Events
        if self.marketplace_contract:
            try:
                # ListingCreated
                events = self.marketplace_contract.events.ListingCreated.get_logs(from_block=from_block)
                for event in events:
                    self.process_listing_created(event)

                # ListingUpdated
                events = self.marketplace_contract.events.ListingUpdated.get_logs(from_block=from_block)
                for event in events:
                    self.process_listing_updated(event)

                # ListingCancelled
                events = self.marketplace_contract.events.ListingCancelled.get_logs(from_block=from_block)
                for event in events:
                    self.process_listing_cancelled(event)
                
                # SellerStaked
                events = self.marketplace_contract.events.SellerStaked.get_logs(from_block=from_block)
                for event in events:
                    self.process_seller_staked(event)
                
                # StakeWithdrawn
                events = self.marketplace_contract.events.StakeWithdrawn.get_logs(from_block=from_block)
                for event in events:
                    self.process_stake_withdrawn(event)
                
                # GenesisSellerJoined
                events = self.marketplace_contract.events.GenesisSellerJoined.get_logs(from_block=from_block)
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

            # Check/Create Escrow record
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            if escrow:
                logger.info(f"Escrow {escrow_id} already exists in database. Skipping update to preserve state.")
                # Don't update existing escrow records - state transitions happen via specific events
                # (FundsDeposited for CREATED->FUNDED, etc.)
                db.commit()
                return
            else:
                # Query actual on-chain state to determine if CREATED or FUNDED
                # This is important for offer-based escrows which start as CREATED
                try:
                    escrow_contract = self.w3.eth.contract(
                        address=Web3.to_checksum_address(settings.escrow_contract_address),
                        abi=self.escrow_abi
                    )
                    on_chain_escrow = escrow_contract.functions.getEscrow(escrow_id).call()
                    on_chain_state = on_chain_escrow[11]  # state is at index 11 in the struct
                    
                    # Contract: 0=CREATED, 1=FUNDED, 2=DELIVERED, 3=CONFIRMED, 4=TRANSITION, 5=DISPUTED, 6=RESOLVED, 7=COMPLETED, 8=REFUNDED
                    state_mapping = {
                        0: EscrowState.CREATED,
                        1: EscrowState.FUNDED,
                        2: EscrowState.DELIVERED,
                        3: EscrowState.CONFIRMED,
                        4: EscrowState.TRANSITION,
                        5: EscrowState.DISPUTED,
                        6: EscrowState.RESOLVED,
                        7: EscrowState.COMPLETED,
                        8: EscrowState.REFUNDED
                    }
                    backend_state = state_mapping.get(on_chain_state, EscrowState.FUNDED)
                    logger.info(f"Escrow {escrow_id} on-chain state: {on_chain_state} -> {backend_state.value}")
                except Exception as e:
                    logger.error(f"Failed to fetch on-chain state for escrow {escrow_id}: {e}")
                    # Fallback to FUNDED for backwards compatibility
                    backend_state = EscrowState.FUNDED
                
                # Find User ID for buyer
                buyer_user = db.query(User).filter(User.wallet_address.ilike(buyer)).first()
                if not buyer_user:
                    # Create user if not exists? Usually users exist before they can buy
                    logger.warning(f"Buyer user not found for {buyer}, cannot create offer.")
                    buyer_id = None
                else:
                    buyer_id = buyer_user.id

                # Check for existing offer
                offer = db.query(Offer).filter(
                    Offer.listing_id == listing.id,
                    Offer.buyer_id == buyer_id,
                    Offer.status.in_([OfferStatus.PENDING, OfferStatus.ACCEPTED])
                ).first()

                if not offer and buyer_id:
                    logger.info(f"Creating synthetic ACCEPTED offer for Direct Purchase: Listing={listing_id}, Buyer={buyer}")
                    offer = Offer(
                        listing_id=listing.id,
                        buyer_id=buyer_id,
                        offer_amount=float(amount) / 1e18,
                        earnest_deposit=0, # Fully funded via direct purchase
                        status=OfferStatus.ACCEPTED,
                        on_chain_id=None # No on-chain offer ID for direct purchase
                    )
                    db.add(offer)
                    db.flush() # Get ID for linkage
                elif offer and offer.status == OfferStatus.PENDING:
                    logger.info(f"Transitioning existing PENDING offer {offer.id} to ACCEPTED via Direct Purchase")
                    offer.status = OfferStatus.ACCEPTED
                    # We don't flush here as it will be committed with the escrow

                new_escrow = Escrow(
                    contract_address=settings.escrow_contract_address,
                    on_chain_id=escrow_id,
                    offer_id=offer.id if offer else None,
                    buyer_address=buyer,
                    seller_address=seller,
                    amount=float(amount) / 1e18, 
                    platform_fee=(float(amount) / 1e18) * 0.025,
                    escrow_state=backend_state
                )
                db.add(new_escrow)
            
            # Update Listing
            listing.status = ListingStatus.SOLD
            db.commit()
            logger.info(f"Processed Escrow record for {escrow_id}")

    def process_funds_deposited(self, event):
        """Handle FundsDeposited event - transitions CREATED -> FUNDED when completeFunding is called"""
        args = event['args']
        escrow_id = args['escrowId']
        
        logger.info(f"Processing FundsDeposited: ID={escrow_id}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            
            if escrow:
                # Update state to FUNDED if it was CREATED (offer flow)
                if escrow.escrow_state == EscrowState.CREATED:
                    escrow.escrow_state = EscrowState.FUNDED
                    db.commit()
                    logger.info(f"Escrow {escrow_id} transitioned from CREATED to FUNDED")
                else:
                    logger.info(f"Escrow {escrow_id} already in state {escrow.escrow_state.value}")
            else:
                logger.warning(f"Escrow {escrow_id} not found for FundsDeposited event")

    def process_receipt_confirmed(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        
        logger.info(f"Processing ReceiptConfirmed: ID={escrow_id}")
        
        with SessionLocal() as db:
            # Find Escrow by on_chain_id
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            
            if escrow:
                escrow.escrow_state = EscrowState.TRANSITION
                db.commit()
                logger.info(f"Escrow {escrow_id} confirmed and moved to TRANSITION state.")
            else:
                logger.warning(f"Escrow record not found for ReceiptConfirmed {escrow_id}")

    def process_transition_retainer_claimed(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        
        logger.info(f"Processing TransitionRetainerClaimed: ID={escrow_id}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            if escrow:
                escrow.escrow_state = EscrowState.COMPLETED
                db.commit()
                logger.info(f"Escrow {escrow_id} fully completed via retainer claim.")

    def process_admin_retainer_released(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        
        logger.info(f"Processing AdminRetainerReleased: ID={escrow_id}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            if escrow:
                escrow.escrow_state = EscrowState.COMPLETED
                db.commit()
                logger.info(f"Escrow {escrow_id} fully completed via ADMIN force release.")

    def process_transition_issue_reported(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        issue = args.get('issue', 'No description provided')
        
        logger.info(f"Processing TransitionIssueReported: ID={escrow_id}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            if escrow:
                escrow.escrow_state = EscrowState.DISPUTED
                escrow.dispute_reason = f"Transition issue reported: {issue}"
                db.commit()
                logger.info(f"Escrow {escrow_id} marked as DISPUTED due to transition issue.")

    def process_verification_extended(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        new_deadline = args['newDeadline']
        
        logger.info(f"Processing VerificationExtended: ID={escrow_id} NewDeadline={new_deadline}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            if escrow:
                from datetime import datetime
                escrow.verification_deadline = datetime.utcfromtimestamp(new_deadline)
                db.commit()
                logger.info(f"Escrow {escrow_id} verification deadline extended to {escrow.verification_deadline}")

    def process_dispute_raised(self, event):
        args = event['args']
        escrow_id = args['escrowId']
        decision = args.get('disputeType', 0) # 0=General?
        ipfs_hash = args.get('evidenceIpfs', '')
        
        logger.info(f"Processing DisputeRaised: ID={escrow_id}")
        
        with SessionLocal() as db:
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
            
            if escrow:
                escrow.escrow_state = EscrowState.DISPUTED
                escrow.dispute_reason = f"Dispute raised on-chain. Evidence: {ipfs_hash}"
                db.commit()
                logger.info(f"Escrow {escrow_id} marked as DISPUTED.")
            else:
                logger.warning(f"Escrow record not found for DisputeRaised {escrow_id}")

    # --- Marketplace Handlers ---

    def process_listing_created(self, event):
        args = event['args']
        listing_id = args['listingId']
        seller_addr = args['seller'].lower()  # Normalize to lowercase
        title = args['title']
        asking_price = args['askingPrice']
        
        logger.info(f"Processing ListingCreated: ID={listing_id} Title={title}")

        with SessionLocal() as db:
            # Try to match existing DRAFT listing by seller and title
            listing = db.query(Listing).join(User).filter(
                User.wallet_address == seller_addr,
                Listing.asset_name == title
                # Could also check status OR asking_price
            ).order_by(Listing.created_at.desc()).first()

            if listing:
                # Update existing
                listing.on_chain_id = listing_id
                listing.status = ListingStatus.ACTIVE
                listing.asking_price = float(asking_price) / 1e18
                logger.info(f"Linked Listing {listing.id} to on_chain_id {listing_id}")
            else:
                # Handle direct-to-contract creation
                logger.info(f"Creating new local listing for ListingCreated {listing_id}")
                
                # Check/Create User
                user = db.query(User).filter(User.wallet_address == seller_addr).first()
                if not user:
                    from app.models.user import VerificationLevel
                    logger.info(f"Creating new user for seller {seller_addr}")
                    user = User(
                        wallet_address=seller_addr, 
                        email=f"{seller_addr[:8]}@placeholder.com", # Placeholder email
                        verification_level=VerificationLevel.BASIC
                    )
                    db.add(user)
                    db.flush() # Get ID
                
                # Create Listing
                new_listing = Listing(
                    seller_id=user.id,
                    on_chain_id=listing_id,
                    asset_name=title,
                    asking_price=float(asking_price) / 1e18,
                    status=ListingStatus.ACTIVE,
                    description="Imported from blockchain", # Placeholder
                    asset_type=AssetType.OTHER, # Placeholder
                    verified_level=1, # 1 = Basic
                    # Required fields with defaults
                    business_url="https://placeholder.com",
                    mrr=0,
                    annual_revenue=0,
                    monthly_profit=0,
                    monthly_expenses=0,
                    revenue_trend=RevenueTrend.STABLE
                )
                db.add(new_listing)
                logger.info(f"Created new listing record for on_chain_id {listing_id}")
            
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

    # --- Offer Handlers ---

    def process_offer_made(self, event):
        args = event['args']
        offer_id = args['offerId']
        listing_id = args['listingId']
        buyer_addr = args['buyer']
        offer_price = args['offerPrice']
        deposit_amount = args['depositAmount']
        tx_hash = event['transactionHash'].hex()
        
        logger.info(f"Processing OfferMade: ID={offer_id} Listing={listing_id} Buyer={buyer_addr}")
        
        with SessionLocal() as db:
            # Find listing
            listing = db.query(Listing).filter(Listing.on_chain_id == listing_id).first()
            if not listing:
                logger.warning(f"Listing not found for on_chain_id {listing_id}")
                return
            
            # Find or create buyer user
            buyer_user = db.query(User).filter(User.wallet_address == buyer_addr.lower()).first()
            if not buyer_user:
                from app.models.user import VerificationLevel
                logger.info(f"Creating new user for buyer {buyer_addr}")
                buyer_user = User(
                    wallet_address=buyer_addr.lower(),
                    email=f"{buyer_addr[:8]}@valyra.xyz",
                    verification_level=VerificationLevel.BASIC
                )
                db.add(buyer_user)
                db.flush()
            
            # Check if offer already exists
            existing = db.query(Offer).filter(Offer.on_chain_id == str(offer_id)).first()
            if existing:
                logger.info(f"Offer {offer_id} already indexed")
                return
            
            # Create offer record
            new_offer = Offer(
                listing_id=listing.id,
                buyer_id=buyer_user.id,
                offer_amount=float(offer_price) / 1e18,
                earnest_deposit=float(deposit_amount) / 1e18,
                earnest_tx_hash=tx_hash,
                on_chain_id=str(offer_id),
                status=OfferStatus.PENDING
            )
            db.add(new_offer)
            db.commit()
            logger.info(f"Created Offer record for on_chain_id {offer_id}")

    def process_offer_accepted(self, event):
        args = event['args']
        offer_id = args['offerId']
        escrow_id = args['escrowId']
        
        logger.info(f"Processing OfferAccepted: OfferID={offer_id} EscrowID={escrow_id}")
        
        with SessionLocal() as db:
            offer = db.query(Offer).filter(Offer.on_chain_id == str(offer_id)).first()
            if offer:
                offer.status = OfferStatus.ACCEPTED
                
                # Link to Escrow (Create shell if not exists)
                escrow = db.query(Escrow).filter(Escrow.on_chain_id == escrow_id).first()
                if not escrow:
                    logger.info(f"Creating shell Escrow record for ID {escrow_id} linked to Offer {offer_id}")
                    # We don't have all details yet (buyer/seller/amount), they come in EscrowCreated
                    # But we MUST create correctly to satisfy non-nullable fields if we commit now?
                    # valid: buyer_address, seller_address, amount, platform_fee are NON-NULLABLE in model.
                    # We can fetch them from Offer? 
                    # Offer has buyer_address (via relation) and offer_amount.
                    # Seller is in listing.
                    
                    # Safer: Wait for EscrowCreated? 
                    # If we don't link them, the API response `offer.escrow` will be null.
                    # Events are in same block. Indexer processes efficiently.
                    # If I create shell, I must fill required columns.
                    
                    # Better Approach: 
                    # Just skip creating Escrow here if it's complex.
                    # But wait, `process_escrow_created` doesn't know about `offer_id`.
                    # So `process_escrow_created` CANNOT link them.
                    
                    # Solution: `process_offer_accepted` MUST link them.
                    # If Escrow doesn't exist, we must create it OR update `process_escrow_created` to find the offer.
                    # `process_escrow_created` receives `escrowId`, `listingId`.
                    # It DOES NOT receive `offerId`.
                    # So it cannot find the offer easily (unless it queries Offer by `escrow_id`, which is circular).
                    
                    # So `process_offer_accepted` sets the link.
                    # It can create the Escrow record with placeholder data? 
                    # OR, better: `process_escrow_created` runs AFTER.
                    # So `process_offer_accepted` can just store "Pending Link"? No, stateless.
                    
                    # Let's see `Escrow` model again.
                    # buyer_address, seller_address, amount, platform_fee are nullable? False.
                    # We have all data in `Offer` + `Listing`!
                    # offer.buyer.wallet_address
                    # offer.listing.seller.wallet_address
                    # offer.offer_amount
                    
                    # Let's fetch them and create full Escrow record here?
                    # Or at least what we can.
                    
                    # Actually, `EscrowCreated` is the source of truth for "Escrow Created".
                    # But `OfferAccepted` is the ONLY source of truth for "Link Offer <-> Escrow".
                    
                    # Strategy:
                    # 1. In `process_offer_accepted`: Create Escrow with available data from Offer.
                    # 2. In `process_escrow_created`: UPSERT (update if exists).
                    
                    buyer_addr = offer.buyer.wallet_address
                    # Seller? offer.listing.seller...
                    seller_addr = offer.listing.seller.wallet_address
                    
                    escrow_amount = float(offer.offer_amount) # It's a Decimal in model, float in python obj?
                    # amount in model is Numeric(20, 2).
                    
                    escrow = Escrow(
                        contract_address=settings.escrow_contract_address,
                        on_chain_id=escrow_id,
                        offer_id=offer.id,
                        buyer_address=buyer_addr,
                        seller_address=seller_addr,
                        amount=escrow_amount,
                        platform_fee=escrow_amount * 0.025,
                        escrow_state=EscrowState.CREATED # Contract emits Created
                    )
                    db.add(escrow)
                    logger.info(f"Created Escrow {escrow_id} from OfferAccepted")
                else:
                     escrow.offer_id = offer.id

                db.commit()
                logger.info(f"Offer {offer_id} marked as ACCEPTED and linked to Escrow {escrow_id}")
            else:
                logger.warning(f"Offer record not found for OfferAccepted {offer_id}")

    def process_offer_rejected(self, event):
        args = event['args']
        offer_id = args['offerId']
        
        logger.info(f"Processing OfferRejected: ID={offer_id}")
        
        with SessionLocal() as db:
            offer = db.query(Offer).filter(Offer.on_chain_id == str(offer_id)).first()
            if offer:
                offer.status = OfferStatus.REJECTED
                db.commit()
                logger.info(f"Offer {offer_id} marked as REJECTED")
            else:
                logger.warning(f"Offer record not found for OfferRejected {offer_id}")

    def process_offer_cancelled(self, event):
        args = event['args']
        offer_id = args['offerId']
        
        logger.info(f"Processing OfferCancelled: ID={offer_id}")
        
        with SessionLocal() as db:
            offer = db.query(Offer).filter(Offer.on_chain_id == str(offer_id)).first()
            if offer:
                offer.status = OfferStatus.EXPIRED  # Using EXPIRED for cancelled
                db.commit()
                logger.info(f"Offer {offer_id} marked as EXPIRED (cancelled)")
            else:
                logger.warning(f"Offer record not found for OfferCancelled {offer_id}")

indexer = IndexerService()
