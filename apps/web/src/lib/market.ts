/**
 * Market-data presentation helpers (ADR 0016): formatting, the honest
 * "is the market open, and what are these prices from" wording, and
 * how often to poll. Pure functions — no React — so every surface
 * (inbox, detail page, Portfolio Health) words things the same way.
 *
 * Everything market-related is shown in New York time, the exchange's
 * own clock, and labelled "ET".
 */
import type { LiveDividend, LiveFedMeeting, LiveMarketSession, LiveQuote, MarketState } from "./live-finance";

export const MARKET_TZ = "America/New_York";

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

/** How often to re-fetch prices. While the market is open prices move,
 * so every minute; outside regular hours the regular-session price
 * doesn't change, so we only check occasionally (to notice the open). */
export function marketPollMs(state: MarketState | undefined): number {
  switch (state) {
    case "open":
      return 60_000;
    case "pre":
    case "post":
      return 5 * 60_000;
    default:
      return 15 * 60_000;
  }
}

/** Research results (new reads, in-flight status) are polled on their
 * own, slower clock: the backend re-checks each holding every 30 min. */
export const RESEARCH_POLL_MS = 2 * 60_000;

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function formatPrice(n: number | null | undefined, currency = "USD"): string {
  if (n == null) return "—";
  const symbol = currency === "USD" ? "$" : "";
  return `${symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol ? "" : ` ${currency}`}`;
}

/** "+1.24" / "−0.62" — a real minus sign, so columns line up. */
export function formatSigned(n: number | null | undefined, digits = 2): string {
  if (n == null) return "—";
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  if (Number(abs.replace(/,/g, "")) === 0) return abs;
  return `${n < 0 ? "−" : "+"}${abs}`;
}

export function formatSignedMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (Number(abs.replace(/,/g, "")) === 0) return `$${abs}`;
  return `${n < 0 ? "−" : "+"}$${abs}`;
}

export function formatPct(n: number | null | undefined, digits = 2): string {
  return n == null ? "—" : `${formatSigned(n, digits)}%`;
}

/** 29726781 → "29.7M". */
export function formatVolume(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

/** Semantic colour for a move: green up, red down, neutral at zero. */
export function moveColor(n: number | null | undefined): string {
  if (n == null || Math.abs(n) < 0.005) return "text-[var(--ink-dim)]";
  return n > 0 ? "text-[var(--green)]" : "text-[var(--red)]";
}

// ---------------------------------------------------------------------------
// Dates and times (all New York)
// ---------------------------------------------------------------------------

/** YYYY-MM-DD for an instant, in New York. */
export function nyDate(d: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return d.toLocaleDateString("en-CA", { timeZone: MARKET_TZ });
}

/** "4:00 PM" for an ISO instant, in New York. */
export function nyTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: MARKET_TZ, hour: "numeric", minute: "2-digit" });
}

/** "Tue" / "Tue, Nov 10" for an ISO instant, in New York. */
export function nyDay(iso: string, withDate = false): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: MARKET_TZ,
    weekday: "short",
    ...(withDate ? { month: "short", day: "numeric" } : {}),
  });
}

// Every `now?: Date` below defaults to the current time *inside* the
// function, never as a default parameter: under cacheComponents a
// `new Date()` evaluated while a page prerenders fails the build, and
// these only read the clock once there is market data to describe.

/** Whole days from today (New York) to a YYYY-MM-DD date. */
export function daysUntil(date: string, now?: Date): number {
  const a = Date.parse(`${nyDate(now ?? new Date())}T00:00:00Z`);
  const b = Date.parse(`${date}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "Thu, Nov 12" for a YYYY-MM-DD calendar date. */
export function formatCalendarDate(date: string, withYear = false): string {
  // Noon UTC keeps the calendar date stable in every display timezone.
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** "today" / "tomorrow" / "in 6 days" / "in 11 weeks". */
export function relativeDays(date: string, now?: Date): string {
  const n = daysUntil(date, now);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n < 0) return `${-n} day${n === -1 ? "" : "s"} ago`;
  if (n < 21) return `in ${n} days`;
  return `in ${Math.round(n / 7)} weeks`;
}

/** Is the latest price from today's session (New York)? */
export function isTodaysSession(asOf: string | null | undefined, now?: Date): boolean {
  return !!asOf && nyDate(new Date(asOf)) === nyDate(now ?? new Date());
}

/** The label for a day-change figure: "today" when the prices are from
 * today's session, otherwise the session's weekday ("Tue") — so on a
 * Saturday nobody reads Friday's move as happening now. */
export function changeLabel(session: LiveMarketSession | undefined, now?: Date): string {
  if (!session?.as_of) return "today";
  return isTodaysSession(session.as_of, now) ? "today" : nyDay(session.as_of);
}

// ---------------------------------------------------------------------------
// Market status wording
// ---------------------------------------------------------------------------

export interface MarketStatusText {
  /** Short state: "Market open", "Pre-market", "After hours", "Market closed". */
  label: string;
  /** What the prices on screen are, said plainly. */
  detail: string;
  /** true while regular-session prices are moving. */
  live: boolean;
}

export function marketStatusText(session: LiveMarketSession | undefined, now?: Date): MarketStatusText {
  if (!session) return { label: "Market status unknown", detail: "", live: false };
  const asOf = session.as_of;
  const closeText = asOf
    ? isTodaysSession(asOf, now)
      ? `today's ${nyTime(asOf)} ET close`
      : `the ${nyDay(asOf, true)} ${nyTime(asOf)} ET close`
    : "the last close";
  const opens = session.next_open
    ? isTodaysSession(session.next_open, now)
      ? `opens ${nyTime(session.next_open)} ET`
      : `opens ${nyDay(session.next_open)} ${nyTime(session.next_open)} ET`
    : "";
  switch (session.state) {
    case "open":
      return {
        label: "Market open",
        detail: asOf ? `Prices as of ${nyTime(asOf)} ET, refreshing every minute` : "Prices refreshing every minute",
        live: true,
      };
    case "pre":
      return { label: "Pre-market", detail: [`Prices are from ${closeText}`, opens && `regular trading ${opens}`].filter(Boolean).join(" · "), live: false };
    case "post":
      return { label: "After hours", detail: `Prices are from ${closeText}`, live: false };
    default:
      return { label: "Market closed", detail: [`Prices are from ${closeText}`, opens].filter(Boolean).join(" · "), live: false };
  }
}

// ---------------------------------------------------------------------------
// Dividends and earnings
// ---------------------------------------------------------------------------

export const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "Pays monthly",
  quarterly: "Pays quarterly",
  semiannual: "Pays twice a year",
  annual: "Pays once a year",
};

