"""Tests for IPFSClient."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.ipfs_client import IPFSClient


class TestIPFSClient:
    """Test cases for IPFSClient."""

    def test_init_default_gateway(self):
        """Test initialization with default gateway."""
        client = IPFSClient()
        assert "cloudflare-ipfs.com" in client.gateway_url

    def test_init_custom_gateway(self):
        """Test initialization with custom gateway."""
        custom_gateway = "https://ipfs.io/ipfs/"
        client = IPFSClient(gateway_url=custom_gateway)
        assert client.gateway_url == "https://ipfs.io/ipfs"

    def test_get_content_url(self):
        """Test generating content URL."""
        client = IPFSClient(gateway_url="https://ipfs.io/ipfs/")
        
        url = client.get_content_url("QmTest123")
        
        assert url == "https://ipfs.io/ipfs/QmTest123"

    def test_get_content_url_strips_slashes(self):
        """Test that CID slashes are stripped."""
        client = IPFSClient(gateway_url="https://ipfs.io/ipfs/")
        
        url = client.get_content_url("/QmTest123/")
        
        assert url == "https://ipfs.io/ipfs/QmTest123"

    @pytest.mark.asyncio
    async def test_get_content_success(self):
        """Test successful content retrieval."""
        client = IPFSClient()
        
        mock_response = MagicMock()
        mock_response.content = b"test content"
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            content = await client.get_content("QmTest123")

            assert content == b"test content"

    @pytest.mark.asyncio
    async def test_get_content_timeout(self):
        """Test timeout handling."""
        client = IPFSClient()
        client.max_retries = 2

        with patch("httpx.AsyncClient") as mock_client:
            import httpx
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.TimeoutException("Timeout")
            )

            with pytest.raises(TimeoutError, match="Failed to fetch"):
                await client.get_content("QmTest123")

    @pytest.mark.asyncio
    async def test_get_content_http_error(self):
        """Test HTTP error handling."""
        client = IPFSClient()

        with patch("httpx.AsyncClient") as mock_client:
            import httpx
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPError("404 Not Found")
            )

            with pytest.raises(httpx.HTTPError):
                await client.get_content("QmTest123")

    @pytest.mark.asyncio
    async def test_get_content_retry_logic(self):
        """Test retry logic on timeout."""
        client = IPFSClient()
        client.max_retries = 3

        mock_response = MagicMock()
        mock_response.content = b"success after retry"
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            import httpx
            # Fail twice, then succeed
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=[
                    httpx.TimeoutException("Timeout 1"),
                    httpx.TimeoutException("Timeout 2"),
                    mock_response,
                ]
            )

            content = await client.get_content("QmTest123")

            assert content == b"success after retry"

    @pytest.mark.asyncio
    async def test_check_availability_success(self):
        """Test checking content availability."""
        client = IPFSClient()

        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.head = AsyncMock(
                return_value=mock_response
            )

            available = await client.check_availability("QmTest123")

            assert available is True

    @pytest.mark.asyncio
    async def test_check_availability_not_found(self):
        """Test checking unavailable content."""
        client = IPFSClient()

        mock_response = MagicMock()
        mock_response.status_code = 404

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.head = AsyncMock(
                return_value=mock_response
            )

            available = await client.check_availability("QmTest123")

            assert available is False

    @pytest.mark.asyncio
    async def test_get_content_with_fallback_success(self):
        """Test fallback gateway success."""
        client = IPFSClient()

        mock_response = MagicMock()
        mock_response.content = b"fallback content"
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            import httpx
            # Primary fails, fallback succeeds
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=[
                    httpx.HTTPError("Primary failed"),
                    mock_response,
                ]
            )

            fallback_gateways = ["https://ipfs.io/ipfs/"]
            content = await client.get_content_with_fallback("QmTest123", fallback_gateways)

            assert content == b"fallback content"

    @pytest.mark.asyncio
    async def test_get_content_with_fallback_all_fail(self):
        """Test when all gateways fail."""
        client = IPFSClient()

        with patch("httpx.AsyncClient") as mock_client:
            import httpx
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPError("All failed")
            )

            fallback_gateways = ["https://ipfs.io/ipfs/", "https://dweb.link/ipfs/"]

            with pytest.raises(RuntimeError, match="Failed to retrieve"):
                await client.get_content_with_fallback("QmTest123", fallback_gateways)
