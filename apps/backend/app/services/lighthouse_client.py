"""Lighthouse Web3 client for permanent file storage."""

import logging
import os
from tempfile import NamedTemporaryFile
from typing import Optional

try:
    from lighthouseweb3 import Lighthouse
except ImportError:
    Lighthouse = None

from app.core.config import settings

logger = logging.getLogger(__name__)


class LighthouseClient:
    """Client for interacting with Lighthouse Web3 storage."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize Lighthouse client.

        Args:
            api_key: Lighthouse API Key. If None, uses settings.
        """
        self.api_key = api_key or settings.lighthouse_api_key
        self.client = None
        self._initialized = False

        if Lighthouse is None:
            logger.warning(
                "lighthouseweb3 not installed. Lighthouse functionality disabled."
            )
            return

        if self.api_key:
            self.client = Lighthouse(token=self.api_key)
            self._initialized = True
            logger.info("Lighthouse client initialized successfully")
        else:
            logger.warning("Lighthouse API Key not configured")

    def is_configured(self) -> bool:
        """Check if Lighthouse client is properly configured.

        Returns:
            True if client is initialized and ready to use.
        """
        return self._initialized and self.client is not None

    async def upload_file(
        self, file_bytes: bytes, filename: str = "upload"
    ) -> dict:
        """Upload file to Lighthouse.

        Args:
            file_bytes: File content as bytes
            filename: Name of the file (used for temporary file)

        Returns:
            Dictionary containing upload info (Hash, Name, Size)

        Raises:
            RuntimeError: If Lighthouse is not configured
        """
        if not self.is_configured():
            raise RuntimeError(
                "Lighthouse client not configured. Please set LIGHTHOUSE_API_KEY."
            )

        try:
            # Lighthouse SDK usually expects a file path
            # Create a temporary file to upload
            with NamedTemporaryFile(delete=False, prefix="lighthouse_", suffix=f"_{filename}") as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            try:
                logger.info(f"Uploading file to Lighthouse: {filename}")
                response = self.client.upload(source=temp_path)
                
                # Response format from SDK:
                # {
                #   'data': {
                #     'Name': 'filename',
                #     'Hash': 'QmW...',
                #     'Size': '123'
                #   }
                # }
                # Or sometimes just the dict directly depending on version
                
                logger.info(f"Upload successful: {response}")
                
                data = response.get("data", response)
                return data

            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)

        except Exception as e:
            logger.error(f"Failed to upload file to Lighthouse: {e}")
            raise

    def get_file_info(self, cid: str) -> dict:
        """Get information about a file on Lighthouse.
        
        Note: The Python SDK might not have a direct 'get_info' method readily available 
        in all versions, but we can implement basic status checks if needed.
        For now, we'll assume availability via gateway check.
        """
        pass
