"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/SiteNav";
import { HoldingsManager } from "@/components/HoldingsManager";
import { MarketStatus } from "@/components/MarketStatus";
import { IntradaySpark } from "@/components/PriceChart";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { useMarket } from "@/components/useMarket";
import type { TriageHolding } from "@/lib/triage";
import { fetchLiveTriage, fetchLiveHoldings, type LiveHolding, type LiveQuote } from "@/lib/live-finance";
import { changeLabel, formatPct, formatPrice, moveColor, nearestEventChip, RESEARCH_POLL_MS } from "@/lib/market";

/** Price, day change and the nearest dated event for a triage card. */
function QuoteLine({ q, label }: { q: LiveQuote | undefined; label: string }) {
  if (!q || q.error || q.price == null) return null;
  const chip = nearestEventChip(q);
  return (
    <>
      <span className="font-mono text-[12.5px] tabular-nums text-[var(--ink-dim)]">{formatPrice(q.price, q.currency)}</span>
      <span className={`font-mono text-[12px] tabular-nums ${moveColor(q.change_pct)}`} title={`Change ${label}`}>
        {formatPct(q.change_pct)}
      </span>
      {chip && (
        <span className="rounded-md border border-[var(--blue)] px-1.5 py-[1px] text-[10px] font-bold text-[var(--blue)]" data-testid="event-chip">
          {chip}
        </span>
      )}
    </>
  );
}

const GROUPS: { key: "act" | "watch"; label: string }[] = [
  { key: "act", label: "Act" },
  { key: "watch", label: "Watch" },
];

/** Lightweight placeholder matching HoldingsManager's own container
 * dimensions — shown only while holdings are in flight, not a shared
 * blocking "Loading…" message for the whole page. */
