import httpx
from typing import Dict, Any, Tuple

class AssetVerificationService:
    async def verify_repo(self, repo_url: str) -> Dict[str, Any]:
        """
        Verifies if a GitHub repo exists and is public.
        """
        # Extract owner/repo from URL
        # URL format: https://github.com/owner/repo
        try:
             # Basic parsing
             parts = str(repo_url).rstrip('/').split('/')
             if 'github.com' not in parts:
                  return {
                       "is_verified": False,
                       "exists": False,
                       "is_public": False,
                       "message": "Invalid GitHub URL"
                  }
             
             owner = parts[-2]
             repo = parts[-1]
             
             api_url = f"https://api.github.com/repos/{owner}/{repo}"
             
             async with httpx.AsyncClient() as client:
                  response = await client.get(
                       api_url, 
                       headers={"User-Agent": "Valyra-Marketplace"},
                       follow_redirects=True
                  )
                  
                  if response.status_code == 200:
                       data = response.json()
                       return {
                            "is_verified": True,
                            "exists": True,
                            "is_public": not data.get('private', False),
                            "repo_details": {
                                 "stars": data.get('stargazers_count', 0),
                                 "forks": data.get('forks_count', 0),
                                 "owner": data.get('owner', {}).get('login')
                            },
                            "message": "Repository verified successfully"
                       }
                  elif response.status_code == 404:
                       return {
                            "is_verified": False,
                            "exists": False,
                            "is_public": False, 
                            "message": "Repository not found or is private"
                       }
                  else:
                       return {
                            "is_verified": False,
                            "exists": False, # Unknown state really, but effectively not verifiable
                            "is_public": False,
                            "message": f"GitHub API error: {response.status_code}"
                       }

        except Exception as e:
             return {
                  "is_verified": False,
                  "exists": False,
                  "is_public": False,
                  "message": f"Verification failed: {str(e)}"
             }

asset_verification_service = AssetVerificationService()
