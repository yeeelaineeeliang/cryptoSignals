"""Data ingestion jobs.

Phase 1: poll_prices only.
Phase 2 will add ingest_candles and compute_features.
"""
from __future__ import annotations

from supabase import Client

from .coinbase import CoinbaseClient
from .config import Settings
from .heartbeat import beat, record_error
from .logging_setup import get_logger

log = get_logger(__name__)


async def poll_prices(cb: CoinbaseClient, sb: Client, settings: Settings) -> None:
    """Poll ticker for each watched pair; UPSERT into `prices`.

    Idempotent: primary key is `symbol`, so a crash-restart just overwrites
    with the fresh tick next time.
    """
    try:
        for symbol in settings.pairs:
            tick = await cb.ticker(symbol)
            sb.table("prices").upsert(
                {
                    "symbol": symbol,
                    "price": tick.price,
                    "bid": tick.bid,
                    "ask": tick.ask,
                    "volume_24h": tick.volume_24h,
                    "fetched_at": tick.fetched_at.isoformat(),
                },
                on_conflict="symbol",
            ).execute()
        beat(sb, build_sha=settings.build_sha)
    except Exception as e:  # noqa: BLE001 -- top-level resilience on purpose
        log.exception("poll_prices_failed", error=str(e))
        try:
            record_error(sb, str(e))
        except Exception:
            log.exception("heartbeat_write_failed")
