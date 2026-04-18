-- ============================================
-- Crypto Signals: model registry, predictions, performance, heartbeat
-- ============================================

-- Trained model registry (one row per training/refit)
CREATE TABLE public.model_versions (
  id                 BIGSERIAL PRIMARY KEY,
  symbol             TEXT NOT NULL REFERENCES public.pairs(symbol),
  granularity        INTEGER NOT NULL,
  feature_set        TEXT NOT NULL,
  selected_features  TEXT[] NOT NULL,       -- post-VIF features, in the order the coefficient vector expects
  coefficients       JSONB NOT NULL,        -- { feature_name: coef, const: intercept }
  scaler_means       JSONB NOT NULL,        -- z-score stats from train fold
  scaler_stds        JSONB NOT NULL,
  vif_trace          JSONB,                 -- [{ iter, dropped, vif_max, r2, osr2, hit_rate }, ...]
  r_squared          NUMERIC(6, 4),
  osr2               NUMERIC(6, 4),
  hit_rate           NUMERIC(6, 4),
  rmse               NUMERIC(20, 8),
  train_window_start TIMESTAMPTZ,
  train_window_end   TIMESTAMPTZ,
  trained_at         TIMESTAMPTZ DEFAULT NOW(),
  is_active          BOOLEAN NOT NULL DEFAULT FALSE
);

-- Only one active model per (symbol, granularity, feature_set)
CREATE UNIQUE INDEX one_active_model
  ON public.model_versions (symbol, granularity, feature_set)
  WHERE is_active = TRUE;

-- Append-only predictions feed
CREATE TABLE public.predictions (
  id               BIGSERIAL PRIMARY KEY,
  symbol           TEXT NOT NULL REFERENCES public.pairs(symbol),
  model_version_id BIGINT NOT NULL REFERENCES public.model_versions(id),
  current_price    NUMERIC(20, 8) NOT NULL,
  predicted_logret NUMERIC(10, 6) NOT NULL,
  signal           TEXT NOT NULL,          -- 'LONG' | 'SHORT' | 'HOLD'
  realized_logret  NUMERIC(10, 6),         -- backfilled once the next bar closes
  hit              BOOLEAN,                 -- backfilled; sign(predicted) == sign(realized)
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX predictions_symbol_recent
  ON public.predictions (symbol, created_at DESC);
CREATE INDEX predictions_unrealized
  ON public.predictions (created_at)
  WHERE realized_logret IS NULL;

-- Rolling model performance snapshots
CREATE TABLE public.model_performance (
  id               BIGSERIAL PRIMARY KEY,
  model_version_id BIGINT NOT NULL REFERENCES public.model_versions(id),
  window_hours     INTEGER NOT NULL,
  hit_rate         NUMERIC(6, 4),
  confusion        JSONB NOT NULL,         -- { tp, fp, tn, fn }
  avg_predicted    NUMERIC(10, 6),
  avg_realized     NUMERIC(10, 6),
  sharpe_live      NUMERIC(10, 4),
  sharpe_backtest  NUMERIC(10, 4),
  evaluated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Worker liveness (single row)
CREATE TABLE public.worker_heartbeats (
  id           INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_poll_at TIMESTAMPTZ NOT NULL,
  last_error   TEXT,
  error_count  INTEGER NOT NULL DEFAULT 0,
  build_sha    TEXT
);
