// Mock data for the AI Finance Risk Analysis POC dashboard.
// This is entirely synthetic — no real portfolio, market, or client data.
//
// Modeled as one hypothetical early-career retirement investor — see
// docs/adr/0009-retirement-persona-and-projection.md. ~$18,000 across 7
// holdings: a broad US index fund, three individual mega-cap tech
// stocks, an international index fund, a bond fund, and cash — the
// same allocation percentages as the earlier general-personal-investor
// version (ADR 0008), just resized to this persona's actual balance.

export type RiskLevel = "low" | "medium" | "high" | "critical";

// ---------------------------------------------------------------------------
// Persona & modeling assumptions — the one place every number on every
// page traces back to. See docs/adr/0009 for why these specific figures
// and why the simplifications below (one blended return/volatility for
// the whole portfolio, not a full covariance-matrix simulation) are
// reasonable for an educational tool, not a real financial model.
// ---------------------------------------------------------------------------

export interface Persona {
  age: number;
  retirementAge: number;
  currentBalance: number;
  monthlyContribution: number;
  goalAtRetirement: number;
}

// All five fields are deliberately adjustable — the retirement
// projection view's sliders change retirementAge and
// monthlyContribution live; this object is just the starting point.
export const persona: Persona = {
  age: 25,
  retirementAge: 65,
  currentBalance: 18000,
  monthlyContribution: 600,
  goalAtRetirement: 1500000,
};

export interface AssetClassAssumption {
  assetClass: string;
  expectedRealReturn: number; // annual, decimal (e.g. 0.07 = 7%/yr above inflation)
  volatility: number; // annual standard deviation, decimal
  expenseRatio: number; // annual, decimal
  weight: number; // portfolio weight, decimal — sums to 1 across this array
}

// Expected returns are REAL (inflation-adjusted) long-run averages, not
// a forecast of any particular year. Individual stocks are assigned
// the same long-run equity return as the index funds (nobody can
// forecast a specific company's alpha over 40 years) but meaningfully
// higher volatility, reflecting realized single-stock behavior.
export const assetClassAssumptions: AssetClassAssumption[] = [
  { assetClass: "US Equity — Index Fund", expectedRealReturn: 0.07, volatility: 0.15, expenseRatio: 0.0003, weight: 0.3 },
  { assetClass: "US Equity — Individual Stocks", expectedRealReturn: 0.07, volatility: 0.32, expenseRatio: 0, weight: 0.3 },
  { assetClass: "International Equity", expectedRealReturn: 0.065, volatility: 0.17, expenseRatio: 0.0008, weight: 0.15 },
  { assetClass: "Fixed Income", expectedRealReturn: 0.02, volatility: 0.05, expenseRatio: 0.0003, weight: 0.2 },
  { assetClass: "Cash & Equivalents", expectedRealReturn: 0.0, volatility: 0.01, expenseRatio: 0, weight: 0.05 },
];

export interface PortfolioAssumptions {
  blendedRealReturn: number;
  blendedVolatility: number;
  blendedExpenseRatio: number;
  inflation: number;
  seed: number;
  pathCount: number;
}

// blendedRealReturn and blendedExpenseRatio are the weighted average of
// assetClassAssumptions above (computed once here, not re-derived at
// render time, so this file is the single source of truth a reader can
// check by hand). blendedVolatility is NOT a weighted average — it is
// a single portfolio-level figure chosen to be lower than a naive
// weighted average would produce (equities don't move in lockstep),
// consistent with a ~75/20/5 equity/bond/cash portfolio's historical
// behavior. This is the projection's biggest deliberate simplification:
// one blended return and one blended volatility for the whole
// portfolio, not a full covariance-matrix Monte Carlo. See ADR 0009.
export const portfolioAssumptions: PortfolioAssumptions = {
  blendedRealReturn: 0.0558,
  blendedVolatility: 0.14,
  blendedExpenseRatio: 0.00027,
  inflation: 0.025,
  seed: 42,
  pathCount: 2000,
};

export interface DrawdownScenario {
  id: string;
  label: string;
  dateRange: string;
  /** Peak-to-trough decline for THIS persona's actual allocation —
   * not a generic 60/40 benchmark. Negative, decimal (e.g. -0.37). */
  peakToTroughPct: number;
  recoveryMonths: number;
  note: string;
}

// Illustrative figures for a ~75% equity / 20% bond / 5% cash
// portfolio with this persona's specific technology concentration —
// not a precise backtest of these exact tickers (several didn't exist
// in their current form in 2008). 2022 is deliberately worse than a
// generic diversified portfolio of the same allocation would have
// been: it was the one period where growth/tech stocks fell harder
// than the broad market AND bonds fell too (rising-rate environment),
// so neither the tech-heavy equity sleeve nor the bond sleeve cushioned
// the way they normally would. See docs/adr/0009.
export const drawdownScenarios: DrawdownScenario[] = [
  {
    id: "2008",
    label: "2008 Global Financial Crisis",
    dateRange: "Oct 2007 – Mar 2009",
    peakToTroughPct: -0.37,
    recoveryMonths: 30,
    note: "A broad, systemic crisis — equities and bonds both eventually contributed to the recovery as rates fell. The longest and deepest of the three, but also the most 'textbook': diversification worked roughly as expected.",
  },
  {
    id: "2020",
    label: "2020 COVID Crash",
    dateRange: "Feb – Mar 2020",
    peakToTroughPct: -0.24,
    recoveryMonths: 4,
    note: "Sharp and fast — the shortest drawdown of the three by far. A portfolio that panic-sold near the bottom would have missed nearly all of a recovery that happened within months.",
  },
  {
    id: "2022",
    label: "2022 Rate-Hike Bear Market",
    dateRange: "Jan – Oct 2022",
    peakToTroughPct: -0.29,
    recoveryMonths: 17,
    note: "The scenario where this portfolio's specific composition made things worse than a generic diversified portfolio: high-growth tech names (NVDA included) fell harder than the broad market, and bonds fell too as rates rose — the usual equity/bond cushion didn't show up this time.",
  },
];

