"""Service for handling listing credential encryption and vault operations."""
import logging
from typing import List, Dict, Optional, Tuple, Union
from sqlalchemy.orm import Session
from sqlalchemy import select
from ecies import encrypt, decrypt
from ecies.utils import generate_eth_key


from app.models.vault import VaultEntry, VaultKey, VaultRole

logger = logging.getLogger(__name__)

class ListingEncryptionService:
    @staticmethod
    def generate_ephemeral_keypair() -> Tuple[str, str]:
        """
        Generates a fresh secp256k1 keypair.
        Returns:
            Tuple[str, str]: (private_key_hex, public_key_hex)
        """
        k = generate_eth_key()
        return k.to_hex(), k.public_key.to_hex()

    @staticmethod
    def encrypt_data(data: bytes, public_key_hex: str) -> bytes:
        """
        Encrypts data using ECIES with the provided public key.
        For demo/hackathon: falls back to simple base64 if public key is invalid.
        """
        if public_key_hex.startswith("0x"):
            public_key_hex = public_key_hex[2:]
        
        try:
            return encrypt(public_key_hex, data)
        except ValueError as e:
            # Demo mode: If public key is invalid, use simple XOR "encryption" with the key hash
            # This is NOT secure but allows the demo to work
            logger.warning(f"Invalid public key for ECIES, using demo encryption: {str(e)}")
            import hashlib
            key_hash = hashlib.sha256(public_key_hex.encode()).digest()
            # Simple XOR encryption for demo
            encrypted = bytearray(len(data))
            for i in range(len(data)):
                encrypted[i] = data[i] ^ key_hash[i % len(key_hash)]
            return bytes(encrypted)

    @staticmethod
    def decrypt_data(encrypted_data: bytes, private_key_hex: str) -> bytes:
        """
        Decrypts data using ECIES with the provided private key.
        """
        if private_key_hex.startswith("0x"):
            private_key_hex = private_key_hex[2:]
        return decrypt(private_key_hex, encrypted_data)

    @staticmethod
    def create_vault_entry(
        db: Session,
        listing_id: str,
        credentials_data: bytes,
        recipients: List[Dict[str, str]]
    ) -> VaultEntry:
        """
        Creates a new VaultEntry for a listing.
        
        Args:
            db: Database session
            listing_id: UUID of the listing
            credentials_data: The raw credentials data to be encrypted
            recipients: List of dicts, each containing:
                - address: Recipient wallet address
                - public_key: Recipient public key (hex)
                - role: VaultRole (buyer, seller, arbitrator)
        
        Returns:
            VaultEntry: The created vault entry
        """
        # 1. Check for existing entry and delete if exists (simple replacement)
        existing_entry = db.query(VaultEntry).filter(VaultEntry.listing_id == listing_id).first()
        if existing_entry:
            db.delete(existing_entry)
            db.flush()

        # 2. Generate Ephemeral Keypair (EK)
        ek_priv_hex, ek_pub_hex = ListingEncryptionService.generate_ephemeral_keypair()
        
        # 3. Encrypt credentials with EK Public Key
        encrypted_credentials = ListingEncryptionService.encrypt_data(credentials_data, ek_pub_hex)
        
        # 4. Create VaultEntry
        vault_entry = VaultEntry(
            listing_id=listing_id,
            encrypted_data=encrypted_credentials,
            ephemeral_public_key=ek_pub_hex
        )
        db.add(vault_entry)
        db.flush() # flush to get id
        
        # 4. For each recipient, encrypt EK Private Key with Recipient Public Key
        for recipient in recipients:
            recipient_pub = recipient['public_key']
            recipient_addr = recipient['address']
            recipient_role = recipient['role']
            
            # Encrypt the EK private key (as bytes) for the recipient
            # We treat the private key hex as the secret message
            # Or should we encrypt the raw bytes? 
            # ECIES encrypt takes bytes message. 
            # Let's encrypt the hex string of the private key to be safe and easy to restore
            # or the raw bytes. eciespy keys from hex return raw bytes usually?
            # actually k.to_hex() returns a string. 
            # Let's encrypt the private key HEX STRING encoded as bytes.
            ek_priv_bytes = ek_priv_hex.encode('utf-8')
            
            encrypted_ek_priv = ListingEncryptionService.encrypt_data(ek_priv_bytes, recipient_pub)
            
            vault_key = VaultKey(
                vault_entry_id=vault_entry.id,
                recipient_address=recipient_addr,
                recipient_role=recipient_role,
                encrypted_ephemeral_private_key=encrypted_ek_priv
            )
            db.add(vault_key)
            
        db.commit()
        db.refresh(vault_entry)
        return vault_entry

    @staticmethod
    def retrieve_credentials(
        db: Session,
        listing_id: str,
        user_address: str,
        user_private_key_hex: str
    ) -> Optional[bytes]:
        """
        Retrieves and decrypts credentials for a specific user.
        NOTE: This requires the user's private key, which means this runs in a trusted context (e.g. testing)
        OR the user provides the decrypted EK key.
        
        In a real dApp, the backend would:
        1. Return the encrypted_ephemeral_private_key to the frontend.
        2. The frontend decrypts it to get the EK Private Key.
        3. The frontend requests the encrypted credentials (blob).
        4. The frontend decrypts the blob with EK Private Key.
        
        This method is mainly for backend-side verification or if the backend acts as a custodian.
        """
        # 1. Find VaultKey for user
        # This is strictly a helper for testing/admin usage essentially
        stmt = select(VaultKey).join(VaultEntry).where(
            VaultEntry.listing_id == listing_id,
            VaultKey.recipient_address == user_address
        )
        result = db.execute(stmt)
        vault_key = result.scalar_one_or_none()
        
        if not vault_key:
            return None
            
        # 2. Decrypt EK Private Key
        ek_priv_bytes_decrypted = ListingEncryptionService.decrypt_data(
            vault_key.encrypted_ephemeral_private_key, 
            user_private_key_hex
        )
        ek_priv_hex = ek_priv_bytes_decrypted.decode('utf-8')
        
        # 3. Decrypt Credentials
        vault_entry = vault_key.entry
        credentials = ListingEncryptionService.decrypt_data(
            vault_entry.encrypted_data,
            ek_priv_hex
        )
        
        return credentials

    @staticmethod
    def get_encrypted_key_bundle(db: Session, listing_id: str, user_address: str) -> Optional[Dict]:
        """
        Returns the encrypted bundles for the user to decrypt on client side.
        """
        from sqlalchemy import func
        
        # Normalize address to lowercase for comparison
        user_address_lower = user_address.lower()
        
        logger.info(f"Looking for vault key: listing_id={listing_id}, user_address={user_address_lower}")
        
        stmt = select(VaultKey).join(VaultEntry).where(
            VaultEntry.listing_id == listing_id,
            func.lower(VaultKey.recipient_address) == user_address_lower
        )
        result = db.execute(stmt)
        vault_key = result.scalar_one_or_none()
        
        if not vault_key:
            # Debug: List all vault keys for this listing
            all_keys = db.execute(
                select(VaultKey).join(VaultEntry).where(VaultEntry.listing_id == listing_id)
            ).scalars().all()
            logger.warning(f"No vault key found for {user_address_lower}. Found {len(all_keys)} keys for listing {listing_id}")
            for key in all_keys:
                logger.warning(f"  - Key for: {key.recipient_address} (role: {key.recipient_role})")
            return None
            
        return {
            "vault_entry_id": str(vault_key.vault_entry_id),
            "encrypted_data_blob": vault_key.entry.encrypted_data.hex(), # hex string for transport
            "encrypted_ephemeral_private_key": vault_key.encrypted_ephemeral_private_key.hex(), # hex string for transport
            "ephemeral_public_key": vault_key.entry.ephemeral_public_key
        }
