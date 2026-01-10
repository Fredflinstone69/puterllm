"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, autoResize = false, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex w-full min-h-[100px] rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-all duration-200 resize-none",
            "focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            autoResize && "overflow-hidden",
            error && "border-[var(--neon-red)] focus:border-[var(--neon-red)] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--neon-red)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
