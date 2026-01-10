"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  onChange?: (value: number) => void;
  showPlusMinus?: boolean;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      valueFormatter,
      onChange,
      showPlusMinus = false,
      min = 0,
      max = 100,
      step = 1,
      value,
      ...props
    },
    ref
  ) => {
    const numValue = typeof value === "number" ? value : Number(value) || 0;
    const numMin = Number(min);
    const numMax = Number(max);
    const numStep = Number(step);
    
    const displayValue = valueFormatter
      ? valueFormatter(numValue)
      : numValue.toString();

    const handleChange = (newValue: number) => {
      const clamped = Math.min(Math.max(newValue, numMin), numMax);
      onChange?.(clamped);
    };

    const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;

    return (
      <div className={cn("space-y-2", className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="text-[var(--foreground-muted)]">{label}</span>
            )}
            {showValue && (
              <span className="font-mono text-[var(--neon-cyan)]">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          {showPlusMinus && (
            <button
              type="button"
              onClick={() => handleChange(numValue - numStep)}
              disabled={numValue <= numMin}
              className="h-8 w-8 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              -
            </button>
          )}
          <div className="relative flex-1 h-2">
            <div className="absolute inset-0 rounded-full bg-[var(--background-secondary)]" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)]"
              style={{ width: `${percentage}%` }}
            />
            <input
              type="range"
              ref={ref}
              min={min}
              max={max}
              step={step}
              value={numValue}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...props}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_15px_var(--neon-cyan)] pointer-events-none transition-all duration-100"
              style={{ left: `calc(${percentage}% - 10px)` }}
            />
          </div>
          {showPlusMinus && (
            <button
              type="button"
              onClick={() => handleChange(numValue + numStep)}
              disabled={numValue >= numMax}
              className="h-8 w-8 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
