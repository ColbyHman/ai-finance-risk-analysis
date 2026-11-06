// Mock data for the AI Finance Risk Analysis POC dashboard.
// This is entirely synthetic — no real portfolio, market, or client data.
//
// Modeled as one real individual investor's diversified brokerage
// account, not an institutional book — see
// docs/adr/0008-personal-portfolio-reframe.md. ~$300,000 across 7
// holdings: a broad US index fund, three individual mega-cap tech
// stocks, an international index fund, a bond fund, and cash.

export type RiskLevel = "low" | "medium" | "high" | "critical";

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
    value: "$5,400",
    delta: "+$380",
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

// var95 is in $ thousands (K), not millions — a personal-portfolio scale.
export const riskTrend: TrendPoint[] = [
  { date: "Oct 01", riskScore: 49, var95: 4.6 },
  { date: "Oct 05", riskScore: 51, var95: 4.8 },
  { date: "Oct 09", riskScore: 48, var95: 4.5 },
  { date: "Oct 13", riskScore: 53, var95: 5.0 },
  { date: "Oct 17", riskScore: 55, var95: 5.2 },
  { date: "Oct 21", riskScore: 54, var95: 5.1 },
  { date: "Oct 25", riskScore: 57, var95: 5.4 },
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
    exposure: "$30,000",
    riskScore: 85,
    aiConfidence: 91,
    level: "high",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$36,000",
    riskScore: 68,
    aiConfidence: 88,
    level: "medium",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    assetClass: "US Equity — Individual Stock",
    exposure: "$24,000",
    riskScore: 64,
    aiConfidence: 87,
    level: "medium",
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetClass: "US Equity — Index Fund",
    exposure: "$90,000",
    riskScore: 58,
    aiConfidence: 93,
    level: "medium",
  },
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    assetClass: "International Equity",
    exposure: "$45,000",
    riskScore: 46,
    aiConfidence: 85,
    level: "low",
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetClass: "Fixed Income",
    exposure: "$60,000",
    riskScore: 34,
    aiConfidence: 90,
    level: "low",
  },
  {
    ticker: "CASH",
    name: "Cash & Money Market",
    assetClass: "Cash & Equivalents",
    exposure: "$15,000",
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
    exposure: "$30,000",
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
    exposure: "$36,000",
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
    exposure: "$24,000",
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
    exposure: "$90,000",
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
    exposure: "$45,000",
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
    exposure: "$60,000",
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
    exposure: "$15,000",
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
