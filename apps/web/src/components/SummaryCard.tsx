import type { SummaryMetric } from "@/lib/mock-data";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

const toneStyles: Record<SummaryMetric["tone"], string> = {
  good: "text-emerald-600",
  bad: "text-red-600",
  neutral: "text-slate-500",
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
};

export function SummaryCard({ metric, compact = false }: { metric: SummaryMetric; compact?: boolean }) {
  const Icon = trendIcon[metric.trend];
  if (compact) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-xs font-medium text-slate-500">{metric.label}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          {metric.value}
        </p>
        <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${toneStyles[metric.tone]}`}>
          <Icon className="h-3 w-3" />
          {metric.delta}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {metric.value}
      </p>
      <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${toneStyles[metric.tone]}`}>
        <Icon className="h-4 w-4" />
        {metric.delta}
      </p>
    </div>
  );
}
