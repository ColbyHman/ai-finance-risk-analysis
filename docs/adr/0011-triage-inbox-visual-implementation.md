# 0011: Triage-inbox visual implementation — dark "Confident Flat" system, Act/Watch queue, holding-detail restructure

## Status
Accepted

## Context
ADR 0010 defined the research-copilot product shape (triage queue +
per-security brief, replacing a static risk dashboard) but shipped it
inside the app's original light theme and a card-grid layout
(`DigestPage`/`DigestCard`) that only loosely matched the final product
intent. Several rounds of mockup iteration followed
(`design/mockups/triage-inbox.html` through `clickable-triage.html`,
`clickable-health.html`, `clickable-detail.html`), converging on a
dark, pill-everything visual system ("Style C: Confident Flat") and a
clickable three-page flow that Colby reviewed and approved. This ADR
documents wiring that already-approved design into production
React/Tailwind — it is not re-litigating the UX from ADR 0010/0011's
mockup phase, just recording what shipped and why, per this repo's ADR
culture.

## Decision
1. **Dark visual system, adopted at the layout level.** Tokens lifted
   verbatim from the approved mockups: background `#191c1f`, card
   surface `#20242a`, secondary surface `#262b32`, border `#2d333b`,
   text `#f4f4f4`/`#9ba3ab`/`#6b7280`, semantic-only green/red/amber
   (`#4ade80`/`#f87171`/`#fbbf24`). Pill radius (999px) on every
   badge/button/toggle, zero box-shadows, tabular numerals on every
   numeric value. Applied in `app/layout.tsx` + `globals.css` so the
   shell is dark everywhere, not just on the three redesigned pages —
   `/retirement`, `/scenarios`, `/diversification`, `/actions` keep
   their own light card content unchanged internally (out of scope for
   a visual-implementation ADR) but no longer sit on a jarring white
   page shell when reached from the new nav.

2. **`/` becomes the Act/Watch/Reviewed triage queue**, replacing the
   card-grid digest (`DigestPage`/`DigestCard`, now deleted). Holdings
   group into Act, Watch, and a collapsed "Reviewed / no action
   needed" list; an empty state covers the all-caught-up case. "Mark
   reviewed" is client-side `useState`, no persistence (POC). Below
   the queue, portfolio-level signals (concentration, correlation) —
   information no single holding's triage would surface — replace what
   had been a secondary holdings table in earlier mockup iterations.

3. **`/portfolio-health` becomes the quick-glance performance page**:
   hero value + timeframe toggle + chart (accent color follows the
   *actual* sign of the selected timeframe's change, never
   hardcoded — the up/down color-flip bug fix carried over from the
   mockup), biggest-movers row, a holdings price/return table, an
   allocation bar, and risk context demoted to a small supporting
   card explicitly labeled "describes behavior, not instruction."
   Deliberately kept a separate page from the triage queue (see the
   `ai-finance-risk-analysis` skill's UI-taste notes): triage answers
   "what needs attention," health answers "how is it doing."

4. **`/securities/[ticker]` gains the full research-copilot detail
   view**: thesis check with a verdict chip (weakens/supports/neutral,
   always paired with its reason), bull case / bear case with inline
   citation markers, an upcoming-catalysts list, a chronological
   timeline, a "what this system couldn't verify" disclosure, and a
   per-citation "show your work" drawer (raw excerpt, source-quality
   tag, model classification). Replaces the old
   `SecurityBrief`/`AIAnalysisPanel`/`SentimentSignalBadge`/
   `TaxLotFlagNotice`/`TrendSeriesChart`/`RiskHistoryChart` stack,
   which is deleted along with `RiskCharts`/`SummaryCard`/
   `TopContributorsTable`/`AnomalyFeed` (all only reachable from the
   surfaces this ADR replaces). `/digest` redirects to `/` rather than
   being deleted outright, so old links/bookmarks still resolve.

**Guardrail carried forward unchanged from ADR 0010, re-verified on
every piece of copy ported from the mockups or newly written:** no
buy/sell/hold language, no bare rating/score without its basis shown,
sentiment and signals framed as information to form a view from, never
a directive.

## What stays, unchanged
- The retirement persona, holdings set (NVDA/AAPL/MSFT/VTI/VXUS/BND/
  Cash), and every modeling assumption in `lib/mock-data.ts` —
  unchanged, already matched the "auto-researcher pipeline" holdings
  set from the ADR-0011-territory reframe before this visual pass
  started.
- `/retirement`, `/scenarios`, `/diversification`, `/actions` — same
  routes, same internal content, same ADR-0009-documented modeling.
  Only the shared nav/page-shell background changed around them.
- `/securities` (the list view) — unchanged; still a plain table
  linking into the now-redesigned `/securities/[ticker]`.
- ADR 0001's "mock data only, no backend/plumbing" constraint.

## Consequences
- New data module `lib/triage.ts`: triage-holding fixtures,
  portfolio-level signals, Portfolio Health fixtures (holdings,
  per-timeframe series, benchmark path, risk-context figures), and the
  richest addition — a `HoldingDetail` record per ticker (thesis,
  verdict, bull/bear with citations, catalysts, timeline, "can't
  verify" list, and a source record per citation) covering all 7
  holdings including the two low-activity index funds and Cash, which
  render minimal pages rather than breaking. Content for all of this
  is copied verbatim from the approved mockups, not invented — see the
  build's own report for the handful of places a literal copy wasn't
  possible (e.g. Tailwind-equivalent spacing/sizing, not new facts).
  Reuses `lib/digest.ts`'s `computeRelevanceScore` for an attached
  relevance figure rather than duplicating a second ranking scheme.
- `components/SiteNav.tsx` rewritten as the dark pill-tab nav from the
  mockups, keeping every existing route reachable (Inbox, Portfolio
  Health, Securities, Retirement, Scenarios, Diversification, Actions)
  — not trimmed down to just the two mockup pages' own nav.
- Deleted now-dead components: `DigestPage`, `DigestCard`,
  `SecurityBrief`, `AIAnalysisPanel`, `SentimentSignalBadge`,
  `TaxLotFlagNotice`, `TrendSeriesChart`, `RiskHistoryChart`,
  `RiskCharts`, `SummaryCard`, `TopContributorsTable`, `AnomalyFeed`.
  `RiskBadge` and `DiversificationScoreCard` are kept — still used by
  the unchanged `/securities` list and `/diversification`.
- `docs/screenshots/` and `README.md` updated to describe the new `/`,
  `/portfolio-health`, and `/securities/[ticker]`, replacing
  references to the retired digest-card/dashboard versions.
