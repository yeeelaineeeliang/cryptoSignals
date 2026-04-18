-- ============================================
-- Crypto Signals: seed data
-- ============================================

INSERT INTO public.pairs (symbol, base, quote, display_name) VALUES
  ('BTC-USD', 'BTC', 'USD', 'Bitcoin'),
  ('ETH-USD', 'ETH', 'USD', 'Ethereum')
ON CONFLICT (symbol) DO NOTHING;

-- Single heartbeat row. Worker updates last_poll_at on every successful poll.
INSERT INTO public.worker_heartbeats (id, last_poll_at, error_count)
VALUES (1, NOW(), 0)
ON CONFLICT (id) DO NOTHING;
