import type { SecurityProfile } from "@/lib/mock-data";
import { Bot, Clock, Microscope, UserRound } from "lucide-react";

export function MethodologyComparison({ security }: { security: SecurityProfile }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            AI-Assisted Analysis
          </h3>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Risk score</dt>
            <dd className="font-medium text-slate-900">{security.ai.riskScore} / 100</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Model confidence</dt>
            <dd className="font-medium text-slate-900">{security.ai.confidence}%</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Turnaround
            </dt>
            <dd className="text-right font-medium text-slate-900">{security.ai.turnaround}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Data freshness</dt>
            <dd className="text-right font-medium text-slate-900">
              {security.ai.dataFreshness}
            </dd>
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

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Traditional Research
          </h3>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Rating</dt>
            <dd className="text-right font-medium text-slate-900">{security.traditional.rating}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Turnaround
            </dt>
            <dd className="text-right font-medium text-slate-900">
              {security.traditional.turnaround}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Data freshness</dt>
            <dd className="text-right font-medium text-slate-900">
              {security.traditional.dataFreshness}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {security.traditional.summary}
        </p>
        <div className="mt-4">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Microscope className="h-3.5 w-3.5" /> Methods used
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {security.traditional.methods.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
