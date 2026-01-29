"""Unified storage service utilizing IPFS via Pinata."""

import logging
from typing import Optional

from app.services.pinata_client import PinataClient
from app.services.ipfs_client import IPFSClient

logger = logging.getLogger(__name__)


class StorageService:
    """Unified service for decentralized file storage and retrieval."""

    def __init__(
        self,
        pinata_client: Optional[PinataClient] = None,
        ipfs_client: Optional[IPFSClient] = None,
    ):
        """Initialize storage service.

        Args:
            pinata_client: PinataClient instance.
            ipfs_client: IPFSClient instance.
        """
        self.pinata = pinata_client or PinataClient()
        self.ipfs = ipfs_client or IPFSClient()
        self._cache: dict[str, bytes] = {}

    async def upload(
        self, file_bytes: bytes, filename: str, content_type: str = "application/octet-stream"
    ) -> dict:
        """Upload file to Pinata for permanent storage.

        Args:
            file_bytes: File content as bytes
            filename: Original filename
            content_type: MIME type (info only)

        Returns:
            Dictionary containing:
                - cid: IPFS Content Identifier (Hash)
                - url: Public URL to access the file
                - filename: Original filename
                - size: File size in bytes
                - content_type: MIME type

        Raises:
            RuntimeError: If storage provider is not configured
        """
        
        if not self.pinata.is_configured():
             raise RuntimeError(
                "Pinata storage provider not configured. Please set PINATA_JWT."
            )

        logger.info(f"Uploading file to Pinata: {filename} ({len(file_bytes)} bytes)")
        result = await self.pinata.upload_file(file_bytes, filename)
        cid = result.get("Hash")

        if not cid:
            raise RuntimeError("Upload failed: No CID returned from storage provider")

        # Generate public URL via IPFS gateway
        url = self.ipfs.get_content_url(cid)

        # Cache the content
        self._cache[cid] = file_bytes

        return {
            "cid": cid,
            "url": url,
            "filename": filename,
            "size": len(file_bytes),
            "content_type": content_type,
        }

    async def download(self, cid: str, use_cache: bool = True) -> bytes:
        """Download file from IPFS.

        Args:
            cid: IPFS Content Identifier
            use_cache: Whether to use cached content if available

        Returns:
            File content as bytes
        """
        # Check cache first
        if use_cache and cid in self._cache:
            logger.info(f"Returning cached content for: {cid}")
            return self._cache[cid]

        try:
            logger.info(f"Downloading from IPFS: {cid}")
            content = await self.ipfs.get_content(cid)
            
            if use_cache:
                self._cache[cid] = content
                
            return content
        except Exception as e:
            logger.error(f"Failed to download {cid}: {e}")
            raise

    def get_url(self, cid: str) -> str:
        """Get public URL for content.

        Args:
            cid: IPFS Content Identifier

        Returns:
            Public URL
        """
        return self.ipfs.get_content_url(cid)

    def clear_cache(self) -> None:
        """Clear the content cache."""
        self._cache.clear()

# Global storage service instance
storage_service = StorageService()
