// Mock data for the AI Finance Risk Analysis POC dashboard.
// This is entirely synthetic — no real portfolio, market, or client data.

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
    value: "62 / 100",
    delta: "+4 vs. last week",
    trend: "up",
    tone: "bad",
  },
  {
    label: "1-Day Value at Risk (95%)",
    value: "$1.84M",
    delta: "+$120K",
    trend: "up",
    tone: "bad",
  },
  {
    label: "Annualized Volatility",
    value: "18.7%",
    delta: "-0.6pt",
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

export const exposureByAssetClass: ExposureSlice[] = [
  { assetClass: "Equities", exposurePct: 38, riskScore: 71 },
  { assetClass: "Fixed Income", exposurePct: 24, riskScore: 38 },
  { assetClass: "Private Credit", exposurePct: 14, riskScore: 66 },
  { assetClass: "Derivatives", exposurePct: 11, riskScore: 84 },
  { assetClass: "FX", exposurePct: 8, riskScore: 52 },
  { assetClass: "Cash & Equivalents", exposurePct: 5, riskScore: 6 },
];

export interface TrendPoint {
  date: string;
  riskScore: number;
  var95: number;
}

export const riskTrend: TrendPoint[] = [
  { date: "Oct 01", riskScore: 51, var95: 1.42 },
  { date: "Oct 05", riskScore: 54, var95: 1.49 },
  { date: "Oct 09", riskScore: 49, var95: 1.38 },
  { date: "Oct 13", riskScore: 57, var95: 1.55 },
  { date: "Oct 17", riskScore: 60, var95: 1.68 },
  { date: "Oct 21", riskScore: 58, var95: 1.63 },
  { date: "Oct 25", riskScore: 62, var95: 1.84 },
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
    name: "NVDA Concentrated Equity Position",
    assetClass: "Equities",
    exposure: "$4.2M",
    riskScore: 88,
    aiConfidence: 94,
    level: "critical",
  },
  {
    ticker: "EMPC3",
    name: "EM Private Credit Fund III",
    assetClass: "Private Credit",
    exposure: "$2.6M",
    riskScore: 79,
    aiConfidence: 87,
    level: "high",
  },
  {
    ticker: "USDTRY",
    name: "USD/TRY Forward Book",
    assetClass: "FX",
    exposure: "$1.1M",
    riskScore: 74,
    aiConfidence: 82,
    level: "high",
  },
  {
    ticker: "SPXPUT",
    name: "S&P 500 Index Put Spread",
    assetClass: "Derivatives",
    exposure: "$900K",
    riskScore: 70,
    aiConfidence: 90,
    level: "medium",
  },
  {
    ticker: "HYLADDER",
    name: "High-Yield Corporate Bond Ladder",
    assetClass: "Fixed Income",
    exposure: "$3.1M",
    riskScore: 44,
    aiConfidence: 85,
    level: "medium",
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
    title: "Unusual correlation spike: Equities vs. Private Credit",
    detail:
      "AI correlation model flagged a 0.62 -> 0.88 shift in 10-day rolling correlation, reducing diversification benefit.",
    severity: "critical",
    detectedAt: "2026-10-25 09:14 UTC",
    model: "correlation-drift-v3",
  },
  {
    id: "alert-2",
    title: "Concentration threshold breached: NVDA position",
    detail:
      "Single-name exposure crossed the 7% portfolio NAV policy limit after today's price move.",
    severity: "high",
    detectedAt: "2026-10-25 08:52 UTC",
    model: "concentration-monitor",
  },
  {
    id: "alert-3",
    title: "Liquidity score downgrade: EM Private Credit Fund III",
    detail:
      "Estimated days-to-liquidate increased from 45 to 72 based on recent redemption gate activity.",
    severity: "medium",
    detectedAt: "2026-10-24 22:03 UTC",
    model: "liquidity-forecast-v2",
  },
  {
    id: "alert-4",
    title: "Volatility regime change detected: FX book",
    detail:
      "Regime-switching model estimates 78% probability portfolio has entered a high-volatility FX regime.",
    severity: "medium",
    detectedAt: "2026-10-24 17:40 UTC",
    model: "regime-switch-hmm",
  },
];

