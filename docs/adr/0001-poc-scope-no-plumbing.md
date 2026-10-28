# 0001: POC scope — no backend, no data pipeline, no deployment plumbing

## Status
Accepted

## Context
The request was to produce a proof-of-concept dashboard illustrating what an
AI-driven finance risk analysis product could look like, explicitly
instructing: "Do not set up any plumbing, just create a simple example
dashboard with screenshots." There is no real portfolio data source, no risk
model, no auth provider, and no target deployment environment defined yet.

Building any of those prematurely would:
- Burn time on infrastructure decisions (database choice, model serving,
  auth provider, hosting) that are not yet informed by real requirements.
- Create the false impression that the numbers on screen are live or
  derived from a real model, when they are illustrative only.
- Make the repo harder to review — a reviewer evaluating "does this UI
  communicate portfolio risk well?" has to wade through infra code to find
  the answer.

## Decision
This repository contains **only**:
- A Next.js frontend rendering the dashboard against static, synthetic mock
  data defined in TypeScript (`apps/web/src/lib/mock-data.ts`).
- Static screenshots of the rendered dashboard, checked into
  `docs/screenshots/`.
- These ADRs.

It explicitly does **not** contain: a backend/API service, a database,
authentication, a CI/CD pipeline, containerization, infrastructure-as-code,
or a deployed environment. There is no `.env` beyond what Next.js itself
requires to run locally, and no secrets of any kind.

## Consequences
- Anyone evaluating this repo should treat all figures (risk scores, VaR,
  alerts, position names) as fictional, illustrative data — not a
  connection to any real portfolio or model.
- Before this becomes anything beyond a POC, follow-up ADRs are needed for:
  data ingestion/model serving architecture, auth, hosting/deployment, and
  observability. None of that is scoped here.
- The mock data module is the single seam where a real data source would
  plug in later (see ADR 0004).
