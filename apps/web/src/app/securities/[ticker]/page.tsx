"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/SiteNav";
import { LiveHoldingDetailView } from "@/components/LiveHoldingDetailView";
import { fetchHoldingDetail, HoldingNotFoundError, type LiveHoldingDetail } from "@/lib/live-finance";

// Fetches client-side, in the browser — same pattern as the home page
// (app/page.tsx). This route used to fetch server-side (inside the
// container, at request time), which broke in production: the finance
// backend is only reachable via a Tailscale MagicDNS hostname that
// resolves from the browser's network but NOT from inside this
// container (no Tailscale client here). Client-side fetch sidesteps
// that entirely — the browser already proved it can reach the backend
// (the home page works), so the detail page now does the same thing.
//
// Takes `params` as a plain prop (not the useParams() hook) — Next
// still passes route params as a prop to a Client Component page
// synchronously, which avoids the "runtime-only value blocks
// prerendering" restriction useParams() hits under this repo's
// cacheComponents config (next.config.ts), with no need for a
// Suspense boundary or a server/client split.
export default function SecurityDetailPage({ params }: { params: { ticker: string } }) {
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
