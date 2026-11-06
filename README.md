# AI Finance Risk Analysis — Dashboard POC

A proof-of-concept dashboard illustrating what an AI-driven personal
portfolio risk analysis product could look like: one individual investor's
diversified brokerage account (~$300,000, 7 holdings), an AI risk read-out
per security, and — the part per-security analysis alone can't show — a
portfolio-level diversification risk view that looks through index funds
to their underlying sector weightings.

**This is a POC with no backend, no data pipeline, and no real data.**
Everything on screen is synthetic/mock data defined in
[`apps/web/src/lib/mock-data.ts`](apps/web/src/lib/mock-data.ts). See
[`docs/adr/0001-poc-scope-no-plumbing.md`](docs/adr/0001-poc-scope-no-plumbing.md)
for why, and the rest of [`docs/adr/`](docs/adr/) for the other decisions
behind this build — [`docs/adr/0008-personal-portfolio-reframe.md`](docs/adr/0008-personal-portfolio-reframe.md)
covers the portfolio and diversification-risk design specifically.

## Screenshots

Full page:

![Dashboard — full page](docs/screenshots/dashboard-full.png)

Above-the-fold viewport:

![Dashboard — viewport](docs/screenshots/dashboard-viewport.png)

Per-security view — every holding ranked by AI risk score, with model
confidence:

![Securities — list](docs/screenshots/securities-list.png)

One holding in depth — AI-assisted risk read-out, the signals driving
it, and a 30-day trend:

![Security — detail](docs/screenshots/security-detail.png)

Diversification risk — the portfolio-level view: a diversification
score, asset allocation, effective sector exposure once index funds are
looked through, and what the AI flagged:

![Diversification risk](docs/screenshots/diversification.png)

## Structure

```
ai-finance-risk-analysis/
├── apps/
│   └── web/              # Next.js (App Router) dashboard
│       └── src/
│           ├── app/              # page.tsx, layout.tsx, securities/, diversification/
│           ├── components/       # SummaryCard, RiskCharts, TopContributorsTable,
│           │                     # AnomalyFeed, RiskBadge, AIAnalysisPanel,
│           │                     # RiskHistoryChart, DiversificationCharts,
│           │                     # DiversificationScoreCard
│           └── lib/mock-data.ts  # all dashboard data (synthetic)
├── docs/
│   ├── adr/               # architecture decision records
│   └── screenshots/       # dashboard screenshots (this README embeds them)
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
- [Recharts](https://recharts.org) for the exposure, risk-trend, and
  sector-exposure charts
- [lucide-react](https://lucide.dev) for icons

See [`docs/adr/`](docs/adr/) for the reasoning behind each of these choices.