// ---------------------------------------------------------------------------
// Per-security views: an AI-assisted risk read-out for each top position —
// score, model confidence, the signals driving it, and a 30-day trend.
// Illustrative mock data for this POC, not a benchmarked study — see
// docs/adr/0006-per-security-comparison-view.md and
// docs/adr/0007-drop-traditional-research-comparison.md.
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
    name: "NVDA Concentrated Equity Position",
    assetClass: "Equities",
    exposure: "$4.2M",
    level: "critical",
    riskHistory: [
      { date: "Oct 01", riskScore: 68 },
      { date: "Oct 05", riskScore: 71 },
      { date: "Oct 09", riskScore: 69 },
      { date: "Oct 13", riskScore: 76 },
      { date: "Oct 17", riskScore: 81 },
      { date: "Oct 21", riskScore: 84 },
      { date: "Oct 25", riskScore: 88 },
    ],
    ai: {
      riskScore: 88,
      confidence: 94,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time, re-scored on every price tick",
      summary:
        "Concentration-monitor and correlation-drift models jointly flag this position: single-name exposure crossed the 7% NAV policy limit today, and its correlation to the private-credit sleeve has risen from 0.62 to 0.88 over 10 days, eroding the diversification the position was assumed to provide.",
      signals: [
        "Single-name concentration > 7% NAV policy limit (breached today)",
        "10-day rolling correlation to Private Credit sleeve: 0.62 -> 0.88",
        "Implied volatility percentile: 92nd (1Y lookback)",
      ],
    },
  },
  {
    ticker: "EMPC3",
    name: "EM Private Credit Fund III",
    assetClass: "Private Credit",
    exposure: "$2.6M",
    level: "high",
    riskHistory: [
      { date: "Oct 01", riskScore: 58 },
      { date: "Oct 05", riskScore: 61 },
      { date: "Oct 09", riskScore: 60 },
      { date: "Oct 13", riskScore: 65 },
      { date: "Oct 17", riskScore: 70 },
      { date: "Oct 21", riskScore: 75 },
      { date: "Oct 25", riskScore: 79 },
    ],
    ai: {
      riskScore: 79,
      confidence: 87,
      turnaround: "< 1 minute after fund administrator data lands",
      dataFreshness: "latest NAV + redemption activity feed",
      summary:
        "Liquidity-forecast model increased the estimated days-to-liquidate from 45 to 72 after detecting a pattern of redemption gate activity in the fund's recent filings — a signal typically buried in administrative paperwork rather than headline NAV updates.",
      signals: [
        "Estimated days-to-liquidate: 45 -> 72 (liquidity-forecast-v2)",
        "Redemption gate activity detected in fund administrator filings",
        "NAV mark lag vs. comparable funds: +12 days",
      ],
    },
  },
  {
    ticker: "USDTRY",
    name: "USD/TRY Forward Book",
    assetClass: "FX",
    exposure: "$1.1M",
    level: "high",
    riskHistory: [
      { date: "Oct 01", riskScore: 55 },
      { date: "Oct 05", riskScore: 58 },
      { date: "Oct 09", riskScore: 60 },
      { date: "Oct 13", riskScore: 63 },
      { date: "Oct 17", riskScore: 68 },
      { date: "Oct 21", riskScore: 71 },
      { date: "Oct 25", riskScore: 74 },
    ],
    ai: {
      riskScore: 74,
      confidence: 82,
      turnaround: "< 1 second (continuous)",
      dataFreshness: "real-time FX rates and implied-vol surface",
      summary:
        "Regime-switching model estimates a 78% probability the book has entered a high-volatility FX regime, based on implied-vol surface shape changes and realized-vol clustering that a human reviewer would need specialized tooling to monitor continuously.",
      signals: [
        "Regime-switch probability (high-vol regime): 78%",
        "Realized vol clustering over trailing 15 sessions",
        "Forward points drift vs. carry-implied fair value",
      ],
    },
  },
  {
    ticker: "SPXPUT",
    name: "S&P 500 Index Put Spread",
    assetClass: "Derivatives",
    exposure: "$900K",
    level: "medium",
    riskHistory: [
      { date: "Oct 01", riskScore: 52 },
      { date: "Oct 05", riskScore: 54 },
      { date: "Oct 09", riskScore: 53 },
      { date: "Oct 13", riskScore: 58 },
      { date: "Oct 17", riskScore: 62 },
      { date: "Oct 21", riskScore: 66 },
      { date: "Oct 25", riskScore: 70 },
    ],
    ai: {
      riskScore: 70,
      confidence: 90,
      turnaround: "< 1 second (continuous, Greeks recomputed on every tick)",
      dataFreshness: "real-time options chain and implied vol",
      summary:
        "Greeks-based risk engine recomputes delta/vega exposure continuously as the underlying moves; current risk score reflects accelerating vega exposure as the spread moves closer to its short strike.",
      signals: [
        "Vega exposure accelerating as spot approaches short strike",
        "Theta decay rate vs. days-to-expiry",
        "Implied vol skew steepening (put side)",
      ],
    },
  },
  {
    ticker: "HYLADDER",
    name: "High-Yield Corporate Bond Ladder",
    assetClass: "Fixed Income",
    exposure: "$3.1M",
    level: "medium",
    riskHistory: [
      { date: "Oct 01", riskScore: 40 },
      { date: "Oct 05", riskScore: 41 },
      { date: "Oct 09", riskScore: 39 },
      { date: "Oct 13", riskScore: 42 },
      { date: "Oct 17", riskScore: 43 },
      { date: "Oct 21", riskScore: 44 },
      { date: "Oct 25", riskScore: 44 },
    ],
    ai: {
      riskScore: 44,
      confidence: 85,
      turnaround: "< 1 minute after bond pricing feed updates",
      dataFreshness: "daily bond pricing + issuer credit-spread feed",
      summary:
        "Credit-spread model shows this ladder's risk score has been flat for three weeks — spreads across the underlying issuers have not moved meaningfully and the model finds no anomalous signal here.",
      signals: [
        "Issuer credit-spread deltas: within 1 standard deviation (30d)",
        "No anomaly-detector flags in trailing 21 sessions",
        "Laddered maturity profile reduces single-date rollover risk",
      ],
    },
  },
];


