# ADR 0009: Retirement Persona and Projection Methodology

## Status

Accepted

## Context

ADR 0008 reframed the mock portfolio around one individual investor and added a
portfolio-level diversification-risk view, but the dashboard itself was still
static: a risk score and a 1-day Value at Risk number, which matter little to
someone with decades until they touch the money. The user's request was
explicit — rework the dashboard around a single hypothetical persona, an
early-career retirement investor, so it answers what a long-term individual
investor actually needs: am I on track, what could go wrong, why is each flag
raised, and what should I do about it.

This ADR documents the persona, every modeling assumption behind the
projection/scenario/suggested-action math, and the UI decisions that came out
of implementing it — in one place, deliberately, so the assumptions are easy
to audit by hand rather than scattered across component comments.

## The persona

Age 25, plans to retire at 65 (40-year horizon). Current balance $18,000,
contributing $600/month, goal of $1.5M at 65 — all five fields adjustable (the
projection page's sliders change retirement age and contribution live).

Portfolio: the same allocation percentages introduced in ADR 0008, resized to
this persona's actual balance — VTI 30% ($5,400), AAPL 12% ($2,160), NVDA 10%
($1,800), MSFT 8% ($1,440), VXUS 15% ($2,700), BND 20% ($3,600), cash 5%
($900). The ~41% effective technology exposure finding from ADR 0008 carries
over unchanged, since it's a function of percentages, not dollar amounts.

## Modeling assumptions (the full list)

Per-asset-class, in `assetClassAssumptions` (apps/web/src/lib/mock-data.ts):

| Asset class | Expected real return | Volatility | Expense ratio | Weight |
|---|---|---|---|---|
| US Equity — Index Fund (VTI) | 7.0%/yr | 15% | 0.03% | 30% |
| US Equity — Individual Stocks | 7.0%/yr | 32% | 0% | 30% |
| International Equity (VXUS) | 6.5%/yr | 17% | 0.08% | 15% |
| Fixed Income (BND) | 2.0%/yr | 5% | 0.03% | 20% |
| Cash & Equivalents | 0.0%/yr | 1% | 0% | 5% |

Returns are **real** (inflation-adjusted) long-run averages, not a forecast of
any specific year. Individual stocks get the same long-run equity return as
the index funds — nobody can forecast one company's alpha over 40 years — but
meaningfully higher volatility, reflecting realized single-stock behavior.
Inflation itself is assumed at 2.5%/yr, used only to frame the "real dollars"
decision below, not as an input to the projection math.

**Portfolio-level blended figures** (`portfolioAssumptions`):
- Blended real return: 5.58%/yr — the weighted average of the table above.
- Blended volatility: 14%/yr — **not** the weighted average (17.7%). This is
  the single biggest deliberate simplification in the whole feature: the
  projection uses one blended volatility for the entire portfolio rather than
  a full covariance-matrix Monte Carlo across each holding. 14% was chosen as
  a plausible figure for a ~75% equity / 20% bond / 5% cash portfolio
  (diversification lowers realized volatility below the naive weighted
  average of its parts), not derived from the naive average by formula. Every
  "adjusted allocation" figure elsewhere in this feature (suggested actions)
  recomputes volatility as `naiveWeightedAverage × (0.14 / 17.7%)` — i.e. the
  same proportional discount — so the simplification is at least applied
  *consistently*, even though it's still a simplification.
- Blended expense ratio: 0.027%/yr — the actual weighted average (used as-is
  for the fee-drag calculation, no adjustment needed since it's additive).
- Seed: 42, path count: 2,000 — see "Why a seeded Monte Carlo" below.

**Everything is computed in real (inflation-adjusted) dollars.** The $1.5M
goal, every chart axis, every dollar figure on every page means today's
purchasing power, not an inflated future number. This was a deliberate choice
over nominal dollars: a 25-year-old reasoning about "$1.5M in 2066 dollars" is
reasoning about a number that means nothing to them; "$1.5M in today's buying
power" they can actually evaluate against today's cost of living.

## Why a seeded Monte Carlo (not a closed-form / analytic approximation)

The brief allowed either. A seeded Monte Carlo was chosen because: (1) it
produces the 10th/50th/90th percentile fan chart directly, without a
closed-form percentile formula for a GBM-with-contributions process that a
reader would have to trust blindly; (2) "seeded" makes it fully reproducible
— the same inputs always produce the same chart, which is what lets the
suggested-actions page quote exact before/after numbers without live
recomputation drifting them; (3) it is cheap enough (2,000 paths × up to 40
years ≈ 80,000 steps) to re-run on every slider change without debouncing.

Implementation (`apps/web/src/lib/projection.ts`): mulberry32, a small
public-domain PRNG, seeded once per `runProjection` call; a Box-Muller
transform turns its uniform output into standard-normal draws; each year,
each simulated path does `balance = (balance + contribution) × exp(drift +
volatility × Z)` where `drift = expectedReturn - 0.5 × volatility²` (the
standard GBM correction so the *median* path compounds at the blended real
return, not the mean). Contributions are added once per year, before that
year's growth, and are held constant in real terms (no raises modeled).

One consequence worth stating plainly: the **median** of a lognormal process
grows slower than the arithmetic mean, because of volatility drag. A
deterministic "7% compounded for 40 years" calculation will overstate what
the *median* simulated outcome actually looks like once volatility is
modeled honestly. This is real, not a bug — it's the same reason a "100%
chance of the average return every year" retirement calculator is
optimistic.

## Scenario replay methodology

2008, 2020, and 2022 drawdowns are replayed by forcing year 1's return to a
fixed peak-to-trough figure (`firstYearShock` in `runProjection`) instead of
drawing it randomly, then letting years 2-40 draw normally as usual. The
peak-to-trough and recovery-time figures themselves
(`drawdownScenarios` in mock-data.ts) are **illustrative approximations for a
portfolio with this persona's specific allocation and tech tilt — not a
backtest of these exact tickers** (several didn't exist in their current form
in 2008). 2022 is deliberately modeled as worse than a generic diversified
portfolio of the same allocation would have been: it was the one period where
growth/tech stocks fell harder than the broad market *and* bonds fell too
(rising-rate environment), so neither the tech-heavy equity sleeve nor the
bond sleeve cushioned the way they normally would — directly tying the
scenario page back to the diversification-risk finding.

The 58-year-old pre-retiree comparison (`preRetireeComparison`) deliberately
uses the **same** blended return/volatility assumptions as the 25-year-old
persona, for a clean apples-to-apples shock comparison. A real 58-year-old
would typically hold a more conservative allocation (more bonds, less
single-stock tech), which would blunt a drawdown like 2022 somewhat — keeping
the assumptions identical isolates the one variable this comparison is
actually about: time horizon, not allocation.

## Suggested-actions methodology

Each suggested action changes exactly one lever (allocation or contribution),
so its effect is attributable to that one change. Allocation-change actions
recompute the portfolio's blended return and volatility from
`assetClassAssumptions` with adjusted weights, using the same "naive weighted
average, scaled by the baseline's discount factor" methodology described
above — then re-run `runProjection` with those new figures to get the new
10th-percentile outcome. These are pre-computed and stored as data, not
live-recalculated in the browser, since they also appear in dashboard copy;
the worked arithmetic:

- **Trim NVDA 10%→5%, move into VXUS 15%→20%:** direct-stock tech
  contribution drops from 30pp to 25pp; VTI's own ~30%-tech weighting
  contributes 9pp (30% weight × 30% tech); VXUS's own ~12%-tech weighting
  (international markets run less tech-heavy than the US — an illustrative
  assumption, chosen so VTI(30% weight)+VXUS(15% weight) already reproduces
  the ADR 0008 baseline's 11pp "via index funds" figure almost exactly: 9pp +
  1.8pp ≈ 11pp) contributes 2.4pp at the new 20% weight. New total: 25 + 9 +
  2.4 ≈ 36%, down from 41%.
- **Raise international, VTI 30%→25%, VXUS 15%→20%:** direct-stock
  contribution unchanged at 30pp; VTI's contribution drops to 7.5pp (25% ×
  30%); VXUS's rises to 2.4pp (20% × 12%). New total: 30 + 7.5 + 2.4 ≈ 40%,
  down only 1pp from 41% — explicitly flagged in the UI that this model
  can't fully credit the diversification benefit of holding assets that
  don't move in lockstep, since it collapses the whole portfolio to one
  blended volatility figure. The action is directionally sound; the
  projection understates it.
- **Raise contribution $600→$750/mo:** no allocation change, pure savings-
  rate lever — the Monte Carlo re-run with `annualContribution = 9000`
  instead of `7200` is the only change.

## Fee-drag methodology

Deterministic, not a second Monte Carlo: grows the baseline balance and
contribution schedule for 40 years at the blended real return, once with the
blended expense ratio subtracted and once without, and reports the
difference (`feeDragOverHorizon` in projection.ts). A fee's effect on
long-run *average* growth dwarfs its effect on volatility, so a deterministic
comparison is a reasonable simplification for an illustrative figure. This
portfolio's blended expense ratio (0.027%/yr) is low — every fund here is
already a cheap index fund or a zero-fee individual stock — and the fee-drag
section deliberately leads with that, so the ~$9,000 cost over 40 years reads
as "even a low-cost portfolio isn't free," not as a complaint about this
specific portfolio's fund choices.

## UI/architecture decisions

- **Four dedicated pages** (`/`, `/retirement`, `/scenarios`, `/actions`,
  plus the existing `/securities` and `/diversification`), not one long
  scrolling dashboard — each of the brief's four questions (am I on track /
  what could go wrong / why is it flagged / what should I do) got enough
  interactive surface (sliders, scenario toggles, ranked actions) that
  cramming all four onto one page would have been unreadable. The dashboard
  leads with a compact teaser + headline stat for each, linking out.
