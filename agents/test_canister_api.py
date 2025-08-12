#!/usr/bin/env python3
"""
Test actual canister API calls using dfx command line
"""
import asyncio
import subprocess
import json

async def test_listing_registry():
    """Test ListingRegistry canister calls"""
    print("📋 Testing ListingRegistry canister...")
    
    try:
        # Test list_ids method
        result = subprocess.run([
            "dfx", "canister", "call", "listing_registry", "list_ids", "()"
        ], capture_output=True, text=True, cwd="/Users/amc/Workspace/web3/valyra")
        
        if result.returncode == 0:
            print("✅ list_ids call successful:")
            print(f"   {result.stdout.strip()}")
            return result.stdout.strip()
        else:
            print(f"❌ list_ids call failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error calling list_ids: {e}")
        return None

async def create_test_listing():
    """Create a test listing"""
    print("📝 Creating test listing...")
    
    try:
        # Create a minimal test listing
        create_args = '''(record {
            title = "Test SaaS Business";
            description = "A test business for valuation";
            website_url = "https://example.com";
            business_structure = variant { LLC };
            logo_url = "https://example.com/logo.png";
            tax_id = "12-3456789";
            registered_address = "123 Test St, Test City, TC 12345";
            customer_base = "SMB customers worldwide";
            tech_stack = "React, Node.js, PostgreSQL";
            arr_usd = 120000: nat64;
            mrr_usd = 10000: nat64;
            net_profit_usd = 60000: nat64;
            gross_margin_pct = 0.75: float32;
            churn_pct = 0.05: float32;
            ltv_usd = 2000: nat32;
            cac_usd = 100: nat32;
            num_employees = 5: nat16;
            annual_operating_expenses_usd = 60000: nat64;
            gdpr_compliant = true;
            attachments_cid = null;
        })'''
        
        result = subprocess.run([
            "dfx", "canister", "call", "listing_registry", "create_deal", create_args
        ], capture_output=True, text=True, cwd="/Users/amc/Workspace/web3/valyra")
        
        if result.returncode == 0:
            print("✅ Test listing created:")
            print(f"   {result.stdout.strip()}")
            return result.stdout.strip()
        else:
            print(f"❌ Failed to create test listing: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating test listing: {e}")
        return None

async def test_valuation_engine():
    """Test ValuationEngine canister calls"""
    print("🧮 Testing ValuationEngine canister...")
    
    try:
        # Test list_valuations method
        result = subprocess.run([
            "dfx", "canister", "call", "valuation_engine", "list_valuations", "()"
        ], capture_output=True, text=True, cwd="/Users/amc/Workspace/web3/valyra")
        
        if result.returncode == 0:
            print("✅ list_valuations call successful:")
            print(f"   {result.stdout.strip()}")
            return result.stdout.strip()
        else:
            print(f"❌ list_valuations call failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error calling list_valuations: {e}")
        return None

async def test_valuation_calculation(deal_id: str):
    """Test valuation calculation"""
    if not deal_id:
        print("⚠️  No deal ID available for valuation test")
        return
        
    print(f"🧮 Testing valuation calculation for deal {deal_id}...")
    
    try:
        result = subprocess.run([
            "dfx", "canister", "call", "valuation_engine", "calculate_valuation", f'("{deal_id}")'
        ], capture_output=True, text=True, cwd="/Users/amc/Workspace/web3/valyra")
        
        if result.returncode == 0:
            print("✅ Valuation calculation successful:")
            print(f"   {result.stdout.strip()}")
        else:
            print(f"❌ Valuation calculation failed: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Error calculating valuation: {e}")

async def main():
    """Main test function"""
    print("🚀 Testing canister functionality...")
    print("="*50)
    
    # Test ListingRegistry
    listing_ids = await test_listing_registry()
    
    # If no listings exist, create one
    if not listing_ids or listing_ids == "(vec {})":
        print("\n📝 No listings found, creating test listing...")
        create_result = await create_test_listing()
        if create_result:
            # Parse the deal ID from the result
            # Expected format: (variant { Ok = 1 : nat64 })
            if "Ok" in create_result:
                deal_id = create_result.split("=")[1].split(":")[0].strip()
                print(f"✅ Created deal with ID: {deal_id}")
            else:
                deal_id = None
        else:
            deal_id = None
    else:
        # Parse existing deal ID
        deal_id = "1"  # Assume first deal for testing
    
    print()
    
    # Test ValuationEngine
    await test_valuation_engine()
    
    print()
    
    # Test valuation calculation
    if deal_id:
        await test_valuation_calculation(deal_id)
    
    print("\n" + "="*50)
    print("✅ Canister tests completed!")

if __name__ == "__main__":
    asyncio.run(main())