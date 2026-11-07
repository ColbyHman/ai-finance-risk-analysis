import type { SentimentSignal } from "@/lib/mock-data";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

const directionStyles: Record<
  SentimentSignal["direction"],
  { icon: typeof TrendingUp; className: string; label: string }
> = {
  improving: { icon: TrendingUp, className: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Improving" },
  deteriorating: { icon: TrendingDown, className: "bg-amber-50 text-amber-700 ring-amber-200", label: "Deteriorating" },
  stable: { icon: Activity, className: "bg-slate-50 text-slate-600 ring-slate-200", label: "Stable" },
};

/**
 * Renders a sentiment read as a labeled signal — direction, magnitude,
 * and its basis/source — deliberately never as a bare 0-100 number.
 * See docs/adr/0010-research-copilot-reframe.md's hard guardrail:
 * a sentiment signal must show where it comes from so it can't read
 * as a rating or a buy/sell/hold call.
 */
export function SentimentSignalBadge({ signal }: { signal: SentimentSignal }) {
  const style = directionStyles[signal.direction];
  const Icon = style.icon;
  return (
    <div className={`rounded-lg px-3 py-2 ring-1 ring-inset ${style.className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon className="h-3.5 w-3.5" />
        {style.label} ({signal.magnitude})
      </div>
      <p className="mt-1 text-xs opacity-90">
        Basis: {signal.basis}
      </p>
      <p className="mt-1 text-xs opacity-80">{signal.detail}</p>
    </div>
  );
}
