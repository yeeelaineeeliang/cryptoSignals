// Domain types shared between the Next.js web app and anything else that speaks
// TypeScript (the Python worker writes JSON shapes that match these).

export interface Pair {
  symbol: string;              // 'BTC-USD'
  base: string;                // 'BTC'
  quote: string;               // 'USD'
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Price {
  symbol: string;
  price: number;
  bid: number | null;
  ask: number | null;
  volume_24h: number | null;
  fetched_at: string;
  updated_at: string;
}

export interface Candle {
  symbol: string;
  bucket_start: string;
  granularity: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade_count: number | null;
  ingested_at: string;
}

export interface FeatureRow {
  symbol: string;
  bucket_start: string;
  granularity: number;
  feature_set: string;
  payload: Record<string, number>;
  target_logret: number | null;
  created_at: string;
}

export type Signal = "LONG" | "SHORT" | "HOLD";

export interface Prediction {
  id: number;
  symbol: string;
  model_version_id: number;
  current_price: number;
  predicted_logret: number;
  signal: Signal;
  realized_logret: number | null;
  hit: boolean | null;
  created_at: string;
}

export interface VifTraceEntry {
  iter: number;
  dropped: string | null;
  vif_max: number;
  r2: number;
  osr2: number;
  hit_rate: number;
  remaining_features: string[];
}

export interface ModelVersion {
  id: number;
  symbol: string;
  granularity: number;
  feature_set: string;
  selected_features: string[];
  coefficients: Record<string, number>;
  scaler_means: Record<string, number>;
  scaler_stds: Record<string, number>;
  vif_trace: VifTraceEntry[] | null;
  r_squared: number | null;
  osr2: number | null;
  hit_rate: number | null;
  rmse: number | null;
  train_window_start: string | null;
  train_window_end: string | null;
  trained_at: string;
  is_active: boolean;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface ModelPerformance {
  id: number;
  model_version_id: number;
  window_hours: number;
  hit_rate: number | null;
  confusion: ConfusionMatrix;
  avg_predicted: number | null;
  avg_realized: number | null;
  sharpe_live: number | null;
  sharpe_backtest: number | null;
  evaluated_at: string;
}

export interface WorkerHeartbeat {
  id: number;
  last_poll_at: string;
  last_error: string | null;
  error_count: number;
  build_sha: string | null;
}

export interface UserPrefs {
  user_id: string;
  watched_pairs: string[];
  signal_threshold: number;
  position_size_pct: number;
  short_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioPosition {
  qty: number;
  avg_cost: number;
}

export interface Portfolio {
  user_id: string;
  starting_capital: number;
  cash_usd: number;
  positions: Record<string, PortfolioPosition>;
  equity_usd: number;
  created_at: string;
  updated_at: string;
}

export type TradeSide = "BUY" | "SELL";

export interface PaperTrade {
  id: number;
  user_id: string;
  symbol: string;
  side: TradeSide;
  qty: number;
  price: number;
  notional_usd: number;
  fee_usd: number;
  prediction_id: number | null;
  reason: string | null;
  created_at: string;
}
