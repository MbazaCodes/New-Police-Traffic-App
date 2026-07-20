"use client";

import { useState, useEffect, useCallback } from "react";

interface FetchState<T> {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Universal hook to fetch from any /api/* endpoint.
 * Returns data[], loading, error, and a refetch function.
 *
 * Handles HTTP status codes properly:
 * - 401: Session expired → redirects to login
 * - 403: Forbidden → Swahili error message
 * - Other errors: Swahili error messages
 */
export function useApiData<T = Record<string, unknown>>(
  endpoint: string,
  params?: Record<string, string>,
  deps: unknown[] = []
): FetchState<T> {
  const [data, setData]       = useState<T[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = new URL(endpoint, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== "all") url.searchParams.set(k, v);
      });
    }

    fetch(url.toString())
      .then((r) => {
        // ── 401: session expired → redirect to login ──
        if (r.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = "/?reason=session_expired";
          }
          throw new Error("Kikao chako kimekwisha. Tafadhali ingia tena.");
        }

        // ── 403: forbidden ──
        if (r.status === 403) {
          throw new Error("Huna ruhusa ya kutazama rasilimali hii.");
        }

        // ── 429: rate limited ──
        if (r.status === 429) {
          throw new Error("Ombi lako limekataliwa. Tafadhali subiri kidogo kisha jaribu tena.");
        }

        // ── 5xx: server error ──
        if (r.status >= 500) {
          throw new Error("Hitilafu ya seva. Tafadhali jaribu tena baadaye.");
        }

        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json.ok === false || json.error) {
          setError(json.error ?? "Hitilafu ya seva");
          setData([]);
        } else {
          setData(json.data ?? []);
          setTotal(json.total ?? (json.data?.length ?? 0));
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setData([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params), tick, ...deps]);

  return { data, total, loading, error, refetch };
}