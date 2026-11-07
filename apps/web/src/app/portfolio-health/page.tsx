"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/SiteNav";
import {
  healthHoldings,
  healthQueueStatus,
  benchmarkPath,
  portfolioByTimeframe,
  riskContext,
  type Timeframe,
} from "@/lib/triage";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "YTD", "1Y"];

const ALLOC_COLORS: Record<string, string> = {
  NVDA: "#4ade80",
  AAPL: "#60a5fa",
  MSFT: "#38bdf8",
  VTI: "#f4f4f4",
  VXUS: "#9ba3ab",
  BND: "#6b7280",
  Cash: "#3f454d",
};

function miniLine(values: number[], w: number, h: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / range) * (h - 6)]);
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}

export default function PortfolioHealthPage() {
  const [tf, setTf] = useState<Timeframe>("YTD");
  const d = portfolioByTimeframe[tf];
  const up = d.changeAbs >= 0;
  // Up/down color-flip bug fix carried over from the mockup: the hero
  // chart's accent follows the ACTUAL sign of the change for the
  // selected timeframe, never a hardcoded color.
  const accent = up ? "#4ade80" : "#f87171";

  const chart = useMemo(() => {
    const w = 700;
    const h = 110;
    const benchPath = benchmarkPath.slice(-d.path.length);
    const min = Math.min(...d.path, ...benchPath);
    const max = Math.max(...d.path, ...benchPath);
    const range = max - min || 1;
    const toPts = (vals: number[]) =>
      vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - min) / range) * (h - 6)]);
    const portLine = toPts(d.path)
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
    const benchLine = toPts(benchPath)
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
    const area = `${portLine} L ${w} ${h} L 0 ${h} Z`;
    return { portLine, benchLine, area };
  }, [d]);

  const movers = [...healthHoldings]
    .filter((h) => h.ticker !== "Cash")
    .sort((a, b) => Math.abs(b.d1) - Math.abs(a.d1))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <TopNav current="/portfolio-health" />
      <div className="mx-auto max-w-[1020px] px-6 pb-[60px]">
        <div className="mt-[18px] mb-5 flex items-start justify-between">
          <div>
            <h1 className="m-0 mb-1 text-xl font-bold tracking-tight">Portfolio Health</h1>
            <p className="m-0 max-w-[480px] text-xs text-[#9ba3ab]">
              Quick glance at performance — separate from the triage inbox on purpose.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-[#20242a] px-7 py-[26px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="m-0 mb-1 flex items-center gap-2 text-[11.5px] text-[#6b7280]">
                Total portfolio value{" "}
                <span className="font-mono text-[10.5px] tabular-nums text-[#6b7280] opacity-70">
                  as of 10:42 AM ET
                </span>
              </p>
              <p className="m-0 font-mono text-[40px] font-medium tabular-nums tracking-tight text-white">
                ${d.value.toLocaleString()}
              </p>
              <div
                className={`mt-1.5 flex items-center gap-1.5 text-[15px] font-semibold ${
                  up ? "text-[#4ade80]" : "text-[#f87171]"
                }`}
              >
                <span className="font-mono tabular-nums">
                  {up ? "↑" : "↓"} ${Math.abs(d.changeAbs).toLocaleString()} ({up ? "+" : ""}
                  {d.changePct}%) {tf}
                </span>
              </div>
            </div>
            <div className="flex gap-0.5 rounded-lg bg-[#262b32] p-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTf(t)}
                  className={`rounded-md border px-3.5 py-1.5 text-[11.5px] font-bold transition-colors ${
                    tf === t
                      ? "border-white bg-white text-[#191c1f]"
                      : "border-transparent text-[#6b7280] hover:border-[#2d333b] hover:text-[#f4f4f4]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <svg viewBox="0 0 700 110" preserveAspectRatio="none" className="h-[110px] w-full block">
              <defs>
                <linearGradient id={`hg-${tf}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={chart.area} fill={`url(#hg-${tf})`} />
              <path d={chart.benchLine} fill="none" stroke="#4b5563" strokeWidth={1.5} strokeDasharray="4 3" />
              <path d={chart.portLine} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-[#6b7280]">
              <span>{tf} ago</span>
              <span>— vs. a blended benchmark (dashed)</span>
              <span>today</span>
            </div>
          </div>
        </div>

        <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
          Biggest movers this period
        </p>
        <div className="mb-5 flex gap-3">
          {movers.map((h) => {
            const moverUp = h.d1 > 0;
            const status = healthQueueStatus[h.ticker];
            const linkText = status ? `${status} in the inbox →` : "See its brief →";
            return (
              <div key={h.ticker} className="flex-1 rounded-[20px] bg-[#20242a] px-[18px] py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white">{h.ticker}</span>
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      moverUp ? "text-[#4ade80]" : h.d1 < 0 ? "text-[#f87171]" : ""
                    }`}
                  >
                    {h.d1 > 0 ? "+" : ""}
                    {h.d1}%
                  </span>
                </div>
                <p className="mt-0.5 mb-2.5 text-[10.5px] text-[#6b7280]">today&apos;s move</p>
                <Link
                  href={`/securities/${h.ticker}`}
                  className="inline-flex items-center gap-[3px] rounded-lg border border-white bg-white px-3 py-[6px] text-[11.5px] font-bold text-[#191c1f] no-underline transition-colors hover:border-[#9ba3ab] hover:bg-[#9ba3ab]"
                >
                  {linkText}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
          Holdings — price and return <span className="font-normal normal-case tracking-normal">(click a row for its brief)</span>
        </p>
        <div className="mb-5 overflow-hidden rounded-[20px] bg-[#20242a]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 80 }}>
                  Ticker
                </th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 80 }}>
                  Weight
                </th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 100 }}>
                  Price
                </th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 90 }}>
                  1D
                </th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 90 }}>
                  YTD
                </th>
                <th className="px-5 pb-2.5 pt-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6b7280]" style={{ width: 90 }}>
                  30-day
                </th>
              </tr>
            </thead>
            <tbody>
              {healthHoldings.map((h) => {
                const rowUp = h.trend[h.trend.length - 1] >= h.trend[0];
                const stroke = rowUp ? "#4ade80" : "#f87171";
                return (
                  <tr
                    key={h.ticker}
                    className="cursor-pointer hover:bg-[#262b32]"
                    onClick={() => {
                      window.location.href = `/securities/${h.ticker}`;
                    }}
                  >
                    <td className="border-t border-[#2d333b] px-5 py-[11px] font-bold">{h.ticker}</td>
                    <td className="border-t border-[#2d333b] px-5 py-[11px] font-mono text-[11.5px] tabular-nums text-[#6b7280]">
                      {h.weight}%
                    </td>
                    <td className="border-t border-[#2d333b] px-5 py-[11px] font-mono text-[12.5px] tabular-nums text-[#9ba3ab]">
                      ${h.price.toFixed(2)}
                    </td>
                    <td
                      className={`border-t border-[#2d333b] px-5 py-[11px] font-mono text-[12.5px] font-semibold tabular-nums ${
                        h.d1 > 0 ? "text-[#4ade80]" : h.d1 < 0 ? "text-[#f87171]" : ""
                      }`}
                    >
                      {h.d1 > 0 ? "+" : ""}
                      {h.d1}%
                    </td>
                    <td
                      className={`border-t border-[#2d333b] px-5 py-[11px] font-mono text-[12.5px] font-semibold tabular-nums ${
                        h.ytd > 0 ? "text-[#4ade80]" : h.ytd < 0 ? "text-[#f87171]" : ""
                      }`}
                    >
                      {h.ytd > 0 ? "+" : ""}
                      {h.ytd}%
                    </td>
                    <td className="border-t border-[#2d333b] px-5 py-[11px]">
                      <svg viewBox="0 0 64 24" className="block h-6 w-16">
                        <path d={miniLine(h.trend, 64, 24)} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[#20242a] px-5 py-[18px]">
            <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">Allocation</p>
            <div className="my-3 flex h-4 overflow-hidden rounded-md">
              {healthHoldings.map((h) => (
                <div key={h.ticker} style={{ width: `${h.weight}%`, background: ALLOC_COLORS[h.ticker] }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5 text-[11px] text-[#9ba3ab]">
              {healthHoldings.map((h) => (
                <span key={h.ticker} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: ALLOC_COLORS[h.ticker] }} />
                  {h.ticker} {h.weight}%
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-[#20242a] px-5 py-[18px]">
            <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
              Risk context{" "}
              <span className="font-normal normal-case tracking-normal text-[#6b7280]">
                — supporting, not actionable
              </span>
            </p>
            <div className="flex justify-between border-b border-[#2d333b] py-2 text-xs">
              <span className="text-[#9ba3ab]">Diversification score</span>
              <span className="font-mono font-semibold tabular-nums">{riskContext.diversificationScore}</span>
            </div>
            <div className="flex justify-between border-b border-[#2d333b] py-2 text-xs">
              <span className="text-[#9ba3ab]">30-day volatility</span>
              <span className="font-mono font-semibold tabular-nums">{riskContext.volatility30d}</span>
            </div>
            <div className="flex justify-between py-2 text-xs">
              <span className="text-[#9ba3ab]">Max drawdown (1Y)</span>
              <span className="font-mono font-semibold tabular-nums">{riskContext.maxDrawdown1y}</span>
            </div>
            <p className="mt-3 text-[10.5px] leading-[1.5] text-[#6b7280]">{riskContext.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
