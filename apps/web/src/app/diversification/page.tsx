import Link from "next/link";
import { AssetAllocationChart, SectorExposureChart } from "@/components/DiversificationCharts";
import { DiversificationScoreCard, DiversificationFlagsList } from "@/components/DiversificationScoreCard";
import { ShieldAlert } from "lucide-react";

export default function DiversificationPage() {
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
              <p className="text-xs text-slate-500">Diversification Risk</p>
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
          <h2 className="text-xl font-semibold text-slate-900">Diversification Risk</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Per-security analysis (see{" "}
            <Link href="/securities" className="text-blue-600 hover:underline">
              Securities
            </Link>
            ) evaluates each holding on its own. This view looks at the portfolio
            as a whole — how much these holdings actually overlap once index
            funds are unpacked into their underlying sector weightings, not
            just which account bucket each one sits in.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DiversificationScoreCard />
          </div>
          <div className="lg:col-span-2">
            <AssetAllocationChart />
          </div>
        </div>

        <SectorExposureChart />

        <DiversificationFlagsList />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · all figures are synthetic mock data illustrating the concept,
        not financial advice — see docs/adr/0008-personal-portfolio-reframe.md.
      </footer>
    </div>
  );
}
