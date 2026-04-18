"""Thin wrappers over Coinbase Exchange public endpoints.

Docs: https://docs.cdp.coinbase.com/exchange/reference/
No auth required for these endpoints. Rate limit: 10 req/s for public.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

from .http_client import retry_http


@dataclass(slots=True)
class TickerSnapshot:
    symbol: str
    price: float
    bid: float | None
    ask: float | None
    volume_24h: float | None
    fetched_at: datetime


@dataclass(slots=True)
class CandleBar:
    symbol: str
    bucket_start: datetime
    granularity: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class CoinbaseClient:
    """Async client for a handful of public endpoints."""

    def __init__(self, http: httpx.AsyncClient, base_url: str) -> None:
        self._http = http
        self._base = base_url.rstrip("/")

    @retry_http
    async def ticker(self, symbol: str) -> TickerSnapshot:
        url = f"{self._base}/products/{symbol}/ticker"
        resp = await self._http.get(url)
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        return TickerSnapshot(
            symbol=symbol,
            price=float(data["price"]),
            bid=float(data["bid"]) if data.get("bid") else None,
            ask=float(data["ask"]) if data.get("ask") else None,
            volume_24h=float(data["volume"]) if data.get("volume") else None,
            fetched_at=datetime.now(tz=timezone.utc),
        )

    @retry_http
    async def candles(
        self,
        symbol: str,
        granularity: int,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> list[CandleBar]:
        """Return bars newest-first. Coinbase caps each response at 300 bars."""
        url = f"{self._base}/products/{symbol}/candles"
        params: dict[str, Any] = {"granularity": granularity}
        if start is not None:
            params["start"] = start.isoformat()
        if end is not None:
            params["end"] = end.isoformat()
        resp = await self._http.get(url, params=params)
        resp.raise_for_status()
        rows: list[list[float]] = resp.json()
        out: list[CandleBar] = []
        for row in rows:
            # [ time, low, high, open, close, volume ]
            ts, low, high, open_, close, volume = row
            out.append(
                CandleBar(
                    symbol=symbol,
                    bucket_start=datetime.fromtimestamp(int(ts), tz=timezone.utc),
                    granularity=granularity,
                    open=float(open_),
                    high=float(high),
                    low=float(low),
                    close=float(close),
                    volume=float(volume),
                )
            )
        return out

    @retry_http
    async def trades(self, symbol: str, limit: int = 100) -> list[dict[str, Any]]:
        url = f"{self._base}/products/{symbol}/trades"
        resp = await self._http.get(url, params={"limit": limit})
        resp.raise_for_status()
        return resp.json()
