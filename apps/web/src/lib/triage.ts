/**
 * Triage inbox / Portfolio Health data.
 *
 * The triage inbox is live-only (ADR 0015) — this file no longer
 * carries fixture triage data, a portfolio-signals/allocation set, or
 * per-security holding-detail fixtures. The `TriageHolding` type below
 * is the shape the home page's Act/Watch/Reviewed list renders,
 * populated from lib/live-finance.ts's adapted triage response — there
 * is no synthetic fallback.
 *
 * Portfolio Health (clickable-health.html) is a DELIBERATE exception,
 * staying on fixture data for now by Colby's explicit decision — see
 * docs/adr/0015-live-finance-domain-and-dynamic-holdings.md. Don't
 * remove or "live-ify" the section below without a new ADR.
 *
 * Guardrail carried forward unchanged: no buy/sell/hold language, no
 * bare rating/score without its basis shown, sentiment/signals framed
 * as information, never a directive.
 */

// ---------------------------------------------------------------------------
// Triage inbox — shape only; data comes from lib/live-finance.ts
// ---------------------------------------------------------------------------

export type TriageStatus = "act" | "watch" | "none";

export interface TriageHolding {
  ticker: string;
  status: TriageStatus;
  headline: string;
  summary?: string;
  reason?: string;
  trend: number[];
  /** Flips client-side when "Mark reviewed" is clicked — no
   * persistence back to the backend yet. */
  reviewed: boolean;
  color: string;
}

// ---------------------------------------------------------------------------
// Portfolio Health (clickable-health.html) — fixture data, by design.
// portfolio-health/page.tsx is the only consumer of everything below.
// ---------------------------------------------------------------------------

export type Timeframe = "1D" | "1W" | "1M" | "YTD" | "1Y";

export interface HealthHolding {
  ticker: string;
  weight: number;
  price: number;
  d1: number;
  ytd: number;
  trend: number[];
  color: string;
}

export const healthHoldings: HealthHolding[] = [
  { ticker: "NVDA", weight: 9.8, price: 487.32, d1: 1.8, ytd: 62.4, trend: [40, 42, 38, 44, 48, 45, 50, 52], color: "var(--green)" },
  { ticker: "AAPL", weight: 14.2, price: 228.14, d1: -0.6, ytd: 11.2, trend: [60, 58, 59, 55, 56, 52, 53, 49], color: "#60a5fa" },
  { ticker: "MSFT", weight: 6.3, price: 412.77, d1: 0.2, ytd: 19.8, trend: [70, 71, 69, 70, 68, 69, 67, 68], color: "#38bdf8" },
  { ticker: "VTI", weight: 22.0, price: 271.05, d1: 0.4, ytd: 17.1, trend: [268, 269, 270, 271, 270, 272, 273, 274], color: "var(--swatch-neutral-1)" },
  { ticker: "VXUS", weight: 9.0, price: 61.88, d1: -0.1, ytd: 9.4, trend: [48, 47, 48, 49, 48, 49, 50, 49], color: "var(--swatch-neutral-2)" },
  { ticker: "BND", weight: 8.5, price: 72.41, d1: -0.3, ytd: -1.8, trend: [50, 49, 48, 47, 48, 46, 45, 44], color: "var(--ink-faint)" },
  { ticker: "Cash", weight: 3.0, price: 1.0, d1: 0.0, ytd: 4.9, trend: [1, 1, 1, 1, 1, 1, 1, 1], color: "#3f454d" },
];

export const healthQueueStatus: Record<string, "Act" | "Watch"> = {
  NVDA: "Act",
  AAPL: "Act",
  MSFT: "Watch",
  BND: "Watch",
};

export interface TimeframeSeries {
  value: number;
  changeAbs: number;
  changePct: number;
  path: number[];
}

export const benchmarkPath: number[] = [118400, 119200, 117800, 120100, 121400, 119900, 122600, 123300, 121800, 124200, 123600, 124850];

export const portfolioByTimeframe: Record<Timeframe, TimeframeSeries> = {
  "1D": { value: 124850, changeAbs: 480, changePct: 0.39, path: [124370, 124410, 124290, 124520, 124700, 124610, 124850] },
  "1W": { value: 124850, changeAbs: 1210, changePct: 0.98, path: [123640, 123900, 123500, 124100, 124400, 124250, 124850] },
  "1M": { value: 124850, changeAbs: 3920, changePct: 3.24, path: [120930, 121500, 119800, 122100, 123400, 122900, 124850] },
  "YTD": {
    value: 124850,
    changeAbs: 15210,
    changePct: 13.86,
    path: [109640, 111200, 108900, 113400, 116200, 114800, 118600, 120100, 117400, 121900, 123100, 124850],
  },
  "1Y": {
    value: 124850,
    changeAbs: 19640,
    changePct: 18.66,
    path: [105210, 108400, 103900, 110200, 107600, 112300, 116800, 114100, 119500, 121800, 118900, 124850],
  },
};

export const riskContext = {
  diversificationScore: "61 / 100",
  volatility30d: "14.2%",
  maxDrawdown1y: "-18.4%",
  note: "Describes how the portfolio has behaved, not what to do — see the triage inbox for evidence-based flags.",
};
