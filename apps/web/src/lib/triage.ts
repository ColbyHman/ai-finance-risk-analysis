/**
 * Triage inbox / Portfolio Health / holding-detail data — the final
 * visual implementation of docs/adr/0010-research-copilot-reframe.md,
 * per docs/adr/0011-triage-inbox-visual-implementation.md.
 *
 * All synthetic (ADR 0001). Content below is copied verbatim from the
 * approved clickable mockups (design/mockups/clickable-triage.html,
 * clickable-health.html, clickable-detail.html) — this file exists so
 * the real React routes read from typed data instead of re-deriving
 * copy, not to invent new facts. See those files for the literal
 * source of every string/number here.
 *
 * Guardrail carried forward unchanged: no buy/sell/hold language, no
 * bare rating/score without its basis shown, sentiment/signals framed
 * as information, never a directive.
 */

import { computeRelevanceScore } from "./digest";
import { digestInputs, digestReferenceTimestamp, persona } from "./mock-data";

// ---------------------------------------------------------------------------
// Triage inbox (clickable-triage.html)
// ---------------------------------------------------------------------------

export type TriageStatus = "act" | "watch" | "none";

export interface TriageHolding {
  ticker: string;
  weight: number;
  status: TriageStatus;
  headline: string;
  summary?: string;
  reason?: string;
  trend: number[];
  /** Initial reviewed state — the "Mark reviewed" button flips this
   * client-side only, no persistence (POC). */
  reviewed: boolean;
  color: string;
}

export const triageHoldings: TriageHolding[] = [
  {
    ticker: "NVDA",
    weight: 9.8,
    status: "act",
    headline: "Two Form 4 insider sales this week, first since Q1",
    summary:
      "A cluster of director-level sales filed Tuesday, plus continued strong data-center order chatter. The insider activity is new; the demand story is unchanged.",
    reason: "New insider-selling cluster — thesis-relevant, not yet reflected in price",
    trend: [40, 42, 38, 44, 48, 45, 50, 52],
    reviewed: false,
    color: "#4ade80",
  },
  {
    ticker: "AAPL",
    weight: 14.2,
    status: "act",
    headline: "Two analyst downgrades cite China demand softness",
    summary:
      "Services revenue beat consensus, but two independent sell-side notes this week flagged a multi-quarter China risk.",
    reason: "First negative analyst consensus shift in 5 months",
    trend: [60, 58, 59, 55, 56, 52, 53, 49],
    reviewed: false,
    color: "#60a5fa",
  },
  {
    ticker: "MSFT",
    weight: 6.3,
    status: "watch",
    headline: "Azure growth deceleration flagged in two outlets, unconfirmed by filings",
    summary:
      "Secondary reporting suggests Azure growth may be slowing. Single-sourced so far — worth watching, not acting on.",
    reason: "Unverified single-source claim — watch for confirmation",
    trend: [70, 71, 69, 70, 68, 69, 67, 68],
    reviewed: false,
    color: "#38bdf8",
  },
  {
    ticker: "BND",
    weight: 8.5,
    status: "watch",
    headline: "Fed minutes lean toward a slower rate-cut path",
    summary:
      "Affects duration risk across the bond sleeve. No fund-specific news — flagged because it's the dominant risk driver this month.",
    reason: "Macro/rate driver, not fund-specific — portfolio-level relevance",
    trend: [50, 49, 48, 47, 48, 46, 45, 44],
    reviewed: false,
    color: "#9ba3ab",
  },
  {
    ticker: "VTI",
    weight: 22.0,
    status: "none",
    headline: "No notable news this week",
    reviewed: true,
    trend: [50, 50, 50, 50, 50, 50, 50, 50],
    color: "#f4f4f4",
  },
  {
    ticker: "VXUS",
    weight: 9.0,
    status: "none",
    headline: "No notable news this week",
    reviewed: true,
    trend: [50, 50, 50, 50, 50, 50, 50, 50],
    color: "#6b7280",
  },
  {
    ticker: "Cash",
    weight: 3.0,
    status: "none",
    headline: "Not applicable",
    reviewed: true,
    trend: [50, 50, 50, 50, 50, 50, 50, 50],
    color: "#3f454d",
  },
];

/** Relevance score attached for reference/ordering within a status
 * group — reuses lib/digest.ts's pure ranking function rather than
 * re-deriving a second scoring scheme. Falls back to 0 for tickers
 * (BND, VTI, VXUS as "Cash" etc.) not present in digestInputs. */
