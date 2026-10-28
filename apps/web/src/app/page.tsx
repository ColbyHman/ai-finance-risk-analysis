import { SummaryCard } from "@/components/SummaryCard";
import { ExposureChart, RiskTrendChart } from "@/components/RiskCharts";
import { TopContributorsTable } from "@/components/TopContributorsTable";
import { AnomalyFeed } from "@/components/AnomalyFeed";
import { summaryMetrics } from "@/lib/mock-data";
import { ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                AI Finance Risk Analysis
              </h1>
              <p className="text-xs text-slate-500">
                Portfolio Risk Dashboard · Proof of Concept
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
            Demo data — not a live feed
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <SummaryCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExposureChart />
          <RiskTrendChart />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TopContributorsTable />
          </div>
          <div className="lg:col-span-2">
            <AnomalyFeed />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC dashboard · all figures are synthetic mock data · no live backend
        or data pipeline is wired up (see docs/adr).
      </footer>
    </div>
  );
}
