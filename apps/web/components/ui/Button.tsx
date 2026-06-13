import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-yellow text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--ink)]",
  secondary:
    "bg-card text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--ink)]",
  danger:
    "bg-red text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--ink)]",
  ghost:
    "bg-transparent text-ink shadow-none border-transparent hover:bg-ink/10",
};

export function Button({
  variant = "primary",
  children,
  loading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold font-heading border-[2.5px] border-ink rounded-[8px] shadow-[3px_3px_0_var(--ink)] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_var(--ink)] ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
