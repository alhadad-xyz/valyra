"""increase buyer_public_key column size

Revision ID: b1859cb870b6
Revises: c0057bf970c4
Create Date: 2026-01-21 07:44:50.320494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1859cb870b6'
down_revision: Union[str, None] = 'c0057bf970c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Increase buyer_public_key column size from 130 to 256 to accommodate longer public keys
    op.alter_column('escrows', 'buyer_public_key',
                    type_=sa.String(256),
                    existing_type=sa.String(130),
                    nullable=True)


def downgrade() -> None:
    # Revert to original size
    op.alter_column('escrows', 'buyer_public_key',
                    type_=sa.String(130),
                    existing_type=sa.String(256),
                    nullable=True)
