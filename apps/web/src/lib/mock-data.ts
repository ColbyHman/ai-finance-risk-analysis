// Mock data for the Finance Copilot POC.
// This is entirely synthetic — no real portfolio, market, or client data.
//
// Holdings: NVDA, MSFT, AAPL, VTI, VXUS, BND, and cash — see
// docs/adr/0010-research-copilot-reframe.md and
// docs/adr/0012-scope-narrowing.md (the old risk-dashboard/retirement
// -planning pages that previously lived alongside this data were
// removed; this file was trimmed to only what the remaining Inbox and
// Portfolio Health pages actually use).

// ---------------------------------------------------------------------------
// Persona — who this portfolio belongs to. Only currentBalance is
// currently read (by lib/triage.ts's relevance-ranking), kept as one
// object rather than a bare number since it's a single coherent
// concept.
// ---------------------------------------------------------------------------

export interface Persona {
  age: number;
  retirementAge: number;
  currentBalance: number;
  monthlyContribution: number;
  goalAtRetirement: number;
}

export const persona: Persona = {
  age: 25,
  retirementAge: 65,
  currentBalance: 18000,
  monthlyContribution: 600,
  goalAtRetirement: 1500000,
};

// ---------------------------------------------------------------------------
// Shared signal types — news, sentiment, tax-lot flags. Feed into
// DigestInput below. See docs/adr/0010 for the "always show the
// basis, never a bare score" rule these are built around.
// ---------------------------------------------------------------------------

export interface NewsDigestEntry {
  ticker: string;
  headline: string;
  /** What changed since the last time someone looked — a summary of
   * the underlying coverage, not a raw headline list and not a take
   * on what it means for the position. */
  summary: string;
  timestamp: string;
  /** How many distinct sources contributed to this summary — a volume
   * signal, not a credibility score. */
  sourceCount: number;
}

export type SentimentDirection = "improving" | "deteriorating" | "stable";
export type SentimentMagnitude = "slight" | "moderate" | "pronounced";

export interface SentimentSignal {
  ticker: string;
  direction: SentimentDirection;
  magnitude: SentimentMagnitude;
  /** Where this read comes from — e.g. "analyst commentary tone",
   * "social chatter volume". Always shown alongside the signal so it
   * never reads as a bare, unexplained score. */
  basis: string;
  /** One sentence of why the basis moved, expandable detail — the
   * "reasoning trail" ADR 0010 requires for every signal. */
  detail: string;
}

export type TaxLotFlagType = "long-term-in-days" | "wash-sale-risk";

export interface TaxLotFlag {
  ticker: string;
  lotId: string;
  type: TaxLotFlagType;
  /** Plain-English statement of the timing fact — never phrased as
   * "you should sell/hold this lot." */
  detail: string;
  dueDate: string;
  daysUntilDue: number;
}

// ---------------------------------------------------------------------------
// Digest inputs — raw per-holding signals that lib/digest.ts's pure
// ranking function turns into a relevanceScore for the triage inbox
// and portfolio-level signals. See docs/adr/0010.
// ---------------------------------------------------------------------------

export interface DigestInput {
  ticker: string;
  name: string;
  /** Dollar exposure — drives the position-size factor in the
   * relevance-ranking function (see lib/digest.ts). */
  positionValue: number;
  news: NewsDigestEntry;
  sentiment: SentimentSignal;
  taxFlag?: TaxLotFlag;
  /** 0-1, illustrative — how much this holding contributes to the
   * portfolio's concentration/diversification risk. Feeds the
   * diversification-impact factor in the relevance score, it is not
   * itself a rating of the security. */
  diversificationImpact: number;
}

// Fixed "as of" reference time for the digest ranking — matches the
// era of the news/sentiment timestamps below, so recency decays
// deterministically regardless of the real wall-clock date the app
// happens to be viewed on.
export const digestReferenceTimestamp = "2026-11-07 12:00 UTC";

