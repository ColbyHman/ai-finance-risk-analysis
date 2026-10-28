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

export function SummaryCard({ metric }: { metric: SummaryMetric }) {
  const Icon = trendIcon[metric.trend];
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
