import type { TaxLotFlag } from "@/lib/mock-data";
import { CalendarClock } from "lucide-react";

const typeLabels: Record<TaxLotFlag["type"], string> = {
  "long-term-in-days": "Crosses long-term holding threshold",
  "wash-sale-risk": "Possible wash-sale timing",
};

/**
 * Renders a tax-lot flag as a timing fact — "here's what's coming
 * up and why it might matter for taxes," never a directive about
 * what to do with the lot. See docs/adr/0010.
 */
export function TaxLotFlagNotice({ flag }: { flag: TaxLotFlag }) {
  return (
    <div className="rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-inset ring-indigo-200">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800">
        <CalendarClock className="h-3.5 w-3.5" />
        {typeLabels[flag.type]}
      </div>
      <p className="mt-1 text-xs text-indigo-700">{flag.detail}</p>
      <p className="mt-1 text-xs text-indigo-500">
        Lot {flag.lotId} · {flag.daysUntilDue} day{flag.daysUntilDue === 1 ? "" : "s"} from {flag.dueDate}
      </p>
    </div>
  );
}
