"use client";

import Link from "next/link";
import type { LiveFedMeeting, LiveQuote } from "@/lib/live-finance";
import { formatCalendarDate, relativeDays, upcomingEvents } from "@/lib/market";

const FED_CALENDAR = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";

/**
 * "Coming up": every published earnings date and announced ex-dividend
 * date across the holdings, plus scheduled Fed rate decisions, in the
 * next 30 days, in date order. A
 * portfolio-level view no single holding's card can show. Only dates
 * the source has published — nothing projected from past patterns.
 */
export function UpcomingEvents({
  quotes,
  fed,
  days = 30,
}: {
  quotes: LiveQuote[] | undefined;
  fed?: LiveFedMeeting[];
  days?: number;
}) {
  if (!quotes) return null;
  const events = upcomingEvents(quotes, days, undefined, fed ?? []);
  return (
    <section className="mt-6" aria-label="Coming up" data-testid="coming-up">
      <div className="mb-3 flex items-center gap-2">
        <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">Coming up</p>
        <span className="text-[11px] text-[var(--ink-faint)]">· next {days} days · earnings, ex-dividend and Fed rate decisions</span>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[var(--surface)]">
        {events.length === 0 && (
          <p className="m-0 px-4 py-3 text-xs text-[var(--ink-faint)]">No earnings, ex-dividend or Fed dates published in the next {days} days.</p>
        )}
        {events.map((ev) => {
          const rowClass =
            "grid grid-cols-[92px_52px_1fr] items-baseline gap-3 border-b border-[var(--border)] px-4 py-2.5 text-xs no-underline last:border-b-0 hover:bg-[var(--surface-2)] max-sm:grid-cols-[78px_44px_1fr]";
          const body = (
            <>
            <span className="text-[var(--ink)]">
              {formatCalendarDate(ev.date)}
              <span className="block text-[10.5px] text-[var(--ink-faint)]">{relativeDays(ev.date)}</span>
            </span>
            <span className="font-bold text-[var(--ink)]">{ev.ticker}</span>
            <span className="min-w-0">
              <span className="font-semibold text-[var(--ink)]">{ev.title}</span>
              <span className="block text-[11px] leading-[1.45] text-[var(--ink-dim)]">{ev.detail}</span>
            </span>
            </>
          );
          const key = `${ev.ticker}-${ev.kind}-${ev.date}`;
          return ev.kind === "fed" ? (
            <a key={key} href={FED_CALENDAR} target="_blank" rel="noreferrer" className={rowClass} data-testid="fed-event">
              {body}
            </a>
          ) : (
            <Link key={key} href={`/securities/${ev.ticker}`} className={rowClass}>
              {body}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
