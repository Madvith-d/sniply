"use client";

import type { TimeSeriesPoint } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/MetricCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

function formatXAxisTick(period: string): string {
  if (period.includes(":")) {
    // Hour format: "2024-01-15 14:00" → "14:00"
    return period.split(" ")[1];
  }
  // Day / week format: "2024-01-15" → "Jan 15"
  const date = new Date(`${period}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-card border-[2.5px] border-ink font-mono text-sm px-3 py-2 rounded-md"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <p className="text-ink/60 text-xs mb-0.5">
        {label && label.includes(":")
          ? label
          : label
            ? new Date(`${label}T00:00:00Z`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
            : ""}
      </p>
      <p className="font-bold">
        {payload[0].value}{" "}
        <span className="text-ink/60 font-normal">
          {payload[0].value === 1 ? "click" : "clicks"}
        </span>
      </p>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  title = "Clicks over time",
}: TimeSeriesChartProps) {
  return (
    <Card title={title}>
      {data.length === 0 ? (
        <EmptyState
          title="No click data yet"
          description="Share your link to start collecting analytics."
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--ink)"
              strokeOpacity={0.12}
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisTick}
              tick={{
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                fill: "var(--ink)",
                fillOpacity: 0.55,
              }}
              tickLine={false}
              axisLine={{ stroke: "var(--ink)", strokeOpacity: 0.15 }}
              minTickGap={48}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                fill: "var(--ink)",
                fillOpacity: 0.55,
              }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--ink)",
                strokeOpacity: 0.2,
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="var(--blue)"
              strokeWidth={2.5}
              fill="url(#clicksGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--blue)",
                stroke: "var(--card-bg)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
