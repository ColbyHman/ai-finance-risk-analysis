import { anomalyAlerts } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";
import { AlertTriangle } from "lucide-react";

export function AnomalyFeed() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Why is it flagged?</h3>
      <p className="mt-1 text-xs text-slate-500">
        What each AI-detected risk flag means, why it matters for a 40-year horizon, and
        exactly which holdings are driving it.
      </p>
      <ul className="mt-4 space-y-4">
        {anomalyAlerts.map((alert) => (
          <li key={alert.id} className="flex gap-3 rounded-lg border border-slate-100 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                <RiskBadge level={alert.severity} />
              </div>
              <dl className="mt-2 space-y-1.5 text-sm">
                <div>
                  <dt className="inline font-medium text-slate-500">What it means: </dt>
                  <dd className="inline text-slate-600">{alert.whatItMeans}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-500">
                    Why it matters at this horizon:{" "}
                  </dt>
                  <dd className="inline text-slate-600">{alert.whyItMattersForHorizon}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-500">What&apos;s driving it: </dt>
                  <dd className="inline text-slate-600">{alert.whatsDrivingIt}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-slate-400">
                {alert.detectedAt} · model: {alert.model}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
