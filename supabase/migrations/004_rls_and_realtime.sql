-- ============================================
-- Crypto Signals: RLS + grants + Realtime publication
-- ============================================

-- Enable RLS on every table
ALTER TABLE public.pairs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prefs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_trades      ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.pairs, public.prices, public.candles, public.features,
                public.predictions, public.model_versions, public.model_performance,
                public.worker_heartbeats
  TO anon, authenticated;

GRANT ALL ON public.user_prefs, public.portfolios, public.paper_trades
  TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Public-read policies (market data)
CREATE POLICY "Public read pairs"             ON public.pairs             FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read prices"            ON public.prices            FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read candles"           ON public.candles           FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read features"          ON public.features          FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read predictions"       ON public.predictions       FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read model_versions"    ON public.model_versions    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read model_performance" ON public.model_performance FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read worker_heartbeats" ON public.worker_heartbeats FOR SELECT TO anon, authenticated USING (true);

-- User-scoped policies (NBA favorites pattern)
CREATE POLICY "Users read own prefs"
  ON public.user_prefs FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users insert own prefs"
  ON public.user_prefs FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users update own prefs"
  ON public.user_prefs FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users read own portfolio"
  ON public.portfolios FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users insert own portfolio"
  ON public.portfolios FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users update own portfolio"
  ON public.portfolios FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users read own trades"
  ON public.paper_trades FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users insert own trades"
  ON public.paper_trades FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);
-- Worker writes portfolios + paper_trades via SERVICE_ROLE_KEY (bypasses RLS).

-- Realtime publication (live tables only)
ALTER PUBLICATION supabase_realtime ADD TABLE public.prices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.paper_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.worker_heartbeats;
