import { feeDragProjection, suggestedActions } from "@/lib/mock-data";
import { ArrowRight, Info } from "lucide-react";

function formatCompactDollars(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

/**
 * "What should I do?" — a ranked list of single-lever changes, each
 * with a concrete before/after on effective tech exposure and on the
 * 10th-percentile (pessimistic-case) age-65 outcome. Figures are
 * pre-computed from the same projection engine as /retirement and
 * /scenarios, not live-recalculated here — see mock-data.ts and
 * docs/adr/0009 for the exact assumption changes behind each number.
 */
export function SuggestedActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Suggested Actions</h2>
      <p className="mt-1 text-xs text-slate-500">
        Ranked by effect on the pessimistic-case (10th percentile) outcome at age 65 — each
        changes exactly one lever, so the effect is attributable to that change alone.
      </p>
      <ol className="mt-4 space-y-4">
        {suggestedActions.map((action, i) => {
          const p10Delta = action.p10After - action.p10Before;
          const techDelta = action.techExposureAfterPct - action.techExposureBeforePct;
          return (
            <li key={action.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{action.rationale}</p>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Effective tech exposure</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        {action.techExposureBeforePct}%
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        {action.techExposureAfterPct}%
                        {techDelta !== 0 && (
                          <span className={techDelta < 0 ? "text-emerald-600" : "text-red-600"}>
                            ({techDelta > 0 ? "+" : ""}{techDelta}pt)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">10th-percentile outcome at 65</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        {formatCompactDollars(action.p10Before)}
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        {formatCompactDollars(action.p10After)}
                        <span className={p10Delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                          ({p10Delta >= 0 ? "+" : ""}{formatCompactDollars(p10Delta)})
                        </span>
                      </p>
                    </div>
                  </div>

                  {action.caveat && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {action.caveat}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">The cost of fees, compounded</h3>
        <p className="mt-1 text-xs text-slate-500">
          This portfolio&apos;s blended expense ratio is low ({feeDragProjection.blendedExpenseRatioPct}%/yr) —
          every fund here is already a cheap index fund or a zero-fee individual stock. Even so:
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Without fees</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatCompactDollars(feeDragProjection.withoutFees)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">With fees</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatCompactDollars(feeDragProjection.withFees)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-red-600">40-year cost</p>
            <p className="mt-1 text-sm font-semibold text-red-700">
              -{formatCompactDollars(feeDragProjection.cost)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
        These are educational illustrations based on simplified, synthetic modeling assumptions —
        not personalized financial advice. Consult a licensed financial advisor before changing a
        real portfolio.
      </p>
    </div>
  );
}
