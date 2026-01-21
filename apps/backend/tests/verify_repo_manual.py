import asyncio
import sys
import os
import httpx

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

async def main():
    repo_url = "https://github.com/alhadad-xyz/valyra"
    api_url = "http://localhost:8000/api/v1/verification/verify-repo"
    
    print(f"Testing repo verification for: {repo_url}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url, 
                json={"repo_url": repo_url}
            )
            
            print(f"Status Code: {response.status_code}")
            print("Response:", response.json())
            
            if response.status_code == 200 and response.json().get('exists') == True:
                print("SUCCESS: Repo verified.")
            else:
                print("FAILURE: Repo verification failed.")
                
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(main())
