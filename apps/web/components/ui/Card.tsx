import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`brutal-card p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {title && (
            <h2 className="text-lg font-bold font-heading">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
