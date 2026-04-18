"""Service-role Supabase client factory.

The worker is a trusted system actor; it bypasses RLS so it can write rows on
behalf of users (portfolios, paper_trades). Never expose SERVICE_ROLE_KEY to
the browser.
"""
from __future__ import annotations

from supabase import Client, create_client

from .config import Settings


def make_supabase(settings: Settings) -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
