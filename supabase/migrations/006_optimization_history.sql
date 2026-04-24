-- ============================================
-- Crypto Signals: optimization audit trail + richer performance metrics
-- ============================================

-- Extend model_performance with trading-quality metrics and diagnosis
ALTER TABLE public.model_performance
  ADD COLUMN IF NOT EXISTS win_rate          NUMERIC(6, 4),       -- fraction of LONG/SHORT signals that were profitable
  ADD COLUMN IF NOT EXISTS max_drawdown      NUMERIC(10, 6),      -- peak-to-trough in cumulative PnL (negative number)
  ADD COLUMN IF NOT EXISTS avg_pnl_per_trade NUMERIC(12, 8),      -- mean direction-adjusted log-return per trade
  ADD COLUMN IF NOT EXISTS feature_drift_pct NUMERIC(6, 4),       -- max |coef_delta| / |coef_prior| across surviving features
  ADD COLUMN IF NOT EXISTS diagnosis         TEXT;                 -- one-line structured summary for the optimizer

-- Annotate model_versions with the hypothesis that triggered its training
ALTER TABLE public.model_versions
  ADD COLUMN IF NOT EXISTS hypothesis TEXT;

-- Append-only audit trail for every optimization action
CREATE TABLE IF NOT EXISTS public.optimization_history (
  run_id           BIGSERIAL PRIMARY KEY,
  timestamp        TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  symbol           TEXT                 NOT NULL REFERENCES public.pairs(symbol),
  model_version_id BIGINT               REFERENCES public.model_versions(id),  -- old model at time of run
  plan             JSONB                NOT NULL,  -- full OptimizationPlan dict + new_model_version_id after refit
  hypothesis       TEXT                 NOT NULL,
  confirmed        BOOLEAN,                        -- NULL = pending, TRUE = hypothesis confirmed, FALSE = rejected
  metric_before    JSONB                NOT NULL,  -- model_performance snapshot before applying plan
  metric_after     JSONB                           -- model_performance snapshot after next evaluate cycle
);

CREATE INDEX IF NOT EXISTS opt_history_symbol_ts
  ON public.optimization_history (symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS opt_history_pending
  ON public.optimization_history (run_id)
  WHERE confirmed IS NULL;

-- RLS + grants (same pattern as rest of market-data tables)
ALTER TABLE public.optimization_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.optimization_history TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.optimization_history_run_id_seq TO anon, authenticated;

CREATE POLICY "Public read optimization_history"
  ON public.optimization_history FOR SELECT TO anon, authenticated USING (true);
