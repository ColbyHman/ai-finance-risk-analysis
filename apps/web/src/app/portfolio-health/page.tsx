"use client";

/**
 * Portfolio Health — real units × live price = value + allocation.
 *
 * Wired to homelab-hub's Conduit backend (fetchPortfolioSummary /
 * updateHoldingUnits in lib/live-finance.ts) — no fixture data, no
 * mock allocation set. This supersedes the earlier explicit decision
 * to keep this page on fixtures (see lib/triage.ts's header comment).
 *
 * Deliberately NOT here: cost basis, gain/loss, buy/sell/hold
 * language, timeframe performance charts, "movers," or a risk-context
 * panel — none of that is backed by real data yet. This page is pure
 * informational display of units → value → allocation, nothing more.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { TopNav } from "@/components/SiteNav";
import { fetchPortfolioSummary, updateHoldingUnits, FinanceApiError, type LivePortfolioHolding } from "@/lib/live-finance";

type SaveState = "idle" | "saving" | "saved" | "error";

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortfolioHealthPage() {
  const [holdings, setHoldings] = useState<LivePortfolioHolding[] | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Per-ticker local input text + save state, keyed by ticker so each
  // row's editor is independent.
  const [unitsInput, setUnitsInput] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(async () => {
    try {
      const data = await fetchPortfolioSummary();
      setHoldings(data.holdings);
      setTotalValue(data.total_value);
      setLoadError(null);
      setUnitsInput((prev) => {
        const next = { ...prev };
        for (const h of data.holdings) {
          if (next[h.ticker] === undefined) next[h.ticker] = String(h.units);
        }
        return next;
      });
    } catch (err) {
      setLoadError(err instanceof FinanceApiError ? err.message : "Failed to load portfolio data.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const commitUnits = useCallback(async (ticker: string, raw: string) => {
    const units = Number(raw);
    if (!Number.isFinite(units) || units < 0) {
      setSaveState((s) => ({ ...s, [ticker]: "error" }));
      return;
    }
    setSaveState((s) => ({ ...s, [ticker]: "saving" }));
    try {
      await updateHoldingUnits(ticker, units);
      setSaveState((s) => ({ ...s, [ticker]: "saved" }));
      await load();
      setTimeout(() => setSaveState((s) => (s[ticker] === "saved" ? { ...s, [ticker]: "idle" } : s)), 2000);
    } catch {
      setSaveState((s) => ({ ...s, [ticker]: "error" }));
    }
  }, [load]);

  function onUnitsChange(ticker: string, value: string) {
    setUnitsInput((s) => ({ ...s, [ticker]: value }));
    // Debounced save: commits 600ms after the user stops typing,
    // rather than on every keystroke.
    if (saveTimers.current[ticker]) clearTimeout(saveTimers.current[ticker]);
    saveTimers.current[ticker] = setTimeout(() => commitUnits(ticker, value), 600);
  }

  function onUnitsBlur(ticker: string, value: string) {
    if (saveTimers.current[ticker]) clearTimeout(saveTimers.current[ticker]);
    commitUnits(ticker, value);
  }

  const ALLOC_COLORS = ["var(--green)", "#60a5fa", "#38bdf8", "var(--swatch-neutral-1)", "var(--swatch-neutral-2)", "var(--ink-faint)", "#3f454d"];

  return (
    <div className="min-h-screen">
      <TopNav current="/portfolio-health" />
      <div className="mx-auto max-w-[1020px] px-6 pb-[60px]">
        <div className="mt-[18px] mb-5">
          <h1 className="m-0 mb-1 text-xl font-bold tracking-tight">Portfolio Health</h1>
          <p className="m-0 max-w-[520px] text-xs text-[var(--ink-dim)]">
            Set how many units you hold of each tracked security — value and allocation update from a live price lookup.
            Informational only: no cost basis or gain/loss, no buy/sell/hold guidance.
          </p>
        </div>

        {loadError && (
          <div className="mb-5 rounded-2xl bg-[var(--surface)] px-5 py-4 text-sm text-[var(--red)]">
            {loadError}
          </div>
        )}

        <div className="mb-5 rounded-3xl bg-[var(--surface)] px-7 py-[26px]">
          <p className="m-0 mb-1 text-[11.5px] text-[var(--ink-faint)]">Total portfolio value</p>
          <p className="m-0 font-mono text-[40px] font-medium tabular-nums tracking-tight text-[var(--ink)]">
            ${formatMoney(totalValue)}
          </p>
          <p className="mt-1.5 text-[11px] text-[var(--ink-faint)]">
            Sum of units × live price across holdings with a usable price lookup.
          </p>
        </div>

        <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
          Holdings — units, live price, value, allocation
        </p>
        <div className="mb-5 overflow-hidden rounded-[20px] bg-[var(--surface)]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--ink-faint)]">Ticker</th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--ink-faint)]" style={{ width: 140 }}>Units owned</th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--ink-faint)]" style={{ width: 110 }}>Live price</th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--ink-faint)]" style={{ width: 120 }}>Value</th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--ink-faint)]" style={{ width: 160 }}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings === null && !loadError && (
                <tr>
                  <td colSpan={5} className="border-t border-[var(--border)] px-5 py-6 text-center text-[12px] text-[var(--ink-faint)]">
                    Loading live portfolio data…
                  </td>
                </tr>
              )}
              {holdings !== null && holdings.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-t border-[var(--border)] px-5 py-6 text-center text-[12px] text-[var(--ink-faint)]">
                    No holdings tracked yet.
                  </td>
                </tr>
              )}
              {holdings?.map((h, i) => {
                const state = saveState[h.ticker] ?? "idle";
                return (
                  <tr key={h.ticker}>
                    <td className="border-t border-[var(--border)] px-5 py-[11px] font-bold">{h.ticker}</td>
                    <td className="border-t border-[var(--border)] px-5 py-[11px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          aria-label={`Units owned of ${h.ticker}`}
                          value={unitsInput[h.ticker] ?? String(h.units)}
                          onChange={(e) => onUnitsChange(h.ticker, e.target.value)}
                          onBlur={(e) => onUnitsBlur(h.ticker, e.target.value)}
                          className="w-[80px] rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[12.5px] tabular-nums text-[var(--ink)] outline-none focus:border-[var(--btn-border)]"
                        />
                        {state === "saving" && <span className="text-[10.5px] text-[var(--ink-faint)]">Saving…</span>}
                        {state === "saved" && <span className="text-[10.5px] text-[var(--green)]">Saved</span>}
                        {state === "error" && <span className="text-[10.5px] text-[var(--red)]">Save failed</span>}
                      </div>
                    </td>
                    <td className="border-t border-[var(--border)] px-5 py-[11px] font-mono text-[12.5px] tabular-nums text-[var(--ink-dim)]">
                      {h.price !== null ? `$${formatMoney(h.price)}` : (
                        <span className="text-[var(--ink-faint)]">price unavailable</span>
                      )}
                    </td>
                    <td className="border-t border-[var(--border)] px-5 py-[11px] font-mono text-[12.5px] tabular-nums text-[var(--ink-dim)]">
                      {h.value !== null ? `$${formatMoney(h.value)}` : <span className="text-[var(--ink-faint)]">—</span>}
                    </td>
                    <td className="border-t border-[var(--border)] px-5 py-[11px]">
                      {h.allocation_pct !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-[70px] overflow-hidden rounded-sm bg-[var(--surface-2)]">
                            <div
                              className="h-2"
                              style={{ width: `${Math.min(100, h.allocation_pct)}%`, background: ALLOC_COLORS[i % ALLOC_COLORS.length] }}
                            />
                          </div>
                          <span className="font-mono text-[11.5px] tabular-nums text-[var(--ink-faint)]">{h.allocation_pct.toFixed(1)}%</span>
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-[var(--ink-faint)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
