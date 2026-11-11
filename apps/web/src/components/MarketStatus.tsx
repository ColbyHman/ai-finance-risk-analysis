"use client";

import type { LiveMarketSession } from "@/lib/live-finance";
import { marketStatusText } from "@/lib/market";
import { formatRelativeTime } from "@/lib/format";
import { useNow } from "./useMarket";

/**
 * One honest line about the prices on screen: is the market open, and
 * if not, which close the prices are from. Deliberately no "live"
 * pulse or ticking animation outside regular hours — on a weekend the
 * page should look like what it is: Friday's numbers.
 */
export function MarketStatus({
  session,
  fetchedAt,
  researchMinutes,
  error,
  className = "",
}: {
  session: LiveMarketSession | undefined;
  fetchedAt: Date | null;
  researchMinutes?: number;
  error?: string | null;
  className?: string;
}) {
  const now = useNow();
  if (!session) {
    return error ? <p className={`m-0 text-[11.5px] text-[var(--amber)] ${className}`}>{error}</p> : null;
  }
  const s = marketStatusText(session, now);
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-[1.5] text-[var(--ink-dim)] ${className}`} data-testid="market-status">
      <span className="inline-flex items-center gap-1.5 font-bold text-[var(--ink)]">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${s.live ? "bg-[var(--green)]" : session.state === "closed" ? "bg-[var(--ink-faint)]" : "bg-[var(--amber)]"}`}
        />
        {s.label}
      </span>
      {s.detail && <span>· {s.detail}</span>}
      {researchMinutes ? <span className="text-[var(--ink-faint)]">· Research re-checks each holding every {researchMinutes} min</span> : null}
      {fetchedAt && (
        <span className="text-[var(--ink-faint)]" title={fetchedAt.toLocaleString()}>
          · Checked {formatRelativeTime(fetchedAt.toISOString())}
        </span>
      )}
      {error && <span className="text-[var(--amber)]">· {error}</span>}
    </div>
  );
}
