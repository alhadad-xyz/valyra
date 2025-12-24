"""Service for Passkey (WebAuthn) authentication."""
from typing import Optional
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
    base64url_to_bytes,
)
from webauthn.helpers import bytes_to_base64url
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    AuthenticatorAttachment,
    PublicKeyCredentialDescriptor,
)
from app.core.config import settings
from app.models.user import User
from app.models.credential import UserCredential

class PasskeyService:
    """Service for handling WebAuthn operations."""

    @staticmethod
    def generate_registration_options(user: User):
        """Generate WebAuthn registration options."""
        options = generate_registration_options(
            rp_id=settings.rp_id,
            rp_name=settings.rp_name,
            user_id=str(user.id).encode(),
            user_name=user.wallet_address,  # Use wallet address as username
            user_display_name=user.basename or user.wallet_address,
            authenticator_selection=AuthenticatorSelectionCriteria(
                 # user_verification=UserVerificationRequirement.REQUIRED,
                 # authenticator_attachment=AuthenticatorAttachment.PLATFORM
            ),
             # Exclude existing credentials
            exclude_credentials=[
                PublicKeyCredentialDescriptor(id=base64url_to_bytes(cred.credential_id))
                for cred in user.credentials
            ] if user.credentials else None
        )
        return options

    @staticmethod
    def verify_registration_response(user: User, response_data: dict, challenge: str):
        """Verify WebAuthn registration response."""
        verification = verify_registration_response(
            credential=response_data,
            expected_challenge=base64url_to_bytes(challenge),
            expected_origin=settings.expected_origin,
            expected_rp_id=settings.rp_id,
        )
        
        return verification

    @staticmethod
    def generate_authentication_options(user: User):
        """Generate WebAuthn authentication options."""
        options = generate_authentication_options(
            rp_id=settings.rp_id,
            allow_credentials=[
                PublicKeyCredentialDescriptor(id=base64url_to_bytes(cred.credential_id))
                for cred in user.credentials
            ] if user.credentials else None,
            user_verification=UserVerificationRequirement.PREFERRED,
        )
        return options

    @staticmethod
    def verify_authentication_response(user: User, response_data: dict, challenge: str, credential_model: UserCredential):
        """Verify WebAuthn authentication response."""
        verification = verify_authentication_response(
            credential=response_data,
            expected_challenge=base64url_to_bytes(challenge),
            expected_origin=settings.expected_origin,
            expected_rp_id=settings.rp_id,
            credential_public_key=credential_model.public_key,
            credential_current_sign_count=credential_model.sign_count,
        )
        
        return verification

passkey_service = PasskeyService()
