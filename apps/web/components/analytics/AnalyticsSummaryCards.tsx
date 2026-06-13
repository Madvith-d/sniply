"use client";

import type { AnalyticsSummary } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <MetricCard label="Total clicks" value={summary.total} color="blue" />
      <MetricCard
        label="Unique visitors"
        value={summary.unique}
        color="purple"
      />
      <MetricCard label="Human clicks" value={summary.humans} color="green" />
      <MetricCard label="Bot clicks" value={summary.bots} />
    </div>
  );
}
