# Crypto Signals Worker

Python 3.12 long-running process deployed on Railway. Polls Coinbase, upserts into Supabase, runs OLS inference, simulates per-user paper trades.

## Local development

```bash
# install (uv is fastest; pip also works)
uv sync                   # or: pip install -e .

# env
cp .env.example .env
# fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the Supabase dashboard

# one-time bootstrap: backfill 30 days of candles, train v1 model
python -m worker.ml.bootstrap_train

# live loop
python -m worker.main
```

## What the scheduler does

| Job | Interval | Action |
|---|---|---|
| `poll_prices` | 5s | Coinbase ticker → `prices` UPSERT + heartbeat |
| `ingest_candles` | 60s | Coinbase candles + trades → `candles` UPSERT |
| `compute_features` | 60s | Build feature vector from last 100 candles → `features` |
| `infer_and_trade` | 30s | OLS inference → `predictions` + per-user paper trades |
| `evaluate_models` | 60m | Backfill realized returns + hit rate → `model_performance` |
| `refit_models` | 6h | OLS + VIF prune on rolling 30-day window → new `model_versions` |

## Deployment (Railway)

1. Push repo to GitHub.
2. railway.app → New Project → Deploy from GitHub.
3. Root directory: `apps/worker`.
4. Variables tab → paste every key from `.env.example`.
5. Deploy. Watch logs for the first heartbeat.

## Files

```
worker/
├── main.py              entrypoint
├── config.py            env → typed Settings
├── logging_setup.py     structured JSON logs
├── supabase_client.py   service-role client factory
├── http_client.py       httpx + tenacity retry
├── coinbase.py          ticker / candles / trades wrappers
├── scheduler.py         APScheduler job registration
├── heartbeat.py         worker_heartbeats writer
├── ingest.py            poll_prices, ingest_candles, compute_features jobs
├── features.py          feature engineering (canonical pipeline)
├── inference.py         load active model, predict, write predictions
├── trading.py           paper-trade engine
└── ml/
    ├── train.py         OLS + VIF elimination (shared by bootstrap + refit)
    ├── refit.py         refit_models job
    ├── evaluate.py      evaluate_models job
    ├── persistence.py   model_versions read/write
    ├── metrics.py       hit_rate, confusion, Sharpe, max_dd
    └── bootstrap_train.py   one-time cold-start training script
```
