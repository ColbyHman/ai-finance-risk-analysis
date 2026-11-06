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
  detail: string;
  severity: RiskLevel;
  detectedAt: string;
  model: string;
}

export const anomalyAlerts: AnomalyAlert[] = [
  {
    id: "alert-1",
    title: "Effective technology-sector exposure above 40% of portfolio",
    detail:
      "Look-through analysis of VTI's and VXUS's own sector weightings, added to the three direct tech holdings (AAPL, NVDA, MSFT), puts total technology exposure at an estimated 41% of the portfolio — well above what '3 individual stock picks' suggests on its own.",
    severity: "high",
    detectedAt: "2026-10-25 09:14 UTC",
    model: "sector-lookthrough-v2",
  },
  {
    id: "alert-2",
    title: "Single-stock concentration: NVDA above typical guidance",
    detail:
      "NVDA is 10% of the portfolio in one stock — above the 5-10% ceiling commonly cited for individual-stock concentration — and realized volatility over the trailing 30 days sits in the 90th percentile of this stock's own 2-year history.",
    severity: "high",
    detectedAt: "2026-10-25 08:52 UTC",
    model: "concentration-monitor",
  },
  {
    id: "alert-3",
    title: "Elevated correlation among AAPL, MSFT, and NVDA",
    detail:
      "Estimated trailing 2-year pairwise correlation between the three individual tech holdings is 0.78-0.85 — in a tech-sector drawdown, these positions are unlikely to offset each other, or VTI's own tech sleeve.",
    severity: "medium",
    detectedAt: "2026-10-24 22:03 UTC",
    model: "correlation-drift-v3",
  },
  {
    id: "alert-4",
    title: "International allocation below typical diversification guidance",
    detail:
      "VXUS is 15% of the total portfolio (about 19% of the equity sleeve specifically) — below the 20-30% international equity allocation many advisors suggest as a US-market diversifier.",
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
