"""IPFS client for retrieving decentralized content."""

import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class IPFSClient:
    """Client for retrieving content from IPFS via gateway."""

    def __init__(self, gateway_url: Optional[str] = None):
        """Initialize IPFS client.

        Args:
            gateway_url: IPFS gateway URL. If None, uses settings.
        """
        self.gateway_url = (gateway_url or settings.ipfs_gateway_url).rstrip("/")
        self.timeout = 30.0  # seconds
        self.max_retries = 3

    async def get_content(self, cid: str) -> bytes:
        """Retrieve content from IPFS by CID.

        Args:
            cid: IPFS Content Identifier

        Returns:
            File content as bytes

        Raises:
            httpx.HTTPError: If retrieval fails
            TimeoutError: If request times out
        """
        url = self.get_content_url(cid)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for attempt in range(self.max_retries):
                try:
                    logger.info(f"Fetching IPFS content: {cid} (attempt {attempt + 1})")
                    response = await client.get(url)
                    response.raise_for_status()

                    logger.info(f"Successfully retrieved IPFS content: {cid}")
                    return response.content

                except httpx.TimeoutException as e:
                    logger.warning(
                        f"Timeout fetching IPFS content (attempt {attempt + 1}): {e}"
                    )
                    if attempt == self.max_retries - 1:
                        raise TimeoutError(
                            f"Failed to fetch IPFS content after {self.max_retries} attempts"
                        )

                except httpx.HTTPError as e:
                    logger.error(f"HTTP error fetching IPFS content: {e}")
                    raise

        raise RuntimeError("Failed to retrieve IPFS content")

    def get_content_url(self, cid: str) -> str:
        """Generate public URL for IPFS content.

        Args:
            cid: IPFS Content Identifier

        Returns:
            Public URL to access the content
        """
        # Remove any leading/trailing slashes from CID
        cid = cid.strip("/")

        # If gateway URL already ends with /ipfs/, don't add it again
        if self.gateway_url.endswith("/ipfs"):
            return f"{self.gateway_url}/{cid}"

        return f"{self.gateway_url}/{cid}"

    async def check_availability(self, cid: str) -> bool:
        """Check if content is available on IPFS.

        Args:
            cid: IPFS Content Identifier

        Returns:
            True if content is accessible, False otherwise
        """
        url = self.get_content_url(cid)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.head(url)
                return response.status_code == 200

        except Exception as e:
            logger.warning(f"Failed to check IPFS availability for {cid}: {e}")
            return False

    async def get_content_with_fallback(
        self, cid: str, fallback_gateways: Optional[list[str]] = None
    ) -> bytes:
        """Retrieve content with fallback to alternative gateways.

        Args:
            cid: IPFS Content Identifier
            fallback_gateways: List of alternative gateway URLs to try

        Returns:
            File content as bytes

        Raises:
            RuntimeError: If all gateways fail
        """
        # Try primary gateway first
        try:
            return await self.get_content(cid)
        except Exception as e:
            logger.warning(f"Primary gateway failed: {e}")

        # Try fallback gateways
        if fallback_gateways:
            for gateway in fallback_gateways:
                try:
                    logger.info(f"Trying fallback gateway: {gateway}")
                    temp_client = IPFSClient(gateway_url=gateway)
                    return await temp_client.get_content(cid)
                except Exception as e:
                    logger.warning(f"Fallback gateway {gateway} failed: {e}")
                    continue

        raise RuntimeError(f"Failed to retrieve IPFS content {cid} from all gateways")
