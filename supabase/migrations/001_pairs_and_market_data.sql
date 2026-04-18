-- ============================================
-- Crypto Signals: market data tables
-- ============================================
-- Trading pairs (seeded) + latest price per pair + append-only OHLCV candles
-- + engineered features (inputs to the model).

-- Trading pairs
CREATE TABLE public.pairs (
  symbol       TEXT PRIMARY KEY,          -- 'BTC-USD'
  base         TEXT NOT NULL,
  quote        TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Latest tick per pair (worker UPSERTs on symbol; frontend realtime-subscribes)
CREATE TABLE public.prices (
  symbol     TEXT PRIMARY KEY REFERENCES public.pairs(symbol),
  price      NUMERIC(20, 8) NOT NULL,
  bid        NUMERIC(20, 8),
  ask        NUMERIC(20, 8),
  volume_24h NUMERIC(28, 8),
  fetched_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Append-only OHLCV bars
CREATE TABLE public.candles (
  symbol       TEXT NOT NULL REFERENCES public.pairs(symbol),
  bucket_start TIMESTAMPTZ NOT NULL,
  granularity  INTEGER NOT NULL,          -- seconds: 300, 3600, etc.
  open         NUMERIC(20, 8) NOT NULL,
  high         NUMERIC(20, 8) NOT NULL,
  low          NUMERIC(20, 8) NOT NULL,
  close        NUMERIC(20, 8) NOT NULL,
  volume       NUMERIC(28, 8) NOT NULL,
  trade_count  INTEGER,
  ingested_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (symbol, granularity, bucket_start)
);
CREATE INDEX candles_recent ON public.candles (symbol, granularity, bucket_start DESC);

-- Engineered features (rows correspond to candle buckets after feature window warmup)
CREATE TABLE public.features (
  symbol        TEXT NOT NULL REFERENCES public.pairs(symbol),
  bucket_start  TIMESTAMPTZ NOT NULL,
  granularity   INTEGER NOT NULL,
  feature_set   TEXT NOT NULL DEFAULT 'v1',
  payload       JSONB NOT NULL,            -- { logret, vol_20, rsi_14, ... }
  target_logret NUMERIC(20, 8),            -- log(close_{t+1} / close_t); NULL for latest bar
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (symbol, granularity, feature_set, bucket_start)
);
CREATE INDEX features_recent ON public.features (symbol, granularity, feature_set, bucket_start DESC);
