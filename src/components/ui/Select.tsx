"use client";

import { forwardRef, SelectHTMLAttributes, useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      placeholder = "Select an option",
      searchable = false,
      searchPlaceholder = "Search...",
      emptyMessage = "No options found",
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search on open
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    };

    return (
      <div className={cn("relative", className)} ref={containerRef}>
        {label && (
          <label className="block text-sm text-[var(--foreground-muted)] mb-2">
            {label}
          </label>
        )}
        
        {/* Hidden native select for form compatibility */}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="sr-only"
          disabled={disabled}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom select trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full h-10 px-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] text-sm transition-all duration-200",
            "hover:border-[var(--neon-purple)]/50",
            "focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen && "border-[var(--neon-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.2)]"
          )}
        >
          <span className={cn(!selectedOption && "text-[var(--foreground-muted)]")}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--glass-border)] shadow-xl overflow-hidden animate-fade-in">
            {searchable && (
              <div className="p-2 border-b border-[var(--glass-border)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-9 pl-10 pr-4 rounded-md bg-[var(--background-tertiary)] border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--neon-cyan)]"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--foreground-muted)] text-center">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2 text-sm text-left transition-colors duration-150",
                      "hover:bg-[var(--neon-purple)]/10",
                      option.value === value && "bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-[var(--foreground-muted)] truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="w-4 h-4 flex-shrink-0 text-[var(--neon-cyan)]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
