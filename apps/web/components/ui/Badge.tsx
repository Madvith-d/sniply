import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-paper-2 text-ink",
  success: "bg-green text-ink",
  error: "bg-red text-ink",
  warning: "bg-yellow text-ink",
  info: "bg-blue text-ink",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold font-heading tracking-wide border-[2px] border-ink rounded-md ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