/** One dated thing coming up — for a holding, or (kind "fed") for the
 * whole market, in which case ticker is "Fed". */
export interface UpcomingEvent {
  ticker: string;
  date: string;
  kind: "earnings" | "ex_dividend" | "fed";
  title: string;
  detail: string;
}

/** "Dec 8–9" for a meeting's start and decision dates. */
function meetingDays(start: string, end: string): string {
  const s = formatCalendarDate(start).replace(/^\w+, /, "");
  const e = formatCalendarDate(end).replace(/^\w+, /, "");
  return start.slice(0, 7) === end.slice(0, 7) ? `${s}–${e.split(" ")[1]}` : `${s} – ${e}`;
}

/** Earnings and announced ex-dividend dates within `days` — only
 * dates the source has published, never projected. Sorted by date. */
export function upcomingEvents(quotes: LiveQuote[], days = 30, now?: Date, fed: LiveFedMeeting[] = []): UpcomingEvent[] {
  const out: UpcomingEvent[] = [];
  for (const f of fed) {
    const n = daysUntil(f.decision_date, now);
    if (n >= 0 && n <= days) {
      out.push({
        ticker: "Fed",
        date: f.decision_date,
        kind: "fed",
        title: "Fed interest-rate decision",
        detail: `Announced 2:00 PM ET after the ${meetingDays(f.start_date, f.decision_date)} meeting${
          f.has_projections ? ", with the Fed's economic projections" : ""
        } · applies to the whole market, not one holding`,
      });
    }
  }
  for (const q of quotes) {
    const e = q.earnings;
    if (e && daysUntil(e.date, now) >= 0 && daysUntil(e.date, now) <= days) {
      out.push({
        ticker: q.ticker,
        date: e.date,
        kind: "earnings",
        title: "Earnings report",
        detail: e.is_estimate ? "Date estimated, not yet confirmed by the company" : "Date confirmed by the company",
      });
    }
    const d = q.dividend;
    if (d?.next_ex_date && daysUntil(d.next_ex_date, now) >= 0 && daysUntil(d.next_ex_date, now) <= days) {
      const amount = d.last_amount != null ? ` · last payout ${formatPrice(d.last_amount, q.currency)}/share` : "";
      const pay = d.next_pay_date ? ` · paid ${formatCalendarDate(d.next_pay_date)}` : "";
      out.push({
        ticker: q.ticker,
        date: d.next_ex_date,
        kind: "ex_dividend",
        title: "Ex-dividend date",
        detail: `Shares bought on or after this date don't receive the next payout${pay}${amount}`,
      });
    }
  }
  return out.sort((a, b) => (a.date === b.date ? a.ticker.localeCompare(b.ticker) : a.date.localeCompare(b.date)));
}

/** A short chip for a holding's nearest dated event, e.g. "Earnings in
 * 6 days" — or null when nothing is published within `days`. */
export function nearestEventChip(q: LiveQuote | undefined, days = 14, now?: Date): string | null {
  if (!q) return null;
  const ev = upcomingEvents([q], days, now)[0];
  if (!ev) return null;
  const what = ev.kind === "earnings" ? "Earnings" : "Ex-dividend";
  return `${what} ${relativeDays(ev.date, now)}`;
}

export function dividendSummary(d: LiveDividend | null | undefined, currency?: string): string {
  if (!d) return "No dividend";
  const parts: string[] = [];
  if (d.frequency) parts.push(FREQUENCY_LABEL[d.frequency]);
  if (d.trailing_amount != null) parts.push(`${formatPrice(d.trailing_amount, currency)}/share over the last 12 months`);
  return parts.join(" · ") || "Dividend history unavailable";
}

// ---------------------------------------------------------------------------
// Diversification wording (ADR 0017): numbers only. The one kind of
// words allowed is a fraction that is arithmetically true of the
// number itself ("62% — a majority"). No thresholds from outside the
// data, nothing that says whether a figure is good or bad.
// ---------------------------------------------------------------------------

/** The strongest plain fraction that is true of `pct`, or null.
 * 62 → "a majority", 70 → "more than two-thirds", 30 → "more than a
 * quarter". Strictly greater-than, so it is never rounded into being
 * true. */
export function shareWords(pct: number): string | null {
  if (pct > 75) return "more than three-quarters";
  if (pct > 200 / 3) return "more than two-thirds";
  if (pct > 50) return "a majority";
  if (pct > 100 / 3) return "more than a third";
  if (pct > 25) return "more than a quarter";
  return null;
}

export function formatShare(pct: number, digits = 1): string {
  return `${pct.toFixed(digits)}%`;
}

export const ASSET_CLASS_LABEL: Record<string, string> = {
  stocks: "Stocks",
  bonds: "Bonds",
  cash: "Cash",
  other: "Other",
  unclassified: "Unclassified",
};
