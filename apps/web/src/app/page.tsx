"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/SiteNav";
import {
  triageHoldings,
  portfolioSignals,
  triageRunLine,
  triageDisclaimer,
  withRelevance,
  type TriageHolding,
} from "@/lib/triage";

/** Mini sparkline — up/down accent follows the actual last-vs-first
 * sign of the series, never a hardcoded color (per clickable-triage.html). */
function Spark({ values }: { values: number[] }) {
  const w = 80;
  const h = 38;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 5 - ((v - min) / range) * (h - 10)]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const up = values[values.length - 1] >= values[0];
  const stroke = up ? "var(--green)" : "var(--red)";
  const gid = `spark-${values.join("-")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[38px] w-full block">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GROUPS: { key: "act" | "watch"; label: string }[] = [
  { key: "act", label: "Act" },
  { key: "watch", label: "Watch" },
];

export default function HomePage() {
  const [holdings, setHoldings] = useState<TriageHolding[]>(triageHoldings);
  const [resolvedOpen, setResolvedOpen] = useState(false);

  const ranked = useMemo(() => withRelevance(holdings), [holdings]);
  const active = ranked.filter((h) => !h.reviewed && (h.status === "act" || h.status === "watch"));
  const resolved = ranked.filter((h) => h.reviewed || h.status === "none");

  function markReviewed(ticker: string) {
    setHoldings((prev) => prev.map((h) => (h.ticker === ticker ? { ...h, reviewed: true } : h)));
  }

  return (
    <div className="min-h-screen">
      <TopNav current="/" />
      <div className="mx-auto max-w-[1020px] px-6 pb-[60px]">
        <h1 className="mt-[18px] mb-1 text-xl font-bold tracking-tight">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--ink-dim)]">
          <span>{triageRunLine.summary}</span>
          <span className="font-mono tabular-nums text-[var(--ink-faint)]">{triageRunLine.asOf}</span>
          <a href="#" className="font-semibold text-[var(--ink)] no-underline">
            View run log →
          </a>
        </div>
        <div className="my-[14px] mb-[22px] rounded-[10px] bg-[var(--surface)] px-3.5 py-2.5 text-[11.5px] leading-[1.5] text-[var(--ink-dim)]">
          {triageDisclaimer}
        </div>

        <div className="mb-3 flex items-center gap-2">
          <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
            Needs your attention
          </p>
        </div>

        {active.length === 0 ? (
          <div className="mb-2.5 rounded-[20px] bg-[var(--surface)] px-6 py-8 text-center">
            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-dim)] text-xl text-[var(--green)]">
              ✓
            </div>
            <p className="m-0 mb-1 text-sm font-bold">All caught up</p>
            <p className="m-0 text-xs text-[var(--ink-dim)]">
              Nothing needs attention right now. Next scheduled run: tomorrow, 6:00 AM.
            </p>
          </div>
        ) : (
          GROUPS.map((g) => {
            const items = active.filter((h) => h.status === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key}>
                <div className="mt-[22px] mb-3 flex items-center gap-2 first:mt-0">
                  <span
                    className={`h-2 w-2 rounded-full ${g.key === "act" ? "bg-[var(--red)]" : "bg-[var(--amber)]"}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink-dim)]">
                    {g.label}
                  </span>
                  <span className="font-mono text-[11.5px] tabular-nums text-[var(--ink-faint)]">{items.length}</span>
                </div>
                {items.map((h) => (
                  <Link
                    key={h.ticker}
                    href={`/securities/${h.ticker}`}
                    className="group mb-2.5 flex items-start gap-4 rounded-[20px] bg-[var(--surface)] px-5 py-4 no-underline transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-[5px] flex items-center justify-between gap-2.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[15px] font-bold tracking-tight">{h.ticker}</span>
                          <span className="font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">{h.weight}%</span>
                        </div>
                        <span
                          className={`rounded-lg border px-[11px] py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-on-bright)] ${
                            h.status === "act" ? "bg-[var(--red)] border-[var(--red)]" : "bg-[var(--amber)] border-[var(--amber)]"
                          }`}
                        >
                          {g.label}
                        </span>
                      </div>
                      <p className="my-[2px] mb-[5px] text-[13px] font-semibold">{h.headline}</p>
                      {h.summary && (
                        <p className="m-0 mb-2.5 text-[12.5px] leading-[1.55] text-[var(--ink-dim)]">{h.summary}</p>
                      )}
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[11px] italic text-[var(--ink-faint)]">{h.reason}</span>
                        <button
                          type="button"
                          className="relative z-[2] flex-shrink-0 rounded-lg border border-[var(--btn-border)] bg-[var(--btn-bg)] px-4 py-[7px] text-[11.5px] font-bold text-[var(--btn-text)] transition-colors hover:border-[var(--btn-hover-border)] hover:bg-[var(--btn-hover-bg)]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markReviewed(h.ticker);
                          }}
                        >
                          Mark reviewed
                        </button>
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <Spark values={h.trend} />
                    </div>
                  </Link>
                ))}
              </div>
            );
          })
        )}

        <div className="mt-6 mb-3 flex items-center gap-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 border-none bg-none p-0 text-left"
            onClick={() => setResolvedOpen((v) => !v)}
          >
            <span
              className={`text-[10px] text-[var(--ink-faint)] transition-transform ${resolvedOpen ? "rotate-90" : ""}`}
            >
              ▸
            </span>
            <span className="h-2 w-2 rounded-full bg-[var(--ink-faint)]" />
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--ink-dim)]">
              Reviewed / no action needed
            </span>
            <span className="font-mono text-[11.5px] tabular-nums text-[var(--ink-faint)]">{resolved.length}</span>
          </button>
        </div>
        {resolvedOpen && (
          <div className="mb-2.5 overflow-hidden rounded-2xl bg-[var(--surface)]">
            {resolved.map((h) => (
              <Link
                key={h.ticker}
                href={`/securities/${h.ticker}`}
                className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 text-xs no-underline last:border-b-0 hover:bg-[var(--surface-2)]"
              >
                <span className="font-bold text-[var(--ink)]">{h.ticker}</span>
                <span className="mx-3.5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ink-dim)]">
                  {h.headline}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">{h.weight}%</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-9">
          <div className="mb-3 flex items-center gap-2">
            <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
              Portfolio-level signals — things no single holding&apos;s triage would catch
            </p>
          </div>
          {portfolioSignals.map((s) => (
            <div key={s.id} className="mb-3 flex items-start gap-3.5 rounded-[20px] bg-[var(--surface)] px-5 py-[18px]">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-[15px] ${
                  s.kind === "concentration"
                    ? "bg-[var(--amber-dim)] text-[var(--amber)]"
                    : "bg-[var(--surface-2)] text-[var(--ink)]"
                }`}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="m-0 mb-1 text-[13.5px] font-bold">{s.title}</p>
                <p className="m-0 text-[12.5px] leading-[1.55] text-[var(--ink-dim)]">{s.text}</p>
                <div className="mt-[9px] flex gap-1.5">
                  {s.tickers.map((t) => (
                    <Link
                      key={t}
                      href={`/securities/${t}`}
                      className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-[9px] py-[3px] text-[10.5px] font-bold text-[var(--ink-dim)] no-underline transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="mb-3 flex items-start gap-3.5 rounded-[20px] bg-[var(--surface)] px-5 py-[18px]">
            <div className="flex-1">
              <p className="m-0 mb-2.5 text-[13.5px] font-bold">Current allocation</p>
              <div className="mt-2 flex h-[22px] overflow-hidden rounded-lg">
                {triageHoldings.map((h) => (
                  <div key={h.ticker} style={{ width: `${h.weight}%`, background: h.color }} />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-[var(--ink-dim)]">
                {triageHoldings.map((h) => (
                  <span key={h.ticker} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: h.color }} />
                    {h.ticker} {h.weight}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
