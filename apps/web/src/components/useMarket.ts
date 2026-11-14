"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMarket, type LiveMarket } from "@/lib/live-finance";
import { marketPollMs } from "@/lib/market";

/**
 * Polls GET /market on a clock that follows the market (ADR 0016):
 * every minute while it's open, every 5 minutes pre/after hours, every
 * 15 minutes while closed. Pauses while the tab is hidden and catches
 * up the moment it's visible again, so a laptop left open on the page
 * doesn't poll all night.
 *
 * A failed poll keeps the last good data on screen (with `error` set)
 * rather than blanking the page — prices that are a minute old are
 * still useful, and `fetchedAt` says how old they are.
 */
export function useMarket(tickers?: string[]) {
  const [data, setData] = useState<LiveMarket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = tickers?.join(",") ?? "";

  const load = useCallback(async () => {
    try {
      const m = await fetchMarket(key ? key.split(",") : undefined);
      setData(m);
      setError(null);
      setFetchedAt(new Date());
      return m;
    } catch {
      setError("Couldn't refresh market data. Showing the last prices received.");
      return null;
    }
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    let state = data?.market.state;

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      if (cancelled || document.hidden) return;
      timer.current = setTimeout(tick, marketPollMs(state));
    };
    const tick = async () => {
      const m = await load();
      if (m) state = m.market.state;
      schedule();
    };
    const onVisible = () => {
      if (!document.hidden) tick();
      else if (timer.current) clearTimeout(timer.current);
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const quote = useCallback((ticker: string) => data?.quotes.find((q) => q.ticker === ticker), [data]);
  return { data, error, fetchedAt, quote, reload: load };
}

/** Re-renders every `ms` so "updated 40s ago" style labels stay true.
 * Starts as undefined: reading the clock during render would be baked
 * into the prerendered page (and fails the build under cacheComponents),
 * so the first tick happens after mount. Callers treat undefined as
 * "now" — by then they're running in the browser. */
export function useNow(ms = 15_000): Date | undefined {
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, ms);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [ms]);
  return now;
}
