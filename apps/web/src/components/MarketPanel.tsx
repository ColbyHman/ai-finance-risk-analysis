"use client";

import type { LiveMarketSession, LiveQuote } from "@/lib/live-finance";
import {
  changeLabel,
  dividendSummary,
  formatCalendarDate,
  formatPct,
  formatPrice,
  formatSigned,
  formatVolume,
  moveColor,
  relativeDays,
} from "@/lib/market";
import { IntradayChart } from "./PriceChart";
import { MarketStatus } from "./MarketStatus";

/** Where `value` sits between `low` and `high`, as a bar with a marker. */
function RangeBar({ low, high, value, currency }: { low: number | null; high: number | null; value: number | null; currency?: string }) {
  if (low == null || high == null || value == null || high <= low) return <span className="text-[var(--ink-faint)]">—</span>;
  const pct = Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
  return (
    <div className="w-full max-w-[260px]">
      <div className="relative h-1.5 rounded-sm bg-[var(--surface-2)]" aria-hidden>
        <div className="absolute top-[-3px] h-3 w-[3px] rounded-sm bg-[var(--ink)]" style={{ left: `calc(${pct}% - 1.5px)` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10.5px] tabular-nums text-[var(--ink-faint)]">
        <span>{formatPrice(low, currency)}</span>
        <span>{formatPrice(high, currency)}</span>
      </div>
    </div>
  );
}

function Row({ label, gloss, children }: { label: string; gloss?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,130px)_1fr] items-start gap-3 border-b border-[var(--border)] py-2.5 last:border-b-0">
      <dt className="text-[11.5px] text-[var(--ink-faint)]">
        {label}
        {gloss && <span className="mt-0.5 block text-[10.5px] leading-[1.4] text-[var(--ink-faint)] opacity-80">{gloss}</span>}
      </dt>
      <dd className="m-0 text-[12.5px] text-[var(--ink)]">{children}</dd>
    </div>
  );
}

function fromHigh(q: LiveQuote): string | null {
  if (q.price == null || q.fifty_two_week_high == null || q.fifty_two_week_low == null) return null;
  const below = ((q.fifty_two_week_high - q.price) / q.fifty_two_week_high) * 100;
  const above = ((q.price - q.fifty_two_week_low) / q.fifty_two_week_low) * 100;
  if (below < 0.05) return "At its 52-week high";
  if (above < 0.05) return "At its 52-week low";
  return `${below.toFixed(1)}% below the 52-week high · ${above.toFixed(1)}% above the low`;
}

/**
 * Market data for one holding (ADR 0016): price action, where it sits
 * in its ranges, and the dated events that move prices — earnings and
 * ex-dividend. Facts with their basis, no verdicts: nothing here says
 * whether any of it is good or bad.
 */
