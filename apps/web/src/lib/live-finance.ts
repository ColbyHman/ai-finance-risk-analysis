/**
 * Live finance domain data layer (ADR 0015, later made the only mode —
 * see docs/adr/0015-live-finance-domain-and-dynamic-holdings.md). The
 * triage inbox, holdings list, and per-security detail page all fetch
 * from homelab-hub's Conduit backend (the `finance` module,
 * /api/v1/finance) — there is no fixture fallback and no env flag to
 * toggle it off.
 *
 * Response shapes from Conduit are adapted into the existing
 * TriageHolding type (lib/triage.ts) so the triage-rendering components
 * don't need to know anything about the wire format — only this data
 * layer talks to Conduit directly.
 */
import type { TriageHolding } from "./triage";

export type AssetType = "equity" | "etf" | "treasury" | "index";

export interface LiveHolding {
  id: string;
  ticker: string;
  asset_type: AssetType;
  active: boolean;
  created_at: string;
  updated_at: string;
  /** null when this ticker has never completed a finance_ingest run. */
  last_ingested_at: string | null;
  /** Server-side truth for "is a refresh already running for this
   * ticker" — null when idle, otherwise the job currently
   * pending/running. Mirrors the backend's holdingListItem shape
   * exactly (services/conduit/internal/modules/finance/handler.go). */
  in_flight: { job_type: string; status: string } | null;
}

interface LiveTriageItem {
  ticker: string;
  status: "act" | "watch" | "none";
  headline: string;
  summary?: string;
  reason?: string;
  reviewed: boolean;
  asset_type: AssetType;
}

interface LiveTriageResponse {
  holdings: LiveTriageItem[];
  disclaimer: string;
}

/** One finance_documents row — a filing or news article fetched for a
 * holding. Mirrors the backend's holdingDetailDocument shape exactly
 * (services/conduit/internal/modules/finance/handler.go). */
export interface LiveDocument {
  id: string;
  source: string;
  doc_type: string;
  url: string;
  title: string;
  published_at: string | null;
}

/** One citation inside a LiveAnalysis — points back at a LiveDocument
 * by id. */
export interface LiveCitation {
  document_id: string;
  url: string;
  excerpt: string;
}

/** One finance_analyses row. Mirrors the backend's holdingDetailAnalysis
 * shape exactly. */
export interface LiveAnalysis {
  id: string;
  summary: string;
  event_type: string;
  sentiment: string;
  materiality: number;
  citations: LiveCitation[];
  created_at: string;
}

/** The full per-security detail response — GET
 * /holdings/{ticker}/detail. Mirrors the backend's holdingDetailResponse
 * shape exactly. */
export interface LiveHoldingDetail {
  ticker: string;
  asset_type: AssetType;
  active: boolean;
  documents: LiveDocument[];
  analyses: LiveAnalysis[];
}

function apiBase(): string {
  return process.env.NEXT_PUBLIC_FINANCE_API_BASE || "http://localhost:8080/api/v1/finance";
}

// Deterministic, UI-only visual accents for live holdings — the
// backend doesn't track portfolio weights/colors (out of scope for
// ADR 0015). The inbox's sparklines are real intraday prices now
// (ADR 0016, lib/market.ts), not synthesized.
const PALETTE = ["var(--green)", "#60a5fa", "#38bdf8", "var(--swatch-neutral-2)", "var(--swatch-neutral-1)", "var(--ink-faint)"];

function adaptTriageItem(item: LiveTriageItem, index: number): TriageHolding {
  return {
    ticker: item.ticker,
    status: item.status,
    headline: item.headline,
    summary: item.summary,
    reason: item.reason,
    reviewed: item.reviewed,
    color: PALETTE[index % PALETTE.length],
  };
}

export class FinanceApiError extends Error {}

export class HoldingNotFoundError extends FinanceApiError {}

/** A refresh was requested while a finance_ingest/finance_analyze job
 * for the same ticker was already pending/running — the backend's
 * real dedup guard (409 Conflict, "refresh-in-progress"), not a
 * generic failure. Lets the UI show "Already refreshing" instead of
 * an error. */
