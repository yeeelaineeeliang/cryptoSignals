"""APScheduler registration helpers.

Each job runs with `coalesce=True, max_instances=1` so a slow run never
overlaps itself and backlogged ticks fire once rather than N times.
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler


def add_interval(
    scheduler: AsyncIOScheduler,
    job_id: str,
    func: Callable[..., Awaitable[Any]],
    *,
    seconds: int | None = None,
    minutes: int | None = None,
    hours: int | None = None,
) -> None:
    kwargs: dict[str, Any] = {}
    if seconds is not None:
        kwargs["seconds"] = seconds
    if minutes is not None:
        kwargs["minutes"] = minutes
    if hours is not None:
        kwargs["hours"] = hours
    scheduler.add_job(
        func,
        "interval",
        id=job_id,
        coalesce=True,
        max_instances=1,
        misfire_grace_time=30,
        **kwargs,
    )
