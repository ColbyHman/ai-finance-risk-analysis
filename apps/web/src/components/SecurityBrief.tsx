import type { SecurityProfile } from "@/lib/mock-data";
import {
  digestInputs,
  fundamentalsSnapshots,
  trendSeries,
} from "@/lib/mock-data";
import { SentimentSignalBadge } from "./SentimentSignalBadge";
import { TaxLotFlagNotice } from "./TaxLotFlagNotice";
import { TrendSeriesChart } from "./TrendSeriesChart";
import { Newspaper, LineChart as LineChartIcon, Scale } from "lucide-react";

/**
 * The per-security "research copilot" brief — fundamentals vs. history
 * and peers, the news digest, the sentiment signal, tax-lot flags,
 * and a longer trend chart than the existing 30-day riskHistory chart.
 * See docs/adr/0010-research-copilot-reframe.md.
 *
 * Added alongside the existing AIAnalysisPanel/RiskHistoryChart (which
 * stay as-is on the page) rather than replacing them — this is
 * strictly additive per the ADR.
 *
 * Hard guardrail: every section here describes "what changed" / "where
 * this sits" — never a verdict. If a ticker has no digest/fundamentals
 * data (not every holding has news this period), the relevant section
 * is simply omitted rather than showing a hollow placeholder.
 */
export function SecurityBrief({ security }: { security: SecurityProfile }) {
  const digest = digestInputs.find((d) => d.ticker === security.ticker);
  const fundamentals = fundamentalsSnapshots.find((f) => f.ticker === security.ticker);
  const trend = trendSeries.find((t) => t.ticker === security.ticker);

  if (!digest && !fundamentals && !trend) return null;

  return (
    <div className="space-y-6">
      {fundamentals && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              Fundamentals vs. own history &amp; {fundamentals.peerOrBenchmarkLabel}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Where this holding sits today relative to its own track record and a
            peer/benchmark set — context, not a verdict on whether that&apos;s good or bad.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {fundamentals.metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">{m.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{m.current}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Own history: {m.ownHistoryAvg} · Peers/benchmark: {m.peerOrBenchmarkAvg}
                </p>
                <p className="mt-1 text-xs text-slate-600">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {trend && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              Price &amp; fundamental trend — {trend.windowLabel}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            A longer window than the 30-day AI risk score trend above, pairing price
            with a normalized fundamental index (illustrative, not a real revenue series).
          </p>
          <div className="mt-4">
            <TrendSeriesChart series={trend} />
          </div>
        </div>
      )}

      {digest && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">What changed since you last looked</h3>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900">{digest.news.headline}</p>
          <p className="mt-1 text-sm text-slate-600">{digest.news.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            {digest.news.timestamp} · {digest.news.sourceCount} sources
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                Sentiment signal
              </p>
              <SentimentSignalBadge signal={digest.sentiment} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                Tax relevance
              </p>
              {digest.taxFlag ? (
                <TaxLotFlagNotice flag={digest.taxFlag} />
              ) : (
                <div className="flex items-center rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400 ring-1 ring-inset ring-slate-100">
                  No tax-lot timing events for this holding right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