export class RefreshInProgressError extends FinanceApiError {}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // AbortSignal.timeout bounds a slow/unreachable backend — without
  // this, a hung fetch during server-side rendering can hang the whole
  // page request (observed as the container's healthcheck flapping to
  // "unhealthy" with no other symptom).
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: init?.signal ?? AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = body;
    let kind = "";
    try {
      const parsed = JSON.parse(body);
      message = parsed.detail ?? parsed.error ?? body;
      kind = parsed.title ?? "";
    } catch {
      /* not JSON, use raw body */
    }
    if (res.status === 404 && kind === "holding-not-found") {
      throw new HoldingNotFoundError(message || "Not found");
    }
    if (res.status === 409 && kind === "refresh-in-progress") {
      throw new RefreshInProgressError(message || "Already refreshing");
    }
    throw new FinanceApiError(message || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Fetches live triage data and adapts it to the TriageHolding shape
 * the triage inbox renders. */
export async function fetchLiveTriage(): Promise<{ holdings: TriageHolding[]; disclaimer: string }> {
  const data = await apiFetch<LiveTriageResponse>("/triage");
  const holdings = data.holdings.map((item, i) => adaptTriageItem(item, i));
  return { holdings, disclaimer: data.disclaimer };
}

export async function fetchLiveHoldings(): Promise<LiveHolding[]> {
  const data = await apiFetch<{ holdings: LiveHolding[] }>("/holdings");
  return data.holdings;
}

export async function addLiveHolding(ticker: string, assetType: AssetType): Promise<LiveHolding> {
  const data = await apiFetch<{ holding: LiveHolding }>("/holdings", {
    method: "POST",
    body: JSON.stringify({ ticker, asset_type: assetType }),
  });
  return data.holding;
}

export async function removeLiveHolding(ticker: string): Promise<void> {
  await apiFetch(`/holdings/${encodeURIComponent(ticker)}`, { method: "DELETE" });
}

export async function refreshLiveHolding(ticker: string): Promise<void> {
  await apiFetch(`/holdings/${encodeURIComponent(ticker)}/refresh`, { method: "POST" });
}

/** Fetches the full per-security detail view: the holding row plus
 * its most recent documents and analyses. Throws HoldingNotFoundError
 * (a FinanceApiError subclass) when the ticker has no row in
 * finance_holdings at all — callers map that to Next's notFound(). */
export async function fetchHoldingDetail(ticker: string): Promise<LiveHoldingDetail> {
  return apiFetch<LiveHoldingDetail>(`/holdings/${encodeURIComponent(ticker)}/detail`);
}

/** One holding's row in Portfolio Health. price/value/allocation_pct
 * are null when the live price lookup failed for this ticker (dead
 * ticker, upstream hiccup) — the backend still returns the holding so
 * the page can show "price unavailable" instead of dropping the row.
 * Mirrors the backend's portfolioHoldingSummary shape exactly
 * (services/conduit/internal/modules/finance/handler.go). */
export interface LivePortfolioHolding {
  ticker: string;
  units: number;
  price: number | null;
  currency?: string;
  value: number | null;
  allocation_pct: number | null;
  /** units × (price − previous close); null without a previous close. */
  day_change: number | null;
  day_change_pct: number | null;
}

/** Mirrors the backend's portfolioSummaryResponse shape exactly. */
export interface LivePortfolioSummary {
  holdings: LivePortfolioHolding[];
  total_value: number;
  /** Sum of each position's units × (price − previous close). */
  total_day_change: number;
  total_day_change_pct: number | null;
  market: LiveMarketSession;
}

/** Fetches live portfolio summary: units, live price, computed value,
 * and allocation % per active holding, plus a portfolio total. This
 * is pure value/allocation display — no cost basis, no gain/loss,
 * never a buy/sell/hold signal. */
export async function fetchPortfolioSummary(): Promise<LivePortfolioSummary> {
  return apiFetch<LivePortfolioSummary>("/portfolio/summary");
}

/** Persists how many units of ticker the user holds — the only field
 * this endpoint accepts. Throws HoldingNotFoundError for an unknown
 * ticker (same 404 shape as fetchHoldingDetail). */
export async function updateHoldingUnits(ticker: string, units: number): Promise<LiveHolding> {
  const data = await apiFetch<{ holding: LiveHolding }>(`/holdings/${encodeURIComponent(ticker)}`, {
    method: "PATCH",
    body: JSON.stringify({ units }),
  });
  return data.holding;
}

// ---------------------------------------------------------------------------
// Market data (ADR 0016) — GET /market. Mirrors MarketSession /
// MarketQuote in services/conduit/internal/modules/finance/market.go
// exactly; change both sides together.
// ---------------------------------------------------------------------------

export type MarketState = "pre" | "open" | "post" | "closed";

export interface LiveMarketSession {
  state: MarketState;
  /** Time of the last regular-session trade; while closed, the close
   * the prices are from. */
  as_of: string | null;
  /** Next regular-session open, when published. */
  next_open: string | null;
  timezone: string;
}

/** Dates are YYYY-MM-DD calendar dates in New York. */
export interface LiveDividend {
  yield_pct: number | null;
  /** Only set when an announced ex-dividend date is today or later —
   * never projected from past payments. */
  next_ex_date: string | null;
  next_pay_date: string | null;
  /** Last ex-date in the source's history (it can trail by weeks). */
  last_ex_date: string | null;
  last_amount: number | null;
  frequency: "" | "monthly" | "quarterly" | "semiannual" | "annual";
  trailing_amount: number | null;
}

export interface LiveEarnings {
  date: string;
  /** The source's own flag: true until the company confirms the date. */
  is_estimate: boolean;
}

export interface LiveQuote {
  ticker: string;
  name?: string;
  currency?: string;
  price: number | null;
  previous_close: number | null;
  change: number | null;
  change_pct: number | null;
  day_high: number | null;
  day_low: number | null;
  volume: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
  market_time: string | null;
  /** 5-minute closes for the latest session: t = unix seconds. */
  intraday: { t: number; p: number }[];
  dividend: LiveDividend | null;
  earnings: LiveEarnings | null;
  beta: number | null;
  trailing_pe: number | null;
  /** Set when this ticker's lookup failed; every other field is null. */
  error?: string;
}

/** A scheduled FOMC meeting from the Fed's own calendar. The rate
 * decision is announced at 2:00 PM ET on decision_date. */
export interface LiveFedMeeting {
  start_date: string;
  decision_date: string;
  /** The Fed also publishes its economic projections at this meeting. */
  has_projections: boolean;
}

export interface LiveMarket {
  market: LiveMarketSession;
  quotes: LiveQuote[];
  research_interval_minutes: number;
  source: string;
  /** Next scheduled Fed rate decisions; empty if the calendar couldn't be read. */
  fed_meetings: LiveFedMeeting[];
}

/** Market data for every active holding, or just `tickers`. */
export async function fetchMarket(tickers?: string[]): Promise<LiveMarket> {
  const qs = tickers?.length ? `?tickers=${encodeURIComponent(tickers.join(","))}` : "";
  return apiFetch<LiveMarket>(`/market${qs}`);
}

// ---------------------------------------------------------------------------
// Diversification (ADR 0017) — GET /portfolio/diversification. Mirrors
// Diversification in services/conduit/internal/modules/finance/
// diversification.go exactly. Percentages are 0–100 and of the whole
// portfolio unless the field name says otherwise.
// ---------------------------------------------------------------------------

export interface LiveDiversification {
  total_value: number;
  holdings: { ticker: string; value: number; weight_pct: number; is_fund: boolean }[];
  concentration: {
    holding_count: number;
    largest_ticker: string;
    largest_pct: number;
    top3_pct: number;
    /** 1 ÷ the sum of squared weights: how many equal-sized positions
     * would be this concentrated. */
    effective_holdings: number;
  };
  asset_mix: { class: "stocks" | "bonds" | "cash" | "other" | "unclassified"; pct: number; value: number }[];
  stock_value_pct: number;
  sectors: {
    key: string;
    label: string;
    pct_of_stocks: number;
    pct_of_portfolio: number;
    direct_pct: number;
    via_funds_pct: number;
  }[];
  sector_coverage_pct: number;
  companies: {
    symbol: string;
    name?: string;
    total_pct: number;
    direct_pct: number;
    via_funds: { fund: string; pct: number }[];
  }[];
  /** How much of each fund its published top holdings cover. */
  fund_coverage: { fund: string; top_holdings_pct: number; count: number }[];
  correlation: {
    tickers: string[];
    /** Correlation of daily returns, −1…1; null under 60 shared days. */
    matrix: (number | null)[][];
    /** Share of days both moved the same direction, ignoring flat days. */
    same_direction_pct: (number | null)[][];
    average_pairwise: number | null;
    from: string;
    to: string;
  } | null;
  missing: { ticker: string; what: string }[];
  unpriced: string[];
  source: string;
}

export async function fetchDiversification(): Promise<LiveDiversification> {
  return apiFetch<LiveDiversification>("/portfolio/diversification");
}
