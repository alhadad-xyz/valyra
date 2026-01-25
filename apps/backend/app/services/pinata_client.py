"""Pinata IPFS client for decentralized file storage."""

import logging
import httpx
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class PinataClient:
    """Client for interacting with Pinata IPFS storage."""

    def __init__(self, jwt_token: Optional[str] = None):
        """Initialize Pinata client.

        Args:
            jwt_token: Pinata JWT Token. If None, uses settings.
        """
        self.jwt_token = jwt_token or settings.pinata_jwt
        self.base_url = "https://api.pinata.cloud"
        self._initialized = bool(self.jwt_token)

        if not self._initialized:
            logger.warning("Pinata JWT not configured")

    def is_configured(self) -> bool:
        """Check if Pinata client is properly configured.

        Returns:
            True if client is initialized and ready to use.
        """
        return self._initialized

    async def upload_file(
        self, file_bytes: bytes, filename: str = "upload"
    ) -> Dict[str, Any]:
        """Upload file to Pinata.

        Args:
            file_bytes: File content as bytes
            filename: Name of the file

        Returns:
            Dictionary containing upload info (Hash, Name, Size) compatible with StorageService
            {
                'Hash': 'Qm...',
                'Name': 'filename',
                'Size': '123'
            }

        Raises:
            RuntimeError: If Pinata is not configured or upload fails
        """
        if not self.is_configured():
            raise RuntimeError(
                "Pinata client not configured. Please set PINATA_JWT."
            )

        url = f"{self.base_url}/pinning/pinFileToIPFS"
        
        headers = {
            "Authorization": f"Bearer {self.jwt_token}"
        }

        # Prepare multipart form data
        files = {
            'file': (filename, file_bytes)
        }
        
        # Optional: Pinata metadata
        pinata_metadata = {
            "name": filename,
            "keyvalues": {
                "source": "valyra-backend"
            }
        }
        
        import json
        data = {
            "pinataMetadata": json.dumps(pinata_metadata)
        }

        try:
            async with httpx.AsyncClient() as client:
                logger.info(f"Uploading file to Pinata: {filename}")
                response = await client.post(
                    url, 
                    headers=headers, 
                    files=files,
                    data=data,
                    timeout=30.0 # Pinata can be slow with large files
                )
                
                if response.status_code != 200:
                    logger.error(f"Pinata upload failed: {response.text}")
                    raise RuntimeError(f"Pinata upload failed: {response.text}")

                result = response.json()
                logger.info(f"Pinata upload successful: {result}")
                
                # Normalize response to match Lighthouse format expected by StorageService
                return {
                    "Hash": result.get("IpfsHash"),
                    "Name": filename,
                    "Size": str(result.get("PinSize"))
                }

        except Exception as e:
            logger.error(f"Failed to upload file to Pinata: {e}")
            raise
