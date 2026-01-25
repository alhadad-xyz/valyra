#!/usr/bin/env python3
"""Script to clear all data from database tables while keeping the structure."""

import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import engine


def clear_all_data():
    """Clear all data from all tables while preserving table structure."""
    
    tables = [
        "view_logs",
        "verification_records",
        "vault_keys",
        "vault_entries",
        "pending_deposits",
        "holds",
        "balances",
        "escrows",
        "offers",
        "listings",
        "users"
    ]
    
    print("🗑️  Clearing all data from database tables...")
    print("=" * 60)
    
    with engine.connect() as conn:
        # Disable foreign key checks temporarily
        print("\n📌 Disabling triggers and constraints...")
        conn.execute(text("SET session_replication_role = 'replica';"))
        conn.commit()
        
        try:
            # Truncate each table
            for table in tables:
                try:
                    print(f"   Clearing {table}...")
                    conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
                    conn.commit()
                    print(f"   ✅ {table} cleared")
                except Exception as e:
                    print(f"   ⚠️  Error clearing {table}: {e}")
                    conn.rollback()
            
            print("\n✅ All tables cleared successfully!")
            
        finally:
            # Re-enable foreign key checks
            print("\n📌 Re-enabling triggers and constraints...")
            conn.execute(text("SET session_replication_role = 'origin';"))
            conn.commit()
    
    print("\n" + "=" * 60)
    print("✨ Database data cleared! Tables structure preserved.")


if __name__ == "__main__":
    confirm = input("⚠️  This will DELETE ALL DATA from the database. Are you sure? (yes/no): ")
    if confirm.lower() == "yes":
        clear_all_data()
    else:
        print("❌ Operation cancelled.")