export interface ComparisonPersona {
  age: number;
  retirementAge: number;
  currentBalance: number;
  label: string;
}

// A hypothetical pre-retiree, same blended return/volatility
// assumptions as the main persona for a clean apples-to-apples shock
// comparison — a real 58-year-old would typically hold a more
// conservative mix than this (more bonds, less single-stock tech),
// which would blunt a drawdown like 2022 somewhat. Keeping the
// assumptions identical isolates the one variable this comparison is
// actually about: time horizon, not allocation. See docs/adr/0009.
export const preRetireeComparison: ComparisonPersona = {
  age: 58,
  retirementAge: 65,
  currentBalance: 650000,
  label: "Hypothetical 58-year-old pre-retiree",
};

export interface SuggestedAction {
  id: string;
  title: string;
  rationale: string;
  techExposureBeforePct: number;
  techExposureAfterPct: number;
  /** 10th-percentile (pessimistic) projected balance at retirement,
   * before and after — same Monte Carlo engine as /retirement, run
   * with the adjusted allocation's own blended return/volatility (or
   * adjusted contribution, for the contribution-bump action). Figures
   * below are pre-computed, not live-recalculated in the UI — see
   * docs/adr/0009 for the exact assumption changes behind each one. */
  p10Before: number;
  p10After: number;
  caveat?: string;
}

// Each action changes exactly one lever so its effect is attributable.
// Allocation-change actions recompute the portfolio's blended return
// and volatility from assetClassAssumptions using the same methodology
// as portfolioAssumptions (naive weighted average, scaled down by the
// same diversification discount factor derived from the baseline) -
// see docs/adr/0009 for the worked arithmetic.
export const suggestedActions: SuggestedAction[] = [
  {
    id: "trim-nvda",
    title: "Trim NVDA from 10% to 5%, move the other 5% into VXUS",
    rationale:
      "The single biggest lever on tail risk: NVDA alone is the most volatile holding in the portfolio. Halving it and redirecting into an already-held, much more diversified fund lowers both the single-stock concentration flag and the portfolio's overall volatility — without reducing expected return (international and US equity carry a similar long-run return assumption here).",
    techExposureBeforePct: 41,
    techExposureAfterPct: 36,
    p10Before: 433556,
    p10After: 452944,
  },
  {
    id: "raise-international",
    title: "Raise international allocation: trim VTI 30% → 25%, VXUS 15% → 20%",
    rationale:
      "Brings international allocation closer to the commonly-cited 20-30% guideline without touching the individual stock positions. The effect on this page's projection is small — by design, this simplified model uses one blended volatility for the whole portfolio and can't fully credit the diversification benefit of holding assets that don't move in lockstep with the US market. In practice this action's main benefit (reducing US-market concentration risk) is understated here, not absent.",
    techExposureBeforePct: 41,
    techExposureAfterPct: 40,
    p10Before: 433556,
    p10After: 427303,
    caveat:
      "This model can't fully capture cross-market diversification benefit — treat this one as directionally sound but understated by the projection.",
  },
  {
    id: "raise-contribution",
    title: "Raise monthly contribution from $600 to $750 (+$150/mo)",
    rationale:
      "Doesn't touch the allocation or its risk profile at all — pure savings-rate lever. Of the three actions here, this one moves the 10th-percentile (pessimistic-case) outcome the most, because it compounds for 40 years regardless of which years are good or bad.",
    techExposureBeforePct: 41,
    techExposureAfterPct: 41,
    p10Before: 433556,
    p10After: 531509,
  },
];

export interface FeeDragProjection {
  years: number;
  blendedExpenseRatioPct: number;
  withoutFees: number;
  withFees: number;
  cost: number;
}

// Deterministic (median-path growth rate, not a second Monte Carlo) -
// see projection.ts's feeDragOverHorizon. This portfolio's blended
// expense ratio is low (index funds here are all sub-0.1%, individual
// stocks and cash carry none) — the point isn't that these specific
// funds are expensive, it's that even a genuinely low-cost portfolio
// loses real money to fees once compounded over 40 years.
export const feeDragProjection: FeeDragProjection = {
  years: 40,
  blendedExpenseRatioPct: 0.027,
  withoutFees: 1217216,
  withFees: 1208262,
  cost: 8954,
};

export interface SummaryMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  tone: "good" | "bad" | "neutral";
}

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Portfolio Risk Score",
    value: "57 / 100",
    delta: "+3 vs. last week",
    trend: "up",
    tone: "bad",
  },
  {
    label: "Estimated 1-Day Value at Risk (95%)",
    value: "$325",
    delta: "+$23",
    trend: "up",
    tone: "bad",
  },
  {
    label: "Annualized Volatility",
    value: "15.8%",
    delta: "-0.4pt",
    trend: "down",
    tone: "good",
  },
  {
    label: "AI Model Confidence",
    value: "91%",
    delta: "steady",
    trend: "flat",
    tone: "neutral",
  },
];

