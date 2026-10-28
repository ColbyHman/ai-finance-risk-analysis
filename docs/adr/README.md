# Architecture Decision Records

This directory tracks the key decisions made while building this POC. Each
ADR is numbered, immutable once accepted (superseded rather than edited),
and follows the lightweight Michael Nygard format: Status, Context,
Decision, Consequences.

| # | Title | Status |
|---|-------|--------|
| [0001](0001-poc-scope-no-plumbing.md) | POC scope: no backend, no data pipeline, no deployment plumbing | Accepted |
| [0002](0002-monorepo-layout.md) | Single-app monorepo layout under `apps/` | Accepted |
| [0003](0003-nextjs-frontend.md) | Next.js (App Router) for the dashboard frontend | Accepted |
| [0004](0004-mock-data-strategy.md) | Static, in-repo mock data instead of a fixture API or database | Accepted |
| [0005](0005-charting-library.md) | Recharts for charting | Accepted |
