# ADR 0015: Live Finance Domain in Conduit + Dynamic Holdings

## Status
Proposed

## Context
ADR 0010/0011 defined and shipped the research-copilot/triage-inbox
product shape, but entirely against fixtures in `lib/triage.ts` — no
real backend exists yet. ADR-0011-territory (the pipeline-direction
reference in this repo's skill) called for a `finance` domain in the
standalone `conduit` repo; that work starts now, for a live demo this
weekend. ADR 0001's mock-only constraint is explicitly lifted for this
feature only, per that same reference doc.

Colby also wants holdings to stop being a fixed fixture list: add/remove
a security on the fly (stocks, ETFs, treasury bills, index funds), with
AAPL + NVDA as the default starting set instead of the old 7-holding
mix. Colby is still learning finance himself, so triage/brief copy
needs to explain unfamiliar terms inline, not assume prior knowledge.

Time-boxed: a presentation is this weekend. Scope is deliberately a
minimal but REAL live slice, not full coverage.

## Decision

### 1. Dynamic holdings (replaces fixed fixture list)
- New Conduit table `finance_holdings`: `id, ticker, asset_type
  ('equity'|'etf'|'treasury'|'index'), active, created_at`.
- `ai-gateway` endpoints: `GET /finance/holdings`,
  `POST /finance/holdings {ticker, asset_type}` (also triggers an
  immediate `finance_ingest` job for that ticker — see below),
  `DELETE /finance/holdings/{ticker}` (soft delete, `active=false`;
  history/citations already fetched for it are kept, just stop showing
  it in the live triage view).
- Seed data: AAPL, NVDA, both `equity`, inserted by
  `sql/00X_finance_seed.sql` on first migration.
- Frontend: holdings list becomes a real settings surface (simple
  list + ticker input + asset-type dropdown + remove button) backed by
  these endpoints when live mode is on; add validates the ticker
  against EDGAR's company-ticker lookup before accepting it, so a typo
  fails fast with a plain-language error instead of silently queuing a
  job that will never find data.

### 2. Finance domain in Conduit (new job types + tables)
- `finance_documents`: raw ingested docs — `id, ticker, source
  ('sec_edgar'|'finnhub_news'), doc_type, url, title, published_at,
  raw_text, fetched_at`.
- `finance_analyses`: one row per analysis run — `id, ticker, summary,
  event_type, sentiment, materiality, citations JSONB (array of
  {document_id, url, excerpt}), created_at, job_id`.
- Job type `finance_ingest {ticker}`: fetches new SEC EDGAR filings
  (`data.sec.gov`, no key, required `User-Agent` header) and — if a
  Finnhub key is configured — recent company news; writes rows to
  `finance_documents`; on completion enqueues `finance_analyze` for any
  newly-fetched documents.
- Job type `finance_analyze {ticker, document_ids}`: LLM pass over the
  fetched documents for a ticker, produces one `finance_analyses` row.
  Every claim must cite a `document_id` that's actually in
  `document_ids` — the handler validates every citation's URL exists in
  the fetched set before writing the result, hard failure (not a soft
  warning) if it doesn't, per the carried-forward anti-fabrication
  guardrail.
- `GET /finance/triage`: aggregates the latest `finance_analyses` row
  per active holding into the Act/Watch/Reviewed shape the UI already
  renders from fixtures — same response shape as the current
  `lib/triage.ts` fixture type, so the frontend data layer swaps source,
  not shape.
- Language guardrail carried forward unchanged (ADR 0010/0011): no
  buy/sell/hold, "attention needed" not a verdict. Additionally, since
  Colby is learning finance himself: every unfamiliar term (10-Q, Form
  4, materiality, etc.) that appears in generated copy gets a one-line
  plain-language gloss inline (prompt-level instruction to the LLM, not
  a UI tooltip system — keep it simple for the deadline).

### 3. Scheduling (uses Conduit ADR 0007)
- One `schedules` row per active holding,
  `job_type='finance_ingest'`, `payload_template={"ticker": "<T>"}`,
  default `interval_seconds = 21600` (6h) — the core agentic loop.
- `POST /finance/holdings` inserting a new holding also inserts its
  schedule row; `DELETE` disables (not deletes) the schedule row so
  re-adding the same ticker later doesn't duplicate schedules.
- A manual "Refresh now" button in the UI hits a direct
  `POST /finance/holdings/{ticker}/refresh`, which enqueues
  `finance_ingest` immediately — bypasses the schedule, useful for the
  live demo so you aren't waiting 6 hours on stage.

## What stays, unchanged
- Fixture mode (`lib/triage.ts`) stays as a fallback demo path, selected
  by an env flag (`NEXT_PUBLIC_FINANCE_LIVE=1` to enable live). If live
  mode has an outage during the actual presentation, flipping the flag
  off gets back to the known-good fixture demo instantly.
- `/portfolio-health`, `/retirement`, `/scenarios`, `/diversification` —
  untouched; this ADR only touches the triage inbox's data source and
  the holdings list.
- UI visual design — unchanged per this round's explicit scope (interface
  is fine for now).

## Scope for this weekend (explicit non-goals)
- Only AAPL + NVDA need to be proven genuinely live end-to-end by the
  presentation. Add/remove holdings works generally, but treasury
  bills and index funds have no SEC filings and often no Finnhub
  company-news coverage — for those, `finance_ingest` should complete
  gracefully with zero documents and the triage view should show a
  plain "no recent filings or news found for this holding" state,
  never an error or a fabricated analysis. Full coverage for non-equity
  asset types is a follow-up, not blocking this ADR.
- No Finnhub key exists yet (Colby to provision). `finance_ingest` must
  work on SEC EDGAR alone when no key is configured — Finnhub is
  additive, not required for the live slice to function.

## Consequences
- Frontend needs a small data-layer swap (fetch from `/finance/triage`
  vs. import from `lib/triage.ts`) behind the live-mode flag — not a
  rewrite of the triage/detail components themselves.
- `finance_ingest` is the first Conduit handler to call an external
  HTTP API rather than only an LLM; needs its own HTTP client with the
  SEC-required `User-Agent` and basic rate-limiting (10 req/sec cap).
- This is the first domain to use scheduled jobs (Conduit ADR 0007) —
  if that primitive has rough edges, finance is where they'll surface
  first.
