import Link from "next/link";
import { securityProfiles } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { VerdictBadge } from "@/components/VerdictBadge";
import { ShieldAlert } from "lucide-react";

export default function SecuritiesIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                AI Finance Risk Analysis
              </h1>
              <p className="text-xs text-slate-500">
                Per-Security Views · AI vs. Traditional Research
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to portfolio dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Securities</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Each security below has an AI-assisted risk read-out alongside the
            equivalent traditional research workflow, so the two can be
            compared directly on the same position. This demonstrates where
            automation adds speed/continuity and where it simply confirms
            what traditional research already found — see each security page
            for the full comparison.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Security</th>
                <th className="px-5 py-3">Asset Class</th>
                <th className="px-5 py-3">Exposure</th>
                <th className="px-5 py-3">AI Risk Score</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Comparison vs. Traditional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {securityProfiles.map((s) => (
                <tr key={s.ticker} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link
                      href={`/securities/${s.ticker}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {s.ticker}
                    </Link>
                    <p className="text-xs text-slate-500">{s.name}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.assetClass}</td>
                  <td className="px-5 py-4 text-slate-600">{s.exposure}</td>
                  <td className="px-5 py-4 text-slate-600">{s.ai.riskScore}</td>
                  <td className="px-5 py-4">
                    <RiskBadge level={s.level} />
                  </td>
                  <td className="px-5 py-4">
                    <VerdictBadge verdict={s.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
