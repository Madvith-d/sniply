"use client";

import type { BreakdownItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/MetricCard";

interface BreakdownChartProps {
  data: BreakdownItem[];
  title: string;
}

export function BreakdownChart({ data, title }: BreakdownChartProps) {
  return (
    <Card title={title}>
      {data.length === 0 ? (
        <EmptyState title="No data" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono font-bold truncate mr-2">
                  {item.label}
                </span>
                <span className="font-mono tabular-nums shrink-0">
                  {item.count}{" "}
                  <span className="text-ink/50">({item.percentage}%)</span>
                </span>
              </div>
              <div className="h-5 bg-paper border-[2px] border-ink rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue border-r-[2px] border-ink transition-all duration-150"
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
