"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for KalshIQ backend."""

    # Kalshi API
    kalshi_api_key_id: str = ""
    kalshi_private_key_path: str = ""
    kalshi_base_url: str = "https://demo-api.kalshi.co/trade-api/v2"

    # Database
    database_url: str = "postgresql+psycopg://kalshiq:kalshiq@localhost:5432/kalshiq"

    # Data pipeline
    poll_interval_seconds: int = 30

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
