# ADR 0015: Live Finance Domain in Conduit + Dynamic Holdings

## Status
Accepted

## Context
ADR 0010/0011 defined and shipped the research-copilot/triage-inbox
product shape, but entirely against fixtures in `lib/triage.ts` — no
real backend exists yet. The pipeline-direction reference called for a
`finance` domain in Conduit; that work starts now, for a live demo
this weekend. ADR 0001's mock-only constraint is explicitly lifted for
this feature only, per that same reference doc.

Colby also wants holdings to stop being a fixed fixture list: add/remove
a security on the fly (stocks, ETFs, treasury bills, index funds), with
AAPL + NVDA as the default starting set instead of the old 7-holding
mix. Colby is still learning finance himself, so triage/brief copy
needs to explain unfamiliar terms inline, not assume prior knowledge.

Time-boxed: a presentation is this weekend. Scope is deliberately a
minimal but REAL live slice, not full coverage.

**CORRECTION (this revision):** an earlier build mistakenly targeted a
stale standalone repo at `github.com/ColbyHman/conduit` (its own
`ai-gateway`/`worker` split, a flat `finance_holdings` table with no
schema prefix). That repo is superseded by ADR 0009/0012's merge of
Conduit into `homelab-hub` — its PR is closed, not merged. **The real
target is `homelab-hub`'s `services/conduit`**, a Go modular monolith:
domains declared by a manifest (`modules/<domain>/module.json`),
Postgres schema-per-domain (ADR 0004 in that repo), one shared
`core.jobs`/`core.job_events` queue, backend code under
`services/conduit/internal/modules/<domain>/`. This revision rewrites
the architecture section below to match that shape; the product-level
decisions (dynamic holdings, AAPL/NVDA default, citation guardrail,
plain-language glosses) are unchanged from the original version.

## Decision

### 1. Dynamic holdings (replaces fixed fixture list)
- New table `finance.finance_holdings` in Conduit's `finance` Postgres
  schema (schema-per-domain, not a flat table in a shared DB):
  `id, ticker, asset_type ('equity'|'etf'|'treasury'|'index'), active,
  created_at, updated_at`.
- Conduit's `finance` module (manifest `modules/finance/module.json`,
  `api.basePath: /api/v1/finance`) exposes: `GET /holdings`,
  `POST /holdings {ticker, asset_type}` (validates the ticker against
  SEC EDGAR's `company_tickers.json` for equity/etf, creates a
  `core.schedules` row, and enqueues an immediate `finance_ingest` job
  for that ticker — see below), `DELETE /holdings/{ticker}` (soft
  delete, `active=false`; history/citations already fetched for it are
  kept, just stop showing it in the live triage view, and its
  `core.schedules` row is disabled rather than deleted).
- Seed data: AAPL, NVDA, both `equity`, inserted by
  `modules/finance/db/migrations/0002_seed_aapl_nvda.sql` — plus a
  `core.schedules` row per ticker so they're live without any manual
  `POST /holdings` call.
- Frontend: holdings list becomes a real settings surface (simple
  list + ticker input + asset-type dropdown + remove button,
  `HoldingsManager.tsx`) backed by these endpoints when live mode is
  on; add validates the ticker against EDGAR's company-ticker lookup
  before accepting it, so a typo fails fast with a plain-language error
  instead of silently queuing a job that will never find data.

### 2. Finance domain in Conduit (new job types + tables)
- `finance.finance_documents`: raw ingested docs — `id, ticker, source
  ('sec_edgar'|'finnhub_news'), doc_type, url, title, published_at,
  raw_text, fetched_at, job_id`.
- `finance.finance_analyses`: one row per analysis run — `id, ticker,
  summary, event_type, sentiment, materiality, citations JSONB (array
  of {document_id, url, excerpt}), reviewed, created_at, job_id`.
- Job type `finance_ingest {ticker}`: fetches new SEC EDGAR filings
  (`data.sec.gov`, no key, required `User-Agent` header, self-rate-
  limited) and — if a Finnhub key is configured (`FINNHUB_API_KEY`,
  mirroring this backend's own `WhisperURL`-empty-disables-the-feature
  convention) — recent company news; writes rows to
  `finance.finance_documents`; on completion enqueues `finance_analyze`
  for any newly-fetched documents.
- Job type `finance_analyze {ticker, document_ids}`: an LLM pass
  (Conduit's existing `internal/llm` client, pointed at its configured
  `LLM_URL`/`LLM_MODEL` — a local Ollama server, not OpenRouter) over
  the fetched documents for a ticker, produces one
  `finance.finance_analyses` row. Every claim must cite a
  `document_id` that's actually in `document_ids` — the handler
  validates every citation against the fetched set before writing the
  result, **hard failure (writes nothing, job fails), not a soft
  warning**, if a citation references a document outside that set, per
  the carried-forward anti-fabrication guardrail.
