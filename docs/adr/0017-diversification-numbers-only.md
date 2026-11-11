# ADR 0017: Diversification on Portfolio Health — Numbers Only

## Status
Accepted (Colby, 2026-11-11)

## Context
Colby asked to add diversification risk, unsure whether it needed AI.
Free published data covers it:
- each fund's asset split, the sector split of its stock portion, and
  its top-10 holdings;
- each stock's sector;
- two years of daily closes.

Colby decided:
- **Where:** in Portfolio Health, not a new page.
- **What:** numbers only. "Percentage of allocation is enough evidence."
  Descriptive words are fine only when they are arithmetically true of
  the number itself, e.g. "62% is a majority".

ADR 0016's honesty rules carry forward.

## Decision
New Conduit route `GET /api/v1/finance/portfolio/diversification`
(`finance/diversification.go`). It is plain arithmetic, unit-tested
against a hand-worked portfolio. A **Diversification** section at the
bottom of Portfolio Health renders it.

| Block | Figure | Definition |
|---|---|---|
| Concentration | Largest position, top-3 share | % of portfolio value (units × latest price) |
| | "Sized like N equal-sized holdings" | 1 ÷ Σ(weight²), shown with that definition |
| Asset mix | Stocks / bonds / cash / other | Each fund split by its published asset mix |
| Sector exposure | % of portfolio, and % of the stock portion | Direct stocks + each fund's stock part × its sector weights, drawn as direct vs through funds |
| Single-company exposure | Direct, through funds, total | Fund value × the company's weight in the fund's published top holdings |
| Moved together | Pairwise correlation of daily returns, and % of days both moved the same way | Last 12 months, days both traded, minimum 60 shared days; plus the simple average over pairs |

**Wording rule.** The only words attached to a number are fractions
that are strictly true of it:

| Share | Wording |
|---|---|
| > 75% | "more than three-quarters" |
| > ⅔ | "more than two-thirds" |
| > 50% | "a majority" |
| > ⅓ | "more than a third" |
| > 25% | "more than a quarter" |

The page never uses thresholds from outside the data ("commonly called
concentrated above …"), never says good or bad, and never suggests an
action. The correlation grid is shaded blue by strength; there's no
red/green, because neither end is a verdict.

**Stated limits on the page:**
- Look-through covers only each fund's published top holdings (VTI's
  top 10 are 34.7% of the fund), so company totals can only be
  understated, never overstated.
- A holding whose make-up can't be fetched counts as "unclassified" and
  is named.
- Holdings with zero units are left out.

**No AI.** Every figure is computable, and Colby chose numbers only.
Two AI options were offered and are not built:
- an LLM summary constrained to these numbers;
- using exposure in the triage inbox ("NVDA news touches 13.0% of the
  portfolio, including through VTI"). This one is still arithmetic.

## Consequences
- The "hidden" concentrations become visible:
  - With the test units, technology is 60.2% of the portfolio: 46.1%
    held directly and 14.1% through VTI/VXUS.
  - NVDA is 12.97% once VTI's 2.23% is added to the 10.73% held
    directly.
- **Upstream calls:** one more Yahoo `quoteSummary` call per holding
  (cached 24 h). The price history reuses ADR 0016's two-year
  dividend-history call (cached 6 h). The first page load costs about
  0.4 s; later loads come from cache.
- **Not covered:**
  - Region (US vs international): Yahoo publishes no country split for
    funds.
  - Bond duration and credit quality.
  - Both would need another data source.

## What stays unchanged
- Portfolio Health's units editor, value and allocation table, and
  ADR 0016's day-change column and status line.
- The triage inbox.
