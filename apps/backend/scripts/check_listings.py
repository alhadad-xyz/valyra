import sys
import os
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.listing import Listing
from app.models.user import User

db = SessionLocal()
listings = db.query(Listing).all()

print(f"Total Listings: {len(listings)}")
for l in listings:
    print(f"ID: {l.id}, Title: {l.asset_name}, Seller: {l.seller_id}, VerifiedLevel: {l.verified_level}, OnChainID: {l.on_chain_id}")

users = db.query(User).all()
print(f"\nTotal Users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Address: {u.wallet_address}, Level: {u.verification_level}")
