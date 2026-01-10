"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] px-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-all duration-200",
            "focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-[var(--neon-red)] focus:border-[var(--neon-red)] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--neon-red)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
