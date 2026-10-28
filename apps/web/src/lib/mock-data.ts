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
  name: string;
  assetClass: string;
  exposure: string;
  riskScore: number;
  aiConfidence: number;
  level: RiskLevel;
}

export const topRiskContributors: RiskContributor[] = [
  {
    name: "NVDA Concentrated Equity Position",
    assetClass: "Equities",
    exposure: "$4.2M",
    riskScore: 88,
    aiConfidence: 94,
    level: "critical",
  },
  {
    name: "EM Private Credit Fund III",
    assetClass: "Private Credit",
    exposure: "$2.6M",
    riskScore: 79,
    aiConfidence: 87,
    level: "high",
  },
  {
    name: "USD/TRY Forward Book",
    assetClass: "FX",
    exposure: "$1.1M",
    riskScore: 74,
    aiConfidence: 82,
    level: "high",
  },
  {
    name: "S&P 500 Index Put Spread",
    assetClass: "Derivatives",
    exposure: "$900K",
    riskScore: 70,
    aiConfidence: 90,
    level: "medium",
  },
  {
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
