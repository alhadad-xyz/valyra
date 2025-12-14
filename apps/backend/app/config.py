"""Application configuration using Pydantic Settings."""
from typing import List
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
    database_url: str
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # API Keys
    gemini_api_key: str
    coinbase_agentkit_key: str | None = None

    # IPFS/Arweave
    arweave_wallet_path: str | None = None
    pinata_api_key: str | None = None
    pinata_secret_key: str | None = None

    # Web3
    base_rpc_url: str = "https://mainnet.base.org"
    base_chain_id: int = 8453

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
    treasury_address: str | None = None

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
