from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    
    DATABASE_URL: str = "postgresql://postgres:postgres@127.0.0.1:5433/carbon_footprint"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "your-supabase-jwt-secret-placeholder"
    GEMINI_API_KEY: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = ""

settings = Settings()