export function withRelevance(holdings: TriageHolding[]): (TriageHolding & { relevanceScore: number })[] {
  const now = new Date(digestReferenceTimestamp.replace(" ", "T").replace(" UTC", "Z"));
  return holdings.map((h) => {
    const input = digestInputs.find((d) => d.ticker === h.ticker);
    const relevanceScore = input
      ? computeRelevanceScore(input, persona.currentBalance, now)
      : 0;
    return { ...h, relevanceScore };
  });
}

export interface PortfolioSignal {
  id: string;
  kind: "concentration" | "correlation";
  icon: string;
  title: string;
  text: string;
  tickers: string[];
}

export const portfolioSignals: PortfolioSignal[] = [
  {
    id: "signal-concentration",
    kind: "concentration",
    icon: "◭",
    title: "38% of equity exposure is tech — most of it hidden inside index funds",
    text: "NVDA and AAPL direct holdings are 24% combined, but VTI and VXUS carry meaningful tech weight on top of that.",
    tickers: ["NVDA", "AAPL", "VTI", "VXUS"],
  },
  {
    id: "signal-correlation",
    kind: "correlation",
    icon: "⇄",
    title: "This week's NVDA and MSFT news both trace back to the same AI-capex story",
    text: "Treat these as one correlated data point about data-center spending, not two independent confirmations.",
    tickers: ["NVDA", "MSFT"],
  },
];

export const triageRunLine = {
  summary: "Last run: 6 hours ago · 7 holdings checked · 1 fetch failure",
  asOf: "as of 10:42 AM ET",
};

export const triageDisclaimer =
  "This ranks and summarizes holdings by how much attention recent evidence suggests they need — it is not a recommendation to buy, sell, or hold anything. Every claim links to its source.";

// ---------------------------------------------------------------------------
// Portfolio Health (clickable-health.html)
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
  { ticker: "NVDA", weight: 9.8, price: 487.32, d1: 1.8, ytd: 62.4, trend: [40, 42, 38, 44, 48, 45, 50, 52], color: "#4ade80" },
  { ticker: "AAPL", weight: 14.2, price: 228.14, d1: -0.6, ytd: 11.2, trend: [60, 58, 59, 55, 56, 52, 53, 49], color: "#60a5fa" },
  { ticker: "MSFT", weight: 6.3, price: 412.77, d1: 0.2, ytd: 19.8, trend: [70, 71, 69, 70, 68, 69, 67, 68], color: "#38bdf8" },
  { ticker: "VTI", weight: 22.0, price: 271.05, d1: 0.4, ytd: 17.1, trend: [268, 269, 270, 271, 270, 272, 273, 274], color: "#f4f4f4" },
  { ticker: "VXUS", weight: 9.0, price: 61.88, d1: -0.1, ytd: 9.4, trend: [48, 47, 48, 49, 48, 49, 50, 49], color: "#9ba3ab" },
  { ticker: "BND", weight: 8.5, price: 72.41, d1: -0.3, ytd: -1.8, trend: [50, 49, 48, 47, 48, 46, 45, 44], color: "#6b7280" },
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

// ---------------------------------------------------------------------------
// Holding detail (clickable-detail.html) — one page per
// /securities/[ticker]. The richest new data: thesis, verdict,
// bull/bear with inline citations, catalysts, chronological timeline,
// confidence, what-couldn't-be-verified, and a per-citation source
// record for the "show your work" drawer.
// ---------------------------------------------------------------------------

export type VerdictType = "weakens" | "supports" | "neutral";
export type SourceQuality = "Primary filing" | "Major outlet" | "Social — unverified";
export type SourceTag = "primary" | "outlet" | "social";

export interface Source {
  title: string;
  outlet: string;
  date: string;
  quality: SourceQuality;
  excerpt: string;
  classification: string;
}

export interface TimelineItem {
  date: string;
  type: string;
  flagged: boolean;
  summary: string;
  cite: number;
  tag: SourceTag;
  tagLabel: string;
}

export interface HoldingDetail {
  ticker: string;
  name: string;
  weight: string;
  status: TriageStatus;
  confidence: string;
  headline: string;
  thesis: string;
  verdict: { type: VerdictType; label: string; reason: string };
  bull: [string, number][];
  bear: [string, number][];
  catalysts: [string, string][];
  timeline: TimelineItem[];
  cantVerify: string[];
  sources: Record<number, Source>;
}

