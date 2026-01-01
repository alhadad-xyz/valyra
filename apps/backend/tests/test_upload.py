import pytest
from httpx import AsyncClient
from fastapi import status
from unittest.mock import patch, MagicMock
import sys
from unittest.mock import MagicMock

# MOCK PROBLEM MODULES BEFORE IMPORTING ANYTHING ELSE
# This prevents the protobuf/Python 3.14 incompatibility crash
# by intercepting imports of modules that use google-generativeai
sys.modules["app.routes.listings"] = MagicMock()
sys.modules["app.routes.users"] = MagicMock()
sys.modules["app.routes.auth"] = MagicMock()
# Also mock google.protobuf just in case
sys.modules["google.protobuf"] = MagicMock()
sys.modules["google.generativeai"] = MagicMock()

from httpx import AsyncClient
from fastapi import status, FastAPI
from unittest.mock import patch, MagicMock
from app.routes.upload import router

@pytest.fixture
async def client():
    # Create a minimal app for testing just this router
    # This avoids importing the whole application which triggers
    # protobuf compatibility issues in the current environment
    app = FastAPI()
    app.include_router(router, prefix="/api/v1")
    
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_upload_file_success(client):
    """Test successful file upload via StorageService."""
    mock_result = {
        "cid": "QmTestHash123",
        "url": "https://gateway.lighthouse.storage/ipfs/QmTestHash123",
        "filename": "test_image.png",
        "size": 1234,
        "content_type": "image/png"
    }

    # Mock the storage_service.upload method
    with patch("app.routes.upload.storage_service.upload", new_callable=MagicMock) as mock_upload:
        # Configure the mock to be awaitable
        async def async_return(*args, **kwargs):
            return mock_result
        mock_upload.side_effect = async_return

        files = {"file": ("test_image.png", b"fake image content", "image/png")}
        response = await client.post("/api/v1/upload/", files=files)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "QmTestHash123" in data["cid"]
        assert "gateway.lighthouse.storage" in data["url"]
        assert data["filename"] == "test_image.png"

@pytest.mark.asyncio
async def test_upload_invalid_file_type(client):
    """Test uploading an invalid file type."""
    files = {"file": ("test.exe", b"malicious content", "application/x-msdownload")}
    response = await client.post("/api/v1/upload/", files=files)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid file type" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_file_too_large(client):
    """Test uploading a file that exceeds the size limit."""
    # Create a large file content (> 10MB)
    large_content = b"0" * (10 * 1024 * 1024 + 1)
    files = {"file": ("large.png", large_content, "image/png")}
    
    response = await client.post("/api/v1/upload/", files=files)

    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    assert "File too large" in response.json()["detail"]

@pytest.mark.asyncio
async def test_storage_service_error(client):
    """Test handling of StorageService errors."""
    with patch("app.routes.upload.storage_service.upload", new_callable=MagicMock) as mock_upload:
        async def async_raise(*args, **kwargs):
            raise RuntimeError("Storage configuration missing")
        mock_upload.side_effect = async_raise

        files = {"file": ("test.png", b"content", "image/png")}
        response = await client.post("/api/v1/upload/", files=files)

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Storage configuration missing" in response.json()["detail"]
