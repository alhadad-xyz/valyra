
import asyncio
from app.database import SessionLocal
from app.models.listing import Listing
from app.schemas.listing import ListingResponse
from uuid import UUID

async def debug_listing():
    db = SessionLocal()
    try:
        listing_id = UUID("a354d6ec-dd92-437a-a58e-cdaf11a8f313")
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        
        if not listing:
            print("Listing not found")
            return

        print(f"Found listing: {listing.asset_name}")
        print(f"Revenue History: {listing.revenue_history} (Type: {type(listing.revenue_history)})")
        print(f"Verified Level: {listing.verified_level} (Type: {type(listing.verified_level)})")
        
        try:
            pydantic_obj = ListingResponse.from_orm(listing)
            print("Pydantic validation successful")
            print(pydantic_obj.json())
        except Exception as e:
            print(f"Pydantic validation failed: {e}")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(debug_listing())
