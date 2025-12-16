"""Benchmark script for Storage Service."""

import asyncio
import time
import os
import logging
from app.services.storage_service import storage_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def benchmark():
    print("=" * 60)
    print("Storage Service Benchmark (Lighthouse)")
    print("=" * 60)

    if not storage_service.lighthouse.is_configured():
        print("⚠️  Lighthouse API Key not set. Skipping live benchmark.")
        print("Please set LIGHTHOUSE_API_KEY in .env to run this benchmark.")
        return

    # Create dummy file (1MB)
    file_size_mb = 1
    file_bytes = os.urandom(file_size_mb * 1024 * 1024)
    filename = f"benchmark_{int(time.time())}.bin"
    
    print(f"File size: {file_size_mb} MB")

    # Benchmark Upload
    print("\nStarting Upload...")
    start_time = time.time()
    try:
        result = await storage_service.upload(file_bytes, filename)
        duration = time.time() - start_time
        cid = result['cid']
        print(f"✓ Upload Complete")
        print(f"  - CID: {cid}")
        print(f"  - Time: {duration:.2f}s")
        print(f"  - Speed: {file_size_mb / duration:.2f} MB/s")
    except Exception as e:
        print(f"✗ Upload Failed: {e}")
        return

    # Benchmark Download (via Gateway)
    print("\nStarting Download (Gateway)...")
    # Clear cache to force network request
    storage_service.clear_cache()
    
    start_time = time.time()
    try:
        # Note: Gateway might take time to propagate. 
        # In a real benchmark we might retry loop here.
        content = await storage_service.download(cid)
        duration = time.time() - start_time
        print(f"✓ Download Complete")
        print(f"  - Size: {len(content)} bytes")
        print(f"  - Time: {duration:.2f}s")
        print(f"  - Speed: {(len(content)/1024/1024) / duration:.2f} MB/s")
    except Exception as e:
        print(f"✗ Download Failed: {e}")

if __name__ == "__main__":
    asyncio.run(benchmark())
