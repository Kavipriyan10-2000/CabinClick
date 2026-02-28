from functools import lru_cache
from typing import Any

from app.core.config import get_settings


def _get_supabase_key() -> str:
    settings = get_settings()
    return settings.supabase_service_role_key or settings.supabase_anon_key


@lru_cache
def get_supabase_client() -> Any:
    settings = get_settings()

    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured.")

    supabase_key = _get_supabase_key()
    if not supabase_key:
        raise RuntimeError(
            "No Supabase API key is configured. Set SUPABASE_SERVICE_ROLE_KEY "
            "or SUPABASE_ANON_KEY in .env.local."
        )

    try:
        from supabase import create_client
    except ImportError as exc:
        raise RuntimeError(
            "Supabase client is not installed or is incompatible with this environment."
        ) from exc

    return create_client(settings.supabase_url, supabase_key)
