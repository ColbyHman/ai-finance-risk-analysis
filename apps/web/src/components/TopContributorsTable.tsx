import { topRiskContributors } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";

export function TopContributorsTable() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Top Risk Contributors</h3>
      <p className="mt-1 text-xs text-slate-500">
        Positions ranked by AI-modeled contribution to portfolio risk
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">Position</th>
              <th className="py-2 pr-4">Asset Class</th>
              <th className="py-2 pr-4">Exposure</th>
              <th className="py-2 pr-4">Risk Score</th>
              <th className="py-2 pr-4">AI Confidence</th>
              <th className="py-2 pr-4">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topRiskContributors.map((row) => (
              <tr key={row.name}>
                <td className="py-3 pr-4 font-medium text-slate-900">{row.name}</td>
                <td className="py-3 pr-4 text-slate-600">{row.assetClass}</td>
                <td className="py-3 pr-4 text-slate-600">{row.exposure}</td>
                <td className="py-3 pr-4 text-slate-600">{row.riskScore}</td>
                <td className="py-3 pr-4 text-slate-600">{row.aiConfidence}%</td>
                <td className="py-3 pr-4">
                  <RiskBadge level={row.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
