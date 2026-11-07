import Link from "next/link";
import { notFound } from "next/navigation";
import { securityProfiles } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { RiskHistoryChart } from "@/components/RiskHistoryChart";
import { SecurityBrief } from "@/components/SecurityBrief";
import { SiteNav } from "@/components/SiteNav";
import { ShieldAlert } from "lucide-react";

export function generateStaticParams() {
  return securityProfiles.map((s) => ({ ticker: s.ticker }));
}

export default async function SecurityDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const security = securityProfiles.find(
    (s) => s.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (!security) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <Link href="/digest" className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                AI Finance Risk Analysis
              </h1>
              <p className="text-xs text-slate-500">Per-Security Brief</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <SiteNav current="/securities" />
            <Link
              href="/securities"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← All securities
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {security.ticker}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {security.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {security.assetClass} · {security.exposure} exposure
            </p>
          </div>
          <RiskBadge level={security.level} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            AI Risk Score — 30 Day Trend
          </h3>
          <RiskHistoryChart data={security.riskHistory} />
        </div>

        <AIAnalysisPanel security={security} />

        <SecurityBrief security={security} />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · all figures are synthetic mock data illustrating the concept —
        see docs/adr/0006-per-security-comparison-view.md and
        docs/adr/0010-research-copilot-reframe.md.
      </footer>
    </div>
  );
}
