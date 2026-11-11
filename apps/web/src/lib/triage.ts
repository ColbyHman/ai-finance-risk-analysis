/**
 * Triage inbox data.
 *
 * The triage inbox is live-only (ADR 0015) — this file carries only
 * the `TriageHolding` type, the shape the home page's Act/Watch/
 * Reviewed list renders, populated from lib/live-finance.ts's adapted
 * triage response. There is no synthetic fallback.
 *
 * Portfolio Health used to stay on fixture data here by an earlier
 * explicit product decision (see docs/adr/0015). That decision was
 * superseded: portfolio-health/page.tsx now wires to the real backend
 * via lib/live-finance.ts (fetchPortfolioSummary/updateHoldingUnits),
 * so the fixture set that used to live below (HealthHolding,
 * healthHoldings, portfolioByTimeframe, riskContext, benchmarkPath)
 * was removed rather than left as dead code.
 *
 * Guardrail carried forward unchanged: no buy/sell/hold language, no
 * bare rating/score without its basis shown, sentiment/signals framed
 * as information, never a directive.
 */

// ---------------------------------------------------------------------------
// Triage inbox — shape only; data comes from lib/live-finance.ts
// ---------------------------------------------------------------------------

export type TriageStatus = "act" | "watch" | "none";

export interface TriageHolding {
  ticker: string;
  status: TriageStatus;
  headline: string;
  summary?: string;
  reason?: string;
  /** Flips client-side when "Mark reviewed" is clicked — no
   * persistence back to the backend yet. */
  reviewed: boolean;
  color: string;
}
