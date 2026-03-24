/** Custom hook for low-latency polling with configurable interval. */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePollingOptions<T> {
  /** Async function to fetch data. */
  fetcher: () => Promise<T>;
  /** Polling interval in milliseconds (default: 5000). */
  interval?: number;
  /** Whether polling is enabled (default: true). */
  enabled?: boolean;
}

interface UsePollingResult<T> {
  /** Latest fetched data. */
  data: T | null;
  /** Whether the initial load is in progress. */
  isLoading: boolean;
  /** Error from the last fetch attempt. */
  error: Error | null;
  /** Timestamp of the last successful fetch. */
  lastUpdated: Date | null;
  /** Manually trigger a refetch. */
  refetch: () => void;
}

export function usePolling<T>({
  fetcher,
  interval = 5000,
  enabled = true,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);

  // Keep fetcher ref current
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    void fetchData();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      void fetchData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);

  return { data, isLoading, error, lastUpdated, refetch };
}
