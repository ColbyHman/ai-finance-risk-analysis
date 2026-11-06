# 0006: Per-security comparison view

## Status
Accepted

## Context
The portfolio dashboard (ADR 0001-0005) shows risk at the whole-portfolio
level: an aggregate score, VaR, and a ranked list of top contributors. It
never actually shows what the AI-assisted workflow buys you on a single
position compared to how that position would normally get reviewed — which
is the actual pitch of an "AI finance risk analysis" tool. Someone looking
at the dashboard has to take the speed/coverage claim on faith.

## Decision
Add a per-security view: `/securities` (an index, one row per position,
reusing `topRiskContributors`' set of names as tickers) and
`/securities/[ticker]` (one position, in depth). Each security's detail
page puts two things next to each other for the same position:

- **AI-assisted analysis**: risk score, model confidence, turnaround
  (sub-second, continuous), data freshness (real-time), the signals that
  drove the score, and a 30-day risk-score trend chart.
- **Traditional research**: an analyst rating, turnaround (days), data
  freshness (as of the last note), a narrative summary, and the methods
  used (earnings review, peer multiples, consensus rating).

A `verdict` ties the two together: **Methods agree** (both read the
position the same way), **AI flagged it earlier** (the AI pipeline caught
something — a concentration breach, a correlation shift — before the next
scheduled analyst review would have), or **Methods diverge** (not
implemented in the current mock data profiles, reserved for a case where
the two genuinely disagree). This is the actual point of the comparison:
most of the time the two should agree on the fundamentals, but the AI
pipeline's edge is re-scoring continuously instead of on a review cycle,
so it sometimes sees something days before a traditional process would.

All the comparison figures (turnaround time, traditional rating, signals,
etc.) are illustrative mock data for this POC, consistent with ADR 0004 —
not a benchmarked study of AI vs. analyst performance.

## Consequences
- `mock-data.ts` gained a `SecurityProfile` type with nested `ai`/
  `traditional` objects and a `riskHistory` series, plus a
  `securityProfiles` array (one entry per existing top contributor).
  `topRiskContributors`' rows now carry a `ticker` field and link to
  `/securities/{ticker}`, so the top-level dashboard and the new section
  are connected, not two disconnected demos.
- `RiskHistoryChart` is a second, single-series Recharts line chart
  (ADR 0005 applies — `"use client"`), kept separate from the
  portfolio-level `RiskCharts` component rather than generalizing a
  shared one, since a 30-day single-metric trend and the dashboard's
  dual-axis trend chart have different enough shapes that forcing one
  component to do both would need more props/branches than reuse saves.
- `/securities/[ticker]` uses `generateStaticParams` — every ticker in
  `securityProfiles` is pre-rendered at build time, consistent with the
  rest of the app having no live backend (ADR 0001).
