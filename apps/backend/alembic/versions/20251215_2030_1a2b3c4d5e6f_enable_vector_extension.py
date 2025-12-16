"""enable vector extension

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2025-12-15 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable the pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')


def downgrade() -> None:
    # Disable the pgvector extension
    op.execute('DROP EXTENSION IF EXISTS vector')
