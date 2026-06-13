import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-yellow text-[#101010] hover:bg-[#ffe27a] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--shadow-color)]",
  secondary:
    "bg-card text-ink hover:bg-paper-2 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--shadow-color)]",
  danger:
    "bg-red text-[#101010] hover:bg-[#ff8ca4] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--shadow-color)]",
  ghost:
    "bg-transparent text-ink shadow-none border-transparent hover:bg-paper-2/80",
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold font-heading border-[2.5px] border-ink rounded-[8px] shadow-[3px_3px_0_var(--shadow-color)] transition-all duration-150 cursor-pointer active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_var(--shadow-color)] ${variants[variant]} ${className}`}
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
