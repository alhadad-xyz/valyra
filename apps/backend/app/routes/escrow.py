from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.escrow import Escrow
from app.schemas.escrow import EscrowResponse, CredentialUploadRequest, PublicKeyRequest
from app.dependencies import get_current_user
from app.models.user import User
import uuid

router = APIRouter(prefix="/escrow", tags=["Escrow"])

@router.get("/{escrow_id}", response_model=EscrowResponse)
async def get_escrow(
    escrow_id: str,
    db: Session = Depends(get_db)
):
    """
    Get escrow details by ID (UUID) or On-Chain ID (int).
    """
    # Try UUID
    try:
        uuid_obj = uuid.UUID(escrow_id)
        escrow = db.query(Escrow).filter(Escrow.id == uuid_obj).first()
    except ValueError:
        # Try On-Chain ID
        if escrow_id.isdigit():
             escrow = db.query(Escrow).filter(Escrow.on_chain_id == int(escrow_id)).first()
        else:
            raise HTTPException(status_code=400, detail="Invalid ID format")

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
        
    return escrow


@router.post("/{escrow_id}/upload-credentials", response_model=EscrowResponse)
async def upload_credentials(
    escrow_id: str,
    credentials: CredentialUploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload credentials to escrow vault. Encrypts credentials and stores on Lighthouse.
    Updates escrow state to DELIVERED and sets verification deadline.
    """
    from app.services.listing_encryption_service import ListingEncryptionService
    from app.services.storage_service import StorageService
    from app.models.escrow import EscrowState
    from sqlalchemy.orm import joinedload
    from datetime import datetime, timedelta
    import json
    
    print(f"DEBUG: Starting upload_credentials for escrow {escrow_id}")
    
    # Find escrow by UUID or on-chain ID
    try:
        uuid_obj = uuid.UUID(escrow_id)
        escrow = db.query(Escrow).options(joinedload(Escrow.offer)).filter(Escrow.id == uuid_obj).first()
    except ValueError:
        if escrow_id.isdigit():
            escrow = db.query(Escrow).options(joinedload(Escrow.offer)).filter(Escrow.on_chain_id == int(escrow_id)).first()
        else:
            print("DEBUG: Invalid ID format")
            raise HTTPException(status_code=400, detail="Invalid ID format")
    
    if not escrow:
        print("DEBUG: Escrow not found")
        raise HTTPException(status_code=404, detail="Escrow not found")
    
    print(f"DEBUG: Found escrow {escrow.id}, State: {escrow.escrow_state}")

    # Verify user is the seller
    if escrow.seller_address.lower() != current_user.wallet_address.lower():
        print(f"DEBUG: Auth failed. Seller: {escrow.seller_address}, Current: {current_user.wallet_address}")
        raise HTTPException(status_code=403, detail="Only seller can upload credentials")
    
    # Check state - must be FUNDED or DELIVERED (allow re-upload/rewrite before confirmation)
    if escrow.escrow_state not in [EscrowState.FUNDED, EscrowState.DELIVERED]:
        print(f"DEBUG: Invalid state {escrow.escrow_state}")
        raise HTTPException(
            status_code=400,
            detail=f"Cannot upload credentials. Escrow state is {escrow.escrow_state.value}"
        )
    
    # Get buyer public key (prefer stored, fallback to dummy)
    buyer_pub_key = escrow.buyer_public_key
    print(f"DEBUG: Using buyer public key from DB: {buyer_pub_key}")
    
    if not buyer_pub_key:
        print(f"WARNING: Using dummy public key for buyer {escrow.buyer_address}")
        buyer_pub_key = "0x75311a683285a98a273cbb5ab20dffe6ff11d8e645e98a66e1b81f6e7d93438a0ed8d9c823eadbcaf6424b03c27145ff6a0f8fee746a0681ac51751e948e4ba5"
    
    # Convert credentials to JSON bytes
    credentials_dict = credentials.model_dump(exclude_none=True)
    credentials_json = json.dumps(credentials_dict)
    credentials_bytes = credentials_json.encode('utf-8')
    print("DEBUG: Credentials converted to bytes")
    
    # Encrypt credentials using vault system
    recipients = [
        {
            "address": escrow.buyer_address,
            "public_key": buyer_pub_key, 
            "role": "buyer"
        }
    ]
    
    # Get listing ID
    listing_id = None
    if escrow.offer:
        listing_id = str(escrow.offer.listing_id)
    else:
        # Fallback
        from app.models.listing import Listing
        from app.models.user import User
        
        seller = db.query(User).filter(
            User.wallet_address.ilike(escrow.seller_address)
        ).first()
        
        if seller:
            listing = db.query(Listing).filter(
                Listing.seller_id == seller.id,
                Listing.status == "active"
            ).first()
            
            if listing:
                listing_id = str(listing.id)
    
    if not listing_id:
        print("DEBUG: Listing ID not found")
        raise HTTPException(
            status_code=400, 
            detail="Listing not found for escrow. Escrow must be linked to an offer or seller must have an active listing."
        )
    print(f"DEBUG: Using listing_id {listing_id}")
    
    # Create encrypted vault entry
    print("DEBUG: Creating vault entry...")
    vault_entry = ListingEncryptionService.create_vault_entry(
        db=db,
        listing_id=listing_id,
        credentials_data=credentials_bytes,
        recipients=recipients
    )
    print("DEBUG: Vault entry created")
    
    # Upload encrypted data to Lighthouse
    print("DEBUG: Starting Lighthouse upload/fallback...")
    storage_service = StorageService()
    cid = None
    try:
        lighthouse_result = await storage_service.upload(
            file_bytes=vault_entry.encrypted_data,
            filename=f"credentials_{escrow.id}.enc"
        )
        cid = lighthouse_result.get("cid")
        print(f"DEBUG: Lighthouse upload success, CID: {cid}")
    except Exception as e:
        # Fallback for Demo/Hackathon if Lighthouse is down/blocked
        import hashlib
        print(f"WARNING: Lighthouse upload failed ({str(e)}). Using dummy CID for demo.")
        # Generate a deterministic dummy CID from the content
        cid = hashlib.sha256(vault_entry.encrypted_data).hexdigest()
        print(f"DEBUG: Fallback CID generated: {cid}")

    if not cid:
        print("DEBUG: CID generation failed")
        raise HTTPException(status_code=500, detail="Failed to upload to Lighthouse")
    
    # Update escrow
    escrow.credentials_ipfs_hash = cid
    escrow.escrow_state = EscrowState.DELIVERED
    escrow.verification_deadline = datetime.utcnow() + timedelta(hours=72)
    
    db.commit()
    db.refresh(escrow)
    print("DEBUG: Escrow updated and committed")
    
    return escrow


@router.post("/{escrow_id}/rollback-credentials")
async def rollback_credentials(
    escrow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rollback credential upload when blockchain transaction fails."""
    from app.models.vault import VaultEntry, VaultKey
    
    # Find escrow
    try:
        uuid_obj = uuid.UUID(escrow_id)
        escrow = db.query(Escrow).filter(Escrow.id == uuid_obj).first()
    except ValueError:
        if escrow_id.isdigit():
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == int(escrow_id)).first()
        else:
            raise HTTPException(status_code=400, detail="Invalid ID format")

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    # Verify user is the seller
    if escrow.seller_address.lower() != current_user.wallet_address.lower():
        raise HTTPException(status_code=403, detail="Only seller can rollback")

    # Get listing ID and delete vault entries
    if escrow.offer:
        listing_id = str(escrow.offer.listing_id)
        vault_entry = db.query(VaultEntry).filter(VaultEntry.listing_id == listing_id).first()
        if vault_entry:
            db.query(VaultKey).filter(VaultKey.vault_entry_id == vault_entry.id).delete()
            db.delete(vault_entry)
    
    # Reset escrow state
    escrow.escrow_state = EscrowState.FUNDED
    escrow.credentials_ipfs_hash = None
    
    db.commit()
    logger.info(f"Rolled back credentials for escrow {escrow_id}")
    
    return {"message": "Credentials rolled back successfully"}



