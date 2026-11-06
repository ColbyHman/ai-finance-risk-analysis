/**
 * Retirement projection math — a seeded Monte Carlo over real
 * (inflation-adjusted) annual returns, not a live market model. See
 * docs/adr/0009-retirement-persona-and-projection.md for the full
 * writeup of every assumption and simplification below; the comments
 * here are the short version.
 *
 * Deliberate simplifications, stated up front:
 * - ONE blended expected return and ONE blended volatility for the
 *   whole portfolio (see portfolioAssumptions in mock-data.ts) — not a
 *   full covariance-matrix simulation across each holding. Reasonable
 *   for an educational "am I roughly on track" tool, not a real
 *   financial-planning model.
 * - Returns are modeled as i.i.d. lognormal draws per year (geometric
 *   Brownian motion, annual steps) — no mean reversion, no
 *   autocorrelation, no regime changes.
 * - Everything is computed in REAL (inflation-adjusted) terms, so the
 *   result is in constant dollars a 25-year-old can actually reason
 *   about today — a "$1.5M goal" means $1.5M of today's buying power,
 *   not an inflated future number.
 * - Contributions are constant in real terms (no raises modeled) and
 *   added once per year, before that year's growth.
 */

/** mulberry32 — a small, fast, seeded PRNG. Deterministic: the same
 * seed always produces the same sequence, which is what makes this
 * projection reproducible run to run (same inputs -> same chart),
 * unlike Math.random(). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard-normal sampler built on the seeded PRNG above (Box-Muller
 * transform), so the whole simulation is reproducible from one seed. */
function makeGaussian(rng: () => number): () => number {
  let spare: number | null = null;
  return function () {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const mag = Math.sqrt(-2 * Math.log(u));
    spare = mag * Math.sin(2 * Math.PI * v);
    return mag * Math.cos(2 * Math.PI * v);
  };
}

export interface ProjectionYearPoint {
  age: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface ProjectionParams {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  /** Real (today's dollars) contribution per year. */
  annualContribution: number;
  expectedRealReturn: number;
  volatility: number;
  seed: number;
  pathCount: number;
  /** If set, year 1's real return is forced to this value instead of
   * randomly drawn — every subsequent year still draws normally. Used
   * to replay "what if a historical-style drawdown happened starting
   * right now" against the normal Monte Carlo machinery, rather than
   * building a separate code path for scenario replay. */
  firstYearShock?: number;
}

export interface ProjectionResult {
  points: ProjectionYearPoint[];
  /** Every path's final (retirement-age) balance, sorted ascending —
   * exposed so callers can compute an arbitrary percentile or
   * probability without re-running the simulation. */
  finalValuesSorted: number[];
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.round(p * (sortedValues.length - 1))),
  );
  return sortedValues[idx];
}

/** Runs the Monte Carlo and returns percentile bands per year plus the
 * full sorted final-year distribution. Pure function of its params —
 * same params always produce the same result (seeded), so a caller
 * (e.g. a slider's onChange) can call this directly on every change
 * without debouncing; pathCount x years is small enough to be instant. */
export function runProjection(params: ProjectionParams): ProjectionResult {
  const { currentAge, retirementAge, currentBalance, annualContribution, expectedRealReturn, volatility, seed, pathCount, firstYearShock } = params;
  const years = Math.max(0, retirementAge - currentAge);
  const rng = mulberry32(seed);
  const gaussian = makeGaussian(rng);

  // paths[pathIndex][yearIndex] = balance at the end of that year
  const drift = expectedRealReturn - 0.5 * volatility * volatility;
  const yearlyValues: number[][] = Array.from({ length: years + 1 }, () => []);
  for (let p = 0; p < pathCount; p++) {
    let balance = currentBalance;
    yearlyValues[0].push(balance);
    for (let y = 1; y <= years; y++) {
      if (y === 1 && firstYearShock !== undefined) {
        balance = (balance + annualContribution) * (1 + firstYearShock);
      } else {
        balance = (balance + annualContribution) * Math.exp(drift + volatility * gaussian());
      }
      yearlyValues[y].push(balance);
    }
  }

  const points: ProjectionYearPoint[] = yearlyValues.map((values, y) => {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      age: currentAge + y,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
    };
  });

  const finalValuesSorted = [...yearlyValues[years]].sort((a, b) => a - b);

  return { points, finalValuesSorted };
}

/** Fraction of simulated paths whose final balance meets or exceeds
 * the goal — a probability, 0-1. */
export function probabilityOfGoal(finalValuesSorted: number[], goal: number): number {
  if (finalValuesSorted.length === 0) return 0;
  let count = 0;
  for (const v of finalValuesSorted) if (v >= goal) count++;
  return count / finalValuesSorted.length;
}

/** Cumulative cost of expense ratios over the projection horizon: the
 * difference between the median outcome at the blended real return,
 * and the median outcome at that same return minus the blended
 * expense ratio. Deterministic (uses the median path's growth rate,
 * not a second full Monte Carlo) — a fee's effect on volatility is
 * negligible next to its effect on the average return, so this is a
 * reasonable simplification for an illustrative figure. */
export function feeDragOverHorizon(params: {
  currentBalance: number;
  annualContribution: number;
  years: number;
  expectedRealReturn: number;
  expenseRatio: number;
}): { withFees: number; withoutFees: number; cost: number } {
  const grow = (annualReturn: number) => {
    let balance = params.currentBalance;
    for (let y = 1; y <= params.years; y++) {
      balance = (balance + params.annualContribution) * (1 + annualReturn);
    }
    return balance;
  };
  const withoutFees = grow(params.expectedRealReturn);
  const withFees = grow(params.expectedRealReturn - params.expenseRatio);
  return { withFees, withoutFees, cost: withoutFees - withFees };
}