export function MarketPanel({
  quote,
  session,
  fetchedAt,
  researchMinutes,
  error,
  isFund,
}: {
  quote: LiveQuote | undefined;
  session: LiveMarketSession | undefined;
  fetchedAt: Date | null;
  researchMinutes?: number;
  error: string | null;
  isFund: boolean;
}) {
  if (!quote) {
    return (
      <div className="mb-5 animate-pulse rounded-3xl bg-[var(--surface)] px-7 py-6" data-testid="market-panel-loading">
        <div className="mb-3 h-8 w-40 rounded bg-[var(--surface-2)]" />
        <div className="h-[150px] rounded-xl bg-[var(--surface-2)]" />
      </div>
    );
  }
  if (quote.error) {
    return (
      <div className="mb-5 rounded-[20px] bg-[var(--surface)] px-6 py-5 text-[12.5px] text-[var(--ink-dim)]" data-testid="market-panel">
        Market data unavailable for {quote.ticker}: {quote.error}
      </div>
    );
  }
  const cur = quote.currency;
  const label = changeLabel(session);
  const d = quote.dividend;
  const e = quote.earnings;
  const pos = fromHigh(quote);

  return (
    <section className="mb-5 rounded-3xl bg-[var(--surface)] px-7 py-6" data-testid="market-panel" aria-label="Market data">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="m-0 font-mono text-[32px] font-medium leading-none tabular-nums tracking-tight" data-testid="price">
            {formatPrice(quote.price, cur)}
          </p>
          <p className={`m-0 mt-1.5 font-mono text-[13px] tabular-nums ${moveColor(quote.change)}`} data-testid="day-change">
            {formatSigned(quote.change)} ({formatPct(quote.change_pct)}) <span className="font-sans text-[var(--ink-faint)]">{label}</span>
          </p>
        </div>
      </div>
      <MarketStatus session={session} fetchedAt={fetchedAt} researchMinutes={researchMinutes} error={error} className="mb-4" />

      <IntradayChart points={quote.intraday} baseline={quote.previous_close} currency={cur} sessionLabel={label === "today" ? "Today's" : `${label}'s`} />

      <dl className="mt-5 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        <div>
          <Row label="Previous close">
            <span className="font-mono tabular-nums">{formatPrice(quote.previous_close, cur)}</span>
          </Row>
          <Row label={label === "today" ? "Day range" : `Day range (${label})`}>
            <RangeBar low={quote.day_low} high={quote.day_high} value={quote.price} currency={cur} />
          </Row>
          <Row label="52-week range">
            <RangeBar low={quote.fifty_two_week_low} high={quote.fifty_two_week_high} value={quote.price} currency={cur} />
            {pos && <p className="m-0 mt-1 text-[11px] text-[var(--ink-dim)]">{pos}</p>}
          </Row>
          <Row label="Volume" gloss="Shares traded in the session">
            <span className="font-mono tabular-nums">{formatVolume(quote.volume)}</span>
          </Row>
          <Row label="Beta" gloss="How much it has moved relative to the overall market: 1.0 = in step, 2.0 = about twice as much">
            <span className="font-mono tabular-nums">{quote.beta != null ? quote.beta.toFixed(2) : "—"}</span>
          </Row>
        </div>
        <div>
          <Row label="Next earnings" gloss="When the company reports results; prices often move around it">
            {e ? (
              <span data-testid="earnings">
                {formatCalendarDate(e.date, true)} <span className="text-[var(--ink-dim)]">· {relativeDays(e.date)}</span>{" "}
                <span
                  className={`ml-1 rounded-md border px-1.5 py-[1px] text-[10px] font-bold ${
                    e.is_estimate ? "border-[var(--border)] text-[var(--ink-dim)]" : "border-[var(--blue)] text-[var(--blue)]"
                  }`}
                >
                  {e.is_estimate ? "Estimated" : "Confirmed"}
                </span>
              </span>
            ) : (
              <span className="text-[var(--ink-faint)]">{isFund ? "Funds don't report earnings" : "No date published yet"}</span>
            )}
          </Row>
          <Row label="Dividend yield" gloss="A year of dividends as a share of the price">
            <span className="font-mono tabular-nums">{d?.yield_pct != null ? `${d.yield_pct.toFixed(2)}%` : "—"}</span>
            {d && <p className="m-0 mt-0.5 text-[11px] text-[var(--ink-dim)]">{dividendSummary(d, cur)}</p>}
          </Row>
          <Row label="Ex-dividend" gloss="Shares bought on or after this date don't get the next payout">
            {d?.next_ex_date ? (
              <span data-testid="next-ex-date">
                {formatCalendarDate(d.next_ex_date)} <span className="text-[var(--ink-dim)]">· {relativeDays(d.next_ex_date)}</span>
                {d.next_pay_date && <span className="block text-[11px] text-[var(--ink-dim)]">Paid {formatCalendarDate(d.next_pay_date)}</span>}
              </span>
            ) : d?.last_ex_date ? (
              <span className="text-[var(--ink-dim)]">
                No upcoming date announced. Last recorded {formatCalendarDate(d.last_ex_date, true)}
                {d.last_amount != null && <> · {formatPrice(d.last_amount, cur)}/share</>}
              </span>
            ) : (
              <span className="text-[var(--ink-faint)]">{d ? "No dates published" : "Doesn't pay a dividend"}</span>
            )}
          </Row>
          <Row label="P/E (trailing)" gloss={isFund ? "Average across the fund's holdings: price ÷ last 12 months' earnings" : "Price ÷ the last 12 months' earnings per share"}>
            <span className="font-mono tabular-nums">{quote.trailing_pe != null ? quote.trailing_pe.toFixed(1) : "—"}</span>
          </Row>
        </div>
      </dl>
      <p className="m-0 mt-4 text-[10.5px] text-[var(--ink-faint)]">
        Market data: Yahoo Finance. Describes the security — not a recommendation to buy, sell, or hold it.
      </p>
    </section>
  );
}
