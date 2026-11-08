/**
 * Live finance domain data layer (ADR 0015). When
 * NEXT_PUBLIC_FINANCE_LIVE is set truthy, the triage inbox and
 * holdings list fetch from homelab-hub's Conduit backend (the
 * `finance` module, /api/v1/finance) instead of importing
 * lib/triage.ts fixtures. When unset/false, callers should fall back
 * to the fixtures entirely — this module is never imported for its
 * side effects in that path.
 *
 * Response shapes from Conduit are adapted into the existing
 * TriageHolding type (lib/triage.ts) so the rendering components don't
 * need to know which data source is active — only the data layer
 * swaps, not the shape (per ADR 0015 Consequences).
 */
import type { TriageHolding } from "./triage";

export type AssetType = "equity" | "etf" | "treasury" | "index";

export interface LiveHolding {
  id: string;
  ticker: string;
  asset_type: AssetType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface LiveTriageItem {
  ticker: string;
  status: "act" | "watch" | "none";
  headline: string;
  summary?: string;
  reason?: string;
  reviewed: boolean;
  asset_type: AssetType;
}

interface LiveTriageResponse {
  holdings: LiveTriageItem[];
  disclaimer: string;
}

/** True when the app should hit the live Conduit backend instead of
 * fixtures. Read at call time (not module load) so tests/toggling in
 * dev work without a rebuild. */
export function isFinanceLive(): boolean {
  return process.env.NEXT_PUBLIC_FINANCE_LIVE === "1" || process.env.NEXT_PUBLIC_FINANCE_LIVE === "true";
}

function apiBase(): string {
  return process.env.NEXT_PUBLIC_FINANCE_API_BASE || "http://localhost:8080/api/v1/finance";
}

// Deterministic, UI-only visual accents for live holdings — the
// backend doesn't track portfolio weights/colors (out of scope for
// ADR 0015), so these are synthesized for the sparkline/allocation bar
// the fixture-mode UI already renders.
const PALETTE = ["var(--green)", "#60a5fa", "#38bdf8", "var(--swatch-neutral-2)", "var(--swatch-neutral-1)", "var(--ink-faint)"];

function adaptTriageItem(item: LiveTriageItem, index: number, total: number): TriageHolding {
  const flat = [50, 50, 50, 50, 50, 50, 50, 50];
  return {
    ticker: item.ticker,
    weight: total > 0 ? Math.round((100 / total) * 10) / 10 : 0,
    status: item.status,
    headline: item.headline,
    summary: item.summary,
    reason: item.reason,
    trend: flat,
    reviewed: item.reviewed,
    color: PALETTE[index % PALETTE.length],
  };
}

export class FinanceApiError extends Error {}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // AbortSignal.timeout bounds a slow/unreachable backend — without
  // this, a hung fetch during server-side rendering can hang the whole
  // page request (observed as the container's healthcheck flapping to
  // "unhealthy" with no other symptom).
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: init?.signal ?? AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = body;
    try {
      message = JSON.parse(body).error ?? body;
    } catch {
      /* not JSON, use raw body */
    }
    throw new FinanceApiError(message || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Fetches live triage data and adapts it to the TriageHolding shape
 * the inbox page already renders from fixtures. */
export async function fetchLiveTriage(): Promise<{ holdings: TriageHolding[]; disclaimer: string }> {
  const data = await apiFetch<LiveTriageResponse>("/triage");
  const holdings = data.holdings.map((item, i) => adaptTriageItem(item, i, data.holdings.length));
  return { holdings, disclaimer: data.disclaimer };
}

export async function fetchLiveHoldings(): Promise<LiveHolding[]> {
  const data = await apiFetch<{ holdings: LiveHolding[] }>("/holdings");
  return data.holdings;
}

export async function addLiveHolding(ticker: string, assetType: AssetType): Promise<LiveHolding> {
  const data = await apiFetch<{ holding: LiveHolding }>("/holdings", {
    method: "POST",
    body: JSON.stringify({ ticker, asset_type: assetType }),
  });
  return data.holding;
}

export async function removeLiveHolding(ticker: string): Promise<void> {
  await apiFetch(`/holdings/${encodeURIComponent(ticker)}`, { method: "DELETE" });
}

export async function refreshLiveHolding(ticker: string): Promise<void> {
  await apiFetch(`/holdings/${encodeURIComponent(ticker)}/refresh`, { method: "POST" });
}
