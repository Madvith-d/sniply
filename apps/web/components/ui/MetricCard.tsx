"use client";

import { type ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  color?: "default" | "blue" | "purple" | "green" | "red";
}

const colorMap: Record<string, string> = {
  default: "bg-card",
  blue: "bg-blue text-ink",
  purple: "bg-purple text-ink",
  green: "bg-green text-ink",
  red: "bg-red text-ink",
};

export function MetricCard({
  label,
  value,
  color = "default",
}: MetricCardProps) {
  return (
    <div
      className={`brutal-card-sm p-4 flex flex-col gap-1.5 ${colorMap[color]}`}
    >
      <span className="text-[11px] font-bold font-heading uppercase tracking-widest opacity-70">
        {label}
      </span>
      <span className="text-2xl md:text-3xl font-extrabold font-mono tabular-nums leading-none">
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
    <div className="brutal-card-sm bg-card p-8 sm:p-12 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-[8px] border-[2.5px] border-ink bg-paper-2 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
      <div>
        <p className="text-base font-extrabold font-heading">{title}</p>
        {description && (
          <p className="text-sm text-ink/60 mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
