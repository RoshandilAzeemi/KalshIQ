/** Shared TypeScript types for KalshIQ frontend. */

export type EdgeSignal = "BUY" | "SELL" | "HOLD";

export interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string | null;
  yes_price: number;
  no_price: number;
  yes_bid: number;
  yes_ask: number;
  volume: number;
  open_interest: number;
  status: string;
  category: string | null;
  close_time: string | null;
  fair_price: number | null;
  edge_pct: number | null;
  signal: EdgeSignal | null;
  last_synced_at: string | null;
}

export interface Trade {
  trade_id: string;
  ticker: string;
  price: number;
  count: number;
  side: string;
  taker_side: string | null;
  traded_at: string;
}

export interface Recommendation {
  ticker: string;
  market_price: number;
  fair_price: number;
  edge_pct: number;
  signal: EdgeSignal;
  confidence: number;
  reasoning: string | null;
  is_active: boolean;
  updated_at: string | null;
}

export interface MarketsListResponse {
  markets: Market[];
  total: number;
}

export interface TradesListResponse {
  trades: Trade[];
  total: number;
}

export interface RecommendationsListResponse {
  recommendations: Recommendation[];
  total: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}
