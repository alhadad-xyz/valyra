"""add rls policies

Revision ID: 3c4d5e6f7a8b
Revises: 2b3c4d5e6f7a
Create Date: 2025-12-16 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c4d5e6f7a8b'
down_revision: Union[str, None] = '2b3c4d5e6f7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Users Table ---
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY")
    
    # Policy: Users can see their own profile
    # Note: 'auth.uid()' is specific to Supabase/PostgREST environment.
    # We cast to uuid to match the column type.
    op.execute("""
        CREATE POLICY "Users can view own profile"
        ON users FOR SELECT
        USING (auth.uid() = id)
    """)
    
    # Policy: Users can update their own profile
    op.execute("""
        CREATE POLICY "Users can update own profile"
        ON users FOR UPDATE
        USING (auth.uid() = id)
    """)


    # --- Listings Table ---
    op.execute("ALTER TABLE listings ENABLE ROW LEVEL SECURITY")

    # Policy: Public can view active listings
    op.execute("""
        CREATE POLICY "Public can view active listings"
        ON listings FOR SELECT
        USING (status = 'active')
    """)

    # Policy: Sellers can view their own listings (any status)
    op.execute("""
        CREATE POLICY "Sellers can view own listings"
        ON listings FOR SELECT
        USING (auth.uid() = seller_id)
    """)

    # Policy: Sellers can insert their own listings
    op.execute("""
        CREATE POLICY "Sellers can create listings"
        ON listings FOR INSERT
        WITH CHECK (auth.uid() = seller_id)
    """)

    # Policy: Sellers can update their own listings
    op.execute("""
        CREATE POLICY "Sellers can update own listings"
        ON listings FOR UPDATE
        USING (auth.uid() = seller_id)
    """)

    # Policy: Sellers can delete their own listings
    op.execute("""
        CREATE POLICY "Sellers can delete own listings"
        ON listings FOR DELETE
        USING (auth.uid() = seller_id)
    """)


    # --- Offers Table ---
    op.execute("ALTER TABLE offers ENABLE ROW LEVEL SECURITY")

    # Policy: Buyers can view their own offers
    op.execute("""
        CREATE POLICY "Buyers can view own offers"
        ON offers FOR SELECT
        USING (auth.uid() = buyer_id)
    """)

    # Policy: Sellers can view offers on their listings
    op.execute("""
        CREATE POLICY "Sellers can view received offers"
        ON offers FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM listings
                WHERE listings.id = offers.listing_id
                AND listings.seller_id = auth.uid()
            )
        )
    """)

    # Policy: Buyers can create offers
    op.execute("""
        CREATE POLICY "Buyers can create offers"
        ON offers FOR INSERT
        WITH CHECK (auth.uid() = buyer_id)
    """)

    # Policy: Sellers can update offer status (managed via API/RPC usually, but RLS allow)
    # Allowing update if you are the seller of the listing
    op.execute("""
        CREATE POLICY "Sellers can update offer status"
        ON offers FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM listings
                WHERE listings.id = offers.listing_id
                AND listings.seller_id = auth.uid()
            )
        )
    """)


    # --- Escrows Table ---
    op.execute("ALTER TABLE escrows ENABLE ROW LEVEL SECURITY")

    # Policy: Parties can view their escrows
    # Need to join via offers to get buyer/seller IDs if we want to trust IDs,
    # OR trust the address columns if we map auth.uid() to address.
    # However, standard practice is to rely on user IDs if available.
    # Escrow links to Offer, Offer links to Buyer and Listing(Seller).
    op.execute("""
        CREATE POLICY "Parties can view escrows"
        ON escrows FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM offers
                JOIN listings ON listings.id = offers.listing_id
                WHERE offers.id = escrows.offer_id
                AND (offers.buyer_id = auth.uid() OR listings.seller_id = auth.uid())
            )
        )
    """)


    # --- Verification Records Table ---
    op.execute("ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY")

    # Policy: Public can view records for active listings
    op.execute("""
        CREATE POLICY "Public can view verification records for active listings"
        ON verification_records FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM listings
                WHERE listings.id = verification_records.listing_id
                AND listings.status = 'active'
            )
        )
    """)


def downgrade() -> None:
    # Drop policies in reverse order
    
    # Verification Records
    op.execute("DROP POLICY IF EXISTS \"Public can view verification records for active listings\" ON verification_records")
    op.execute("ALTER TABLE verification_records DISABLE ROW LEVEL SECURITY")

    # Escrows
    op.execute("DROP POLICY IF EXISTS \"Parties can view escrows\" ON escrows")
    op.execute("ALTER TABLE escrows DISABLE ROW LEVEL SECURITY")

    # Offers
    op.execute("DROP POLICY IF EXISTS \"Sellers can update offer status\" ON offers")
    op.execute("DROP POLICY IF EXISTS \"Buyers can create offers\" ON offers")
    op.execute("DROP POLICY IF EXISTS \"Sellers can view received offers\" ON offers")
    op.execute("DROP POLICY IF EXISTS \"Buyers can view own offers\" ON offers")
    op.execute("ALTER TABLE offers DISABLE ROW LEVEL SECURITY")

    # Listings
    op.execute("DROP POLICY IF EXISTS \"Sellers can delete own listings\" ON listings")
    op.execute("DROP POLICY IF EXISTS \"Sellers can update own listings\" ON listings")
    op.execute("DROP POLICY IF EXISTS \"Sellers can create listings\" ON listings")
    op.execute("DROP POLICY IF EXISTS \"Sellers can view own listings\" ON listings")
    op.execute("DROP POLICY IF EXISTS \"Public can view active listings\" ON listings")
    op.execute("ALTER TABLE listings DISABLE ROW LEVEL SECURITY")

    # Users
    op.execute("DROP POLICY IF EXISTS \"Users can update own profile\" ON users")
    op.execute("DROP POLICY IF EXISTS \"Users can view own profile\" ON users")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY")
