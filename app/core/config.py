import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path.cwd() / ".env.local")


class Settings:
    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "Cabin Crew Dispatch API")
        self.app_version = os.getenv("APP_VERSION", "0.1.0")
        self.api_v1_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
        self.cors_origins = self._parse_csv_env("CORS_ORIGINS")
        self.supabase_project_ref = os.getenv("SUPABASE_PROJECT_REF", "")
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    @staticmethod
    def _parse_csv_env(name: str) -> list[str]:
        raw_value = os.getenv(name, "")
        return [item.strip() for item in raw_value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
