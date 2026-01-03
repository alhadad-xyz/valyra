title:	[Role: Backend] File Upload Proxy (`/upload` -> IPFS)
state:	OPEN
author:	alhadad-xyz
labels:	Role: Backend, Week 2
comments:	0
assignees:	
projects:	
milestone:	
number:	84
--
## 📖 General Description
Create a file upload proxy endpoint that accepts files from the frontend, validates them, and uploads to IPFS/Pinata, returning the content hash (CID) for decentralized storage.

**Category:** CRUD Endpoints

**Technical Context:** Use FastAPI's `UploadFile` parameter to receive multipart/form-data. Validate `content_type` (allow images, PDFs) and file size (max 10MB). Stream the file to Pinata API using `httpx` POST request. Return the IPFS CID (`ipfs://<hash>`) to the client. Implement virus scanning for uploaded files before storage.



## Definition of Done
- [ ] Upload endpoint accepts multipart/form-data
- [ ] File content streamed to Pinata/IPFS
- [ ] IPFS Hash (CID) returned to client
- [ ] Max file size limit (e.g. 10MB) enforced
- [ ] Peer review completed

## 🛠️ How to Implement
1. **Input:** FastApi `UploadFile` parameter.
2. **Validation:** Check `file.content_type` and `len(file.read())`.
3. **Pinata/IPFS:** Use `httpx` to POST the file stream to IPFS pinning service.
4. **Return:** Respond with `ipfs://<hash>`.

## 📚 References
- 📄 [Product Requirements (PRD)](docs/prd.md)
- 📐 [Technical Design Doc (TDD)](docs/tdd.md)
- 🎨 [Design Specifications](docs/design-spec.md)
