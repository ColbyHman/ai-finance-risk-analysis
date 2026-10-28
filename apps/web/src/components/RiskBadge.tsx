import type { RiskLevel } from "@/lib/mock-data";

const levelStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  medium: "bg-amber-100 text-amber-800 ring-amber-600/20",
  high: "bg-orange-100 text-orange-800 ring-orange-600/20",
  critical: "bg-red-100 text-red-800 ring-red-600/20",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${levelStyles[level]}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}
