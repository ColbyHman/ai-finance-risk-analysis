import type { Verdict } from "@/lib/mock-data";
import { CheckCircle2, Scale, Zap } from "lucide-react";

const styles: Record<Verdict, { label: string; className: string; Icon: typeof Zap }> = {
  agree: {
    label: "Methods agree",
    className: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    Icon: CheckCircle2,
  },
  "ai-flags-earlier": {
    label: "AI flagged it earlier",
    className: "bg-blue-100 text-blue-800 ring-blue-600/20",
    Icon: Zap,
  },
  diverge: {
    label: "Methods diverge",
    className: "bg-amber-100 text-amber-800 ring-amber-600/20",
    Icon: Scale,
  },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, className, Icon } = styles[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
