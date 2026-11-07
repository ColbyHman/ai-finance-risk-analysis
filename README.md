# AI Finance Risk Analysis — Research Copilot POC

A proof-of-concept triage inbox illustrating what an AI-assisted
personal-portfolio research copilot could look like for one
hypothetical early-career retirement investor: age 25, a $18,000
brokerage account (7 holdings — NVDA, AAPL, MSFT, VTI, VXUS, BND,
Cash), contributing $600/month toward a $1.5M goal at 65.

The app is built around a triage-first workflow, not a static risk
dashboard: what needs attention right now, with every claim traceable
to a source, plus the separate questions a long-term investor actually
asks (am I on track, what could go wrong, how is it doing, what should
I do). Visual system is a dark "Confident Flat" theme — see
[`docs/adr/0011-triage-inbox-visual-implementation.md`](docs/adr/0011-triage-inbox-visual-implementation.md)
for the full build record and
[`design/mockups/clickable-triage.html`](design/mockups/clickable-triage.html),
[`clickable-health.html`](design/mockups/clickable-health.html), and
[`clickable-detail.html`](design/mockups/clickable-detail.html) for the
literal approved spec these pages implement.

- **What needs my attention?** ([`/`](apps/web/src/app/page.tsx), the
  landing page — "Inbox" in the nav) — every holding grouped into
  Act / Watch / Reviewed (no action needed), each item carrying a
  headline, a one-line summary, and the specific reason it was
  flagged. "Mark reviewed" is a real client-side interaction (no
  persistence — POC). Below the queue, portfolio-level signals
  (concentration hidden inside index funds, correlated news across
  holdings) surface cross-holding analysis no single item's triage
  would catch, plus the current allocation breakdown. Never a
  buy/sell/hold call — every claim is framed as evidence to form your
  own view from, with a stated basis.
