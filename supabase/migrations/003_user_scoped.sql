-- ============================================
-- Crypto Signals: user-scoped tables (RLS-protected)
-- ============================================
-- user_id is the Clerk JWT `sub` claim (TEXT).

CREATE TABLE public.user_prefs (
  user_id           TEXT PRIMARY KEY,
  watched_pairs     TEXT[] NOT NULL DEFAULT ARRAY['BTC-USD', 'ETH-USD'],
  signal_threshold  NUMERIC(10, 6) NOT NULL DEFAULT 0.002,   -- 0.2% log-return
  position_size_pct NUMERIC(6, 4)  NOT NULL DEFAULT 0.10,    -- 10% of cash per trade
  short_enabled     BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.portfolios (
  user_id          TEXT PRIMARY KEY,
  starting_capital NUMERIC(20, 2) NOT NULL DEFAULT 10000.00,
  cash_usd         NUMERIC(20, 8) NOT NULL DEFAULT 10000.00,
  positions        JSONB          NOT NULL DEFAULT '{}'::jsonb,
  equity_usd       NUMERIC(20, 8) NOT NULL DEFAULT 10000.00,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.paper_trades (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  symbol        TEXT NOT NULL REFERENCES public.pairs(symbol),
  side          TEXT NOT NULL,                              -- 'BUY' | 'SELL'
  qty           NUMERIC(28, 8) NOT NULL,
  price         NUMERIC(20, 8) NOT NULL,
  notional_usd  NUMERIC(20, 8) NOT NULL,
  fee_usd       NUMERIC(20, 8) NOT NULL DEFAULT 0,
  prediction_id BIGINT REFERENCES public.predictions(id) ON DELETE SET NULL,
  reason        TEXT,                                       -- 'signal' | 'manual' | 'reset'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX paper_trades_user_recent
  ON public.paper_trades (user_id, created_at DESC);
