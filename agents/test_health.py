#!/usr/bin/env python3
"""
Test the health check endpoint by starting the agent and making a request
"""
import asyncio
import signal
import sys
import time
import httpx
import uvicorn
from valuation_agent import ValuationAgent

class HealthTestServer:
    def __init__(self):
        self.agent = None
        self.server_task = None
        self.running = False
    
    async def start_agent(self):
        """Start the agent with health check server"""
        try:
            print("🚀 Starting ValuationAgent with health check...")
            self.agent = ValuationAgent()
            
            # Start the FastAPI server for health checks
            config = uvicorn.Config(
                app=self.agent.app,
                host="127.0.0.1",
                port=8080,
                log_level="info"
            )
            server = uvicorn.Server(config)
            self.server_task = asyncio.create_task(server.serve())
            
            # Give server time to start
            await asyncio.sleep(2)
            print("✅ Health check server started on http://localhost:8080")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start agent: {e}")
            return False
    
    async def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            print("🔍 Testing health check endpoint...")
            
            async with httpx.AsyncClient() as client:
                response = await client.get("http://localhost:8080/health")
                
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Health check successful!")
                    print(f"   Status: {data.get('status')}")
                    print(f"   Redis connected: {data.get('redis_connected')}")
                    print(f"   Processed listings: {data.get('processed_listings')}")
                    print(f"   Error count: {data.get('error_count')}")
                    return True
                else:
                    print(f"❌ Health check failed with status: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Health check request failed: {e}")
            return False
    
    async def test_metrics_endpoint(self):
        """Test the metrics endpoint"""
        try:
            print("🔍 Testing metrics endpoint...")
            
            async with httpx.AsyncClient() as client:
                response = await client.get("http://localhost:8080/metrics")
                
                if response.status_code == 200:
                    print("✅ Metrics endpoint accessible!")
                    return True
                else:
                    print(f"❌ Metrics endpoint failed with status: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Metrics endpoint request failed: {e}")
            return False
    
    async def cleanup(self):
        """Clean up resources"""
        if self.server_task and not self.server_task.done():
            self.server_task.cancel()
            try:
                await self.server_task
            except asyncio.CancelledError:
                pass
        
        if self.agent and self.agent.http_client:
            await self.agent.http_client.aclose()

async def main():
    """Main test function"""
    tester = HealthTestServer()
    
    try:
        # Start the agent and health server
        if not await tester.start_agent():
            return False
        
        # Test health endpoint
        health_ok = await tester.test_health_endpoint()
        
        # Test metrics endpoint
        metrics_ok = await tester.test_metrics_endpoint()
        
        success = health_ok and metrics_ok
        
        if success:
            print("\n🎉 All health check tests passed!")
        else:
            print("\n💥 Some health check tests failed!")
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False
    
    finally:
        await tester.cleanup()

def signal_handler(signum, frame):
    print("\n🛑 Received interrupt signal, shutting down...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run the test
    success = asyncio.run(main())
    
    if not success:
        sys.exit(1)