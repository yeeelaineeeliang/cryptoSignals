// Coinbase Exchange public API response shapes we rely on.
// Docs: https://docs.cdp.coinbase.com/exchange/reference/

export interface CoinbaseTicker {
  ask: string;
  bid: string;
  volume: string;       // 24h base volume
  trade_id: number;
  price: string;
  size: string;
  time: string;
  rfq_volume?: string;
}

// /products/{pair}/candles returns an array of tuples:
// [ time, low, high, open, close, volume ]  -- time is unix seconds
export type CoinbaseCandleTuple = [number, number, number, number, number, number];

export interface CoinbaseTrade {
  time: string;
  trade_id: number;
  price: string;
  size: string;
  side: "buy" | "sell";
}
