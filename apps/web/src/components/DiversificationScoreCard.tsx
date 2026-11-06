import { diversificationScore, diversificationFlags } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";
import { Gauge, AlertTriangle } from "lucide-react";

/** The headline number for the diversification-risk view: not a
 * per-security score, a portfolio-level one — how much these holdings
 * actually overlap once you look through the index funds. */
export function DiversificationScoreCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Gauge className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">Diversification Score</h3>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-slate-900">{diversificationScore.score}</span>
        <span className="text-sm text-slate-500">/ 100</span>
      </div>
      <p className="mt-1 text-sm font-medium text-amber-700">{diversificationScore.label}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{diversificationScore.summary}</p>
    </div>
  );
}

/** Portfolio-level findings — concentration and correlation risk that
 * only shows up when holdings are considered together, not one at a
 * time (that's what the per-security AIAnalysisPanel is for). */
export function DiversificationFlagsList() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">What the AI Flagged</h3>
      <p className="mt-1 text-xs text-slate-500">
        Concentration and correlation risk across the whole portfolio, not any one holding
      </p>
      <ul className="mt-4 space-y-4">
        {diversificationFlags.map((flag) => (
          <li key={flag.id} className="flex gap-3 rounded-lg border border-slate-100 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{flag.title}</p>
                <RiskBadge level={flag.severity} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{flag.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
