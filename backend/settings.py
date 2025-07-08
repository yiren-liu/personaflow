from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pydantic import Field

class Settings(BaseSettings):
    openai_api_type: Optional[str] = Field(default=None, validation_alias="OPENAI_API_TYPE")
    openai_api_key: Optional[str] = Field(default=None, validation_alias="OPENAI_API_KEY")
    openai_api_base: Optional[str] = Field(default=None, validation_alias="OPENAI_API_BASE")
    s2_api_key: Optional[str] = Field(default=None, validation_alias="S2_API_KEY")
    youtube_playlist_id: Optional[str] = Field(default=None, validation_alias="YOUTUBE_PLAYLIST_ID")
    google_application_credentials: Optional[str] = Field(default=None, validation_alias="GOOGLE_APPLICATION_CREDENTIALS")
    reranker_type: Optional[str] = Field(default=None, validation_alias="RERANKER_TYPE")
    sagamaker_cls_endpoint: Optional[str] = Field(default=None, validation_alias="SAGEMAKER_CLS_ENDPOINT")
    hf_model_id: Optional[str] = Field(default=None, validation_alias="HF_MODEL_ID")
    tgi_url: Optional[str] = Field(default=None, validation_alias="TGI_URL")
    xinference_api_url: Optional[str] = Field(default=None, validation_alias="XINFERENCE_API_URL")
    xinference_model_id: Optional[str] = Field(default=None, validation_alias="XINFERENCE_MODEL_ID")
    cohere_api_url: Optional[str] = Field(default=None, validation_alias="COHERE_API_URL")
    cohere_api_key: Optional[str] = Field(default=None, validation_alias="COHERE_API_KEY")
    jwt_secret: str = Field(default=None, validation_alias="SUPABASE_JWT_SECRET")
    supabase_url: str = Field(default=None, validation_alias="SUPABASE_URL")
    supabase_service_key: str = Field(default=None, validation_alias="SUPABASE_SERVICE_KEY")
    redis_host: str = Field(default=None, validation_alias="REDIS_HOST")
    redis_port: str = Field(default=None, validation_alias="REDIS_PORT")
    redis_password: str = Field(default=None, validation_alias="REDIS_PASSWORD")
    decrypt_key: str = Field(default=None, validation_alias="DECRYPT_KEY")
    # SMTP server settings
    # smtp_host: str = Field(default=None, validation_alias="SMTP_HOST")
    # smtp_port: str = Field(default=None, validation_alias="SMTP_PORT")
    # smtp_user: str = Field(default=None, validation_alias="SMTP_USER")
    # smtp_password: str = Field(default=None, validation_alias="SMTP_PASSWORD")
    # smtp_from: str = Field(default=None, validation_alias="SMTP_FROM")
    # smtp_sender_name: str = Field(default=None, validation_alias="SMTP_SENDER_NAME")
    # # crontab
    # crontab_pattern: str = Field(default="0 18 * * *", validation_alias="CRONTAB_PATTERN")
    # temp_location: str = Field(default=None, validation_alias="TEMP_LOCATION")

    model_config = SettingsConfigDict(
        env_file=".env.block",
        extra="ignore",
        env_file_encoding="utf-8",
    )


# Instantiate the settings
app_settings = Settings()

