import pytest
from unittest.mock import MagicMock, ANY
from app.services.listing_encryption_service import ListingEncryptionService
from app.models.vault import VaultEntry, VaultKey, VaultRole
from ecies.utils import generate_eth_key

def test_generate_ephemeral_keypair():
    priv, pub = ListingEncryptionService.generate_ephemeral_keypair()
    assert priv is not None
    assert pub is not None
    assert len(priv) >= 64 # Hex string
    assert len(pub) >= 128 # Hex string uncompressed

def test_encrypt_decrypt_roundtrip():
    priv, pub = ListingEncryptionService.generate_ephemeral_keypair()
    message = b"Secret Credentials"
    
    encrypted = ListingEncryptionService.encrypt_data(message, pub)
    decrypted = ListingEncryptionService.decrypt_data(encrypted, priv)
    
    assert decrypted == message

def test_create_vault_entry():
    # Setup
    db = MagicMock()
    listing_id = "listing-uuid"
    credentials_data = b"Super Secret Password"
    
    # Generate mock recipients keys
    buyer_priv = generate_eth_key()
    buyer_pub = buyer_priv.public_key.to_hex()
    buyer_addr = buyer_priv.public_key.to_address()
    
    seller_priv = generate_eth_key()
    seller_pub = seller_priv.public_key.to_hex()
    seller_addr = seller_priv.public_key.to_address()
    
    recipients = [
        {"address": buyer_addr, "public_key": buyer_pub, "role": VaultRole.BUYER},
        {"address": seller_addr, "public_key": seller_pub, "role": VaultRole.SELLER}
    ]
    
    # Execute
    vault_entry = ListingEncryptionService.create_vault_entry(db, listing_id, credentials_data, recipients)
    
    # Assertions
    assert db.add.call_count >= 3 # 1 VaultEntry + 2 VaultKeys
    
    # Verify VaultEntry
    assert isinstance(vault_entry, VaultEntry)
    assert vault_entry.listing_id == listing_id
    assert vault_entry.encrypted_data != credentials_data
    
    # Verify VaultKeys creation
    # We expect db.add calls with VaultKey objects
    vault_key_calls = [call for call in db.add.call_args_list if isinstance(call[0][0], VaultKey)]
    assert len(vault_key_calls) == 2
    
    # Verify decryption flow for Buyer
    # Capture the stored VaultKeys
    buyer_key_obj = next(call[0][0] for call in vault_key_calls if call[0][0].recipient_role == VaultRole.BUYER)
    
    # 1. Decrypt Encrypted EPK Private Key using Buyer's Private Key
    encrypted_epk_priv = buyer_key_obj.encrypted_ephemeral_private_key
    decrypted_epk_priv_bytes = ListingEncryptionService.decrypt_data(encrypted_epk_priv, buyer_priv.to_hex())
    decrypted_epk_priv_hex = decrypted_epk_priv_bytes.decode('utf-8')
    
    # 2. Decrypt Credentials using Decrypted EPK Private Key
    final_credentials = ListingEncryptionService.decrypt_data(vault_entry.encrypted_data, decrypted_epk_priv_hex)
    
    assert final_credentials == credentials_data
