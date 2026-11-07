/**
 * Portfolio-wide "what changed" digest ranking — see
 * docs/adr/0010-research-copilot-reframe.md.
 *
 * This is a pure function, same pattern as projection.ts: same inputs
 * always produce the same ranking, no hidden state, nothing
 * recomputed differently between server and client render. The
 * relevanceScore it produces is NOT a rating of the security — it's
 * strictly "how much does this card deserve your attention right
 * now," driven by four factors:
 *
 *  - position size (bigger dollar exposure -> more portfolio-wide
 *    relevance)
 *  - news recency + volume (how fresh and how widely covered)
 *  - tax-lot urgency (a flag due sooner outranks one due later, or
 *    none at all)
 *  - diversification impact (holdings that are already concentration
 *    risk get a bump, since "what changed" matters more for them)
 *
 * Weights below are an illustrative, documented split — not derived
 * from a backtest. They're deliberately simple enough to audit by
 * hand, same spirit as the weighting choices in projection.ts.
 */

import type { DigestInput } from "./mock-data";

export interface RankedDigestEntry extends DigestInput {
  relevanceScore: number;
}

const WEIGHTS = {
  positionSize: 35,
  newsRecency: 20,
  newsVolume: 15,
  taxUrgency: 20,
  diversificationImpact: 10,
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function hoursSince(timestamp: string, now: Date): number {
  const then = new Date(timestamp.replace(" ", "T").replace(" UTC", "Z"));
  const diffMs = now.getTime() - then.getTime();
  return diffMs / (1000 * 60 * 60);
}

/** Decays linearly from 1 (just posted) to 0 at 7 days old — news
 * older than a week contributes nothing to recency. */
function recencyFactor(timestamp: string, now: Date): number {
  const hours = hoursSince(timestamp, now);
  return clamp01(1 - hours / (24 * 7));
}

/** Saturates at 20 sources — beyond that, more coverage doesn't add
 * meaningfully more relevance. */
function volumeFactor(sourceCount: number): number {
  return clamp01(sourceCount / 20);
}

/** A flag due today is maximally urgent; one due 90+ days out
 * contributes nothing. No flag at all contributes nothing. */
function taxUrgencyFactor(daysUntilDue: number | undefined): number {
  if (daysUntilDue === undefined) return 0;
  return clamp01(1 - daysUntilDue / 90);
}

export function computeRelevanceScore(
  entry: DigestInput,
  totalPortfolioValue: number,
  now: Date = new Date(),
): number {
  const positionWeight = totalPortfolioValue > 0
    ? clamp01(entry.positionValue / totalPortfolioValue)
    : 0;

  const score =
    positionWeight * WEIGHTS.positionSize +
    recencyFactor(entry.news.timestamp, now) * WEIGHTS.newsRecency +
    volumeFactor(entry.news.sourceCount) * WEIGHTS.newsVolume +
    taxUrgencyFactor(entry.taxFlag?.daysUntilDue) * WEIGHTS.taxUrgency +
    clamp01(entry.diversificationImpact) * WEIGHTS.diversificationImpact;

  return Math.round(score * 10) / 10;
}

/** Ranks every digest entry by relevanceScore, descending. Pure:
 * same inputs (including `now`) always produce the same order. */
export function rankDigestEntries(
  entries: DigestInput[],
  totalPortfolioValue: number,
  now: Date = new Date(),
): RankedDigestEntry[] {
  return entries
    .map((entry) => ({
      ...entry,
      relevanceScore: computeRelevanceScore(entry, totalPortfolioValue, now),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
