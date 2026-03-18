"use client";
import { useState, useEffect } from "react";

/**
 * Simulates an async data-fetch with a configurable delay.
 * Useful for demo pages that load JSON fixtures.
 *
 * Usage:
 *   const { data, loading } = useMockData(() => import("@/lib/mock/clause-deltas.json"), 600);
 */
export function useMockData<T>(
  loader: () => Promise<{ default: T }> | T,
  delayMs = 500
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Artificial delay to simulate network latency
        await new Promise((r) => setTimeout(r, delayMs));

        const result = loader();
        if (result instanceof Promise) {
          const mod = await result;
          if (!cancelled) {
            // Handle both ES module default exports and plain values
            setData("default" in mod ? mod.default : (mod as T));
          }
        } else {
          if (!cancelled) setData(result as T);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [loader, delayMs]);

  return { data, loading, error };
}
