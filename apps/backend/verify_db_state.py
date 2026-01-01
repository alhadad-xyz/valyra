import os
import sys
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

# Add parent directory to path to import app modules if needed
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("DATABASE_URL not set")
    sys.exit(1)

print(f"Connecting to database: {database_url.split('@')[-1]}") # Hide sensitive info

try:
    engine = create_engine(database_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    expected_tables = ["users", "listings", "offers", "escrows", "verification_records", "alembic_version"]
    missing_tables = [t for t in expected_tables if t not in tables]

    if missing_tables:
        print(f"❌ Missing tables: {missing_tables}")
        print(f"Current tables: {tables}")
        sys.exit(1)
    else:
        print("✅ All expected tables found.")
        print(f"Tables: {tables}")
        
    # Check alembic version
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version_num FROM alembic_version"))
        version = result.scalar()
        print(f"Alembic Version: {version}")

except Exception as e:
    print(f"Error connecting or verifying database: {e}")
    sys.exit(1)
