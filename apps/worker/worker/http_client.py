"""Shared httpx.AsyncClient with retry/backoff.

Coinbase public endpoints don't need auth, but they do rate-limit, so we use
exponential backoff on 429/5xx. Network hiccups are expected and we don't want
one bad poll to crash the loop.
"""
from __future__ import annotations

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)


def make_http_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        timeout=httpx.Timeout(10.0),
        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        headers={"User-Agent": "crypto-signals/0.1"},
    )


retry_http = retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(min=1, max=30),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True,
)
