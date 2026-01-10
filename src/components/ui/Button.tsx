"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--neon-purple)] text-white hover:bg-[var(--neon-purple)]/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]",
        neon: "border border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-transparent hover:bg-[var(--neon-cyan)]/10 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
        magenta:
          "border border-[var(--neon-magenta)] text-[var(--neon-magenta)] bg-transparent hover:bg-[var(--neon-magenta)]/10 shadow-[0_0_10px_rgba(255,0,255,0.2)] hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]",
        ghost:
          "text-[var(--foreground)] hover:bg-white/5 hover:text-[var(--neon-cyan)]",
        glass:
          "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--foreground)] hover:border-[var(--neon-purple)]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]",
        destructive:
          "bg-[var(--neon-red)]/20 border border-[var(--neon-red)] text-[var(--neon-red)] hover:bg-[var(--neon-red)]/30",
        success:
          "bg-[var(--neon-green)]/20 border border-[var(--neon-green)] text-[var(--neon-green)] hover:bg-[var(--neon-green)]/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="spinner-neon w-4 h-4 border-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
