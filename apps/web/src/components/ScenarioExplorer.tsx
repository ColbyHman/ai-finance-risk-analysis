"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  drawdownScenarios,
  persona,
  portfolioAssumptions,
  preRetireeComparison,
} from "@/lib/mock-data";
import { runProjection, type ProjectionResult } from "@/lib/projection";

function formatCompactDollars(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

type PersonaKey = "current" | "preRetiree";

/**
 * "What could go wrong?" — replays each historical-style drawdown as
 * year 1 of the projection (see runProjection's firstYearShock), then
 * lets the normal 39 years of compounding play out from there, and
 * compares that to the no-shock baseline. The persona toggle re-runs
 * the exact same shock against a 7-years-to-retirement comparison
 * persona, to make the horizon point concrete rather than asserted.
 *
 * The Monte Carlo itself only ever runs in an effect, never during
 * render — this is deliberately client-only (unlike the dashboard
 * teaser's server-computed baseline), which also sidesteps any
 * SSR-vs-client floating-point/engine mismatch producing a hydration
 * warning for a value this is purely interactive anyway.
 */
export function ScenarioExplorer() {
  const [scenarioId, setScenarioId] = useState(drawdownScenarios[0].id);
  const [personaKey, setPersonaKey] = useState<PersonaKey>("current");
  const [result, setResult] = useState<{ baseline: ProjectionResult; shocked: ProjectionResult } | null>(null);

  const scenario = drawdownScenarios.find((s) => s.id === scenarioId) ?? drawdownScenarios[0];
  const active = personaKey === "current"
    ? { age: persona.age, retirementAge: persona.retirementAge, currentBalance: persona.currentBalance, label: `This persona (age ${persona.age})` }
    : { age: preRetireeComparison.age, retirementAge: preRetireeComparison.retirementAge, currentBalance: preRetireeComparison.currentBalance, label: preRetireeComparison.label };

  // Same contribution rate used for both personas in this comparison —
  // isolates horizon as the one variable, same simplification noted
  // for preRetireeComparison in mock-data.ts.
  const annualContribution = persona.monthlyContribution * 12;

  useEffect(() => {
    const common = {
      currentAge: active.age,
      retirementAge: active.retirementAge,
      currentBalance: active.currentBalance,
      annualContribution,
      expectedRealReturn: portfolioAssumptions.blendedRealReturn,
      volatility: portfolioAssumptions.blendedVolatility,
      seed: portfolioAssumptions.seed,
      pathCount: portfolioAssumptions.pathCount,
    };
    setResult({
      baseline: runProjection(common),
      shocked: runProjection({ ...common, firstYearShock: scenario.peakToTroughPct }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.age, active.retirementAge, active.currentBalance, annualContribution, scenario.peakToTroughPct]);

  const baseline = result?.baseline;
  const shocked = result?.shocked;
  const chartData = baseline
    ? baseline.points.map((p, i) => ({
        age: p.age,
        baseline: Math.round(p.p50),
        shocked: Math.round(shocked?.points[i]?.p50 ?? 0),
      }))
    : [];

  const baselineFinal = baseline?.points[baseline.points.length - 1]?.p50;
  const shockedFinal = shocked?.points[shocked.points.length - 1]?.p50;
  const hasResult = baselineFinal !== undefined && shockedFinal !== undefined;
  const dollarImpact = hasResult ? baselineFinal - shockedFinal : 0;
  const pctImpact = hasResult && baselineFinal > 0 ? dollarImpact / baselineFinal : 0;
  const yearsToRecover = active.retirementAge - active.age;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          What could go wrong? — Historical Drawdown Replay
        </h2>
        <div className="flex rounded-lg border border-slate-200 p-1 text-xs">
          <button
            type="button"
            onClick={() => setPersonaKey("current")}
            className={`rounded-md px-3 py-1.5 font-medium ${personaKey === "current" ? "bg-blue-600 text-white" : "text-slate-600"}`}
          >
            This persona (age {persona.age})
          </button>
          <button
            type="button"
            onClick={() => setPersonaKey("preRetiree")}
            className={`rounded-md px-3 py-1.5 font-medium ${personaKey === "preRetiree" ? "bg-blue-600 text-white" : "text-slate-600"}`}
          >
            58-year-old pre-retiree
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {drawdownScenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenarioId(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
              s.id === scenarioId
                ? "bg-red-600 text-white ring-red-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-600">{scenario.note}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Peak-to-trough</p>
          <p className="text-lg font-bold text-red-700">{Math.round(scenario.peakToTroughPct * 100)}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Time to recover</p>
          <p className="text-lg font-bold text-slate-900">{scenario.recoveryMonths} mo</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Years to {active.label.includes("pre-retiree") ? "retirement" : `age ${active.retirementAge}`}</p>
          <p className="text-lg font-bold text-slate-900">{yearsToRecover}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Impact on median outcome</p>
          <p className="text-lg font-bold text-red-700">
            {hasResult ? `-${formatCompactDollars(dollarImpact)} (${Math.round(pctImpact * 100)}%)` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCompactDollars} width={60} />
            <Tooltip
              formatter={(v, name) => [formatCompactDollars(Number(v)), name === "baseline" ? "No shock" : `With ${scenario.label}`]}
              labelFormatter={(age) => `Age ${age}`}
            />
            <Line dataKey="baseline" name="baseline" stroke="#94a3b8" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="shocked" name="shocked" stroke="#dc2626" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Gray: median projection with no shock. Red: median projection if {scenario.label.toLowerCase()}
        {" "}happened starting this year, for {active.label.toLowerCase()}.
      </p>
    </div>
  );
}
