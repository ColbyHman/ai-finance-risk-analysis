import Link from "next/link";
import { SuggestedActions } from "@/components/SuggestedActions";
import { SiteNav } from "@/components/SiteNav";
import { ShieldAlert } from "lucide-react";

export default function ActionsPage() {
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
              <p className="text-xs text-slate-500">Suggested Actions</p>
            </div>
          </Link>
          <SiteNav current="/actions" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">What should I do?</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Three single-lever changes, each with a concrete before/after on effective
            technology exposure and on the pessimistic-case outcome at retirement — not a
            generic &quot;diversify more&quot; recommendation.
          </p>
        </div>

        <SuggestedActions />
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · educational illustration, not personalized financial advice — see
        docs/adr/0009-retirement-persona-and-projection.md for every modeling assumption.
      </footer>
    </div>
  );
}
