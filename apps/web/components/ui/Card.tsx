import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`brutal-card p-5 md:p-6 bg-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-5">
          {title && (
            <h2 className="text-lg font-extrabold font-heading tracking-tight">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