- **1-day VaR and the headline risk score were moved to the bottom of the
  dashboard**, in a visually muted "secondary metrics" strip explicitly
  labeled as less relevant at this horizon — not deleted, since they're still
  real (short-horizon) signals, just no longer the first thing a 40-year
  investor sees. Their old headline position was replaced with "probability
  of reaching the goal" (already existed) and a new "worst-case historical
  shock" figure, computed the same way the /scenarios page does.
- **The sector look-through finding was made visual**, not just a number:
  the existing `sectorExposure` data already had a `viaIndexFunds` /
  `viaIndividualStocks` split that wasn't being charted as a breakdown before
  this feature — it's now a stacked bar per sector.
- **Every AI risk flag was reworked into three explicit parts** (what it
  means / why it matters at this horizon / what's driving it) instead of one
  paragraph, per the brief, and cross-references the scenario replay where
  relevant.
- **A real hydration bug was caught and fixed during verification**: running
  the Monte Carlo during `ScenarioExplorer`'s render produced different
  results server-side vs. client-side in this sandbox on the very first page
  load (root cause unconfirmed — possibly a module-instance or Turbopack
  dev-mode quirk, not reproduced in a minimal isolated repro). The fix:
  the Monte Carlo now only ever runs in a `useEffect`, never during render,
  for every client-side-interactive projection in this feature — a stricter
  and more defensible pattern regardless of the original cause, since none
  of this needs to be in the initial server-rendered HTML anyway (the
  dashboard's teaser banner, by contrast, intentionally computes
  server-side, since it's static and non-interactive).

## Consequences

- Every dollar figure across every page of this feature traces back to the
  tables above by hand — a reviewer doesn't have to trust a black box.
- The single-blended-volatility simplification means this tool will
  systematically understate the benefit of genuine diversification (holding
  assets that don't move together) and can't model sequence-of-returns risk
  with any more granularity than "one shock in year 1." A real financial-
  planning tool would use a covariance matrix and historical bootstrap
  resampling instead of i.i.d. lognormal draws; that's explicitly out of
  scope for this educational POC.
- Historical scenario figures are illustrative, not backtested against these
  exact tickers — stated plainly in the UI copy on `/scenarios`, not just in
  this document.
