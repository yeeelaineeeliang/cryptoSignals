# Crypto Signals

Live crypto trading signal dashboard — productionized OLS research model with VIF feature selection, paper trading, and real-time performance tracking.

**Live URLs:**
- Web: *coming soon (Vercel)*
- Worker: *coming soon (Railway)*

## Architecture

```
Coinbase Exchange API (public, no auth)
   ↓  (poll every 5s / candles every 60s)
Python Worker on Railway (apps/worker/)
   ↓  (OLS inference every 30s, paper-trade engine per user)
Supabase (Postgres + Realtime + RLS)
   ↓  (postgres_changes subscriptions)
Next.js on Vercel (apps/web/) with Clerk auth
```

## Project layout

```
apps/
├── web/      Next.js + Tailwind + shadcn + Clerk
└── worker/   Python 3.12 + APScheduler + statsmodels
packages/
└── shared/   TypeScript types
supabase/
└── migrations/   SQL migrations (apply via Supabase MCP)
docs/
├── VIF.md        VIF / multicollinearity refresher
└── FEATURES.md   Feature glossary (auto-generated)
```

## Quickstart

### 1. Supabase

Create a project at supabase.com. Apply migrations in order via the Supabase MCP:

```
001_pairs_and_market_data.sql
002_models_and_predictions.sql
003_user_scoped.sql
004_rls_and_realtime.sql
005_seed.sql
```

### 2. Clerk

Create an app at clerk.com. In JWT Templates, create a template named `supabase` (HS256) signed with your Supabase project's JWT secret.

### 3. Worker (local)

```bash
cd apps/worker
uv sync                         # or: pip install -e .
cp .env.example .env            # fill in SUPABASE_* and SERVICE_ROLE_KEY
python -m worker.ml.bootstrap_train    # ONCE: backfill + train v1
python -m worker.main                  # start the live loop
```

### 4. Web (local)

```bash
cd apps/web
pnpm install
cp .env.example .env.local      # fill in Clerk + Supabase anon key
pnpm dev
```

## Deployment

- **Worker → Railway**: connect GitHub, root directory `apps/worker`, set env vars, start command `python -m worker.main`.
- **Web → Vercel**: connect GitHub, root directory `apps/web`, set env vars, framework preset Next.js.

## Disclaimer

Paper-trading simulator. Educational use only. Not investment advice. Not affiliated with Coinbase.
