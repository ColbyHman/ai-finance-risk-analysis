# 0008: Reframe as a personal diversified portfolio, add diversification risk

## Status
Accepted

## Context
The mock data through ADR 0007 modeled an institutional book: a hedge
fund's concentrated NVDA equity position, an EM private credit fund, an
FX forward book, an index put spread — six-to-eight-figure positions with
institutional language ("fund administrator data," "NAV policy limit,"
"macro desk"). That framing doesn't land with a general audience the way
a real individual investor's own brokerage account does, and it only
ever evaluated risk one security at a time — nothing in the product
looked at the portfolio as a whole.

## Decision
Replace the institutional mock portfolio with one real individual's
diversified brokerage account (~$300,000, 7 holdings): a broad US index
fund (VTI), three individual mega-cap tech stocks (AAPL, NVDA, MSFT), an
international index fund (VXUS), a bond fund (BND), and cash. Every
dollar figure, risk score, and AI-analysis summary across
`summaryMetrics`, `exposureByAssetClass`, `riskTrend`,
`topRiskContributors`, `anomalyAlerts`, and `securityProfiles` was
rewritten to match — not just relabeled.

Add a second, portfolio-level dimension the per-security view can't
show: **diversification risk**. Seven holdings across five asset
classes looks diversified by headline allocation alone. The new
`/diversification` page does a sector look-through — unpacking VTI's and
VXUS's own sector weightings and adding them to the three direct tech
holdings — and finds technology is an estimated 41% of the whole
portfolio, roughly three times what "3 stock picks" suggests on its
own. This is the core story: an investor can hold a textbook-diversified
*allocation* (5 asset classes, 7 tickers, equity/bond/cash split) and
still carry concentrated *risk*, because index funds aren't
sector-neutral and "different ticker" isn't the same thing as
"independent risk."

New data: `sectorExposure` (look-through sector weightings),
`diversificationScore`, `diversificationFlags`. New components:
`DiversificationScoreCard`, `DiversificationFlagsList`,
`AssetAllocationChart`, `SectorExposureChart`. New page:
`/diversification`, cross-linked from both the dashboard (a teaser
banner) and `/securities` (a line in the intro copy).

### Why a stacked bar instead of a pie/donut for asset allocation
A Recharts `Pie` rendered as a clipped partial arc (not a full circle)
in this environment's headless-browser screenshot tooling, while every
`BarChart` in the app — including the new sector-exposure chart right
next to it — rendered correctly throughout. Rather than chase a
rendering-environment-specific bug in a chart library, `AssetAllocationChart`
is a single-row 100%-stacked horizontal bar with an explicit percentage
legend underneath. It communicates "this sums to the whole portfolio"
at least as clearly as a donut would, with zero library-level risk.

## Consequences
- The old institutional-portfolio story (concentrated single-name
  equity, private credit, FX, derivatives) no longer exists anywhere in
  the mock data — this is a full replacement, not an additive mode.
- `/securities` and `/diversification` are now two different lenses on
  the same seven holdings: one evaluates each position on its own, the
  other evaluates how they overlap. Each page's intro copy says so and
  links to the other.
- `RiskCharts.tsx`'s VaR trend chart changed its dollar scale from $M
  to $K to match a ~$300K personal portfolio instead of a
  multi-hundred-million-dollar institutional book.
- If a pie/donut chart is wanted again later for some other view, test
  it directly against this environment's screenshot tooling before
  trusting it — this was a real, reproducible rendering failure, not
  a one-off.
