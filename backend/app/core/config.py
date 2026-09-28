from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Kastu"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False

    # AWS configuration
    aws_region: str = "ap-south-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None

    # Amazon Transcribe
    transcribe_language_code: str = "en-IN"
    transcribe_sample_rate: int = 16000
    transcribe_partial_results_stability: str = "medium"

    # Amazon Bedrock & Guardrails
    bedrock_model_id: str = "amazon.nova-pro-v1:0"
    bedrock_guardrail_id: Optional[str] = None
    bedrock_guardrail_version: Optional[str] = "DRAFT"
    bedrock_inference_profile_id: Optional[str] = None

    # TTS
    tts_voice_id: str = "Kajal"

    # DynamoDB Tables
    dynamodb_table_users: str = "users"
    dynamodb_table_sessions: str = "sessions"
    dynamodb_table_grammar_errors: str = "grammar_errors"
    dynamodb_table_ws_connections: str = "websocket_connections"

    # Auth
    jwt_secret: str = "kastu-super-secret-development-jwt-key-replace-in-production-123456"
    jwt_expiry_seconds: int = 1800
    bcrypt_cost: int = 12

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
