# 0003: Next.js (App Router) for the dashboard frontend

## Status
Accepted

## Context
The request specified Next.js for the frontend. The main implementation
choices within that were: Pages Router vs. App Router, and whether to pull
in a server (API routes, data fetching) or keep it a pure static client
render given ADR 0001's "no plumbing" constraint.

## Decision
- **App Router** (`apps/web/src/app/`), scaffolded via `create-next-app`
  with TypeScript, Tailwind CSS, and ESLint. App Router is the
  actively-developed Next.js paradigm (Pages Router is in maintenance mode)
  and is the better foundation if this POC grows into something with real
  routes (e.g. `/portfolios/[id]`, `/alerts`).
- **No server-side data fetching, no API routes.** The dashboard imports
  mock data directly from a TypeScript module
  (`apps/web/src/lib/mock-data.ts`) at build/render time. `next build`
  produces a fully static page (confirmed: the build output shows `/` as
  `○ (Static)`). This matches ADR 0001 — there is no backend to fetch from.
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite`/turbopack
  plugin, the `create-next-app` default) rather than a component library,
  to keep the dependency surface small for a POC.
- Dropped `next/font/google` (the `create-next-app` default) in favor of
  the system font stack, since it requires a network fetch to Google Fonts
  at build time — an unnecessary external dependency for a POC that should
  build offline/reproducibly.

## Consequences
- The app has zero server-side runtime requirements; `next build && next
  start` serves a static page, and it could equally be exported as fully
  static HTML if needed later.
- Any future "make this real" work (ADR 0001's follow-ups) will need to
  introduce either API routes, a separate backend service, or
  server components with real data fetching — not yet decided, and
  explicitly out of scope here.