function HoldingsSkeleton() {
  return (
    <div className="mb-3 animate-pulse rounded-[20px] bg-[var(--surface)] px-5 py-[18px]">
      <div className="mb-3 h-3.5 w-40 rounded bg-[var(--surface-2)]" />
      <div className="mb-3 overflow-hidden rounded-xl bg-[var(--surface-2)]">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2.5 border-b border-[var(--border)] px-3.5 py-2.5 last:border-b-0">
            <div className="h-3 w-10 rounded bg-[var(--surface)]" />
            <div className="h-3 flex-1 rounded bg-[var(--surface)]" />
            <div className="h-5 w-16 rounded bg-[var(--surface)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lightweight placeholder matching a triage card's rough dimensions. */
function TriageSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1].map((i) => (
        <div key={i} className="mb-2.5 flex items-start gap-4 rounded-[20px] bg-[var(--surface)] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2.5 h-4 w-16 rounded bg-[var(--surface-2)]" />
            <div className="mb-[5px] h-3.5 w-3/4 rounded bg-[var(--surface-2)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--surface-2)]" />
          </div>
          <div className="h-[38px] w-20 flex-shrink-0 rounded bg-[var(--surface-2)]" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [holdings, setHoldings] = useState<TriageHolding[]>([]);
  const [liveHoldings, setLiveHoldings] = useState<LiveHolding[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [resolvedOpen, setResolvedOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [triageLoading, setTriageLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const market = useMarket();
  const label = changeLabel(market.data?.market);

  // Holdings and triage are fetched independently so each section can
  // render — and show its own skeleton — the moment ITS OWN data
  // resolves, instead of both waiting behind one shared gate.
  async function loadHoldings() {
    try {
      const rawHoldings = await fetchLiveHoldings();
      setLiveHoldings(rawHoldings);
    } catch {
      setLoadError(
        "Couldn't reach the finance backend. Check that homelab-hub/services/conduit is running and NEXT_PUBLIC_FINANCE_API_BASE is correct.",
      );
      setLiveHoldings([]);
    } finally {
      setHoldingsLoading(false);
    }
  }

  async function loadTriage() {
    try {
      const triage = await fetchLiveTriage();
      // "Mark reviewed" is client-side only for now: keep those marks
      // when a background refresh brings the list back.
      setHoldings((prev) => {
        const reviewed = new Set(prev.filter((h) => h.reviewed).map((h) => h.ticker));
        return triage.holdings.map((h) => (reviewed.has(h.ticker) ? { ...h, reviewed: true } : h));
      });
      setDisclaimer(triage.disclaimer);
    } catch {
      setLoadError(
        "Couldn't reach the finance backend. Check that homelab-hub/services/conduit is running and NEXT_PUBLIC_FINANCE_API_BASE is correct.",
      );
      setHoldings([]);
    } finally {
      setTriageLoading(false);
    }
  }

  useEffect(() => {
    loadHoldings();
    loadTriage();
    // Research runs every 30 minutes per holding on the backend; pick
    // up new reads without a reload. Skipped while the tab is hidden.
    const id = setInterval(() => {
      if (document.hidden) return;
      loadHoldings();
      loadTriage();
    }, RESEARCH_POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = holdings.filter((h) => !h.reviewed && (h.status === "act" || h.status === "watch"));
  const resolved = holdings.filter((h) => h.reviewed || h.status === "none");

  function markReviewed(ticker: string) {
    setHoldings((prev) => prev.map((h) => (h.ticker === ticker ? { ...h, reviewed: true } : h)));
  }

  return (
    <div className="min-h-screen">
      <TopNav current="/" />
      <div className="mx-auto max-w-[1020px] px-6 pb-[60px]">
        <h1 className="mt-[18px] mb-1 text-xl font-bold tracking-tight">Portfolio</h1>
        <MarketStatus
          session={market.data?.market}
          fetchedAt={market.fetchedAt}
          researchMinutes={market.data?.research_interval_minutes}
          error={market.error}
        />
        {disclaimer && (
          <div className="my-[14px] mb-[22px] rounded-[10px] bg-[var(--surface)] px-3.5 py-2.5 text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
            {disclaimer}
          </div>
        )}
        {loadError && (
          <div className="mb-[14px] rounded-[10px] bg-[var(--amber-dim)] px-3.5 py-2.5 text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
            {loadError}
          </div>
        )}

        {holdingsLoading ? (
          <HoldingsSkeleton />
        ) : (
          <HoldingsManager holdings={liveHoldings} onChanged={loadHoldings} quote={market.quote} changeLabel={label} />
        )}

        <div className="mb-3 flex items-center gap-2">
          <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
            Needs your attention
          </p>
        </div>

        {triageLoading ? (
          <TriageSkeleton />
        ) : active.length === 0 ? (
          <div className="mb-2.5 rounded-[20px] bg-[var(--surface)] px-6 py-8 text-center">
            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-dim)] text-xl text-[var(--green)]">
              ✓
            </div>
            <p className="m-0 mb-1 text-sm font-bold">All caught up</p>
            <p className="m-0 text-xs text-[var(--ink-dim)]">
              Nothing needs attention right now from the holdings currently being watched.
            </p>
          </div>
        ) : (
          GROUPS.map((g) => {
            const items = active.filter((h) => h.status === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key}>
                <div className="mt-[22px] mb-3 flex items-center gap-2 first:mt-0">
                  <span
                    className={`h-2 w-2 rounded-full ${g.key === "act" ? "bg-[var(--red)]" : "bg-[var(--amber)]"}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink-dim)]">
                    {g.label}
                  </span>
                  <span className="font-mono text-[11.5px] tabular-nums text-[var(--ink-faint)]">{items.length}</span>
                </div>
                {items.map((h) => (
                  <Link
                    key={h.ticker}
                    href={`/securities/${h.ticker}`}
                    className="group mb-2.5 flex items-start gap-4 rounded-[20px] bg-[var(--surface)] px-5 py-4 no-underline transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-[5px] flex items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-[15px] font-bold tracking-tight">{h.ticker}</span>
                          <QuoteLine q={market.quote(h.ticker)} label={label} />
                        </div>
                        <span
                          className={`rounded-lg border px-[11px] py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-on-bright)] ${
                            h.status === "act" ? "bg-[var(--red)] border-[var(--red)]" : "bg-[var(--amber)] border-[var(--amber)]"
                          }`}
                        >
                          {g.label}
                        </span>
                      </div>
                      <p className="my-[2px] mb-[5px] text-[13px] font-semibold">{h.headline}</p>
                      {h.summary && (
                        <p className="m-0 mb-2.5 text-[12.5px] leading-[1.55] text-[var(--ink-dim)]">{h.summary}</p>
                      )}
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[11px] italic text-[var(--ink-faint)]">{h.reason}</span>
                        <button
                          type="button"
                          className="relative z-[2] flex-shrink-0 rounded-lg border border-[var(--btn-border)] bg-[var(--btn-bg)] px-4 py-[7px] text-[11.5px] font-bold text-[var(--btn-text)] transition-colors hover:border-[var(--btn-hover-border)] hover:bg-[var(--btn-hover-bg)]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markReviewed(h.ticker);
                          }}
                        >
                          Mark reviewed
                        </button>
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0" title={`${h.ticker} ${label === "today" ? "today" : label}, 5-minute prices; dashed line = previous close`}>
                      <IntradaySpark points={market.quote(h.ticker)?.intraday ?? []} baseline={market.quote(h.ticker)?.previous_close ?? null} />
                    </div>
                  </Link>
                ))}
              </div>
            );
          })
        )}

        <div className="mt-6 mb-3 flex items-center gap-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 border-none bg-none p-0 text-left"
            onClick={() => setResolvedOpen((v) => !v)}
          >
            <span
              className={`text-[10px] text-[var(--ink-faint)] transition-transform ${resolvedOpen ? "rotate-90" : ""}`}
            >
              ▸
            </span>
            <span className="h-2 w-2 rounded-full bg-[var(--ink-faint)]" />
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink-dim)]">
              Reviewed / no action needed
            </span>
            <span className="font-mono text-[11.5px] tabular-nums text-[var(--ink-faint)]">{resolved.length}</span>
          </button>
        </div>
        {resolvedOpen && (
          <div className="mb-2.5 overflow-hidden rounded-2xl bg-[var(--surface)]">
            {resolved.length === 0 && (
              <p className="m-0 px-4 py-2.5 text-xs text-[var(--ink-faint)]">Nothing here yet.</p>
            )}
            {resolved.map((h) => (
              <Link
                key={h.ticker}
                href={`/securities/${h.ticker}`}
                className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 text-xs no-underline last:border-b-0 hover:bg-[var(--surface-2)]"
              >
                <span className="font-bold text-[var(--ink)]">{h.ticker}</span>
                <span className="mx-3.5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ink-dim)]">
                  {h.headline}
                </span>
                <span className={`font-mono tabular-nums ${moveColor(market.quote(h.ticker)?.change_pct)}`}>
                  {formatPct(market.quote(h.ticker)?.change_pct)}
                </span>
              </Link>
            ))}
          </div>
        )}

        <UpcomingEvents quotes={market.data?.quotes} fed={market.data?.fed_meetings} />
      </div>
    </div>
  );
}
