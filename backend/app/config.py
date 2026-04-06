from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=["../.env", ".env"], env_file_encoding="utf-8", case_sensitive=False, extra="ignore")
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_BUCKET: str = "memoryos-files"
    REDIS_URL: str = "redis://localhost:6379"
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"
    TAVILY_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://127.0.0.1:8000"
    ENV: str = "development"
    USE_CELERY: bool = True

@lru_cache
def get_settings(): return Settings()
settings = get_settings()
