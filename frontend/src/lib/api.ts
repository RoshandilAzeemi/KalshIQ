/** API client for KalshIQ backend. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getMarkets(params?: {
  status?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  const path = `/api/markets${query ? `?${query}` : ""}`;

  return fetchApi<import("@/types").MarketsListResponse>(path);
}

export async function getMarket(ticker: string) {
  return fetchApi<import("@/types").Market>(`/api/markets/${ticker}`);
}

export async function getTrades(params?: {
  ticker?: string;
  side?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.ticker) searchParams.set("ticker", params.ticker);
  if (params?.side) searchParams.set("side", params.side);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  const path = `/api/trades${query ? `?${query}` : ""}`;

  return fetchApi<import("@/types").TradesListResponse>(path);
}

export async function getRecommendations(params?: {
  signal?: string;
  min_edge?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.signal) searchParams.set("signal", params.signal);
  if (params?.min_edge) searchParams.set("min_edge", String(params.min_edge));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const path = `/api/recommendations${query ? `?${query}` : ""}`;

  return fetchApi<import("@/types").RecommendationsListResponse>(path);
}

export async function getHealth() {
  return fetchApi<import("@/types").HealthResponse>("/api/health");
}