export interface ExposureSlice {
  assetClass: string;
  exposurePct: number;
  riskScore: number;
}

// Asset-class allocation looks diversified at a glance — five classes,
// seven holdings, a standard equity/bond/cash split. The point of the
// diversification-risk view (docs/adr/0008) is that this view alone
// hides how much of "US Equity — Individual Stocks" and "US Equity —
// Index Fund" actually overlap in the same sector.
export const exposureByAssetClass: ExposureSlice[] = [
  { assetClass: "US Equity — Index Fund", exposurePct: 30, riskScore: 58 },
  { assetClass: "US Equity — Individual Stocks", exposurePct: 30, riskScore: 79 },
  { assetClass: "International Equity", exposurePct: 15, riskScore: 48 },
  { assetClass: "Fixed Income", exposurePct: 20, riskScore: 34 },
  { assetClass: "Cash & Equivalents", exposurePct: 5, riskScore: 4 },
];

export interface TrendPoint {
  date: string;
  riskScore: number;
  var95: number;
}

// var95 is in plain dollars — a personal-portfolio scale ($18K total),
// not the $K/$M scale an institutional book would use.
export const riskTrend: TrendPoint[] = [
  { date: "Oct 01", riskScore: 49, var95: 276 },
  { date: "Oct 05", riskScore: 51, var95: 288 },
  { date: "Oct 09", riskScore: 48, var95: 270 },
  { date: "Oct 13", riskScore: 53, var95: 300 },
  { date: "Oct 17", riskScore: 55, var95: 312 },
  { date: "Oct 21", riskScore: 54, var95: 306 },
  { date: "Oct 25", riskScore: 57, var95: 325 },
];

export interface RiskContributor {
  ticker: string;
  name: string;
  assetClass: string;
  exposure: string;
  riskScore: number;
  aiConfidence: number;
  level: RiskLevel;
}

export const topRiskContributors: RiskContributor[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$1,800",
    riskScore: 85,
    aiConfidence: 91,
    level: "high",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$2,160",
    riskScore: 68,
    aiConfidence: 88,
    level: "medium",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$1,440",
    riskScore: 64,
    aiConfidence: 87,
    level: "medium",
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetClass: "US Equity — Index Fund",
    exposure: "$5,400",
    riskScore: 58,
    aiConfidence: 93,
    level: "medium",
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    assetClass: "International Equity",
    exposure: "$2,700",
    riskScore: 46,
    aiConfidence: 85,
    level: "low",
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetClass: "Fixed Income",
    exposure: "$3,600",
    riskScore: 34,
    aiConfidence: 90,
    level: "low",
  },
  {
    ticker: "CASH",
    name: "Cash & Money Market",
    assetClass: "Cash & Equivalents",
    exposure: "$900",
    riskScore: 4,
    aiConfidence: 99,
    level: "low",
  },
];

export interface AnomalyAlert {
  id: string;
  title: string;
  /** Plain-English meaning — no jargon, no acronyms without context. */
  whatItMeans: string;
  /** Specifically why this matters (or doesn't, as much) at THIS
   * persona's 40-year horizon — not a generic risk-management line. */
  whyItMattersForHorizon: string;
  /** The actual holdings/weights/numbers driving the flag. */
  whatsDrivingIt: string;
  severity: RiskLevel;
  detectedAt: string;
  model: string;
}

export const anomalyAlerts: AnomalyAlert[] = [
  {
    id: "alert-1",
    title: "Effective technology-sector exposure above 40% of portfolio",
    whatItMeans:
      "Forty-one cents of every dollar in this portfolio is effectively riding on the technology sector once index funds are unpacked into their own sector weightings — even though the account looks diversified at a glance (7 holdings, 5 asset classes).",
    whyItMattersForHorizon:
      "At 40 years out, a few bad years for tech are recoverable — the retirement projection already factors in this level of volatility. What matters is that the portfolio's real bet is narrower than '7 holdings, 5 asset classes' suggests, so the odds shown on the projection page assume this concentration, not a lower one.",
    whatsDrivingIt:
      "VTI's own ~30% technology weighting plus VXUS's smaller tech sleeve, plus AAPL, NVDA, and MSFT held directly (30% of the whole portfolio combined).",
    severity: "high",
    detectedAt: "2026-10-25 09:14 UTC",
    model: "sector-lookthrough-v2",
  },
  {
    id: "alert-2",
    title: "Single-stock concentration: NVDA above typical guidance",
    whatItMeans:
      "One company — NVIDIA — makes up 10% of the entire portfolio, more than double the 5% ceiling commonly cited as a starting point for single-stock positions.",
    whyItMattersForHorizon:
      "A single company's fortunes (a bad product cycle, a lost customer, new competition) can swing this portfolio's trajectory more than a 40-year retirement plan would ideally depend on — even though NVDA specifically has performed well recently. The scenario replay's 2022 drawdown is the concrete version of this risk.",
    whatsDrivingIt:
      "NVDA direct holding at 10% allocation ($1,800 of $18,000); realized 30-day volatility sits in the 90th percentile of its own 2-year range.",
    severity: "high",
    detectedAt: "2026-10-25 08:52 UTC",
    model: "concentration-monitor",
  },
  {
    id: "alert-3",
    title: "Elevated correlation among AAPL, MSFT, and NVDA",
    whatItMeans:
      "AAPL, MSFT, and NVDA tend to rise and fall together — to a risk model, they're closer to one large position than three separate bets.",
    whyItMattersForHorizon:
      "In a tech-sector drawdown, these three holdings — plus the tech sleeve inside VTI — won't offset each other the way genuinely different asset classes would. That's exactly what made the 2022 scenario worse for this persona than a generic diversified portfolio of the same allocation (see the scenario replay).",
    whatsDrivingIt:
      "Estimated trailing 2-year pairwise correlation of 0.78-0.85 between AAPL, MSFT, and NVDA.",
    severity: "medium",
    detectedAt: "2026-10-24 22:03 UTC",
    model: "correlation-drift-v3",
  },
  {
    id: "alert-4",
    title: "International allocation below typical diversification guidance",
    whatItMeans:
      "International stocks (VXUS) are a smaller slice of this portfolio than many advisors suggest for a US-based investor.",
    whyItMattersForHorizon:
      "Over a 40-year career, US and international markets won't always lead at the same time — a thin international sleeve means missing more of whichever decade international happens to outperform, without materially lowering overall risk today.",
    whatsDrivingIt:
      "VXUS at 15% of the total portfolio (about 19% of the equity sleeve specifically), versus a commonly-cited 20-30% international-equity guideline.",
    severity: "medium",
    detectedAt: "2026-10-24 17:40 UTC",
    model: "allocation-guidance-check",
  },
];

