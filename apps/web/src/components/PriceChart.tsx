"use client";

import { useId } from "react";
import { formatPrice, nyTime } from "@/lib/market";

type Point = { t: number; p: number };

function geometry(points: Point[], baseline: number | null, w: number, h: number, pad: number) {
  const values = points.map((p) => p.p);
  if (baseline != null) values.push(baseline);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const y = (v: number) => pad + (1 - (v - min) / range) * (h - pad * 2);
  // x follows time, not index, so a session that's still in progress
  // fills the chart only as far as the clock has got.
  const t0 = points[0].t;
  const span = Math.max(points[points.length - 1].t - t0, 1);
  const x = (t: number) => ((t - t0) / span) * w;
  return { x, y };
}

/** Colour for the session: against the previous close when we have
 * one (that's what "up today" means), else first vs last point. */
function upOrDown(points: Point[], baseline: number | null) {
  const last = points[points.length - 1].p;
  return last >= (baseline ?? points[0].p);
}

/**
 * Small intraday line for list rows — replaces the inbox's old flat
 * placeholder sparkline with the real session.
 */
export function IntradaySpark({ points, baseline }: { points: Point[]; baseline: number | null }) {
  const gid = useId();
  if (points.length < 2) {
    return <div className="flex h-[38px] items-center justify-center text-[10px] text-[var(--ink-faint)]">No trades yet</div>;
  }
  const w = 80;
  const h = 38;
  const { x, y } = geometry(points, baseline, w, h, 5);
  const stroke = upOrDown(points, baseline) ? "var(--green)" : "var(--red)";
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.p).toFixed(1)}`).join(" ");
  const lastX = x(points[points.length - 1].t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-[38px] w-full" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {baseline != null && (
        <line x1={0} x2={w} y1={y(baseline)} y2={y(baseline)} stroke="var(--ink-faint)" strokeWidth={0.8} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      )}
      <path d={`${line} L ${lastX} ${h} L 0 ${h} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * The detail page's session chart: 5-minute closes with the previous
 * close as a dashed reference line, labelled axes at the ends.
 */
export function IntradayChart({
  points,
  baseline,
  currency,
  sessionLabel,
}: {
  points: Point[];
  baseline: number | null;
  currency?: string;
  sessionLabel: string;
}) {
  const gid = useId();
  if (points.length < 2) {
    return (
      <div className="flex h-[150px] items-center justify-center rounded-xl bg-[var(--surface-2)] text-[11.5px] text-[var(--ink-faint)]">
        No trades yet in this session.
      </div>
    );
  }
  const w = 600;
  const h = 150;
  const { x, y } = geometry(points, baseline, w, h, 10);
  const up = upOrDown(points, baseline);
  const stroke = up ? "var(--green)" : "var(--red)";
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.p).toFixed(1)}`).join(" ");
  const lastX = x(points[points.length - 1].t);
  const hi = points.reduce((a, b) => (b.p > a.p ? b : a));
  const lo = points.reduce((a, b) => (b.p < a.p ? b : a));
  const iso = (t: number) => new Date(t * 1000).toISOString();
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-[150px] w-full" role="img"
        aria-label={`${sessionLabel} price, ${formatPrice(points[0].p, currency)} to ${formatPrice(points[points.length - 1].p, currency)}`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {baseline != null && (
          <line x1={0} x2={w} y1={y(baseline)} y2={y(baseline)} stroke="var(--ink-faint)" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        )}
        <path d={`${line} L ${lastX} ${h} L 0 ${h} Z`} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-1.5 flex flex-wrap justify-between gap-x-4 gap-y-0.5 font-mono text-[10.5px] tabular-nums text-[var(--ink-faint)]">
        <span>{nyTime(iso(points[0].t))} ET</span>
        <span>
          High {formatPrice(hi.p, currency)} · Low {formatPrice(lo.p, currency)}
          {baseline != null && <> · - - previous close {formatPrice(baseline, currency)}</>}
        </span>
        <span>{nyTime(iso(points[points.length - 1].t))} ET</span>
      </figcaption>
    </figure>
  );
}
