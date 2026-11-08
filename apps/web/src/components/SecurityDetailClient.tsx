"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopNav } from "@/components/SiteNav";
import { LiveHoldingDetailView } from "@/components/LiveHoldingDetailView";
import { fetchHoldingDetail, HoldingNotFoundError, type LiveHoldingDetail } from "@/lib/live-finance";

// Fetches client-side, in the browser — same pattern as the home page
// (app/page.tsx). Server-side fetch (inside the container, at request
// time) broke in production: the finance backend was only reachable
// via a hostname that resolved from the browser's network but not
// from inside the container.
//
// Uses the useParams() hook, NOT a `params` prop. An earlier version
// of this file took `params` as a plain prop assuming Next passes
// route params synchronously to a Client Component page — that
// assumption was WRONG for this Next version: params arrives as
// something that doesn't destructure synchronously, so `ticker` came
// through as an empty string and fetchHoldingDetail was silently
// never called at all (confirmed live against corp-finance.colbyh.dev/
// securities/BND: zero requests to the detail endpoint, stuck on
// "Loading …" forever). useParams() is the correct hook for reading
// route params in a Client Component. It DOES block static
// prerendering under this repo's cacheComponents config if used
// directly in a page — that's why this logic lives in a separate
// client component wrapped in <Suspense> by page.tsx, per Next's own
// suggested fix ("[stream] Wrap the component in <Suspense>").
export function SecurityDetailClient() {
  const params = useParams<{ ticker: string }>();
  const ticker = (params.ticker ?? "").toUpperCase();

  const [detail, setDetail] = useState<LiveHoldingDetail | null>(null);
  const [notFoundTicker, setNotFoundTicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFoundTicker(false);
    fetchHoldingDetail(ticker)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof HoldingNotFoundError) {
          setNotFoundTicker(true);
        } else {
          setError(
            "Couldn't reach the finance backend. Check that homelab-hub/services/conduit is running and NEXT_PUBLIC_FINANCE_API_BASE is correct.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (!loading && detail) {
    return (
      <div className="min-h-screen">
        <TopNav current="/securities" />
        <LiveHoldingDetailView detail={detail} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav current="/securities" />
      <div className="mx-auto max-w-[980px] px-6 pb-[60px]">
        {loading && (
          <p className="mt-8 text-[11.5px] text-[var(--ink-faint)]">Loading {ticker}…</p>
        )}
        {!loading && notFoundTicker && (
          <div className="mt-8 rounded-[20px] bg-[var(--surface)] px-6 py-8 text-center">
            <p className="m-0 mb-1 text-sm font-bold">Not tracked</p>
            <p className="m-0 text-xs text-[var(--ink-dim)]">
              {ticker} isn&apos;t in your holdings. Add it from the home page to start tracking it.
            </p>
          </div>
        )}
        {!loading && error && (
          <div className="mt-8 rounded-[10px] bg-[var(--amber-dim)] px-3.5 py-2.5 text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
