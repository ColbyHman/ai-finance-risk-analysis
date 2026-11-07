# 0012: Scope narrowing — remove the risk-dashboard-era pages

## Status
Accepted

## Context
After ADR 0011 implemented the triage inbox / Portfolio Health /
holding-detail pages for real, the app still carried five routes from
the earlier "AI Finance Risk Analysis" risk-dashboard era: `/retirement`
(Monte Carlo projection), `/scenarios` (drawdown replay),
`/diversification` (concentration scoring), `/actions` (suggested
levers), and `/securities` (the old risk-score list view), plus a dead
`/digest` redirect left over from ADR 0010's intermediate state.

These pages each had their own inline `<header>` with the old
"AI Finance Risk Analysis" title and light theme, never updated to the
dark "Confident Flat" system from ADR 0011 (they were explicitly
deprioritized in that build — "don't need to redesign, just don't
break"). The result, surfaced directly by Colby: the app now reads as
two different, inconsistently-styled products glued together — a
"Finance Copilot" that researches holdings for you, and a leftover
"AI Finance Risk Analysis" dashboard that answers unrelated questions
(am I on track for retirement, what would a historical crash do to
this portfolio, what's my sector concentration).

## Decision
Delete the five risk-dashboard-era routes and their dedicated
components outright — not hide them behind a flag, not leave them
unlinked. `git rm`, not a redirect:

- `app/retirement/`, `app/scenarios/`, `app/diversification/`,
  `app/actions/`, `app/securities/page.tsx` (list view — the dynamic
  `app/securities/[ticker]/page.tsx` detail route stays, it's part of
  the Finance Copilot surface)
- `app/digest/` (dead redirect, no longer needed)
- `components/RetirementProjection.tsx`, `ScenarioExplorer.tsx`,
  `SuggestedActions.tsx`, `DiversificationCharts.tsx`,
  `DiversificationScoreCard.tsx`, `RiskBadge.tsx`
- `lib/projection.ts` (only consumer was the two deleted pages)
- All now-unused exports in `lib/mock-data.ts` — the file dropped from
  1219 lines to the ~260 that `lib/digest.ts`/`lib/triage.ts` actually
  read (persona, the news/sentiment/tax-flag types, and `digestInputs`)

`SiteNav` now lists exactly two links: Inbox, Portfolio Health —
matching the original three-page clickable mockup from the design
review, not the seven-route nav that accreted across ADRs 0001-0010.

## What stays
- `/` (triage inbox), `/portfolio-health`, `/securities/[ticker]` —
  unchanged by this ADR, already correct per ADR 0011.
- ADRs 0001-0010 themselves are left as written (this repo's standing
  convention — they document what was true when written, not edited
  to pretend the retirement/scenario/diversification work never
  happened). This ADR documents that their UI was later removed, not
  that the decisions were wrong at the time.

## Consequences
- The app is now exactly three routes, one visual system, one
  consistent brand ("Finance Copilot," not "AI Finance Risk
  Analysis" — that title only ever existed on the pages just
  deleted).
- The retirement-projection and historical-drawdown-replay concepts
  (genuinely useful ones, per ADR 0009) have no current home. If
  wanted again, they'd need their own placement decision — bolting
  them back onto the triage inbox would repeat the exact mixing this
  ADR removes. Not scheduled, flagging as a known gap rather than
  silently losing the idea.
- `mock-data.ts`'s trim is mechanical (removed only exports with zero
  real importers, verified via grep before deleting each block), not
  a rewrite of what remains.
