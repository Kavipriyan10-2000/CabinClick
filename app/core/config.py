import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "Cabin Crew Dispatch API")
        self.app_version = os.getenv("APP_VERSION", "0.1.0")
        self.api_v1_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
        self.cors_origins = self._parse_csv_env("CORS_ORIGINS")

    @staticmethod
    def _parse_csv_env(name: str) -> list[str]:
        raw_value = os.getenv(name, "")
        return [item.strip() for item in raw_value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
