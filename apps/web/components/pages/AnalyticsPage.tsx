"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyticsApi, linksApi } from "@/lib/api";
import type {
  AnalyticsSummary,
  BreakdownDimension,
  BreakdownItem,
  Link as LinkType,
  TimeGranularity,
  TimeSeriesPoint,
} from "@/lib/types";
import { shortUrl } from "@/lib/utils";
import { AnalyticsSummaryCards } from "@/components/analytics/AnalyticsSummaryCards";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

interface AnalyticsPageProps {
  id: string;
}

const dimensions: { value: BreakdownDimension; label: string }[] = [
  { value: "device", label: "Device" },
  { value: "browser", label: "Browser" },
  { value: "os", label: "OS" },
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
];

const granularities: { value: TimeGranularity; label: string }[] = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
];

export function AnalyticsPage({ id }: AnalyticsPageProps) {
  const [link, setLink] = useState<LinkType | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesPoint[]>([]);
  const [breakdowns, setBreakdowns] = useState<
    Record<BreakdownDimension, BreakdownItem[]>
  >({
    device: [],
    browser: [],
    os: [],
    country: [],
    city: [],
  });
  const [granularity, setGranularity] = useState<TimeGranularity>("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError("");
      try {
        const [linkData, summaryData, tsData, ...bdData] = await Promise.all([
          linksApi.get(id),
          analyticsApi.summary(id),
          analyticsApi.timeseries(id, granularity),
          ...dimensions.map((d) => analyticsApi.breakdown(id, d.value)),
        ]);

        if (cancelled) return;

        setLink(linkData);
        setSummary(summaryData);
        setTimeseries(tsData);

        const bd: Record<BreakdownDimension, BreakdownItem[]> = {
          device: [],
          browser: [],
          os: [],
          country: [],
          city: [],
        };
        dimensions.forEach((d, i) => {
          bd[d.value] = bdData[i] as BreakdownItem[];
        });
        setBreakdowns(bd);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [id, granularity]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="brutal-card-sm bg-card p-6 text-center font-heading font-bold animate-pulse text-ink/60">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !link || !summary) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card title="Analytics unavailable">
          <p className="text-ink/70 mb-4">
            {error || "Could not load analytics for this link."}
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-bold font-heading hover:underline"
          >
            ← Back to dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const url = shortUrl(link.shortCode);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-bold font-heading hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight mt-3">
          Analytics
        </h1>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm font-bold text-blue hover:underline mt-1 inline-block"
        >
          {url}
        </a>
      </div>

      <AnalyticsSummaryCards summary={summary} />

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <Select
          label="Time granularity"
          options={granularities}
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as TimeGranularity)}
        />
      </div>

      <TimeSeriesChart data={timeseries} />

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {dimensions.map((d) => (
          <BreakdownChart
            key={d.value}
            title={`By ${d.label.toLowerCase()}`}
            data={breakdowns[d.value]}
          />
        ))}
      </div>
    </div>
  );
}