// ---------------------------------------------------------------------------
// Per-security views: an AI-assisted risk read-out for each holding —
// score, model confidence, the signals driving it, and a 30-day trend.
// Illustrative mock data for this POC, not financial advice or a
// benchmarked study — see docs/adr/0006-per-security-comparison-view.md,
// docs/adr/0007-drop-traditional-research-comparison.md, and
// docs/adr/0008-personal-portfolio-reframe.md.
// ---------------------------------------------------------------------------

export interface RiskHistoryPoint {
  date: string;
  riskScore: number;
}

export interface SecurityProfile {
  ticker: string;
  name: string;
  assetClass: string;
  exposure: string;
  level: RiskLevel;
  riskHistory: RiskHistoryPoint[];

  ai: {
    riskScore: number;
    confidence: number;
    turnaround: string;
    dataFreshness: string;
    summary: string;
    signals: string[];
  };
}

export const securityProfiles: SecurityProfile[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$1,800",
    level: "high",
    riskHistory: [
      { date: "Oct 01", riskScore: 71 },
      { date: "Oct 05", riskScore: 74 },
      { date: "Oct 09", riskScore: 72 },
      { date: "Oct 13", riskScore: 78 },
      { date: "Oct 17", riskScore: 80 },
      { date: "Oct 21", riskScore: 82 },
      { date: "Oct 25", riskScore: 85 },
    ],
    ai: {
      riskScore: 85,
      confidence: 91,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "NVIDIA is the largest single-stock position in the portfolio and one of its most volatile holdings. A 10% allocation to one stock exceeds the 5-10% ceiling commonly cited for individual-stock concentration, and realized volatility over the trailing 30 days sits in the 90th percentile of this stock's own 2-year range.",
      signals: [
        "Single-stock allocation (10%) above typical 5-10% individual-stock guidance",
        "30-day realized volatility in the 90th percentile vs. this stock's own 2-year history",
        "High estimated correlation with the portfolio's other individual tech holdings (AAPL, MSFT)",
      ],
    },
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$2,160",
    level: "medium",
    riskHistory: [
      { date: "Oct 01", riskScore: 60 },
      { date: "Oct 05", riskScore: 61 },
      { date: "Oct 09", riskScore: 59 },
      { date: "Oct 13", riskScore: 63 },
      { date: "Oct 17", riskScore: 65 },
      { date: "Oct 21", riskScore: 66 },
      { date: "Oct 25", riskScore: 68 },
    ],
    ai: {
      riskScore: 68,
      confidence: 88,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "Apple is a large, financially stable company and individually a lower-volatility holding than NVDA. But it adds to the portfolio's already-heavy technology tilt rather than offsetting it — combined with NVDA, MSFT, and VTI's own tech weighting, it's one of four positions that tend to move together in a tech-sector selloff.",
      signals: [
        "Estimated correlation with NVDA and MSFT over the trailing 2 years: elevated, sector-driven",
        "Contributes to an estimated ~41% effective technology-sector exposure portfolio-wide",
        "Historically lower earnings-driven volatility than NVDA",
      ],
    },
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$1,440",
    level: "medium",
    riskHistory: [
      { date: "Oct 01", riskScore: 56 },
      { date: "Oct 05", riskScore: 57 },
      { date: "Oct 09", riskScore: 56 },
      { date: "Oct 13", riskScore: 59 },
      { date: "Oct 17", riskScore: 61 },
      { date: "Oct 21", riskScore: 62 },
      { date: "Oct 25", riskScore: 64 },
    ],
    ai: {
      riskScore: 64,
      confidence: 87,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "Microsoft, like Apple, is individually a lower-volatility mega-cap — but it adds to the same technology concentration as AAPL and NVDA rather than diversifying it. The model treats all three individual holdings as one correlated cluster for risk purposes, not three independent bets.",
      signals: [
        "Estimated correlation with AAPL and NVDA over the trailing 2 years: elevated, sector-driven",
        "Cloud/enterprise revenue mix offers some differentiation from NVDA's hardware cycle exposure",
        "Contributes to an estimated ~41% effective technology-sector exposure portfolio-wide",
      ],
    },
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetClass: "US Equity — Index Fund",
    exposure: "$5,400",
    level: "medium",
    riskHistory: [
      { date: "Oct 01", riskScore: 50 },
      { date: "Oct 05", riskScore: 51 },
      { date: "Oct 09", riskScore: 50 },
      { date: "Oct 13", riskScore: 53 },
      { date: "Oct 17", riskScore: 55 },
      { date: "Oct 21", riskScore: 56 },
      { date: "Oct 25", riskScore: 58 },
    ],
    ai: {
      riskScore: 58,
      confidence: 93,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "As a total-market index fund, VTI is the single most diversified holding in the portfolio by company count — but it is not sector-neutral. Roughly a third of VTI's own weighting is in technology companies, which compounds with the three individual tech stocks rather than offsetting them.",
      signals: [
        "An estimated ~31% of VTI's own holdings are technology-sector companies",
        "Broad diversification across thousands of underlying companies reduces single-company risk",
        "Still carries full US equity-market beta — not a hedge against a broad market selloff",
      ],
    },
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    assetClass: "International Equity",
    exposure: "$2,700",
    level: "low",
    riskHistory: [
      { date: "Oct 01", riskScore: 47 },
      { date: "Oct 05", riskScore: 48 },
      { date: "Oct 09", riskScore: 46 },
      { date: "Oct 13", riskScore: 47 },
      { date: "Oct 17", riskScore: 46 },
      { date: "Oct 21", riskScore: 45 },
      { date: "Oct 25", riskScore: 46 },
    ],
    ai: {
      riskScore: 46,
      confidence: 85,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "International developed and emerging-market exposure, and the portfolio's best diversifier against US-specific and technology-sector risk — its own technology weighting is roughly half of VTI's. At 15% of the portfolio, it's on the lower end of commonly recommended international allocations.",
      signals: [
        "Technology weighting roughly half of VTI's — a genuine diversifier against the portfolio's US tech concentration",
        "15% portfolio allocation (~19% of the equity sleeve) is below the 20-30% international range many advisors suggest",
        "Adds currency and non-US-market risk the rest of the portfolio doesn't carry",
      ],
    },
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetClass: "Fixed Income",
    exposure: "$3,600",
    level: "low",
    riskHistory: [
      { date: "Oct 01", riskScore: 33 },
      { date: "Oct 05", riskScore: 34 },
      { date: "Oct 09", riskScore: 33 },
      { date: "Oct 13", riskScore: 34 },
      { date: "Oct 17", riskScore: 35 },
      { date: "Oct 21", riskScore: 34 },
      { date: "Oct 25", riskScore: 34 },
    ],
    ai: {
      riskScore: 34,
      confidence: 90,
      turnaround: "< 1 minute after bond pricing feed updates",
      dataFreshness: "daily bond pricing feed",
      summary:
        "Total bond market exposure, carrying interest-rate (duration) risk rather than equity-market risk. Its low correlation to the equity holdings is the main diversification benefit it provides to this portfolio, not return — bonds are the ballast here, not the growth engine.",
      signals: [
        "Estimated effective duration ~6 years — a 1-point rate move implies roughly a 6% price move in this sleeve",
        "Historically low correlation to the equity side of the portfolio",
        "Credit quality skews investment-grade — limited default risk relative to high-yield bonds",
      ],
    },
  },
  {
    ticker: "CASH",
    name: "Cash & Money Market",
    assetClass: "Cash & Equivalents",
    exposure: "$900",
    level: "low",
    riskHistory: [
      { date: "Oct 01", riskScore: 4 },
      { date: "Oct 05", riskScore: 4 },
      { date: "Oct 09", riskScore: 4 },
      { date: "Oct 13", riskScore: 4 },
      { date: "Oct 17", riskScore: 4 },
      { date: "Oct 21", riskScore: 4 },
      { date: "Oct 25", riskScore: 4 },
    ],
    ai: {
      riskScore: 4,
      confidence: 99,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time",
      summary:
        "Cash and money-market holdings carry essentially no market risk, but also no growth — and at 5% of the portfolio, provide a thinner buffer against a prolonged equity drawdown than a typical 6-12 month expense cushion would.",
      signals: [
        "No material market or credit risk",
        "Yield currently tracks short-term interest rates, not inflation specifically",
        "5% allocation is a thin buffer given equities alone are ~75% of the portfolio",
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Diversification risk: the thing the per-security view, taken security
// by security, can't show on its own — how much these holdings actually
// overlap once you look through the index funds to their underlying
// sector weightings. See docs/adr/0008-personal-portfolio-reframe.md.
// ---------------------------------------------------------------------------

export interface SectorExposureSlice {
  sector: string;
  pct: number;
  viaIndexFunds: number;
  viaIndividualStocks: number;
}

// Percentages are of the WHOLE portfolio (not just the equity sleeve),
// so Fixed Income + Cash's 25% combined is part of what's "left over"
// once every sector's look-through contribution is added up.
export const sectorExposure: SectorExposureSlice[] = [
  { sector: "Technology", pct: 41, viaIndexFunds: 11, viaIndividualStocks: 30 },
  { sector: "Financials", pct: 7, viaIndexFunds: 7, viaIndividualStocks: 0 },
  { sector: "Healthcare", pct: 5, viaIndexFunds: 5, viaIndividualStocks: 0 },
  { sector: "Consumer Discretionary", pct: 5, viaIndexFunds: 5, viaIndividualStocks: 0 },
  { sector: "Industrials", pct: 5, viaIndexFunds: 5, viaIndividualStocks: 0 },
  { sector: "Other Equity Sectors", pct: 12, viaIndexFunds: 12, viaIndividualStocks: 0 },
  { sector: "Fixed Income & Cash", pct: 25, viaIndexFunds: 0, viaIndividualStocks: 0 },
];

export interface DiversificationScore {
  score: number;
  label: string;
  summary: string;
}

export const diversificationScore: DiversificationScore = {
  score: 58,
  label: "Moderate concentration risk",
  summary:
    "Seven holdings across five asset classes look diversified on the surface. Once VTI's and VXUS's own sector weightings are added to the three direct tech holdings, technology alone accounts for an estimated 41% of the portfolio — the single largest driver of the score below 70.",
};

export interface DiversificationFlag {
  id: string;
  title: string;
  detail: string;
  severity: RiskLevel;
}

export const diversificationFlags: DiversificationFlag[] = [
  {
    id: "flag-1",
    title: "Effective technology exposure (~41%) is 3x what '3 stock picks' suggests",
    detail:
      "AAPL, NVDA, and MSFT alone are 30% of the portfolio, but VTI's and VXUS's own technology weightings add roughly another 11 points on top — all four positions are exposed to the same sector-level risk, even though they look like four unrelated holdings.",
    severity: "high",
  },
  {
    id: "flag-2",
    title: "AAPL, MSFT, and NVDA are a correlated cluster, not three bets",
    detail:
      "Estimated trailing 2-year pairwise correlation between the three is 0.78-0.85. In a technology-sector drawdown, they — and VTI's own tech sleeve — are unlikely to move independently of each other.",
    severity: "medium",
  },
  {
    id: "flag-3",
    title: "International allocation (15%) is below common diversification guidance",
    detail:
      "VXUS is about 19% of the equity sleeve specifically, below the 20-30% international allocation many advisors suggest as a diversifier against US-market-specific risk.",
    severity: "medium",
  },
  {
    id: "flag-4",
    title: "Cash buffer (5%) is thin relative to the equity allocation (~75%)",
    detail:
      "A 5% cash position provides less cushion against a prolonged equity drawdown than a typical 6-12 month expense reserve would, given how much of the portfolio is equity-market risk.",
    severity: "low",
  },
];

// ---------------------------------------------------------------------------
// Research copilot: per-security "what changed" + portfolio-wide digest.
// See docs/adr/0010-research-copilot-reframe.md. All synthetic, same
// "mock data only" constraint as the rest of this file (ADR 0001).
//
// Hard guardrail from ADR 0010: nothing here is a rating or a
// recommendation. News summaries describe what changed, not what to
// do about it. Sentiment is a labeled signal with a stated basis
// (never a bare 0-100 score framed as a rating). Tax-lot flags are
// timing facts, not advice. Copy throughout uses "here's what
// changed / here's why it might matter" framing, never "you should."
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

export interface TrendSeriesPoint {
  date: string;
  price: number;
  /** A normalized fundamental index (100 = the start of this window),
   * illustrative only — not a real revenue/earnings series. */
  fundamentalIndex: number;
}

export interface TrendSeries {
  ticker: string;
  windowLabel: string;
  points: TrendSeriesPoint[];
}

// 180-day windows, sampled every 15 days (12 points) — longer than
// the 30-day riskHistory charts elsewhere in securityProfiles, per
// ADR 0010's "longer window than the current 30-day chart" ask.
export const trendSeries: TrendSeries[] = [
  {
    ticker: "NVDA",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 108.2, fundamentalIndex: 100 },
      { date: "May 26", price: 112.4, fundamentalIndex: 101 },
      { date: "Jun 10", price: 118.9, fundamentalIndex: 103 },
      { date: "Jun 25", price: 115.6, fundamentalIndex: 104 },
      { date: "Jul 10", price: 121.3, fundamentalIndex: 106 },
      { date: "Jul 25", price: 129.8, fundamentalIndex: 108 },
      { date: "Aug 09", price: 126.1, fundamentalIndex: 109 },
      { date: "Aug 24", price: 134.5, fundamentalIndex: 111 },
      { date: "Sep 08", price: 141.2, fundamentalIndex: 113 },
      { date: "Sep 23", price: 138.7, fundamentalIndex: 114 },
      { date: "Oct 08", price: 146.9, fundamentalIndex: 116 },
      { date: "Oct 23", price: 152.3, fundamentalIndex: 118 },
    ],
  },
  {
    ticker: "AAPL",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 189.4, fundamentalIndex: 100 },
      { date: "May 26", price: 191.1, fundamentalIndex: 100 },
      { date: "Jun 10", price: 187.8, fundamentalIndex: 101 },
      { date: "Jun 25", price: 193.5, fundamentalIndex: 101 },
      { date: "Jul 10", price: 196.2, fundamentalIndex: 102 },
      { date: "Jul 25", price: 194.8, fundamentalIndex: 102 },
      { date: "Aug 09", price: 198.1, fundamentalIndex: 103 },
      { date: "Aug 24", price: 201.4, fundamentalIndex: 103 },
      { date: "Sep 08", price: 199.7, fundamentalIndex: 104 },
      { date: "Sep 23", price: 203.9, fundamentalIndex: 104 },
      { date: "Oct 08", price: 206.5, fundamentalIndex: 105 },
      { date: "Oct 23", price: 208.2, fundamentalIndex: 105 },
    ],
  },
  {
    ticker: "MSFT",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 412.3, fundamentalIndex: 100 },
      { date: "May 26", price: 418.6, fundamentalIndex: 101 },
      { date: "Jun 10", price: 415.2, fundamentalIndex: 102 },
      { date: "Jun 25", price: 422.8, fundamentalIndex: 103 },
      { date: "Jul 10", price: 429.4, fundamentalIndex: 104 },
      { date: "Jul 25", price: 426.1, fundamentalIndex: 104 },
      { date: "Aug 09", price: 433.7, fundamentalIndex: 105 },
      { date: "Aug 24", price: 438.9, fundamentalIndex: 106 },
      { date: "Sep 08", price: 435.2, fundamentalIndex: 106 },
      { date: "Sep 23", price: 441.6, fundamentalIndex: 107 },
      { date: "Oct 08", price: 447.3, fundamentalIndex: 108 },
      { date: "Oct 23", price: 452.8, fundamentalIndex: 109 },
    ],
  },
  {
    ticker: "VTI",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 268.4, fundamentalIndex: 100 },
      { date: "May 26", price: 270.1, fundamentalIndex: 101 },
      { date: "Jun 10", price: 272.8, fundamentalIndex: 101 },
      { date: "Jun 25", price: 271.5, fundamentalIndex: 102 },
      { date: "Jul 10", price: 275.9, fundamentalIndex: 102 },
      { date: "Jul 25", price: 278.3, fundamentalIndex: 103 },
      { date: "Aug 09", price: 276.7, fundamentalIndex: 103 },
      { date: "Aug 24", price: 280.4, fundamentalIndex: 104 },
      { date: "Sep 08", price: 283.1, fundamentalIndex: 104 },
      { date: "Sep 23", price: 281.6, fundamentalIndex: 105 },
      { date: "Oct 08", price: 285.9, fundamentalIndex: 105 },
      { date: "Oct 23", price: 288.2, fundamentalIndex: 106 },
    ],
  },
  {
    ticker: "VXUS",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 58.3, fundamentalIndex: 100 },
      { date: "May 26", price: 58.9, fundamentalIndex: 100 },
      { date: "Jun 10", price: 59.6, fundamentalIndex: 101 },
      { date: "Jun 25", price: 59.1, fundamentalIndex: 101 },
      { date: "Jul 10", price: 60.4, fundamentalIndex: 102 },
      { date: "Jul 25", price: 61.2, fundamentalIndex: 102 },
      { date: "Aug 09", price: 60.8, fundamentalIndex: 103 },
      { date: "Aug 24", price: 61.9, fundamentalIndex: 103 },
      { date: "Sep 08", price: 62.5, fundamentalIndex: 104 },
      { date: "Sep 23", price: 62.1, fundamentalIndex: 104 },
      { date: "Oct 08", price: 63.4, fundamentalIndex: 105 },
      { date: "Oct 23", price: 64.1, fundamentalIndex: 105 },
    ],
  },
  {
    ticker: "BND",
    windowLabel: "180-day",
    points: [
      { date: "May 11", price: 72.8, fundamentalIndex: 100 },
      { date: "May 26", price: 72.5, fundamentalIndex: 100 },
      { date: "Jun 10", price: 72.1, fundamentalIndex: 100 },
      { date: "Jun 25", price: 71.9, fundamentalIndex: 99 },
      { date: "Jul 10", price: 71.6, fundamentalIndex: 99 },
      { date: "Jul 25", price: 71.8, fundamentalIndex: 99 },
      { date: "Aug 09", price: 71.3, fundamentalIndex: 98 },
      { date: "Aug 24", price: 70.9, fundamentalIndex: 98 },
      { date: "Sep 08", price: 70.6, fundamentalIndex: 98 },
      { date: "Sep 23", price: 70.8, fundamentalIndex: 97 },
      { date: "Oct 08", price: 70.4, fundamentalIndex: 97 },
      { date: "Oct 23", price: 70.1, fundamentalIndex: 97 },
    ],
  },
];

