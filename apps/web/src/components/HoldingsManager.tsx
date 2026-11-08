"use client";

import { useState } from "react";
import {
  addLiveHolding,
  removeLiveHolding,
  refreshLiveHolding,
  type AssetType,
  type LiveHolding,
  FinanceApiError,
} from "@/lib/live-finance";

const ASSET_TYPES: { value: AssetType; label: string; gloss: string }[] = [
  { value: "equity", label: "Equity (stock)", gloss: "a share of ownership in a single company" },
  { value: "etf", label: "ETF (fund)", gloss: "a basket of many securities traded as one fund" },
  { value: "treasury", label: "Treasury", gloss: "a bond issued by the U.S. government" },
  { value: "index", label: "Index fund", gloss: "a fund that tracks a market index like the S&P 500" },
];

interface Props {
  holdings: LiveHolding[];
  onChanged: () => void;
}

/** Holdings management UI for live mode (ADR 0015): add/remove a
 * tracked security. No buy/sell/hold language anywhere here — this
 * only adds or removes what the system watches, it never suggests an
 * action on the position itself. */
export function HoldingsManager({ holdings, onChanged }: Props) {
  const [ticker, setTicker] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("equity");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

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
    try {
      await refreshLiveHolding(t);
    } catch {
      /* best-effort — the triage view will just show stale data until the next successful run */
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
        {holdings.map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs">
            <span className="font-bold">{h.ticker}</span>
            <span className="flex-1 text-[var(--ink-dim)]">{h.asset_type}</span>
            <button
              type="button"
              disabled={refreshing === h.ticker}
              onClick={() => handleRefresh(h.ticker)}
              className="rounded-md border border-[var(--btn-border)] bg-[var(--btn-bg)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--btn-text)] disabled:opacity-50"
              title="Fetch new filings/news for this holding right now, instead of waiting for the next scheduled check"
            >
              {refreshing === h.ticker ? "Refreshing…" : "Refresh now"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRemove(h.ticker)}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink-dim)] disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
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
