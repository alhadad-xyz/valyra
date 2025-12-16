# Lighthouse Web3 Storage Setup

This guide covers setting up Lighthouse Web3 for permanent file storage and configuring IPFS gateway in Valyra.

## Overview

- **Lighthouse**: Permanent, decentralized file storage on IPFS/Filecoin.
- **IPFS**: Retrieval via public gateways.

## Setup

### 1. Get Lighthouse API Key
1. Go to [lighthouse.storage](https://lighthouse.storage/).
2. Login/Signup.
3. Go to API Key section and generate a new key.

### 2. Configure Environment
Add to your `.env` file:
```bash
LIGHTHOUSE_API_KEY=your_api_key_here
IPFS_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/
```

### 3. Usage

#### Uploading
```python
from app.services import storage_service

result = await storage_service.upload(
    file_bytes=b"content", 
    filename="doc.pdf"
)
# Returns { "cid": "Qm...", "url": "..." }
```

#### Downloading
```python
content = await storage_service.download(cid="Qm...")
```

## Troubleshooting

- **Upload Failed**: Check API Key validity. Ensure file size is within limits.
- **Download Failed**: Check IPFS Gateway URL. Try fallback gateways.
