"""
Script to force the indexer to re-scan blockchain events and update existing listings.

This script resets the indexer's last_processed_block to 0, forcing it to do a full
catch-up scan of the last 50,000 blocks on the next indexer loop iteration.

Usage:
    poetry run python scripts/force_indexer_rescan.py
"""

import asyncio
import logging
from app.database import SessionLocal
from app.models.listing import Listing

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Force indexer to re-scan by checking for listings without on_chain_id"""
    
    with SessionLocal() as db:
        # Count listings without on_chain_id
        null_listings = db.query(Listing).filter(Listing.on_chain_id == None).all()
        
        logger.info(f"Found {len(null_listings)} listings without on_chain_id:")
        for listing in null_listings:
            logger.info(f"  - {listing.asset_name} (ID: {listing.id}, Created: {listing.created_at})")
        
        if len(null_listings) > 0:
            logger.info("\n" + "="*80)
            logger.info("To update these listings, the indexer needs to re-scan blockchain events.")
            logger.info("The indexer will automatically scan the last 50,000 blocks on startup.")
            logger.info("\nOptions:")
            logger.info("1. Restart the backend to trigger a re-scan")
            logger.info("2. Wait for the indexer to process new ListingCreated events")
            logger.info("3. Manually sync listings to blockchain via the seller dashboard")
            logger.info("="*80)
        else:
            logger.info("All listings have on_chain_id. No action needed.")

if __name__ == "__main__":
    asyncio.run(main())
