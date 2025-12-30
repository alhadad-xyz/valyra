"""File upload router for handling uploads to IPFS via Lighthouse."""
from typing import Dict, Any

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.storage_service import storage_service

router = APIRouter(prefix="/upload", tags=["upload"])

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Upload a file to IPFS via Lighthouse.
    
    Validates file type and size before uploading.
    Returns the IPFS CID and a gateway URL.
    """
    # 1. Validate Content Type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    # 2. Validate File Size
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB",
        )
        
    # Reset file cursor for uploading if needed, though we have content in memory now
    await file.seek(0)
    
    # 3. Upload to Lighthouse via StorageService
    try:
        result = await storage_service.upload(
            file_bytes=content,
            filename=file.filename or "upload",
            content_type=file.content_type or "application/octet-stream"
        )
        
        # Ensure return format matches expected schema
        return {
            "cid": f"ipfs://{result['cid']}" if not result['cid'].startswith("ipfs://") else result['cid'],
            "url": result['url'],
            "filename": result['filename'],
            "size": result['size'],
            "content_type": result['content_type'],
        }
            
    except RuntimeError as e:
        # Catch configuration or upload errors from StorageService
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal upload error: {str(e)}",
        )
