import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold font-heading">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`brutal-input font-sans ${error ? "border-red shadow-[3px_3px_0_var(--red)]" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-semibold text-red flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});