- `GET /triage`: aggregates the latest `finance.finance_analyses` row
  per active holding into the Act/Watch/Reviewed shape the UI already
  renders from fixtures — same response field names as the current
  `lib/triage.ts` fixture type (via `lib/live-finance.ts`'s adapter),
  so the frontend data layer swaps source, not shape.
- Language guardrail carried forward unchanged (ADR 0010/0011): no
  buy/sell/hold, "attention needed" not a verdict. Additionally, since
  Colby is learning finance himself: every unfamiliar term (10-Q, Form
  4, materiality, etc.) that appears in generated copy gets a one-line
  plain-language gloss inline (a prompt-level instruction to the LLM in
  `modules/finance/prompts/finance_analysis.txt`, not a UI tooltip
  system).

### 3. Scheduling — a new generic primitive, not finance-specific
- Conduit gained a **new `core.schedules` table** (not pre-existing):
  `id, name UNIQUE, job_type, module_id, payload_template JSONB,
  interval_seconds, enabled, next_run_at, last_run_at, last_job_id,
  created_at, updated_at` — core-level infra, documented in that
  repo's own `docs/adr/0015-scheduled-jobs.md`, because more than one
  future domain will want "run this job type every N seconds."
- A scheduler goroutine (started from `cmd/conduit/main.go` alongside
  the existing worker pool — not a second binary) polls
  `core.schedules` for due rows (`SKIP LOCKED`, same pattern as the
  job queue's own claim query), enqueues an ordinary `core.jobs` row
  via the existing queue package, and updates
  `next_run_at`/`last_run_at`/`last_job_id`.
- One schedule row per active holding, `job_type='finance_ingest'`,
  `payload_template={"ticker": "<T>"}`, default
  `interval_seconds = 21600` (6h) — the core agentic loop.
- `POST /holdings` inserting a new holding also inserts (or re-enables)
  its schedule row; `DELETE` disables (not deletes) the schedule row
  so re-adding the same ticker later doesn't duplicate schedules.
- A manual "Refresh now" button in the UI hits a direct
  `POST /holdings/{ticker}/refresh`, which enqueues `finance_ingest`
  immediately — bypasses the schedule, useful for the live demo so you
  aren't waiting 6 hours on stage.

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
- The product-level decisions from the original version of this ADR
  (dynamic holdings, AAPL/NVDA default, no buy/sell/hold language,
  plain-language glosses, citation guardrail) — only the backend's
  actual location and internal architecture changed in this revision.

## Scope for this weekend (explicit non-goals)
- Only AAPL + NVDA need to be proven genuinely live end-to-end by the
  presentation. Add/remove holdings works generally, but treasury
  bills and index funds have no SEC filings and often no Finnhub
  company-news coverage — for those, `finance_ingest` completes
  gracefully with zero documents and the triage view shows a plain
  "no recent filings or news found for this holding" state, never an
  error or a fabricated analysis. Full coverage for non-equity asset
  types is a follow-up, not blocking this ADR.
- No Finnhub key exists yet (Colby to provision). `finance_ingest`
  works on SEC EDGAR alone when no key is configured — Finnhub is
  additive, not required for the live slice to function.

## Consequences
- Frontend needs a small data-layer swap (fetch from Conduit's
  `/api/v1/finance/triage` vs. import from `lib/triage.ts`) behind the
  live-mode flag, plus `apps/web/src/lib/live-finance.ts`'s base
  URL/paths pointed at Conduit's real routes (`/api/v1/finance/...`,
  not the stale repo's `/finance/...` gateway paths) — not a rewrite of
  the triage/detail components themselves.
- `finance_ingest` is the first Conduit handler to call an external
  HTTP API rather than only an LLM; needed its own HTTP client with the
  SEC-required `User-Agent` and basic rate-limiting.
- This is the first domain to use the new `core.schedules` primitive —
  if that primitive has rough edges, finance is where they surfaced
  first (verified: migrations apply, the scheduler fires AAPL/NVDA
  ingest jobs on boot via `next_run_at = now()` in the seed migration).
- Conduit's local dev needs permissive-for-localhost CORS (this
  frontend runs as a separate Next.js dev server, a different origin)
  — added as explicitly-commented demo/dev-only middleware in
  Conduit's `internal/api/server.go`, not a production CORS policy.

## Related
- `homelab-hub` repo: `docs/adr/0015-scheduled-jobs.md` (the
  `core.schedules` primitive itself)
- `homelab-hub` repo: `docs/domains.md`, `docs/adr/0003-module-manifest-contract.md`,
  `docs/adr/0004-schema-per-domain.md`, `docs/adr/0005-conduit-as-backend.md`,
  `docs/adr/0009-backend-in-this-repository.md`
