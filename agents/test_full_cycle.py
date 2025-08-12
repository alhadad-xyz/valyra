#!/usr/bin/env python3
"""
Test the complete valuation agent cycle using subprocess calls to dfx
"""
import asyncio
import subprocess
import json
import time
import redis
from datetime import datetime

class SimpleValuationAgent:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
        self.processed_count = 0
        self.project_root = "/Users/amc/Workspace/web3/valyra"
    
    async def get_listing_ids(self):
        """Get all listing IDs from ListingRegistry"""
        try:
            result = subprocess.run([
                "dfx", "canister", "call", "listing_registry", "list_ids", "()"
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                output = result.stdout.strip()
                print(f"📋 ListingRegistry response: {output}")
                
                # Parse the response: (vec { 1 : nat64; 3 : nat64 })
                if "vec {" in output:
                    # Extract numbers between the braces
                    ids_section = output.split("vec {")[1].split("}")[0]
                    ids = []
                    for part in ids_section.split(";"):
                        if ":" in part and "nat64" in part:
                            id_str = part.split(":")[0].strip()
                            if id_str.isdigit():
                                ids.append(int(id_str))
                    return ids
                return []
            else:
                print(f"❌ Failed to get listing IDs: {result.stderr}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting listing IDs: {e}")
            return []
    
    async def get_listing_details(self, listing_id):
        """Get detailed listing information"""
        try:
            result = subprocess.run([
                "dfx", "canister", "call", "listing_registry", "get_deal", f"({listing_id} : nat64)"
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                output = result.stdout.strip()
                print(f"📄 Listing {listing_id} details: {output[:100]}...")
                
                # For simplicity, we'll assume the call succeeded if we get an "Ok" response  
                if "variant {" in output and "Ok" in output:
                    return {"id": listing_id, "status": "retrieved"}
                else:
                    print(f"❌ Unexpected response format: {output[:200]}")
                    return None
            else:
                print(f"❌ Failed to get listing {listing_id}: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting listing {listing_id}: {e}")
            return None
    
    async def check_cached_valuation(self, listing_id):
        """Check if we have a cached valuation"""
        cache_key = f"valuation:{listing_id}"
        try:
            cached = self.redis_client.get(cache_key)
            if cached:
                print(f"💾 Found cached valuation for listing {listing_id}")
                return json.loads(cached)
            return None
        except Exception as e:
            print(f"❌ Redis error: {e}")
            return None
    
    async def trigger_valuation(self, listing_id):
        """Trigger valuation calculation"""
        try:
            print(f"🧮 Triggering valuation for listing {listing_id}...")
            result = subprocess.run([
                "dfx", "canister", "call", "valuation_engine", "calculate_valuation", f'("{listing_id}")'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                output = result.stdout.strip()
                print(f"✅ Valuation calculated: {output[:150]}...")
                
                if "variant {" in output and "Ok" in output:
                    # Cache the result
                    cache_key = f"valuation:{listing_id}"
                    cache_data = {
                        "listing_id": listing_id,
                        "calculated_at": datetime.utcnow().isoformat(),
                        "raw_response": output[:500]  # Truncate for storage
                    }
                    self.redis_client.setex(cache_key, 3600, json.dumps(cache_data))
                    print(f"💾 Cached valuation for listing {listing_id}")
                    return True
                else:
                    print(f"⚠️  Valuation returned error: {output}")
                    return False
            else:
                print(f"❌ Failed to calculate valuation: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error calculating valuation: {e}")
            return False
    
    async def process_listing(self, listing_id):
        """Process a single listing"""
        print(f"\n🔄 Processing listing {listing_id}...")
        
        # Get listing details
        listing = await self.get_listing_details(listing_id)
        if not listing:
            print(f"❌ Failed to get listing {listing_id} details")
            return False
        
        # Check cache
        cached_valuation = await self.check_cached_valuation(listing_id)
        if cached_valuation:
            print(f"⚡ Using cached valuation for listing {listing_id}")
            return True
        
        print(f"💡 No cached valuation found for listing {listing_id}, calculating new one...")
        
        # Trigger new valuation
        success = await self.trigger_valuation(listing_id)
        if success:
            self.processed_count += 1
            print(f"✅ Successfully processed listing {listing_id}")
        else:
            print(f"❌ Failed to process listing {listing_id}")
        
        return success
    
    async def run_polling_cycle(self):
        """Run one complete polling cycle"""
        print("🚀 Starting polling cycle...")
        start_time = time.time()
        
        # Get all listing IDs
        listing_ids = await self.get_listing_ids()
        print(f"📊 Found {len(listing_ids)} listings to process")
        
        if not listing_ids:
            print("⚠️  No listings found")
            return
        
        # Process each listing
        for listing_id in listing_ids:
            await self.process_listing(listing_id)
            await asyncio.sleep(1)  # Small delay between listings
        
        duration = time.time() - start_time
        print(f"\n✅ Polling cycle completed in {duration:.2f}s")
        print(f"📈 Processed {self.processed_count} listings")

async def main():
    """Main test function"""
    print("🚀 Testing complete ValuationAgent cycle...")
    print("="*60)
    
    # Create simple agent
    agent = SimpleValuationAgent()
    
    # Test Redis connection
    try:
        agent.redis_client.ping()
        print("✅ Redis connection working")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return
    
    print()
    
    # Run one polling cycle
    await agent.run_polling_cycle()
    
    print("\n" + "="*60)
    print("🎉 Complete cycle test finished!")
    
    # Show cache contents
    print("\n💾 Cached valuations:")
    keys = agent.redis_client.keys("valuation:*")
    for key in keys:
        data = json.loads(agent.redis_client.get(key))
        print(f"   {key}: calculated at {data['calculated_at']}")

if __name__ == "__main__":
    asyncio.run(main())