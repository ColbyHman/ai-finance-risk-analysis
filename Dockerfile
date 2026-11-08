# Multi-stage build for the Next.js (App Router) dashboard POC.
#
# Context is the repo root (an npm workspace), not apps/web, because the
# install step needs the root package.json + the workspace lockfile —
# see docker-compose-service-deployment skill, "In a monorepo the
# context is usually the repo root."
#
# Runtime stage runs the standalone server (output: "standalone" in
# apps/web/next.config.ts), not `next start` — next start does not work
# with standalone output, and standalone deliberately omits
# .next/static and public/, so both are copied in explicitly below.

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps ./apps
COPY package.json package-lock.json ./
COPY apps ./apps
# NEXT_PUBLIC_* vars are inlined into the client bundle at `next build`
# time, not read at container start — env_file/.env at `docker compose up`
# has NO effect on them. They MUST be passed as build args (see
# docker-compose.yml's build.args) and set here before the build step.
ARG NEXT_PUBLIC_FINANCE_API_BASE=""
ENV NEXT_PUBLIC_FINANCE_API_BASE=$NEXT_PUBLIC_FINANCE_API_BASE
RUN npm run build --workspace=apps/web

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
EXPOSE 3000
ENTRYPOINT ["node", "apps/web/server.js"]
