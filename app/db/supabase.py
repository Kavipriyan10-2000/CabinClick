from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


def _get_supabase_key() -> str:
    settings = get_settings()
    return settings.supabase_service_role_key or settings.supabase_anon_key


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()

    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured.")

    supabase_key = _get_supabase_key()
    if not supabase_key:
        raise RuntimeError(
            "No Supabase API key is configured. Set SUPABASE_SERVICE_ROLE_KEY "
            "or SUPABASE_ANON_KEY in .env.local."
        )

    return create_client(settings.supabase_url, supabase_key)
