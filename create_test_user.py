import sys
import os
import uuid
from datetime import datetime

# Add backend to path
import sys
import os
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(ROOT_DIR, 'apps/backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User, VerificationLevel
from app.models.credential import UserCredential

def create_test_user():
    """Create a dummy user for testing."""
    engine = create_engine(str(settings.database_url))
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check if test user exists using raw SQL
        from sqlalchemy import text
        dummy_address = "0xTestAddress1234567890123456789012345678"
        result = db.execute(text("SELECT id FROM users WHERE wallet_address = :wallet"), {"wallet": dummy_address}).fetchone()
        
        if result:
            print(f"✅ Test User already exists: {result[0]}")
            return str(result[0])

        from sqlalchemy import text
        user_id = uuid.uuid4()
        
        # Insert using raw SQL to bypass SQLAlchemy Enum validation weirdness
        db.execute(text("""
            INSERT INTO users (id, wallet_address, basename, email, verification_level, reputation_score, created_at, updated_at, google_id, challenge)
            VALUES (:id, :wallet, :basename, :email, 'BASIC', 50, NOW(), NOW(), NULL, NULL)
        """), {
            "id": user_id,
            "wallet": dummy_address,
            "basename": "testuser.base.eth",
            "email": "test@valyra.xyz"
        })
        db.commit()
        print(f"✅ Created Test User: {user_id}")
        return str(user_id)
    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
