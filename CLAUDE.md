# Crypto Signals — Architecture

Live crypto trading signal dashboard. Productionizes a 2024 OLS research model by putting it on rails: Python worker polls Coinbase, OLS inference every 30s, paper-trading simulator per user, Supabase Realtime pushes updates to a Next.js frontend without refresh.

## Data flow

```
Coinbase Exchange (public REST, no auth)
    │  /products/{pair}/ticker   → 5-second price polls
    │  /products/{pair}/candles  → 60-second OHLCV ingest
    │  /products/{pair}/trades   → trade count per bar (reconstructs the old
    │                              project's `count` feature)
    ▼
Python Worker (apps/worker/, Railway)
    - APScheduler AsyncIOScheduler runs six jobs:
        poll_prices (5s), ingest_candles (60s), compute_features (60s),
        infer_and_trade (30s), evaluate_models (1h), refit_models (6h)
    - Idempotent upserts; httpx + tenacity backoff; structlog JSON logs
    ▼
Supabase (Postgres + Realtime + RLS)
    Market data (public read):
        pairs, prices, candles, features, predictions, model_versions,
        model_performance, worker_heartbeats
    User-scoped (RLS on auth.jwt()->>'sub' = user_id):
        user_prefs, portfolios, paper_trades
    Realtime publication (supabase_realtime):
        prices, predictions, paper_trades, portfolios, worker_heartbeats
    ▼
Next.js 16 Frontend (apps/web/, Vercel)
    - Clerk for auth; JWT template `supabase` signs with Supabase's JWT secret
    - useSupabaseClient injects Clerk token as Bearer on every fetch
    - Realtime hooks: use-realtime-prices, -predictions, -trades
    - Pages: / (landing), /dashboard, /portfolio, /model, /settings,
             /sign-in, /sign-up
```

## Why Python (not an Edge Function or Node worker)

The HW4 spec requires "background worker deployed on Railway". The NBA scoreboard reference uses a Supabase Edge Function — elegant but does NOT satisfy this requirement. We run Python on Railway because:

1. `statsmodels.OLS` + `variance_inflation_factor` are native; the bootstrap training script is the pedagogical artifact for this project.
2. `supabase-py` is mature.
3. Railway nixpacks detects `pyproject.toml` automatically.
4. Inference is a dot product anyway — no runtime advantage to TypeScript.

## ML pipeline

Feature engineering happens at two places, intentionally using the same `build_features` function:

1. **One-time bootstrap** (`apps/worker/worker/ml/bootstrap_train.py`): backfills 30 days of candles via Coinbase, computes features, runs OLS + iterative VIF elimination (drop max-VIF feature when VIF > 10; drop when 5 < VIF ≤ 10 only if OSR² doesn't degrade), writes a `model_versions` row with `is_active = TRUE`, emits training artifacts (`artifacts/vif_trace.csv`, coefficient plot, summary report).

2. **Live inference** (`worker/inference.py`): reads latest features row, standardizes with scaler_means/stds from the active model, dot-products coefficients, writes to `predictions`.

3. **Periodic refit** (`worker/ml/refit.py`, every 6h): same code path as bootstrap, but on a rolling 30-day window. Writes a new `model_versions` row; promotes to active only if R² > 0.

The `vif_trace` JSONB column carries the full iteration history — this is what the `/model` page visualizes so the pedagogy is front-facing, not hidden infra.

## Auth model

- Web browser → Clerk session → `getToken({ template: "supabase" })` → HS256 JWT
- JWT signed with the Supabase project's JWT secret → Supabase auto-verifies
- RLS policies use `auth.jwt() ->> 'sub'` (Clerk user ID) for user_prefs, portfolios, paper_trades
- The Python worker uses `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS — it is the trusted system actor that writes on behalf of users

## Deployment

- **Supabase**: project created; apply migrations 001–005 via Supabase MCP; verify Realtime publication; run `get_advisors(type='security')`.
- **Clerk**: create app; add JWT Template `supabase` (HS256) signed with Supabase JWT secret.
- **Railway** (worker): root directory `apps/worker`, nixpacks builds Python 3.12, start command `python -m worker.main`. Paste env vars from `.env.example`.
- **Vercel** (web): root directory `apps/web`, Next.js preset, paste `NEXT_PUBLIC_*` + `CLERK_SECRET_KEY` env vars.

## LLM policy

Zero LLM calls in any hot path. Inference is a dot product. `ENABLE_LLM_FEATURES=false` gates any future CareerOS bridge (user-triggered "explain this prediction" with per-user quotas + caching). Cost discipline is architectural, not aspirational — the lesson from the prior CareerOS project was that agent loops running on a cron bankrupt you.

## Disclaimer

Paper-trading simulator. Educational use only. Not investment advice. Footer renders on every page.
