import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class IdentityVerificationService:
    def __init__(self):
        self.github_api_url = "https://api.github.com"
    
    async def verify_user(self, github_username: str, linkedin_url: str) -> dict:
        """
        Main method to verify a user by combining GitHub and LinkedIn data.
        """
        github_data = await self.fetch_github_user(github_username)
        linkedin_data = await self.scrape_linkedin_profile(linkedin_url)
        
        score, details = self.calculate_trust_score(github_data, linkedin_data)
        
        return {
            "trust_score": score,
            "details": details,
            "github_data": github_data,
            "linkedin_data": linkedin_data
        }

    async def fetch_github_user(self, username: str) -> dict:
        """
        Fetches public user data from GitHub API.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.github_api_url}/users/{username}")
                if response.status_code == 404:
                    raise HTTPException(status_code=404, detail="GitHub user not found")
                if response.status_code != 200:
                    logger.error(f"GitHub API error: {response.text}")
                    raise HTTPException(status_code=502, detail="Failed to fetch GitHub data")
                
                return response.json()
            except httpx.RequestError as e:
                logger.error(f"GitHub request failed: {str(e)}")
                raise HTTPException(status_code=503, detail="GitHub API unavailable")

    async def scrape_linkedin_profile(self, url: str) -> dict:
        """
        Scrapes basic info from LinkedIn profile.
        WARNING: This is fragile and may be blocked by LinkedIn.
        """
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, follow_redirects=True)
                if response.status_code != 200:
                    logger.warning(f"LinkedIn scrape failed: {response.status_code}")
                    # Return basic data on failure to not block entire verification
                    return {"valid_scrape": False}
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Basic extraction attempts - these CSS selectors are highly likely to change
                # and LinkedIn uses dynamic classes.
                # We try to find standard meta tags or structured data first.
                
                data = {"valid_scrape": True}
                
                # Try to get title/headline
                title = soup.find("title")
                if title:
                    data["title"] = title.text.strip()
                
                # Check for "connections" logic - specific scraping is very hard without a reliable API
                # or updated selectors. For this task, we will simulate connection count extraction
                # if we can find typical patterns or specific keywords in the text.
                
                full_text = soup.get_text().lower()
                if "500+ connections" in full_text:
                    data["connections_count"] = 500
                else:
                    # Fallback/Placeholder
                    data["connections_count"] = 0 
                
                return data
                
            except Exception as e:
                logger.error(f"LinkedIn scraping error: {str(e)}")
                return {"valid_scrape": False}

    def calculate_trust_score(self, github_data: dict, linkedin_data: dict) -> tuple[int, dict]:
        """
        Calculates trust score (0-100) based on:
        - Account age (30%)
        - Contributions/Public Repos (40%)
        - Connections (30%)
        """
        score = 0
        details = {}
        
        # 1. Account Age (30%)
        created_at = github_data.get("created_at")
        if created_at:
            created_date = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")
            age_years = (datetime.now() - created_date).days / 365.25
            
            # Max points for > 3 years
            age_score = min(30, int(age_years * 10))
            score += age_score
            details["account_age_years"] = round(age_years, 1)
            details["age_score"] = age_score
        else:
            details["age_score"] = 0
            
        # 2. Contributions/Activity (40%)
        # Using public_repos and followers as a proxy for "contributions" since 
        # actual contribution graph is hard to scrape accurately via API without GraphQL or scraping.
        public_repos = github_data.get("public_repos", 0)
        followers = github_data.get("followers", 0)
        
        # Simple heuristic: 1 point per repo (cap 20), 1 point per follower (cap 20)
        repo_score = min(20, public_repos)
        follower_score = min(20, followers)
        
        activity_score = repo_score + follower_score
        score += activity_score
        
        details["public_repos"] = public_repos
        details["followers"] = followers
        details["activity_score"] = activity_score
        
        # 3. LinkedIn Connections (30%)
        # Full validation of this is hard without auth.
        connections = linkedin_data.get("connections_count", 0)
        valid_linkedin = linkedin_data.get("valid_scrape", False)
        
        linkedin_score = 0
        if valid_linkedin:
            # If we see 500+, give max points. Otherwise 0 (since we can't easily parse partials)
            if connections >= 500:
                linkedin_score = 30
            elif connections > 0:
                linkedin_score = 15 # Some presence
        
        score += linkedin_score
        details["linkedin_connections_score"] = linkedin_score
        
        return min(100, score), details
