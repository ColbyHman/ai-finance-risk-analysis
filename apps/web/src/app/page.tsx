import { SummaryCard } from "@/components/SummaryCard";
import { ExposureChart, RiskTrendChart } from "@/components/RiskCharts";
import { TopContributorsTable } from "@/components/TopContributorsTable";
import { AnomalyFeed } from "@/components/AnomalyFeed";
import { drawdownScenarios, persona, portfolioAssumptions, summaryMetrics } from "@/lib/mock-data";
import { probabilityOfGoal, runProjection } from "@/lib/projection";
import { ShieldAlert, Network, TrendingUp } from "lucide-react";
import Link from "next/link";

function formatCompactDollars(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

export default function Home() {
  // The teaser banner's numbers are the baseline persona (no slider
  // input) — the interactive version lives on /retirement. Computed
  // server-side since runProjection is a pure, seeded function; same
  // result either side.
  const common = {
    currentAge: persona.age,
    retirementAge: persona.retirementAge,
    currentBalance: persona.currentBalance,
    annualContribution: persona.monthlyContribution * 12,
    expectedRealReturn: portfolioAssumptions.blendedRealReturn,
    volatility: portfolioAssumptions.blendedVolatility,
    seed: portfolioAssumptions.seed,
    pathCount: portfolioAssumptions.pathCount,
  };
  const baseline = runProjection(common);
  const medianAtRetirement = baseline.points[baseline.points.length - 1]?.p50 ?? 0;
  const goalProbability = probabilityOfGoal(baseline.finalValuesSorted, persona.goalAtRetirement);

  // Headline "worst-case" figure: whichever historical-style scenario
  // does the most damage to the median age-65 outcome, replayed as
  // year 1 (see /scenarios). Long-horizon-relevant in a way 1-day VaR
  // isn't — this is what the dashboard leads with instead.
  const baselineFinal = medianAtRetirement;
  let worstScenario = drawdownScenarios[0];
  let worstPctImpact = 0;
  for (const s of drawdownScenarios) {
    const shocked = runProjection({ ...common, firstYearShock: s.peakToTroughPct });
    const shockedFinal = shocked.points[shocked.points.length - 1]?.p50 ?? 0;
    const pctImpact = baselineFinal > 0 ? (baselineFinal - shockedFinal) / baselineFinal : 0;
    if (pctImpact > worstPctImpact) {
      worstPctImpact = pctImpact;
      worstScenario = s;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                AI Finance Risk Analysis
              </h1>
              <p className="text-xs text-slate-500">
                Personal Portfolio Risk Dashboard · Proof of Concept
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
            Demo data — not a live feed
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Am I on track for retirement at {persona.retirementAge}?
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Age {persona.age} today, ${persona.monthlyContribution}/mo, projected to a
                  median of <strong>{formatCompactDollars(medianAtRetirement)}</strong> by age{" "}
                  {persona.retirementAge}.
                </p>
              </div>
            </div>
            <Link
              href="/retirement"
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              See the full projection →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-inset ring-blue-100">
              <p className="text-xs text-slate-500">Probability of reaching the goal</p>
              <p className="text-2xl font-bold text-blue-900">{Math.round(goalProbability * 100)}%</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-inset ring-blue-100">
              <p className="text-xs text-slate-500">
                Worst-case historical shock ({worstScenario.label.replace(/^\d{4}\s*/, "")})
              </p>
              <p className="text-2xl font-bold text-red-700">
                -{Math.round(worstPctImpact * 100)}% to age-65 outcome
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                What could go wrong? Scenario replay available
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                See how 2008, 2020, and 2022-style drawdowns would hit this
                portfolio today — and why the same shock matters far less at
                age 25 than it would for someone 7 years from retirement.
              </p>
            </div>
            <Link
              href="/scenarios"
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Explore scenarios →
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExposureChart />
          <RiskTrendChart />
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Network className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Diversification risk: moderate concentration flagged
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Seven holdings, five asset classes — looks diversified. Once
                  index funds are unpacked into their own sector weightings,
                  technology alone is an estimated 41% of the portfolio.
                </p>
              </div>
            </div>
            <Link
              href="/diversification"
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View diversification analysis →
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TopContributorsTable />
          </div>
          <div className="lg:col-span-2">
            <AnomalyFeed />
          </div>
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                What should I do? Suggested actions available
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Three concrete, single-lever changes — each with a before/after on tech
                exposure and on the pessimistic-case outcome at retirement — plus what fees
                quietly cost over 40 years.
              </p>
            </div>
            <Link
              href="/actions"
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              See suggested actions →
            </Link>
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-medium text-slate-400">
            Secondary metrics — short-horizon risk indicators, less relevant at a 40-year horizon
            than the projection and scenario views above
          </p>
          <div className="grid grid-cols-2 gap-3 opacity-80 sm:grid-cols-4">
            {summaryMetrics.map((metric) => (
              <SummaryCard key={metric.label} metric={metric} compact />
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC dashboard · all figures are synthetic mock data · no live backend
        or data pipeline is wired up · every modeling assumption behind the
        retirement projection, scenarios, and suggested actions is documented
        in docs/adr/0009-retirement-persona-and-projection.md.
      </footer>
    </div>
  );
}
