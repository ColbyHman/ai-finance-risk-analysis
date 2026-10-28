# 0002: Single-app monorepo layout under `apps/`

## Status
Accepted

## Context
The request specified "implement a POC of this as a mono repo," even though
today there is exactly one deployable unit (the dashboard frontend). A
monorepo layout needs to be chosen even for a single app, because retrofitting
one later (moving code into an `apps/` folder, introducing workspaces) is a
larger diff than starting with the shape you'll want at 2+ apps.

Likely future apps/packages for a real version of this product: a risk-model
service, a shared design-system/UI package, a shared types/schema package for
the risk data contracts, and possibly an ingestion worker.

## Decision
Use an npm-workspaces monorepo:

```
ai-finance-risk-analysis/
├── apps/
│   └── web/            # Next.js dashboard (this POC's only app)
├── docs/
│   ├── adr/            # these records
│   └── screenshots/    # dashboard screenshots
└── package.json         # workspace root, "workspaces": ["apps/*"]
```

No `packages/` directory is created yet — there is nothing to share between
apps until a second app exists. Adding it later is a low-cost change (new
workspace entry + moving code), not a restructure.

npm workspaces was chosen over pnpm/yarn/turborepo tooling because the POC
has one app and zero cross-package build orchestration needs; adopting a
build-graph tool (Turborepo, Nx) before there's a graph to orchestrate is
unjustified complexity. Revisit this when a second app/package lands.

## Consequences
- `npm install` from the repo root installs for all workspaces.
- Adding a second app is `mkdir apps/<name>` + its own `package.json`; no
  root-level reconfiguration needed beyond what's already in place.
- If/when shared code emerges, introduce `packages/<name>` and have `apps/*`
  depend on it via the workspace protocol — no decision needed now, just
  noting the extension point.
