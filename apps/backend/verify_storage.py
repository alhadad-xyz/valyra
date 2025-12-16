"""Simple verification script for Lighthouse Web3."""

import sys
import os

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def main():
    print("=" * 60)
    print("Lighthouse Web3 Verification")
    print("=" * 60)
    
    # 1. Test Imports
    try:
        from app.services.lighthouse_client import LighthouseClient
        print("✓ LighthouseClient imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import LighthouseClient: {e}")
        return
        
    try:
        from app.services.storage_service import StorageService
        print("✓ StorageService imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import StorageService: {e}")
        return

    # 2. Test Configuration (Mocked settings check)
    try:
        client = LighthouseClient(api_key="test_key")
        print("✓ LighthouseClient initialized with key")
        
        if client.is_configured():
            print("✓ LighthouseClient configuration check passed")
        else:
            print("✗ LighthouseClient configuration check failed")
            
    except Exception as e:
        print(f"✗ Client initialization failed: {e}")

    # 3. Test StorageService
    try:
        service = StorageService()
        print("✓ StorageService initialized")
        
        # Test URL generation
        cid = "QmTest123"
        url = service.get_url(cid)
        print(f"✓ URL Generation: {url}")
        
    except Exception as e:
        print(f"✗ StorageService test failed: {e}")

if __name__ == "__main__":
    main()
