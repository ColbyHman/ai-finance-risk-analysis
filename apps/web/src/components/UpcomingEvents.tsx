"use client";

import Link from "next/link";
import type { LiveQuote } from "@/lib/live-finance";
import { formatCalendarDate, relativeDays, upcomingEvents } from "@/lib/market";

/**
 * "Coming up": every published earnings date and announced ex-dividend
 * date across the holdings in the next 30 days, in date order. A
 * portfolio-level view no single holding's card can show. Only dates
 * the source has published — nothing projected from past patterns.
 */
export function UpcomingEvents({ quotes, days = 30 }: { quotes: LiveQuote[] | undefined; days?: number }) {
  if (!quotes) return null;
  const events = upcomingEvents(quotes, days);
  return (
    <section className="mt-6" aria-label="Coming up" data-testid="coming-up">
      <div className="mb-3 flex items-center gap-2">
        <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">Coming up</p>
        <span className="text-[11px] text-[var(--ink-faint)]">· next {days} days · earnings and ex-dividend dates</span>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[var(--surface)]">
        {events.length === 0 && (
          <p className="m-0 px-4 py-3 text-xs text-[var(--ink-faint)]">No earnings or ex-dividend dates published for your holdings in the next {days} days.</p>
        )}
        {events.map((ev) => (
          <Link
            key={`${ev.ticker}-${ev.kind}-${ev.date}`}
            href={`/securities/${ev.ticker}`}
            className="grid grid-cols-[92px_52px_1fr] items-baseline gap-3 border-b border-[var(--border)] px-4 py-2.5 text-xs no-underline last:border-b-0 hover:bg-[var(--surface-2)] max-sm:grid-cols-[78px_44px_1fr]"
          >
            <span className="text-[var(--ink)]">
              {formatCalendarDate(ev.date)}
              <span className="block text-[10.5px] text-[var(--ink-faint)]">{relativeDays(ev.date)}</span>
            </span>
            <span className="font-bold text-[var(--ink)]">{ev.ticker}</span>
            <span className="min-w-0">
              <span className="font-semibold text-[var(--ink)]">{ev.title}</span>
              <span className="block text-[11px] leading-[1.45] text-[var(--ink-dim)]">{ev.detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
