"use client";

import { cn } from "@/lib/utils";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// ── Search Bar ────────────────────────────────────────────────
// Unified search component with optional filter toggle.
// Every page that needs search should use this component.
//
// Usage:
//   <SearchBar
//     value={search}
//     onChange={setSearch}
//     placeholder="Tafuta afisa..."
//     filterCount={3}
//     onFilterToggle={() => setShowFilters(true)}
//   />

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  filterCount?: number;
  onFilterToggle?: () => void;
};

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Tafuta...",
  className,
  filterCount,
  onFilterToggle,
}: SearchBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="tpf-search flex-1">
        <Search size={15} className="shrink-0 text-[var(--tpf-text-4)]" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] text-[var(--tpf-text)] outline-none placeholder:text-[var(--tpf-text-4)]"
        />
        {value && onClear && (
          <button onClick={onClear} className="shrink-0 text-[var(--tpf-text-4)] hover:text-[var(--tpf-text-3)]">
            <X size={14} />
          </button>
        )}
      </div>
      {onFilterToggle && (
        <button
          onClick={onFilterToggle}
          className={cn(
            "tpf-btn tpf-btn-ghost relative",
            filterCount && filterCount > 0 && "text-[var(--tpf-blue)]"
          )}
        >
          <SlidersHorizontal size={16} />
          {filterCount && filterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[var(--tpf-blue)] text-[9px] font-bold text-white">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
