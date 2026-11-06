"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exposureByAssetClass, sectorExposure } from "@/lib/mock-data";

const ASSET_CLASS_COLORS = ["#2563eb", "#1d4ed8", "#0ea5e9", "#64748b", "#94a3b8"];
const SECTOR_HIGHLIGHT = "#dc2626";
const SECTOR_DEFAULT = "#2563eb";

// A single-row 100%-stacked bar, not a pie/donut — Recharts' Pie
// rendered as a clipped partial arc in this environment's headless
// browser (bar/stacked-bar charts render reliably everywhere else in
// this app, so this sidesteps it rather than fighting it) and a
// stacked bar reads the "this sums to the whole portfolio" point just
// as clearly.
const allocationRow = [
  Object.fromEntries(exposureByAssetClass.map((s) => [s.assetClass, s.exposurePct])),
];

/** What you actually own, by asset class — the "looks diversified"
 * surface view. Paired with SectorExposureChart, which shows the
 * look-through view that complicates it. */
export function AssetAllocationChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Asset Allocation</h3>
      <p className="mt-1 text-xs text-slate-500">
        Five asset classes, seven holdings — diversified by this measure alone
      </p>
      <div className="mt-4 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={allocationRow}
            layout="vertical"
            stackOffset="expand"
            margin={{ top: 0, right: 10, bottom: 0, left: -20 }}
          >
            <XAxis type="number" hide domain={[0, 1]} />
            <YAxis type="category" dataKey={() => ""} hide />
            <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
            {exposureByAssetClass.map((s, i) => (
              <Bar
                key={s.assetClass}
                dataKey={s.assetClass}
                stackId="allocation"
                fill={ASSET_CLASS_COLORS[i % ASSET_CLASS_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-3">
        {exposureByAssetClass.map((s, i) => (
          <li key={s.assetClass} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: ASSET_CLASS_COLORS[i % ASSET_CLASS_COLORS.length] }}
            />
            {s.assetClass} — {s.exposurePct}%
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The look-through view: what sector these holdings actually belong
 * to once index funds' own weightings are unpacked, not just which
 * account "bucket" they sit in. Technology is highlighted since it's
 * the sector carrying the portfolio's concentration risk. */
export function SectorExposureChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        Effective Sector Exposure (Look-Through)
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        % of total portfolio, including each index fund&apos;s own sector weighting
      </p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sectorExposure} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="sector"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="pct" name="Portfolio %" radius={[4, 4, 0, 0]}>
              {sectorExposure.map((s, i) => (
                <Cell key={i} fill={s.sector === "Technology" ? SECTOR_HIGHLIGHT : SECTOR_DEFAULT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