// Raw inputs for the portfolio-wide "what changed" feed — ranking
// (relevanceScore, sort order) is computed by lib/digest.ts, not
// hardcoded here. See docs/adr/0010-research-copilot-reframe.md.
export const digestInputs: DigestInput[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    positionValue: 1800,
    news: {
      ticker: "NVDA",
      headline: "Cloud customers raised capex guidance, citing AI accelerator demand",
      summary:
        "Several major cloud providers raised full-year capital-expenditure guidance over the past week, with multiple analyst notes attributing a meaningful share of the increase to AI accelerator purchases. Nothing about this holding's position size or allocation has changed — this is coverage volume and tone, not a position event.",
      timestamp: "2026-11-06 14:20 UTC",
      sourceCount: 17,
    },
    sentiment: {
      ticker: "NVDA",
      direction: "improving",
      magnitude: "moderate",
      basis: "analyst commentary tone",
      detail:
        "Tone across sell-side notes referencing NVDA shifted more positive over the trailing 5 trading days, tracking the capex-guidance coverage above. This reflects a shift in how commentary is framed, not a price target, rating, or buy/sell call tracked here.",
    },
    taxFlag: {
      ticker: "NVDA",
      lotId: "NVDA-LOT-2",
      type: "long-term-in-days",
      detail:
        "The lot opened 2025-11-19 crosses the one-year holding mark in 12 days, at which point any future sale of this specific lot would be taxed under long-term rather than short-term capital gains rules. A timing fact about this lot, not a suggestion to act on it.",
      dueDate: "2026-11-19",
      daysUntilDue: 12,
    },
    diversificationImpact: 0.95,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    positionValue: 1440,
    news: {
      ticker: "MSFT",
      headline: "Cloud/AI-platform revenue mix drew renewed analyst attention ahead of earnings",
      summary:
        "Coverage over the past two weeks has focused on the growing share of revenue tied to cloud infrastructure and AI-platform services, ahead of the next scheduled earnings report. Several notes compared this mix shift to peers without a clear consensus view on its significance.",
      timestamp: "2026-11-05 09:45 UTC",
      sourceCount: 11,
    },
    sentiment: {
      ticker: "MSFT",
      direction: "stable",
      magnitude: "slight",
      basis: "analyst commentary tone",
      detail:
        "Commentary tone has been mixed and roughly balanced over the trailing 2 weeks — no clear positive or negative tilt, just elevated volume ahead of earnings.",
    },
    taxFlag: {
      ticker: "MSFT",
      lotId: "MSFT-LOT-1",
      type: "wash-sale-risk",
      detail:
        "A different MSFT lot sold at a loss on 2026-10-14 was followed by this lot's purchase on 2026-10-29, inside the 30-day wash-sale window. Under IRS wash-sale rules that loss may be disallowed for the current tax year. A timing/recordkeeping fact to be aware of, not tax advice — consult a tax professional for how this applies to a real return.",
      dueDate: "2026-11-13",
      daysUntilDue: 6,
    },
    diversificationImpact: 0.85,
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    positionValue: 2160,
    news: {
      ticker: "AAPL",
      headline: "Services-segment commentary ahead of the next earnings window",
      summary:
        "Coverage over the past week has centered on services-segment growth expectations heading into the next earnings report, with a handful of notes also referencing softer unit-volume estimates for hardware. Volume of coverage is in line with Apple's typical pre-earnings pattern.",
      timestamp: "2026-11-04 11:10 UTC",
      sourceCount: 9,
    },
    sentiment: {
      ticker: "AAPL",
      direction: "stable",
      magnitude: "slight",
      basis: "social chatter volume",
      detail:
        "Retail/social discussion volume about AAPL is essentially flat versus the trailing 90-day average — no notable spike or drop in how often this name comes up.",
    },
    diversificationImpact: 0.8,
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    positionValue: 5400,
    news: {
      ticker: "VTI",
      headline: "Broad-market fund flows and sector-weighting commentary",
      summary:
        "Coverage this period has been mostly about broad US-equity fund flows and index-provider commentary on sector weighting drift, rather than anything specific to this fund. Technology's weight within the index has ticked up slightly over the trailing quarter.",
      timestamp: "2026-11-03 16:00 UTC",
      sourceCount: 6,
    },
    sentiment: {
      ticker: "VTI",
      direction: "stable",
      magnitude: "slight",
      basis: "analyst commentary tone",
      detail:
        "Commentary volume specific to this fund is low and tone has been neutral — most of what's circulating is broad-market, not fund-specific.",
    },
    taxFlag: {
      ticker: "VTI",
      lotId: "VTI-LOT-1",
      type: "long-term-in-days",
      detail:
        "This lot (opened 2025-12-02) crosses the one-year holding mark in 25 days. A timing fact about this lot, not a suggestion to act on it.",
      dueDate: "2026-12-02",
      daysUntilDue: 25,
    },
    diversificationImpact: 0.55,
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    positionValue: 2700,
    news: {
      ticker: "VXUS",
      headline: "International-markets commentary following a multi-week relative move",
      summary:
        "International developed and emerging markets have outpaced US markets over the trailing 6 weeks, drawing renewed commentary on international valuations relative to the US. Nothing specific to this fund's holdings has changed.",
      timestamp: "2026-11-02 08:30 UTC",
      sourceCount: 8,
    },
    sentiment: {
      ticker: "VXUS",
      direction: "improving",
      magnitude: "slight",
      basis: "analyst commentary tone",
      detail:
        "Commentary on international-equity valuations has leaned modestly more constructive over the past 6 weeks, in step with the relative-performance move described above.",
    },
    diversificationImpact: 0.2,
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    positionValue: 3600,
    news: {
      ticker: "BND",
      headline: "Rate-path commentary following recent economic data",
      summary:
        "Recent economic data releases shifted market expectations for the pace of future rate changes, which commentary has tied to bond-fund price moves over the past two weeks. This fund's holdings and duration profile haven't changed.",
      timestamp: "2026-11-01 13:15 UTC",
      sourceCount: 10,
    },
    sentiment: {
      ticker: "BND",
      direction: "deteriorating",
      magnitude: "slight",
      basis: "analyst commentary tone",
      detail:
        "Commentary tone around near-term bond-price moves has leaned modestly more cautious over the past two weeks, tracking the rate-path data referenced above — a tone read on short-term price-moving commentary, not a credit or default signal.",
    },
    diversificationImpact: 0.1,
  },
];
