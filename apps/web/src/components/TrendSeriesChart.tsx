"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendSeries } from "@/lib/mock-data";

/**
 * Longer-window trend chart for a single security — price alongside
 * a normalized fundamental index, over a 180-day window rather than
 * the 30-day riskHistory chart used elsewhere. Per
 * docs/adr/0010-research-copilot-reframe.md's "trend context" item.
 */
export function TrendSeriesChart({ series }: { series: TrendSeries }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series.points} margin={{ left: -10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="price"
            name="Price ($)"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="fundamentalIndex"
            name="Fundamental index (100 = window start)"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
