"""Application configuration using Pydantic Settings."""

from typing import List, Optional
from pydantic import field_validator, PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Database
    database_url: PostgresDsn
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # Redis
    redis_url: str = "redis://localhost:6379"

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: Optional[str]) -> Optional[str]:
        """Fix postgres:// scheme for SQLAlchemy compatibility."""
        if v and isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # API Keys
    gemini_api_key: SecretStr
    coinbase_agentkit_key: Optional[str] = None

    # IPFS/Lighthouse
    lighthouse_api_key: Optional[str] = None
    ipfs_gateway_url: str = "https://gateway.lighthouse.storage/ipfs/"
    pinata_api_key: Optional[str] = None
    pinata_secret_key: Optional[str] = None

    # AgentKit & CDP
    cdp_api_key_name: Optional[str] = None
    cdp_api_key_private_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    admin_api_key: Optional[str] = None  # For securing the agent endpoint

    # Web3
    base_rpc_url: str = "https://mainnet.base.org"
    base_chain_id: int = 8453
    escrow_contract_address: Optional[str] = None
    marketplace_contract_address: Optional[str] = None

    # Passkeys (WebAuthn)
    rp_id: str = "localhost"
    rp_name: str = "Valyra"
    expected_origin: str = "http://localhost:3000"

    # Google
    google_client_id: Optional[str] = None
    google_client_secret: Optional[SecretStr] = None
    google_redirect_uri: Optional[str] = "http://localhost:8000/api/v1/auth/google/callback"

    # App Config
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Platform
    platform_fee_percentage: float = 2.5
    treasury_address: Optional[str] = None

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"


# Global settings instance
settings = Settings()
