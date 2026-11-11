# Architecture Decision Records

This directory tracks the key decisions made while building this POC.
Each ADR is numbered, immutable once accepted (superseded rather than
edited), and follows the lightweight Michael Nygard format: Status,
Context, Decision, Consequences.

The early ADRs (0001–0009) describe product shapes that were later
replaced. They are kept as written; the ADR that replaced each one
says why.

| # | Title | Status |
|---|-------|--------|
| [0001](0001-poc-scope-no-plumbing.md) | POC scope: no backend, no data pipeline, no deployment plumbing | Accepted, lifted by 0015 |
| [0002](0002-monorepo-layout.md) | Single-app monorepo layout under `apps/` | Accepted |
| [0003](0003-nextjs-frontend.md) | Next.js (App Router) for the dashboard frontend | Accepted |
| [0004](0004-mock-data-strategy.md) | Static, in-repo mock data instead of a fixture API or database | Accepted, superseded by 0015 |
| [0005](0005-charting-library.md) | Recharts for charting | Accepted, later replaced by inline SVG |
| [0006](0006-per-security-comparison-view.md) | Per-security comparison view | Accepted, later superseded |
| [0007](0007-drop-traditional-research-comparison.md) | Drop the traditional-research comparison | Accepted |
| [0008](0008-personal-portfolio-reframe.md) | Reframe as a personal diversified portfolio, add diversification risk | Accepted, later superseded |
| [0009](0009-retirement-persona-and-projection.md) | Retirement persona and projection methodology | Accepted, later superseded |
| [0010](0010-research-copilot-reframe.md) | Research-copilot reframe: per-security briefs + portfolio-wide "what changed" | Accepted |
| [0011](0011-triage-inbox-visual-implementation.md) | Triage-inbox visual implementation: dark "Confident Flat" system, Act/Watch queue | Accepted |
| [0012](0012-scope-narrowing.md) | Scope narrowing: remove the risk-dashboard-era pages | Accepted |
| [0013](0013-rectangular-buttons.md) | Rounded-rectangle buttons, not pills | Accepted |
| [0014](0014-light-mode.md) | Light mode: off-white, not stark white | Accepted |
| [0015](0015-live-finance-domain-and-dynamic-holdings.md) | Live finance domain in Conduit + dynamic holdings (lifts 0001/0004 for this feature) | Accepted |
| [0016](0016-active-market-data-and-30-minute-research.md) | Active market data and a 30-minute research cadence | Accepted |
| [0017](0017-diversification-numbers-only.md) | Diversification on Portfolio Health: numbers only | Accepted |
| [0018](0018-dividend-income-and-fed-decisions.md) | Dividend income and Fed rate decisions | Accepted |