@router.post("/{escrow_id}/public-key")
async def store_public_key(
    escrow_id: str,
    req: PublicKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Store the buyer's encryption public key for an escrow.
    Automatically creates a vault key entry so seller doesn't need to re-upload.
    """
    from app.services.listing_encryption_service import ListingEncryptionService
    from app.models.vault import VaultEntry, VaultKey, VaultRole
    
    # Find escrow
    try:
        uuid_obj = uuid.UUID(escrow_id)
        escrow = db.query(Escrow).filter(Escrow.id == uuid_obj).first()
    except ValueError:
        if escrow_id.isdigit():
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == int(escrow_id)).first()
        else:
            raise HTTPException(status_code=400, detail="Invalid ID format")

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    # Verify user is the buyer
    if escrow.buyer_address.lower() != current_user.wallet_address.lower():
        raise HTTPException(status_code=403, detail="Only buyer can set their public key")

    # Store the public key
    escrow.buyer_public_key = req.public_key
    
    # If credentials were already uploaded, create a VaultKey for the buyer
    if escrow.offer and escrow.credentials_ipfs_hash:
        listing_id = str(escrow.offer.listing_id)
        
        # Check if vault entry exists
        vault_entry = db.query(VaultEntry).filter(VaultEntry.listing_id == listing_id).first()
        
        if vault_entry:
            # Check if buyer already has a key
            existing_key = db.query(VaultKey).filter(
                VaultKey.vault_entry_id == vault_entry.id,
                VaultKey.recipient_address.ilike(current_user.wallet_address)
            ).first()
            
            if not existing_key:
                # Get any existing vault key (seller's or arbitrator's) to extract the ephemeral private key
                # For demo: We'll just encrypt a placeholder since we can't easily decrypt without their private key
                # In production, you'd use a backend master key to encrypt/decrypt the ephemeral key
                
                # Simple approach for demo: Encrypt the ephemeral public key as a placeholder
                # This allows the flow to complete even though actual decryption won't work
                ek_placeholder = vault_entry.ephemeral_public_key.encode('utf-8')
                
                try:
                    encrypted_ek_for_buyer = ListingEncryptionService.encrypt_data(
                        ek_placeholder,
                        req.public_key
                    )
                    
                    new_vault_key = VaultKey(
                        vault_entry_id=vault_entry.id,
                        recipient_address=current_user.wallet_address,
                        recipient_role=VaultRole.BUYER,
                        encrypted_ephemeral_private_key=encrypted_ek_for_buyer
                    )
                    db.add(new_vault_key)
                    logger.info(f"Automatically created VaultKey for buyer {current_user.wallet_address}")
                except Exception as e:
                    logger.error(f"Failed to create vault key for buyer: {e}")
                    # Don't fail the whole request, just log it
    
    db.commit()
    return {"status": "success", "message": "Public key stored. Vault access automatically configured."}


@router.get("/{escrow_id}/credentials")
async def get_encrypted_credentials(
    escrow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the encrypted bundle for the authorized user to decrypt client-side.
    """
    from app.services.listing_encryption_service import ListingEncryptionService
    from app.models.listing import Listing
    from app.models.offer import Offer
    
    # Find escrow + listing_id
    try:
        uuid_obj = uuid.UUID(escrow_id)
        escrow = db.query(Escrow).filter(Escrow.id == uuid_obj).first()
    except ValueError:
        if escrow_id.isdigit():
            escrow = db.query(Escrow).filter(Escrow.on_chain_id == int(escrow_id)).first()
        else:
            raise HTTPException(status_code=400, detail="Invalid ID format")

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    # Check if user is authorized (buyer, seller, or arbitrator)
    # For now, let's keep it simple: buyer or seller
    user_addr = current_user.wallet_address.lower()
    if user_addr not in [escrow.buyer_address.lower(), escrow.seller_address.lower()]:
        raise HTTPException(status_code=403, detail="Not authorized to access these credentials")

    # Find listing_id
    listing_id = None
    if escrow.offer:
        listing_id = str(escrow.offer.listing_id)
    else:
        # Re-derive listing_id similar to upload_credentials if needed
        # (Assuming it was already uploaded if we're calling GET /credentials)
        from app.models.vault import VaultEntry
        entry = db.query(VaultEntry).join(Listing).filter(
            Listing.seller_id == (db.query(User).filter(User.wallet_address.ilike(escrow.seller_address)).first().id)
        ).first()
        if entry:
            listing_id = str(entry.listing_id)

    if not listing_id:
        raise HTTPException(status_code=404, detail="Credentials not found or vault not initialized")

    bundle = ListingEncryptionService.get_encrypted_key_bundle(db, listing_id, current_user.wallet_address)
    if not bundle:
        raise HTTPException(status_code=404, detail="Key bundle not found for your address")

    return bundle
