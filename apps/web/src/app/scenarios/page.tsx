import Link from "next/link";
import { ScenarioExplorer } from "@/components/ScenarioExplorer";
import { SiteNav } from "@/components/SiteNav";
import { ShieldAlert } from "lucide-react";

export default function ScenariosPage() {
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
              <p className="text-xs text-slate-500">Scenario Analysis</p>
            </div>
          </Link>
          <SiteNav current="/scenarios" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">What could go wrong?</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Replays three historical-style drawdowns against this portfolio&apos;s
            actual allocation, starting this year, then lets the rest of a
            normal 40-year projection play out. The toggle re-runs the exact
            same shock against a hypothetical 58-year-old with only 7 years
            left — the point isn&apos;t that one shock is &quot;worse&quot;
            than another, it&apos;s that the same shock means very different
            things depending on how much time is left to recover from it.
          </p>
        </div>

        <ScenarioExplorer />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · educational illustration, not personalized financial advice —
        drawdown figures are illustrative approximations for a portfolio
        with this persona&apos;s allocation, not a backtest of these exact
        tickers. See docs/adr/0009-retirement-persona-and-projection.md.
      </footer>
    </div>
  );
}
