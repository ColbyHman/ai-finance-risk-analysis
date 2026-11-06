"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { persona, portfolioAssumptions } from "@/lib/mock-data";
import { probabilityOfGoal, runProjection } from "@/lib/projection";

function formatCompactDollars(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

/**
 * The "Am I on track?" view: a seeded Monte Carlo fan chart (10th/50th/
 * 90th percentile portfolio value by age) against the goal, with live
 * sliders for monthly contribution and retirement age. Every number
 * here is computed client-side from lib/projection.ts — same inputs
 * always produce the same chart (seeded), so moving a slider back to
 * its original position reproduces the original chart exactly.
 */
export function RetirementProjection() {
  const [monthlyContribution, setMonthlyContribution] = useState(persona.monthlyContribution);
  const [retirementAge, setRetirementAge] = useState(persona.retirementAge);

  const result = useMemo(
    () =>
      runProjection({
        currentAge: persona.age,
        retirementAge,
        currentBalance: persona.currentBalance,
        annualContribution: monthlyContribution * 12,
        expectedRealReturn: portfolioAssumptions.blendedRealReturn,
        volatility: portfolioAssumptions.blendedVolatility,
        seed: portfolioAssumptions.seed,
        pathCount: portfolioAssumptions.pathCount,
      }),
    [retirementAge, monthlyContribution],
  );

  // A second run at +$200/month, same everything else, for the
  // one-line "what does more contribution buy you" readout. Cheap
  // enough to just run again rather than caching/diffing.
  const plusTwoHundred = useMemo(
    () =>
      runProjection({
        currentAge: persona.age,
        retirementAge,
        currentBalance: persona.currentBalance,
        annualContribution: (monthlyContribution + 200) * 12,
        expectedRealReturn: portfolioAssumptions.blendedRealReturn,
        volatility: portfolioAssumptions.blendedVolatility,
        seed: portfolioAssumptions.seed,
        pathCount: portfolioAssumptions.pathCount,
      }),
    [retirementAge, monthlyContribution],
  );

  const chartData = result.points.map((p) => ({
    age: p.age,
    p10: Math.round(p.p10),
    band: Math.round(p.p90 - p.p10),
    p50: Math.round(p.p50),
  }));

  const medianAtRetirement = result.points[result.points.length - 1]?.p50 ?? 0;
  const goalProbability = probabilityOfGoal(result.finalValuesSorted, persona.goalAtRetirement);
  const medianWithMore = plusTwoHundred.points[plusTwoHundred.points.length - 1]?.p50 ?? 0;
  const extraFromContribution = medianWithMore - medianAtRetirement;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Am I on track? — Projected Portfolio Value to Age {retirementAge}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            {portfolioAssumptions.pathCount.toLocaleString()}-path Monte Carlo, seeded for
            reproducibility — shaded band is the 10th-90th percentile range, the line is the
            median outcome. All dollar figures are in today&apos;s purchasing power (real terms).
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-right">
          <p className="text-xs text-blue-700">Probability of reaching the goal</p>
          <p className="text-2xl font-bold text-blue-900">{Math.round(goalProbability * 100)}%</p>
        </div>
      </div>

      <div className="mt-5 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: "Age", position: "insideBottom", offset: -5, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCompactDollars} width={60} />
            <Tooltip
              formatter={(v, name) => {
                if (name === "band") return [null, null];
                return [formatCompactDollars(Number(v)), name === "p50" ? "Median" : "10th percentile"];
              }}
              labelFormatter={(age) => `Age ${age}`}
            />
            <Area
              dataKey="p10"
              stackId="band"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
            />
            <Area
              dataKey="band"
              stackId="band"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.45}
              name="10th-90th percentile"
              isAnimationActive={false}
            />
            <Line
              dataKey="p50"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={false}
              name="p50"
              isAnimationActive={false}
            />
            <ReferenceLine
              y={persona.goalAtRetirement}
              stroke="#16a34a"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{ value: `Goal: ${formatCompactDollars(persona.goalAtRetirement)}`, position: "insideTopLeft", fontSize: 11, fill: "#16a34a" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contribution-slider" className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Monthly contribution</span>
            <span className="font-semibold text-slate-900">${monthlyContribution}/mo</span>
          </label>
          <input
            id="contribution-slider"
            type="range"
            min={0}
            max={2000}
            step={50}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
        </div>
        <div>
          <label htmlFor="retirement-age-slider" className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Retirement age</span>
            <span className="font-semibold text-slate-900">{retirementAge}</span>
          </label>
          <input
            id="retirement-age-slider"
            type="range"
            min={persona.age + 5}
            max={75}
            step={1}
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Median projected balance at age {retirementAge}:{" "}
        <strong className="text-slate-900">{formatCompactDollars(medianAtRetirement)}</strong>.
        An extra <strong>$200/month</strong> from here adds about{" "}
        <strong className="text-emerald-700">{formatCompactDollars(extraFromContribution)}</strong>{" "}
        to the median outcome at age {retirementAge}.
      </p>
    </div>
  );
}
