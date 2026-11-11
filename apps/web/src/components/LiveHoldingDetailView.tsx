"use client";

import Link from "next/link";
import type { LiveHoldingDetail, LiveDocument, LiveAnalysis } from "@/lib/live-finance";
import { MarketPanel } from "./MarketPanel";
import { useMarket } from "./useMarket";

const ASSET_TYPE_LABELS: Record<string, string> = {
  equity: "Equity (a share of ownership in a single company)",
  etf: "ETF (a basket of many securities traded as one fund)",
  treasury: "Treasury (a bond issued by the U.S. government)",
  index: "Index fund (a fund that tracks a market index)",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  earnings: "Earnings",
  insider_activity: "Insider activity (a company officer or director trading their own shares)",
  analyst_rating: "Analyst rating change",
  macro_sector: "Macro / sector news",
  product: "Product update",
  no_activity: "No notable activity",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Undated";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function SentimentChip({ sentiment }: { sentiment: string }) {
  const s = sentiment.toLowerCase();
  const cls =
    s === "positive"
      ? "bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]"
      : s === "negative"
      ? "bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--amber)]"
      : "bg-[var(--surface-2)] text-[var(--ink-dim)] border-[var(--border)]";
  const label = s === "positive" ? "Reads positive" : s === "negative" ? "Reads negative" : "Neutral";
  return <span className={`rounded-md border px-[11px] py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
}

function DocumentRow({ doc, highlighted }: { doc: LiveDocument; highlighted?: boolean }) {
  return (
    <a
      id={`doc-${doc.id}`}
      href={doc.url || undefined}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5 text-xs no-underline last:border-b-0 hover:bg-[var(--surface-2)] ${
        highlighted ? "bg-[var(--amber-dim)]" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[12.5px] font-semibold text-[var(--ink)]">{doc.title || "Untitled document"}</p>
        <p className="m-0 mt-0.5 text-[10.5px] text-[var(--ink-faint)]">
          {doc.source} · {doc.doc_type || "filing"} · {formatDate(doc.published_at)}
        </p>
      </div>
      {doc.url && <span className="flex-shrink-0 text-[10.5px] text-[var(--ink-faint)]">View source →</span>}
    </a>
  );
}

function AnalysisCard({ analysis, documents }: { analysis: LiveAnalysis; documents: LiveDocument[] }) {
  const docById = new Map(documents.map((d) => [d.id, d]));
  return (
    <div className="mb-4 rounded-[20px] bg-[var(--surface)] px-5 py-[18px]">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <SentimentChip sentiment={analysis.sentiment} />
        <span className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-[9px] py-[3px] text-[10.5px] font-bold text-[var(--ink-dim)]">
          {EVENT_TYPE_LABELS[analysis.event_type] || analysis.event_type || "Update"}
        </span>
        <span className="text-[10.5px] text-[var(--ink-faint)]">{formatDate(analysis.created_at)}</span>
      </div>
      <p className="m-0 mb-3 text-[13.5px] leading-[1.6] text-[var(--ink-dim)]">{analysis.summary}</p>
      <p className="m-0 mb-3 text-[10.5px] text-[var(--ink-faint)]">
        Materiality (how much this matters, 0–100): {analysis.materiality}/100 — a presentation-layer sense of how
        much attention this deserves, not a buy/sell/hold signal.
      </p>
      {analysis.citations.length > 0 && (
        <div className="border-t border-[var(--border)] pt-3">
          <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)]">
            This claim cites
          </p>
          <ul className="m-0 flex flex-col gap-1 pl-0 text-[11.5px]">
            {analysis.citations.map((c, i) => {
              const doc = docById.get(c.document_id);
              return (
                <li key={`${c.document_id}-${i}`} className="list-none">
                  <a
                    href={`#doc-${c.document_id}`}
                    className="text-[var(--ink-dim)] underline hover:text-[var(--ink)]"
                  >
                    {doc ? doc.title || "Untitled document" : "A fetched document (see list below)"}
                  </a>
                  {c.excerpt && <span className="text-[var(--ink-faint)]"> — &ldquo;{c.excerpt}&rdquo;</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LiveHoldingDetailView({ detail }: { detail: LiveHoldingDetail }) {
  const market = useMarket([detail.ticker]);
  const quote = market.quote(detail.ticker);
  const latest = detail.analyses[0];
  const olderAnalyses = detail.analyses.slice(1);

  return (
    <div className="mx-auto max-w-[980px] px-6 pb-[60px]">
      <Link href="/" className="mb-3.5 mt-4 inline-block text-xs text-[var(--ink-dim)] no-underline hover:text-[var(--ink)]">
        ← Triage inbox
      </Link>

      <div className="mb-5 rounded-3xl bg-[var(--surface)] px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <p className="m-0 text-[28px] font-bold tracking-tight">
              {detail.ticker}
              {quote?.name && <span className="ml-2.5 text-[15px] font-semibold text-[var(--ink-dim)]">{quote.name}</span>}
            </p>
            <p className="mt-[3px] text-[12.5px] text-[var(--ink-faint)]">
              {ASSET_TYPE_LABELS[detail.asset_type] || detail.asset_type}
            </p>
          </div>
          {!detail.active && (
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-[5px] text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-dim)]">
              Not currently tracked
            </span>
          )}
        </div>
      </div>

      <MarketPanel
        quote={quote}
        session={market.data?.market}
        fetchedAt={market.fetchedAt}
        researchMinutes={market.data?.research_interval_minutes}
        error={market.error}
        isFund={detail.asset_type !== "equity"}
      />

      {detail.documents.length === 0 ? (
        <div className="mb-4 rounded-[20px] bg-[var(--surface)] px-6 py-8 text-center">
          <p className="m-0 mb-1 text-sm font-bold">No recent filings or news found</p>
          <p className="m-0 text-xs text-[var(--ink-dim)]">
            Nothing has been fetched yet for this holding. Checks run on a schedule, or can be triggered right away
            from the holdings list on the home page.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
            Latest read
          </p>
          {latest ? (
            <AnalysisCard analysis={latest} documents={detail.documents} />
          ) : (
            <div className="mb-4 rounded-[20px] bg-[var(--surface)] px-5 py-[18px] text-[12.5px] text-[var(--ink-dim)]">
              Documents have been fetched for this holding, but no analysis has run yet.
            </div>
          )}

          {olderAnalyses.length > 0 && (
            <>
              <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
                Earlier reads
              </p>
              {olderAnalyses.map((a) => (
                <AnalysisCard key={a.id} analysis={a} documents={detail.documents} />
              ))}
            </>
          )}

          <p className="mb-2.5 mt-6 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
            Documents fetched for this holding ({detail.documents.length})
          </p>
          <div className="mb-4 overflow-hidden rounded-2xl bg-[var(--surface)]">
            {detail.documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}

      <div className="mt-[26px] text-center text-[11px] text-[var(--ink-faint)]">
        Information to help you form your own view — not a recommendation to buy, sell, or hold anything.
      </div>
    </div>
  );
}
