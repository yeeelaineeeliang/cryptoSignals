"""Worker liveness signal.

Single row at id=1; frontend reads this to render Live / Stale / Down status.
"""
from __future__ import annotations

from datetime import datetime, timezone

from supabase import Client

from .logging_setup import get_logger

log = get_logger(__name__)


def beat(sb: Client, build_sha: str = "") -> None:
    """Record a successful poll. Cheap — one UPSERT."""
    sb.table("worker_heartbeats").upsert(
        {
            "id": 1,
            "last_poll_at": datetime.now(tz=timezone.utc).isoformat(),
            "last_error": None,
            "error_count": 0,
            "build_sha": build_sha or None,
        },
        on_conflict="id",
    ).execute()


def record_error(sb: Client, err: str) -> None:
    """Record a poll failure. Increments error_count via a read-modify-write;
    the free-tier throughput makes a SQL-side increment unnecessary here.
    """
    row = (
        sb.table("worker_heartbeats")
        .select("error_count")
        .eq("id", 1)
        .single()
        .execute()
    )
    current = int(row.data.get("error_count", 0) if row.data else 0)
    sb.table("worker_heartbeats").upsert(
        {
            "id": 1,
            "last_poll_at": datetime.now(tz=timezone.utc).isoformat(),
            "last_error": err[:500],
            "error_count": current + 1,
        },
        on_conflict="id",
    ).execute()
    log.warning("heartbeat_error", error=err[:200], count=current + 1)