- **How is it doing?** ([`/portfolio-health`](apps/web/src/app/portfolio-health/page.tsx)) —
  a deliberately separate page from the inbox (triage changes when
  news drops; this changes when the market moves). Hero total-value
  chart with a 1D/1W/1M/YTD/1Y toggle (the chart's accent color always
  follows the actual sign of the period's change, never hardcoded),
  biggest movers linking back into the inbox or a holding's brief,
  a holdings price/return table, an allocation bar, and risk context
  (diversification score, volatility, max drawdown) demoted to a small
  card explicitly labeled "describes behavior, not instruction."
- **Why is this holding flagged, and what's the evidence?**
  ([`/securities/[ticker]`](apps/web/src/app/securities/[ticker]/page.tsx)) —
  a thesis check with a verdict chip (weakens/supports/neutral,
  always paired with its reason — never a bare rating), bull case /
  bear case with inline citation markers, upcoming catalysts, a
  chronological timeline, an explicit "what this system couldn't
  verify" disclosure, and a per-citation "show your work" drawer
  (raw excerpt, source-quality tag, model classification). Covers all
  7 holdings, including the two low-activity index funds and Cash,
  which render minimal pages rather than breaking.
- **Am I on track?** ([`/retirement`](apps/web/src/app/retirement/page.tsx)) —
  a seeded Monte Carlo projection to age 65 (10th/50th/90th percentile
  fan chart against the goal), with live sliders for contribution and
  retirement age.
- **What could go wrong?** ([`/scenarios`](apps/web/src/app/scenarios/page.tsx)) —
  2008/2020/2022-style drawdowns replayed against this persona's actual
  allocation, with a toggle comparing the same shock against a
  hypothetical 58-year-old pre-retiree to show why horizon matters.
- **How concentrated is this, really?** ([`/diversification`](apps/web/src/app/diversification/page.tsx)) —
  a diversification score, asset allocation, and effective sector
  exposure once index funds are looked through (direct holdings vs.
  via index funds).
- **What should I do?** ([`/actions`](apps/web/src/app/actions/page.tsx)) —
  three ranked, single-lever suggestions (each with a before/after on
  tech exposure and on the pessimistic-case outcome at 65), plus what
  fee drag costs over 40 years even on a low-cost portfolio.

**This is a POC with no backend, no data pipeline, and no real data.**
Everything on screen is synthetic/mock data defined in
[`apps/web/src/lib/mock-data.ts`](apps/web/src/lib/mock-data.ts) and
[`apps/web/src/lib/triage.ts`](apps/web/src/lib/triage.ts) (the inbox,
Portfolio Health, and holding-detail fixtures — content copied
verbatim from the approved mockups, not invented). See
[`docs/adr/0001-poc-scope-no-plumbing.md`](docs/adr/0001-poc-scope-no-plumbing.md)
for why, and the rest of [`docs/adr/`](docs/adr/) for the decisions
behind this build —
[`docs/adr/0009-retirement-persona-and-projection.md`](docs/adr/0009-retirement-persona-and-projection.md)
documents the persona and every modeling assumption behind the
projection, scenario replay, and suggested-action math, and
[`docs/adr/0010-research-copilot-reframe.md`](docs/adr/0010-research-copilot-reframe.md) /
[`docs/adr/0011-triage-inbox-visual-implementation.md`](docs/adr/0011-triage-inbox-visual-implementation.md)
document the triage-queue product shape and its final visual
implementation, respectively.

## Screenshots

Inbox — the landing page, Act/Watch triage queue with portfolio-level signals:

![Inbox](docs/screenshots/triage-inbox.png)

Inbox — after marking an item reviewed (client-side state, no persistence):

![Inbox — mark reviewed](docs/screenshots/triage-inbox-mark-reviewed.png)

Portfolio Health — hero value chart, movers, holdings table, allocation, risk context:

![Portfolio Health](docs/screenshots/portfolio-health.png)

Portfolio Health — 1D timeframe selected (chart color follows the actual sign):

![Portfolio Health — 1D](docs/screenshots/portfolio-health-1d.png)

Holding detail — NVDA's thesis check, bull/bear evidence, catalysts, and timeline:

![Security detail — NVDA](docs/screenshots/security-detail-nvda.png)

Holding detail — a citation's "show your work" drawer open:

![Security detail — NVDA, source drawer](docs/screenshots/security-detail-nvda-drawer.png)

Am I on track? — retirement projection with live sliders:

![Retirement projection](docs/screenshots/retirement.png)

What could go wrong? — historical drawdown replay with horizon comparison:

![Scenario replay](docs/screenshots/scenarios.png)

What should I do? — ranked suggested actions and fee drag:

![Suggested actions](docs/screenshots/actions.png)

Per-security view — every holding ranked by AI risk score, with model confidence:

![Securities — list](docs/screenshots/securities-list.png)

Diversification risk — the portfolio-level view: a diversification
score, asset allocation, effective sector exposure once index funds
are looked through (direct holdings vs. via index funds), and what
the AI flagged:

![Diversification risk](docs/screenshots/diversification.png)

## Structure

```
ai-finance-risk-analysis/
├── apps/
│   └── web/              # Next.js (App Router) app
│       └── src/
│           ├── app/              # page.tsx (inbox), portfolio-health/,
│           │                     # retirement/, scenarios/, actions/, securities/,
│           │                     # diversification/, digest/ (redirects to /)
│           ├── components/       # HoldingDetailView, SiteNav, RiskBadge,
│           │                     # RetirementProjection, ScenarioExplorer,
│           │                     # SuggestedActions, DiversificationCharts,
│           │                     # DiversificationScoreCard
│           └── lib/
│               ├── mock-data.ts  # persona, projection, diversification mock data
│               ├── triage.ts     # inbox, Portfolio Health, holding-detail mock data
│               ├── projection.ts # seeded Monte Carlo + scenario/fee-drag math
│               └── digest.ts     # pure relevance-ranking function, reused by triage.ts
├── design/
│   └── mockups/           # approved static-HTML design mockups (reference only,
│                           # not shipped code) — clickable-triage.html,
│                           # clickable-health.html, clickable-detail.html are the
│                           # literal spec apps/web implements
├── docs/
│   ├── adr/               # architecture decision records
│   └── screenshots/       # app screenshots (this README embeds them)
└── package.json            # npm workspaces root
```

## Running it locally

```bash
npm install
npm run dev --workspace=apps/web
# http://localhost:3000
```

Production build:

```bash
npm run build --workspace=apps/web
npm run start --workspace=apps/web
```

## Tech

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript, Tailwind CSS v4)
- [Recharts](https://recharts.org) for the retirement/scenario/diversification charts;
  the inbox, Portfolio Health, and holding-detail pages draw their own
  inline SVG sparklines/area charts per the approved mockups
- [lucide-react](https://lucide.dev) for icons on the untouched routes

See [`docs/adr/`](docs/adr/) for the reasoning behind each of these choices.