export interface FundamentalMetric {
  label: string;
  current: string;
  ownHistoryAvg: string;
  peerOrBenchmarkAvg: string;
  note: string;
}

export interface FundamentalsSnapshot {
  ticker: string;
  peerOrBenchmarkLabel: string;
  metrics: FundamentalMetric[];
}

// A snapshot vs. each security's own history and a peer/benchmark —
// illustrative figures, not a live fundamentals feed. Framed as
// context ("here's where this sits"), not a verdict.
export const fundamentalsSnapshots: FundamentalsSnapshot[] = [
  {
    ticker: "NVDA",
    peerOrBenchmarkLabel: "Semiconductor peers (AMD, AVGO, TSM)",
    metrics: [
      { label: "P/E ratio", current: "42.1x", ownHistoryAvg: "38.6x (5-yr)", peerOrBenchmarkAvg: "31.4x", note: "Trading above both its own 5-year average and the peer group — has for most of the past 18 months." },
      { label: "Revenue growth (YoY)", current: "+62%", ownHistoryAvg: "+48% (5-yr avg)", peerOrBenchmarkAvg: "+19%", note: "Growth well above its own historical pace and the peer group, concentrated in data-center demand." },
      { label: "Operating margin", current: "58%", ownHistoryAvg: "49% (5-yr)", peerOrBenchmarkAvg: "32%", note: "Wider than peers — a function of pricing power in the current demand cycle, not guaranteed to persist." },
    ],
  },
  {
    ticker: "AAPL",
    peerOrBenchmarkLabel: "Large-cap tech peers (MSFT, GOOGL)",
    metrics: [
      { label: "P/E ratio", current: "29.8x", ownHistoryAvg: "27.3x (5-yr)", peerOrBenchmarkAvg: "28.1x", note: "Close to the peer average, modestly above its own 5-year norm." },
      { label: "Revenue growth (YoY)", current: "+6%", ownHistoryAvg: "+9% (5-yr avg)", peerOrBenchmarkAvg: "+13%", note: "Slower than its own historical pace and the peer group — services growth partially offsetting flatter hardware revenue." },
      { label: "Operating margin", current: "31%", ownHistoryAvg: "29% (5-yr)", peerOrBenchmarkAvg: "27%", note: "Stable and above peer average." },
    ],
  },
  {
    ticker: "MSFT",
    peerOrBenchmarkLabel: "Large-cap tech peers (AAPL, GOOGL)",
    metrics: [
      { label: "P/E ratio", current: "34.6x", ownHistoryAvg: "31.2x (5-yr)", peerOrBenchmarkAvg: "28.1x", note: "Above both its own history and peers, tracking cloud/AI-platform growth expectations." },
      { label: "Revenue growth (YoY)", current: "+15%", ownHistoryAvg: "+13% (5-yr avg)", peerOrBenchmarkAvg: "+13%", note: "Modestly ahead of its own historical pace, in line with the faster-growing peer." },
      { label: "Operating margin", current: "45%", ownHistoryAvg: "42% (5-yr)", peerOrBenchmarkAvg: "35%", note: "Wider than its own history and peers." },
    ],
  },
  {
    ticker: "VTI",
    peerOrBenchmarkLabel: "S&P 500 (benchmark)",
    metrics: [
      { label: "Expense ratio", current: "0.03%", ownHistoryAvg: "0.03% (unchanged)", peerOrBenchmarkAvg: "0.04% (category avg)", note: "Unchanged, already at the low end for broad-market index funds." },
      { label: "Trailing-12-month tracking difference", current: "-0.02%", ownHistoryAvg: "-0.02% (5-yr avg)", peerOrBenchmarkAvg: "n/a", note: "Tracks its target index closely, as expected for a total-market fund." },
      { label: "Weighted avg P/E of holdings", current: "27.9x", ownHistoryAvg: "24.1x (5-yr)", peerOrBenchmarkAvg: "27.6x (S&P 500)", note: "In line with the broad market, above its own 5-year average alongside the broader market's re-rating." },
    ],
  },
  {
    ticker: "VXUS",
    peerOrBenchmarkLabel: "MSCI ACWI ex-US (benchmark)",
    metrics: [
      { label: "Expense ratio", current: "0.08%", ownHistoryAvg: "0.08% (unchanged)", peerOrBenchmarkAvg: "0.11% (category avg)", note: "Below the category average for international index funds." },
      { label: "Weighted avg P/E of holdings", current: "16.2x", ownHistoryAvg: "15.4x (5-yr)", peerOrBenchmarkAvg: "16.5x (benchmark)", note: "Modestly above its own 5-year average, roughly in line with its benchmark." },
      { label: "Dividend yield", current: "2.6%", ownHistoryAvg: "2.8% (5-yr avg)", peerOrBenchmarkAvg: "2.7% (benchmark)", note: "Slightly below its own historical average." },
    ],
  },
  {
    ticker: "BND",
    peerOrBenchmarkLabel: "Bloomberg U.S. Aggregate (benchmark)",
    metrics: [
      { label: "SEC yield", current: "4.4%", ownHistoryAvg: "3.1% (5-yr avg)", peerOrBenchmarkAvg: "4.3% (benchmark)", note: "Higher than its own 5-year average, reflecting the higher-rate environment of the past two years." },
      { label: "Effective duration", current: "6.1 yrs", ownHistoryAvg: "6.3 yrs (5-yr avg)", peerOrBenchmarkAvg: "6.0 yrs (benchmark)", note: "In line with its own history and benchmark." },
      { label: "Expense ratio", current: "0.03%", ownHistoryAvg: "0.03% (unchanged)", peerOrBenchmarkAvg: "0.04% (category avg)", note: "Below the category average for broad bond index funds." },
    ],
  },
];

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
   * portfolio's concentration/diversification risk (see
   * diversificationFlags / sectorExposure). Feeds the
   * diversification-impact factor in the relevance score, it is not
   * itself a rating of the security. */
  diversificationImpact: number;
}

// Fixed "as of" reference time for the digest ranking — matches the
// era of the news/sentiment timestamps below, so recency decays
// deterministically regardless of the real wall-clock date the app
// happens to be viewed on (same reproducibility reasoning as
// portfolioAssumptions.seed in the retirement projection).
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
