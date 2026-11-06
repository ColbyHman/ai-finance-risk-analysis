import Link from "next/link";
import { RetirementProjection } from "@/components/RetirementProjection";
import { ShieldAlert } from "lucide-react";

export default function RetirementPage() {
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
              <p className="text-xs text-slate-500">Retirement Projection</p>
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
          <h2 className="text-xl font-semibold text-slate-900">Am I on track?</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            A 1-day Value at Risk number means very little to someone with a 40-year
            horizon. This projects the current portfolio and contribution schedule
            forward to retirement, so the question this page answers is the one
            that actually matters at this persona&apos;s age: is the current plan on
            pace for the goal, and what does changing it do to the odds?
          </p>
        </div>

        <RetirementProjection />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · educational illustration, not personalized financial advice — see
        docs/adr/0009-retirement-persona-and-projection.md for every modeling
        assumption.
      </footer>
    </div>
  );
}
