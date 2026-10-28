# 0004: Static, in-repo mock data instead of a fixture API or database

## Status
Accepted

## Context
The dashboard needs numbers to render: a portfolio risk score, VaR,
volatility, per-asset-class exposure and risk scores, a risk/VaR trend
series, top risk contributors, and anomaly alerts. Options considered:
a local JSON fixture server, a lightweight embedded database (SQLite), or
plain in-repo data structures.

Per ADR 0001, no backend or data pipeline is in scope for this POC, so the
data layer needs to be the simplest thing that lets the UI be built and
demonstrated, with an obvious seam for a future real integration.

## Decision
All dashboard data lives in one TypeScript module,
`apps/web/src/lib/mock-data.ts`, exporting typed constants (`summaryMetrics`,
`exposureByAssetClass`, `riskTrend`, `topRiskContributors`,
`anomalyAlerts`) and their corresponding interfaces/types. Components import
directly from this module. Every value in it is synthetic — fabricated for
illustration, not derived from any real portfolio, client, or market data.

## Consequences
- Zero runtime dependencies for data (no fetch, no DB driver, no fixture
  server to run alongside the app).
- The types exported from `mock-data.ts` (`SummaryMetric`,
  `ExposureSlice`, `TrendPoint`, `RiskContributor`, `AnomalyAlert`) are the
  de facto data contract the UI expects. When a real data source is
  introduced, it should satisfy these shapes (or the types should be moved
  to a shared `packages/` module per ADR 0002 and evolved deliberately) —
  that is a future decision, not implied acceptance of this exact shape
  long-term.
- Anyone reading the dashboard must not mistake the numbers for real
  figures — the UI carries a visible "Demo data — not a live feed" badge
  and the footer states the data is synthetic, specifically to prevent
  that misreading.
