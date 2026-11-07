# 0010: Research-copilot reframe — per-security briefs + portfolio-wide "what changed"

## Status
Accepted

## Context
ADR 0007 dropped a side-by-side "AI vs. traditional research" comparison
view because it duplicated a live presentation. ADR 0008/0009 then built
out the tool around a single persona's retirement outlook: a seeded
Monte Carlo projection, historical drawdown replay, and portfolio
diversification risk — all answering "am I on track?" and "why is this
flagged?"

None of that is actually a substitute for what a person doing their own
"traditional investment research" does day to day: reading company
fundamentals, following news, tracking sentiment, watching for tax-law
or tax-lot events, spotting trends. The dashboard tells you about risk
in the abstract; it doesn't reduce the time between "something changed"
and "I've formed an opinion," which is the actual job to be done.

## Decision
Add a research-copilot layer on top of the existing retirement/risk
tooling, structured as two new surfaces:

1. **Per-security brief** (`/securities/[ticker]`, extending the
   existing page) — a bird's-eye card per holding with drill-down,
   covering:
   - Fundamentals snapshot vs. the security's own history and peers
   - News digest: a summarized "what changed since you last looked,"
     not a raw headline list
   - Sentiment signal (analyst tone shift, retail/social chatter trend)
     — rendered as a labeled signal with its own confidence/source
     trail, never collapsed into a rating
   - Tax relevance: lot-level long/short-term timing, wash-sale flags,
     upcoming tax-law changes touching this holding
   - Trend context: price/volume/fundamental trend lines over a
     longer window than the current 30-day chart
   - Every item expands into its sources/reasoning on click

2. **Portfolio-wide "what changed" feed** (new `/digest` route, becomes
   the landing surface ahead of the current dashboard) — all holdings'
   changes ranked by relevance to *this* portfolio (position size,
   news volume, tax-lot timing, diversification impact), each entry
   linking straight into the relevant security's brief. This is the
   actual time-to-decision lever: triage here, drill down only where
   warranted.

**Hard guardrail, stricter than ADR 0007's framing:** no recommendation
language anywhere in either surface. No ratings, no "buy/sell/hold," no
"AI suggests." Every signal is presented as information plus "why this
might matter to you," ending in a drill-down, never a directive. The
existing `/actions` page (ADR 0009's suggested actions) already treads
close to this line with ranked levers — it's kept as-is since it's
about contribution/allocation mechanics, not security-level advice, but
no new surface should narrow that gap further.

## What stays, unchanged
- `/retirement` (Monte Carlo projection), `/scenarios` (drawdown
  replay), `/diversification`, `/actions` — different question
  ("am I on track," "what could go wrong") than research ("what should
  I know right now"). Kept as separate tabs, not merged in.

## Consequences
- New mock-data shapes: `NewsDigestEntry`, `SentimentSignal`,
  `TaxLotFlag`, `TrendSeries` per security; a portfolio-level
  `DigestEntry[]` feed with a relevance score.
- `/digest` becomes the first thing a user sees: it **replaces** the
  current dashboard as the landing page at `/`. The former dashboard
  content (`SummaryCard`, `ExposureChart`, `RiskTrendChart`,
  `TopContributorsTable`, `AnomalyFeed`) moves to its own route,
  `/portfolio-health`, unchanged, rather than being folded into the
  digest as a section or kept as a secondary tab off `/`. Confirmed
  by the user — not an open question as of this ADR's acceptance.
- This is the largest single addition to the POC so far — likely its
  own multi-step build like ADR 0009, same "mock data only, no
  plumbing" constraint from ADR 0001 still applies (synthetic
  news/sentiment/tax data, not real feeds).
- Risk: sentiment/tax-flag mock data can read as *implied* advice even
  without rating language (e.g. a loud negative-sentiment card next to
  a holding reads as "sell this"). Needs explicit neutral framing in
  copy, checked in review before merge, not just structurally absent
  ratings.
