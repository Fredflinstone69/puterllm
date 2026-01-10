"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border border-[var(--neon-purple)]/30",
        cyan: "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30",
        magenta: "bg-[var(--neon-magenta)]/20 text-[var(--neon-magenta)] border border-[var(--neon-magenta)]/30",
        green: "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border border-[var(--neon-green)]/30",
        yellow: "bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30",
        red: "bg-[var(--neon-red)]/20 text-[var(--neon-red)] border border-[var(--neon-red)]/30",
        outline: "border border-[var(--glass-border)] text-[var(--foreground-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
