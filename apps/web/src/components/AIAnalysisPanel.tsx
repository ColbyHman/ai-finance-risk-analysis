import type { SecurityProfile } from "@/lib/mock-data";
import { Bot, Clock } from "lucide-react";

/**
 * The AI-assisted analysis for one position: score, confidence,
 * turnaround, freshness, and the signals driving the score.
 *
 * This used to sit next to an equivalent "traditional research" panel
 * (see docs/adr/0006-per-security-comparison-view.md) — that side was
 * dropped for the live demo; the AI-vs-traditional comparison itself
 * is presented separately, not shown in this tool (see
 * docs/adr/0007-drop-traditional-research-comparison.md).
 */
export function AIAnalysisPanel({ security }: { security: SecurityProfile }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">
          AI-Assisted Analysis
        </h3>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500">Risk score</dt>
          <dd className="font-medium text-slate-900">{security.ai.riskScore} / 100</dd>
        </div>
        <div>
          <dt className="text-slate-500">Model confidence</dt>
          <dd className="font-medium text-slate-900">{security.ai.confidence}%</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3.5 w-3.5" /> Turnaround
          </dt>
          <dd className="font-medium text-slate-900">{security.ai.turnaround}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Data freshness</dt>
          <dd className="font-medium text-slate-900">{security.ai.dataFreshness}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">{security.ai.summary}</p>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Signals driving this score
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {security.ai.signals.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
