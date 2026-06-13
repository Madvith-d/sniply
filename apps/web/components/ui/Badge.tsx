import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white",
  success: "bg-green",
  error: "bg-red",
  warning: "bg-yellow",
  info: "bg-blue text-white",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold font-heading border-[2px] border-ink rounded-md ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
