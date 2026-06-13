"use client";

import { type ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  color?: "default" | "blue" | "purple" | "green" | "red";
}

const colorMap = {
  default: "bg-white",
  blue: "bg-blue text-white",
  purple: "bg-purple text-ink",
  green: "bg-green",
  red: "bg-red",
};

export function MetricCard({
  label,
  value,
  color = "default",
}: MetricCardProps) {
  return (
    <div
      className={`brutal-card-sm p-4 flex flex-col gap-1 ${colorMap[color]}`}
    >
      <span className="text-xs font-bold font-heading uppercase tracking-wide opacity-80">
        {label}
      </span>
      <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="brutal-card-sm p-8 text-center flex flex-col items-center gap-3">
      <p className="text-lg font-bold font-heading">{title}</p>
      {description && (
        <p className="text-sm text-ink/70 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
