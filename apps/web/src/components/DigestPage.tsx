import Link from "next/link";
import { ShieldAlert, Newspaper } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { DigestCard } from "@/components/DigestCard";
import { digestInputs, digestReferenceTimestamp, persona } from "@/lib/mock-data";
import { rankDigestEntries } from "@/lib/digest";

/**
 * The research-copilot "what changed" feed — the new landing surface
 * per docs/adr/0010-research-copilot-reframe.md. Replaces the old
 * dashboard as `/`; the dashboard itself moved to `/portfolio-health`
 * unchanged. Rendered from both `app/page.tsx` and `app/digest/page.tsx`
 * so `/` and `/digest` show the identical view.
 *
 * Ranking is computed, not hardcoded — see lib/digest.ts's
 * rankDigestEntries, a pure function in the same spirit as
 * lib/projection.ts.
 *
 * Guardrail: this is a triage surface, not an advice surface. Every
 * card is "here's what changed, here's why it might matter" ending
 * in a drill-down link — never a verdict.
 */
export function DigestPage() {
  const now = new Date(digestReferenceTimestamp.replace(" ", "T").replace(" UTC", "Z"));
  const ranked = rankDigestEntries(digestInputs, persona.currentBalance, now);

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
              <p className="text-xs text-slate-500">Research Digest · Proof of Concept</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <SiteNav current="/digest" />
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              Demo data — not a live feed
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex items-start gap-3">
          <Newspaper className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              What changed across these holdings
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Every holding&apos;s recent news, sentiment, and tax-lot timing in one
              ranked feed — triage here, then drill into a holding&apos;s own brief
              only where it&apos;s warranted. Ranked by relevance to this specific
              portfolio (position size, how fresh and widely covered the news is,
              tax-lot urgency, and how much this holding already contributes to
              concentration risk), not by how &quot;good&quot; or &quot;bad&quot; the
              news is. For the risk-in-the-abstract view (am I on track, what could
              go wrong), see{" "}
              <Link href="/portfolio-health" className="text-blue-600 hover:underline">
                Portfolio Health
              </Link>
              .
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          {ranked.map((entry, i) => (
            <DigestCard key={entry.ticker} entry={entry} rank={i + 1} />
          ))}
        </ol>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Everything above describes what changed and why it might be worth a
          look — it is not a recommendation to buy, sell, or hold anything, and
          none of it should be read as a verdict on any holding. Tax-lot notes
          are timing facts, not tax advice; consult a licensed professional
          before acting on anything here with a real portfolio.
        </p>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 text-xs text-slate-400">
        POC · all news, sentiment, and tax-lot data on this page are synthetic
        mock data illustrating the concept, not a live feed — see
        docs/adr/0010-research-copilot-reframe.md.
      </footer>
    </div>
  );
}
