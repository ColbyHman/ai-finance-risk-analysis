import Link from "next/link";
import type { RankedDigestEntry } from "@/lib/digest";
import { SentimentSignalBadge } from "./SentimentSignalBadge";
import { TaxLotFlagNotice } from "./TaxLotFlagNotice";
import { Newspaper } from "lucide-react";

function formatCompactDollars(v: number): string {
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

/**
 * One ranked "what changed" card — news summary, sentiment signal,
 * and a tax flag if one applies, linking straight into the
 * security's own brief for drill-down. See
 * docs/adr/0010-research-copilot-reframe.md: this is information
 * plus "why it might matter," ending in a link, never a directive.
 */
export function DigestCard({ entry, rank }: { entry: RankedDigestEntry; rank: number }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {rank}
          </span>
          <div>
            <Link
              href={`/securities/${entry.ticker}`}
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              {entry.ticker}
            </Link>
            <span className="ml-2 text-xs text-slate-500">
              {entry.name} · {formatCompactDollars(entry.positionValue)} position
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
          Relevance {entry.relevanceScore.toFixed(1)}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-900">{entry.news.headline}</p>
          <p className="mt-1 text-sm text-slate-600">{entry.news.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            {entry.news.timestamp} · {entry.news.sourceCount} sources
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SentimentSignalBadge signal={entry.sentiment} />
        {entry.taxFlag ? (
          <TaxLotFlagNotice flag={entry.taxFlag} />
        ) : (
          <div className="flex items-center rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400 ring-1 ring-inset ring-slate-100">
            No tax-lot timing events for this holding right now.
          </div>
        )}
      </div>

      <Link
        href={`/securities/${entry.ticker}`}
        className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        See the full brief for {entry.ticker} →
      </Link>
    </li>
  );
}
