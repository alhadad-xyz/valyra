#!/usr/bin/env python3
"""
Test connectivity to ICP canisters
"""
import asyncio
import httpx
from valuation_agent import Config

async def test_canister_connectivity():
    """Test connectivity to ListingRegistry and ValuationEngine canisters"""
    print("🔍 Testing canister connectivity...")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test ListingRegistry
        print(f"📋 Testing ListingRegistry: {Config.LISTING_REGISTRY_URL}")
        try:
            response = await client.get(
                f"{Config.LISTING_REGISTRY_URL}/query",
                params={"method": "list_ids"}
            )
            if response.status_code == 200:
                print("✅ ListingRegistry is accessible")
                data = response.json()
                print(f"   Response: {data}")
            else:
                print(f"⚠️  ListingRegistry returned status {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except httpx.ConnectError:
            print("❌ ListingRegistry connection failed - canister likely not running")
            print("   This is expected if you haven't started the ICP local network")
        except Exception as e:
            print(f"❌ ListingRegistry error: {e}")
        
        print()
        
        # Test ValuationEngine  
        print(f"🧮 Testing ValuationEngine: {Config.VALUATION_ENGINE_URL}")
        try:
            response = await client.post(
                f"{Config.VALUATION_ENGINE_URL}/query",
                json={"method": "list_valuations"}
            )
            if response.status_code == 200:
                print("✅ ValuationEngine is accessible")
                data = response.json()
                print(f"   Response: {data}")
            else:
                print(f"⚠️  ValuationEngine returned status {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except httpx.ConnectError:
            print("❌ ValuationEngine connection failed - canister likely not running")
            print("   This is expected if you haven't started the ICP local network")
        except Exception as e:
            print(f"❌ ValuationEngine error: {e}")

def print_setup_instructions():
    """Print instructions for setting up the ICP local network"""
    print("\n" + "="*60)
    print("📋 TO TEST WITH ACTUAL CANISTERS:")
    print("="*60)
    print("1. Start the ICP local network:")
    print("   dfx start --clean")
    print()
    print("2. Deploy the canisters:")
    print("   dfx deploy")
    print()
    print("3. The canisters should be available at:")
    print(f"   - ListingRegistry: {Config.LISTING_REGISTRY_URL}")
    print(f"   - ValuationEngine: {Config.VALUATION_ENGINE_URL}")
    print()
    print("4. Run this test again to verify connectivity")
    print("="*60)

async def main():
    """Main test function"""
    await test_canister_connectivity()
    print_setup_instructions()

if __name__ == "__main__":
    asyncio.run(main())