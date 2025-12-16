"""create core tables

Revision ID: 2b3c4d5e6f7a
Revises: 1a2b3c4d5e6f
Create Date: 2025-12-16 09:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2b3c4d5e6f7a'
down_revision: Union[str, None] = '1a2b3c4d5e6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types
    verification_level_enum = postgresql.ENUM('basic', 'standard', 'enhanced', name='verificationlevel')
    verification_level_enum.create(op.get_bind())
    
    asset_type_enum = postgresql.ENUM('saas', 'ecommerce', 'content', 'community', 'other', name='assettype')
    asset_type_enum.create(op.get_bind())
    
    revenue_trend_enum = postgresql.ENUM('growing', 'stable', 'declining', name='revenuetrend')
    revenue_trend_enum.create(op.get_bind())
    
    verification_status_enum = postgresql.ENUM('pending', 'verified', 'failed', name='verificationstatus')
    verification_status_enum.create(op.get_bind())
    
    listing_status_enum = postgresql.ENUM('draft', 'active', 'sold', 'paused', name='listingstatus')
    listing_status_enum.create(op.get_bind())
    
    offer_status_enum = postgresql.ENUM('pending', 'accepted', 'rejected', 'expired', name='offerstatus')
    offer_status_enum.create(op.get_bind())
    
    escrow_state_enum = postgresql.ENUM(
        'created', 'funded', 'delivered', 'confirmed', 'disputed', 'resolved', 'completed', 'refunded',
        name='escrowstate'
    )
    escrow_state_enum.create(op.get_bind())
    
    verification_type_enum = postgresql.ENUM(
        'dns', 'build_id', 'oauth_stripe', 'oauth_analytics', 'github_repo', 'email_domain',
        name='verificationtype'
    )
    verification_type_enum.create(op.get_bind())
    
    verification_record_status_enum = postgresql.ENUM('pending', 'verified', 'failed', name='verificationrecordstatus')
    verification_record_status_enum.create(op.get_bind())

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('wallet_address', sa.String(length=42), nullable=False),
        sa.Column('basename', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('verification_level', verification_level_enum, nullable=False, server_default='basic'),
        sa.Column('reputation_score', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('wallet_address', name='uq_users_wallet_address'),
        sa.CheckConstraint('reputation_score >= 0 AND reputation_score <= 100', name='chk_users_reputation_score')
    )
    op.create_index('ix_users_wallet_address', 'users', ['wallet_address'])

    # Create listings table
    op.create_table(
        'listings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('seller_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_name', sa.String(length=255), nullable=False),
        sa.Column('asset_type', asset_type_enum, nullable=False),
        sa.Column('business_url', sa.String(length=512), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('asking_price', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('tech_stack', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('build_id', sa.String(length=255), nullable=True),
        sa.Column('mrr', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('annual_revenue', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('monthly_profit', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('monthly_expenses', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('revenue_trend', revenue_trend_enum, nullable=False),
        sa.Column('verification_status', verification_status_enum, nullable=False, server_default='pending'),
        sa.Column('ip_assignment_hash', sa.String(length=66), nullable=True),
        sa.Column('seller_signature', sa.Text(), nullable=True),
        sa.Column('status', listing_status_enum, nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], name='fk_listings_seller_id')
    )
    op.create_index('ix_listings_seller_id', 'listings', ['seller_id'])
    op.create_index('ix_listings_status', 'listings', ['status'])

    # Create offers table
    op.create_table(
        'offers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('listing_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('buyer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('offer_amount', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('earnest_deposit', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('earnest_tx_hash', sa.String(length=66), nullable=True),
        sa.Column('status', offer_status_enum, nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['listing_id'], ['listings.id'], name='fk_offers_listing_id'),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], name='fk_offers_buyer_id')
    )
    op.create_index('ix_offers_listing_id', 'offers', ['listing_id'])
    op.create_index('ix_offers_buyer_id', 'offers', ['buyer_id'])
    op.create_index('ix_offers_status', 'offers', ['status'])

    # Create escrows table
    op.create_table(
        'escrows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('offer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contract_address', sa.String(length=42), nullable=True),
        sa.Column('escrow_state', escrow_state_enum, nullable=False, server_default='created'),
        sa.Column('buyer_address', sa.String(length=42), nullable=False),
        sa.Column('seller_address', sa.String(length=42), nullable=False),
        sa.Column('amount', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('platform_fee', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('credentials_ipfs_hash', sa.String(length=255), nullable=True),
        sa.Column('verification_deadline', sa.DateTime(), nullable=True),
        sa.Column('dispute_reason', sa.Text(), nullable=True),
        sa.Column('arbitrator_decision', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['offer_id'], ['offers.id'], name='fk_escrows_offer_id'),
        sa.UniqueConstraint('offer_id', name='uq_escrows_offer_id')
    )
    op.create_index('ix_escrows_offer_id', 'escrows', ['offer_id'])
    op.create_index('ix_escrows_contract_address', 'escrows', ['contract_address'])

    # Create verification_records table
    op.create_table(
        'verification_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('listing_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('verification_type', verification_type_enum, nullable=False),
        sa.Column('status', verification_record_status_enum, nullable=False, server_default='pending'),
        sa.Column('verification_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['listing_id'], ['listings.id'], name='fk_verification_records_listing_id')
    )
    op.create_index('ix_verification_records_listing_id', 'verification_records', ['listing_id'])


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_index('ix_verification_records_listing_id', table_name='verification_records')
    op.drop_table('verification_records')
    
    op.drop_index('ix_escrows_contract_address', table_name='escrows')
    op.drop_index('ix_escrows_offer_id', table_name='escrows')
    op.drop_table('escrows')
    
    op.drop_index('ix_offers_status', table_name='offers')
    op.drop_index('ix_offers_buyer_id', table_name='offers')
    op.drop_index('ix_offers_listing_id', table_name='offers')
    op.drop_table('offers')
    
    op.drop_index('ix_listings_status', table_name='listings')
    op.drop_index('ix_listings_seller_id', table_name='listings')
    op.drop_table('listings')
    
    op.drop_index('ix_users_wallet_address', table_name='users')
    op.drop_table('users')
    
    # Drop ENUM types
    postgresql.ENUM(name='verificationrecordstatus').drop(op.get_bind())
    postgresql.ENUM(name='verificationtype').drop(op.get_bind())
    postgresql.ENUM(name='escrowstate').drop(op.get_bind())
    postgresql.ENUM(name='offerstatus').drop(op.get_bind())
    postgresql.ENUM(name='listingstatus').drop(op.get_bind())
    postgresql.ENUM(name='verificationstatus').drop(op.get_bind())
    postgresql.ENUM(name='revenuetrend').drop(op.get_bind())
    postgresql.ENUM(name='assettype').drop(op.get_bind())
    postgresql.ENUM(name='verificationlevel').drop(op.get_bind())