export const holdingDetails: Record<string, HoldingDetail> = {
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    weight: "9.8%",
    status: "act",
    confidence: "Medium — based on 6 documents (1 filing, 3 news, 2 social).",
    headline: "Two Form 4 insider sales this week, first since Q1",
    thesis:
      "Core AI infrastructure holding for the data-center buildout cycle, held for 7+ years as a satellite growth position alongside the index-fund core. Valuation premium accepted as the cost of the exposure; thesis breaks if data-center capex growth decelerates structurally, not cyclically.",
    verdict: {
      type: "weakens",
      label: "Weakens — mildly",
      reason:
        "New insider-selling cluster doesn't contradict the capex thesis directly, but is the first signal this period worth tracking against it.",
    },
    bull: [
      ["Data-center order commentary held strong into next quarter", 1],
      ["No change in capex guidance from major cloud customers this period", 2],
    ],
    bear: [
      ["Two Form 4 filings show director-level sales this week, first cluster since Q1", 3],
      ["Retail chatter volume tripled vs. 30-day average — tone mixed, a crowding signal worth noting", 4],
    ],
    catalysts: [
      ["Feb 19", "Q4 earnings call (confirmed via IR calendar)"],
      ["Mar 02", "10-K filing due"],
      ["—", "No scheduled analyst day found this period"],
    ],
    timeline: [
      { date: "Nov 05", type: "Insider activity", flagged: true, summary: "Two Form 4 filings disclosed director-level stock sales, the first cluster since Q1.", cite: 3, tag: "primary", tagLabel: "Primary filing" },
      { date: "Nov 04", type: "Rumor / opinion", flagged: false, summary: "Retail chatter volume spiked 3x normal, tone split roughly evenly between bullish and cautious.", cite: 4, tag: "social", tagLabel: "Social — unverified" },
      { date: "Nov 02", type: "Macro / sector", flagged: false, summary: "Supply-chain checks reported continued data-center order strength into next quarter.", cite: 1, tag: "outlet", tagLabel: "Major outlet" },
    ],
    cantVerify: [
      "No earnings call transcript was available yet for forward-looking management commentary.",
      "The retail-chatter sentiment reading is based on public post volume only — no access to a licensed social-sentiment feed.",
      "Analyst rating changes were not fetched this period (deferred to a later live-mode pass).",
    ],
    sources: {
      1: { title: "Supply-chain checks point to steady data-center demand", outlet: "TechWire News", date: "Nov 2", quality: "Major outlet", excerpt: "\"Multiple contract manufacturers confirmed order volumes for data-center GPUs held steady into Q1, with no signs of the pull-forward unwind some analysts had flagged as a risk.\"", classification: "Event type: macro/sector · Materiality: 55/100 — relevant but not new information" },
      2: { title: "Cloud capex guidance unchanged in Q3 calls", outlet: "Company IR roundup", date: "Oct 29", quality: "Primary filing", excerpt: "\"Major cloud providers reiterated full-year capex guidance on their most recent earnings calls, with no downward revision.\"", classification: "Event type: earnings · Materiality: 40/100 — supportive but already priced in" },
      3: { title: "Form 4 — Statement of Changes in Beneficial Ownership", outlet: "SEC EDGAR", date: "Nov 5", quality: "Primary filing", excerpt: "\"Reporting person disposed of 42,000 shares on 11/03 pursuant to a Rule 10b5-1 trading plan adopted 8/15.\"", classification: "Event type: insider activity · Materiality: 60/100 — new signal, flagged for the thesis check" },
      4: { title: "r/stocks megathread + StockTwits volume spike", outlet: "Aggregated social", date: "Nov 4", quality: "Social — unverified", excerpt: "\"Post volume mentioning the ticker ran roughly 3.1x its 30-day average on Nov 4.\"", classification: "Event type: rumor/opinion · Materiality: 25/100 — crowding signal, not a thesis-relevant fact" },
    },
  },
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    weight: "14.2%",
    status: "act",
    confidence: "Medium — based on 4 documents (1 filing, 3 news).",
    headline: "Two analyst downgrades cite China demand softness",
    thesis:
      "Long-held core position, valued for durable services revenue growth and capital return. Thesis breaks if services growth stalls or if a multi-region demand slowdown becomes structural rather than a single-quarter wobble.",
    verdict: {
      type: "weakens",
      label: "Weakens — mildly",
      reason: "Services beat is reassuring, but two independent downgrades in one week is the first negative analyst consensus shift in 5 months.",
    },
    bull: [
      ["Q4 services revenue beat consensus by 3.1%, hardware roughly in line", 1],
      ["No change to buyback or dividend guidance", 2],
    ],
    bear: [
      ["Two sell-side notes this week flagged softer China unit demand as a multi-quarter risk", 3],
      ["First negative analyst consensus shift in 5 months", 4],
    ],
    catalysts: [
      ["Jan 28", "Q1 earnings call"],
      ["Feb 09", "10-Q filing due"],
    ],
    timeline: [
      { date: "Nov 05", type: "Earnings", flagged: false, summary: "Q4 services revenue beat consensus by 3.1%; hardware roughly in line with estimates.", cite: 1, tag: "primary", tagLabel: "Primary filing" },
      { date: "Nov 04", type: "Analyst rating", flagged: true, summary: "Second sell-side downgrade this week, both citing China unit demand softness as a multi-quarter concern.", cite: 3, tag: "outlet", tagLabel: "Major outlet" },
    ],
    cantVerify: [
      "Analyst price-target detail wasn't available in the fixture set, only the rating direction.",
      "China-specific unit sell-through data isn't independently verifiable from public filings alone.",
    ],
    sources: {
      1: { title: "Q4 earnings release", outlet: "Company IR", date: "Nov 5", quality: "Primary filing", excerpt: "\"Services revenue grew 14% year-over-year, ahead of consensus estimates of 11%.\"", classification: "Event type: earnings · Materiality: 50/100" },
      2: { title: "Capital return program update", outlet: "Company IR", date: "Nov 5", quality: "Primary filing", excerpt: "\"The Board authorized continuation of the existing buyback program with no changes to pace.\"", classification: "Event type: earnings · Materiality: 20/100" },
      3: { title: "Two downgrades cite China softness", outlet: "MarketWire", date: "Nov 4", quality: "Major outlet", excerpt: "\"Both notes pointed to channel checks suggesting softer-than-expected sell-through in the region.\"", classification: "Event type: analyst rating · Materiality: 60/100 — new negative signal" },
      4: { title: "Analyst consensus tracker", outlet: "Aggregated ratings feed", date: "Nov 4", quality: "Major outlet", excerpt: "\"Consensus rating moved from 'buy' leaning to 'hold' leaning for the first time since June.\"", classification: "Event type: analyst sentiment · Materiality: 45/100" },
    },
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    weight: "6.3%",
    status: "watch",
    confidence: "Low — single-sourced, no filing confirmation yet.",
    headline: "Azure growth deceleration flagged in two outlets, unconfirmed by filings",
    thesis:
      "Core cloud/enterprise software holding, thesis rests on durable Azure growth and AI-services monetization. Breaks if Azure growth decelerates structurally rather than a one-quarter compute capacity constraint.",
    verdict: {
      type: "neutral",
      label: "Neutral — unconfirmed",
      reason: "Single-sourced claim, not yet corroborated by a filing or earnings commentary. Watching, not weighting into the thesis yet.",
    },
    bull: [["No change to AI-services monetization commentary this period", 1]],
    bear: [["Two outlets independently reported possible Azure growth deceleration next quarter, citing unnamed sources", 2]],
    catalysts: [["Jan 23", "Q2 earnings call"]],
    timeline: [
      { date: "Nov 03", type: "Rumor / opinion", flagged: false, summary: "Two trade outlets reported anonymous-source claims of a possible Azure growth slowdown next quarter — not corroborated by any filing yet.", cite: 2, tag: "outlet", tagLabel: "Major outlet (unconfirmed)" },
    ],
    cantVerify: [
      "The Azure slowdown claim rests on anonymous sourcing in both outlets — no primary filing or management commentary confirms or denies it yet.",
      "No earnings call has occurred since the claim surfaced.",
    ],
    sources: {
      1: { title: "AI Copilot monetization update", outlet: "Company blog", date: "Oct 20", quality: "Primary filing", excerpt: "\"Copilot seat growth continued at a similar pace to last quarter, per the company's own disclosure.\"", classification: "Event type: product · Materiality: 15/100" },
      2: { title: "Sources say Azure growth may slow", outlet: "CloudWire / TechInsider (two outlets)", date: "Nov 3", quality: "Major outlet", excerpt: "\"Two people familiar with the matter, speaking anonymously, said capacity constraints could slow Azure's reported growth rate next quarter.\"", classification: "Event type: macro/sector · Materiality: 50/100 — unconfirmed, single-sourced per outlet" },
    },
  },
  BND: {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    weight: "8.5%",
    status: "watch",
    confidence: "Medium — macro-driven, fund-level.",
    headline: "Fed minutes lean toward a slower rate-cut path",
    thesis:
      "Duration/ballast sleeve of the portfolio, held to dampen equity volatility, not for yield maximization. Breaks only if the role itself (ballast) stops working, not from any single rate move.",
    verdict: {
      type: "neutral",
      label: "Neutral — macro, not fund-specific",
      reason: "This is a rate-path story affecting the entire bond sleeve, not something specific to this fund.",
    },
    bull: [["No credit-quality concerns — this is a duration story, not a credit story", 1]],
    bear: [["FOMC minutes leaned toward a slower cutting path than markets had priced", 2]],
    catalysts: [["Dec 18", "Next FOMC meeting"]],
    timeline: [
      { date: "Nov 01", type: "Macro / sector", flagged: false, summary: "FOMC minutes released this week leaned toward a slower rate-cutting path than markets had priced in, which weighs on long-duration bond funds specifically.", cite: 2, tag: "primary", tagLabel: "Primary (Fed minutes)" },
    ],
    cantVerify: ["This fund's actual effective duration this period wasn't in the fixture data, only the benchmark-level Fed commentary."],
    sources: {
      1: { title: "Fund fact sheet", outlet: "Vanguard", date: "Oct 1", quality: "Primary filing", excerpt: "\"The fund maintains broad exposure to investment-grade issuers, with no material allocation to below-investment-grade debt.\"", classification: "Event type: macro/sector · Materiality: 10/100" },
      2: { title: "FOMC minutes, November meeting", outlet: "Federal Reserve", date: "Nov 1", quality: "Primary filing", excerpt: "\"Several participants noted that a more gradual approach to policy easing may be appropriate given recent data.\"", classification: "Event type: macro/sector · Materiality: 55/100 — affects the whole bond sleeve" },
    },
  },
  VTI: {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    weight: "22.0%",
    status: "none",
    confidence: "High — broad index fund, low idiosyncratic risk.",
    headline: "No notable news this week",
    thesis: "Core broad-market equity exposure, the largest single position by design — this is the portfolio's foundation, not a satellite bet.",
    verdict: { type: "neutral", label: "Neutral — no change", reason: "Tracks its benchmark closely as expected; nothing this period changes that." },
    bull: [["Tracked its benchmark within normal variance this period", 1]],
    bear: [],
    catalysts: [],
    timeline: [{ date: "—", type: "No activity", flagged: false, summary: "No fund-level news this week.", cite: 1, tag: "primary", tagLabel: "Fund tracking data" }],
    cantVerify: [],
    sources: { 1: { title: "Fund tracking data", outlet: "Fund administrator", date: "Weekly", quality: "Primary filing", excerpt: "\"Tracking difference remained within the fund's typical range for the period.\"", classification: "Event type: macro/sector · Materiality: 5/100" } },
  },
  VXUS: {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    weight: "9.0%",
    status: "none",
    confidence: "High — broad index fund, low idiosyncratic risk.",
    headline: "No notable news this week",
    thesis: "International diversification sleeve — reduces home-country concentration relative to a US-only equity book.",
    verdict: { type: "neutral", label: "Neutral — no change", reason: "No fund-level events this period." },
    bull: [["Continues to provide non-US diversification as designed", 1]],
    bear: [],
    catalysts: [],
    timeline: [{ date: "—", type: "No activity", flagged: false, summary: "No fund-level news this week.", cite: 1, tag: "primary", tagLabel: "Fund tracking data" }],
    cantVerify: [],
    sources: { 1: { title: "Fund tracking data", outlet: "Fund administrator", date: "Weekly", quality: "Primary filing", excerpt: "\"Tracking difference remained within the fund's typical range for the period.\"", classification: "Event type: macro/sector · Materiality: 5/100" } },
  },
  Cash: {
    ticker: "Cash",
    name: "Cash",
    weight: "3.0%",
    status: "none",
    confidence: "Not applicable.",
    headline: "Not applicable — cash position",
    thesis: "Held for rebalancing flexibility and as dry powder, not an investment position with a thesis to check.",
    verdict: { type: "neutral", label: "N/A", reason: "Nothing to triage for a cash position." },
    bull: [],
    bear: [],
    catalysts: [],
    timeline: [],
    cantVerify: [],
    sources: {},
  },
};
