"use client";

import type { TimeSeriesPoint } from "@/lib/types";
import { formatPeriod } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/MetricCard";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

export function TimeSeriesChart({
  data,
  title = "Clicks over time",
}: TimeSeriesChartProps) {
  const max = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <Card title={title}>
      {data.length === 0 ? (
        <EmptyState
          title="No click data yet"
          description="Share your link to start collecting analytics."
        />
      ) : (
        <div className="flex items-end gap-1 md:gap-2 h-48 md:h-56 overflow-x-auto pb-1">
          {data.map((point) => (
            <div
              key={point.period}
              className="flex flex-col items-center gap-1 min-w-[2.5rem] flex-1"
            >
              <span className="text-xs font-mono font-bold tabular-nums">
                {point.clicks}
              </span>
              <div
                className="w-full bg-blue border-[2px] border-ink rounded-t-md transition-all duration-150"
                style={{
                  height: `${Math.max((point.clicks / max) * 100, 4)}%`,
                  minHeight: point.clicks > 0 ? "8px" : "2px",
                }}
              />
              <span
                className="text-[10px] font-mono text-ink/60 text-center leading-tight"
                title={point.period}
              >
                {formatPeriod(point.period).split(" ").pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
