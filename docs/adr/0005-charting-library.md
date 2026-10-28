# 0005: Recharts for charting

## Status
Accepted

## Context
The dashboard needs two charts: a grouped bar chart (exposure % and risk
score per asset class) and a dual-axis line chart (risk score and VaR over
time). Candidates considered: Recharts, Chart.js (with a React wrapper),
visx, and hand-rolled SVG.

## Decision
Use **Recharts**. It's a thin, composable wrapper around SVG with
first-class React/TypeScript support, requires no canvas-context plumbing,
and its `ResponsiveContainer` makes the charts reflow cleanly inside the
Tailwind grid layout without extra sizing code. For a two-chart POC, a
heavier/more flexible library (visx) or a canvas-based one (Chart.js) would
add complexity with no corresponding benefit.

## Consequences
- Chart components (`apps/web/src/components/RiskCharts.tsx`) are marked
  `"use client"` since Recharts renders client-side — this is the only
  client-rendered part of an otherwise fully static page (see ADR 0003).
- If chart requirements grow significantly (e.g. candlestick/financial
  chart types, large time-series datasets needing virtualization), revisit
  this choice; Recharts is not optimized for very large datasets.
