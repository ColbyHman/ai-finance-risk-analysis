"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addLiveHolding,
  removeLiveHolding,
  refreshLiveHolding,
  type AssetType,
  type LiveHolding,
  type LiveQuote,
  FinanceApiError,
  RefreshInProgressError,
} from "@/lib/live-finance";
import { formatRelativeTime } from "@/lib/format";
import { formatPct, formatPrice, moveColor } from "@/lib/market";

const ASSET_TYPES: { value: AssetType; label: string; gloss: string }[] = [
  { value: "equity", label: "Equity (stock)", gloss: "a share of ownership in a single company" },
  { value: "etf", label: "ETF (fund)", gloss: "a basket of many securities traded as one fund" },
  { value: "treasury", label: "Treasury", gloss: "a bond issued by the U.S. government" },
  { value: "index", label: "Index fund", gloss: "a fund that tracks a market index like the S&P 500" },
];

/** In-flight status → a short, present-tense label for the row. */
function inFlightLabel(status: string): string {
  if (status === "pending") return "Queued…";
  if (status === "running") return "Fetching…";
  return "Working…";
}

interface Props {
  holdings: LiveHolding[];
  onChanged: () => void;
  /** Market data per ticker (ADR 0016); undefined while loading. */
  quote?: (ticker: string) => LiveQuote | undefined;
  /** "today", or the session's weekday when prices are from an earlier day. */
  changeLabel?: string;
}

/** Holdings management UI for live mode (ADR 0015): add/remove a
 * tracked security. No buy/sell/hold language anywhere here — this
 * only adds or removes what the system watches, it never suggests an
 * action on the position itself. */
export function HoldingsManager({ holdings, onChanged, quote, changeLabel = "today" }: Props) {
  const [ticker, setTicker] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("equity");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [alreadyRefreshing, setAlreadyRefreshing] = useState<string | null>(null);

  // While ANY holding has a server-reported in_flight job, poll for
  // fresh state every ~4-5s so the "Queued…/Fetching…" indicator and
  // last-updated time move on their own without a manual reload. The
  // interval clears itself the moment nothing is in flight anymore.
  const anyInFlight = holdings.some((h) => h.in_flight !== null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (anyInFlight && !pollRef.current) {
      pollRef.current = setInterval(() => {
        onChanged();
      }, 4500);
    }
    if (!anyInFlight && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyInFlight]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addLiveHolding(ticker.trim().toUpperCase(), assetType);
      setTicker("");
      onChanged();
    } catch (err) {
      setError(err instanceof FinanceApiError ? err.message : "Couldn't add that holding — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(t: string) {
    setBusy(true);
    setError(null);
    try {
      await removeLiveHolding(t);
      onChanged();
    } catch (err) {
      setError(err instanceof FinanceApiError ? err.message : "Couldn't remove that holding — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRefresh(t: string) {
    setRefreshing(t);
    setAlreadyRefreshing(null);
    try {
      await refreshLiveHolding(t);
      onChanged();
    } catch (err) {
      if (err instanceof RefreshInProgressError) {
        setAlreadyRefreshing(t);
      }
      /* otherwise best-effort — the triage view will just show stale data until the next successful run */
    } finally {
      setRefreshing(null);
    }
  }

  return (
    <div className="mb-3 rounded-[20px] bg-[var(--surface)] px-5 py-[18px]">
      <p className="m-0 mb-1 text-[13.5px] font-bold">Holdings being watched</p>
      <p className="m-0 mb-3 text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
        Add or remove a security for the system to track. This only changes what gets checked — it
        never suggests what to do with a position.
      </p>

      <div className="mb-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl bg-[var(--surface-2)]">
        {holdings.length === 0 && (
          <p className="m-0 px-3.5 py-2.5 text-[11.5px] text-[var(--ink-faint)]">No holdings yet — add one below.</p>
        )}
        {holdings.map((h) => {
          const locallyRefreshing = refreshing === h.ticker;
          const serverInFlight = h.in_flight !== null;
          const disableRefresh = locallyRefreshing || serverInFlight;
          const statusText = serverInFlight
            ? inFlightLabel(h.in_flight!.status)
            : alreadyRefreshing === h.ticker
              ? "Already refreshing"
              : `Researched ${formatRelativeTime(h.last_ingested_at)}`;
          return (
            <Link
              key={h.id}
              href={`/securities/${h.ticker}`}
              className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs no-underline transition-colors hover:bg-[var(--surface)]"
            >
              {/* On a phone the research status moves under the ticker so
                  the row fits 390px without clipping the buttons. */}
              <span className="w-12 font-bold max-sm:min-w-0 max-sm:flex-1">
                {h.ticker}
                <span className="block text-[10px] font-normal text-[var(--ink-faint)] sm:hidden">{statusText}</span>
              </span>
              {(() => {
                const q = quote?.(h.ticker);
                return (
                  <span className="flex w-[150px] items-baseline gap-2 font-mono tabular-nums max-sm:w-auto max-sm:flex-col max-sm:items-end max-sm:gap-0" data-testid="holding-quote">
                    <span className="text-[var(--ink)]">{q && !q.error ? formatPrice(q.price, q.currency) : "—"}</span>
                    <span className={`text-[11px] ${moveColor(q?.change_pct)}`} title={`Change ${changeLabel}`}>
                      {q && !q.error ? formatPct(q.change_pct) : ""}
                    </span>
                  </span>
                );
              })()}
              <span className="flex-1 text-[var(--ink-dim)] max-sm:hidden">{h.asset_type}</span>
              <span className="text-[10.5px] text-[var(--ink-faint)] max-sm:hidden" title="Last completed research run for this holding (news + filings)">
                {statusText}
              </span>
              <button
                type="button"
                disabled={disableRefresh}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRefresh(h.ticker);
                }}
                className="whitespace-nowrap rounded-md border border-[var(--btn-border)] bg-[var(--btn-bg)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--btn-text)] disabled:opacity-50"
                title="Fetch new filings/news for this holding right now, instead of waiting for the next scheduled check"
              >
                {locallyRefreshing ? (
                  "Refreshing…"
                ) : serverInFlight ? (
                  inFlightLabel(h.in_flight!.status)
                ) : (
                  <>
                    Refresh<span className="max-sm:hidden"> now</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(h.ticker);
                }}
                className="whitespace-nowrap rounded-md border border-[var(--border)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink-dim)] disabled:opacity-50"
              >
                Remove
              </button>
            </Link>
          );
        })}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker (e.g. MSFT)"
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs"
          maxLength={10}
        />
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AssetType)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs"
          title={ASSET_TYPES.find((a) => a.value === assetType)?.gloss}
        >
          {ASSET_TYPES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy || !ticker.trim()}
          className="rounded-lg border border-[var(--btn-border)] bg-[var(--btn-bg)] px-4 py-[7px] text-[11.5px] font-bold text-[var(--btn-text)] disabled:opacity-50"
        >
          Add holding
        </button>
      </form>
      {error && <p className="m-0 mt-2 text-[11px] text-[var(--red)]">{error}</p>}
    </div>
  );
}
