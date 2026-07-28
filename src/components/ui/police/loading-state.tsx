"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ── Loading State ────────────────────────────────────────────
// Standardized loading indicator for pages, tables, and cards.
//
// Usage:
//   <LoadingState message="Loading officers..." />
//   <LoadingState variant="skeleton" rows={5} />
//   <LoadingState variant="spinner" />

type LoadingVariant = "spinner" | "skeleton" | "overlay";

type LoadingStateProps = {
  variant?: LoadingVariant;
  message?: string;
  rows?: number;
  className?: string;
};

export function LoadingState({
  variant = "spinner",
  message = "Inapakia...",
  rows = 4,
  className,
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
        <Loader2 size={28} className="animate-spin text-[var(--tpf-blue)]" />
        <p className="text-sm text-[var(--tpf-text-3)]">{message}</p>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="tpf-skeleton size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="tpf-skeleton h-3.5 w-3/4 rounded" />
              <div className="tpf-skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="tpf-skeleton h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  // Overlay variant (for cards/sections)
  return (
    <div className={cn("absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--tpf-card)]/80 backdrop-blur-sm", className)}>
      <Loader2 size={24} className="animate-spin text-[var(--tpf-blue)]" />
    </div>
  );
}
