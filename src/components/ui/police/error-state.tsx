"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ── Error State ──────────────────────────────────────────────
// Standardized error display for API failures, network errors, etc.
//
// Usage:
//   <ErrorState
//     title="Failed to Load Data"
//     message="Could not connect to the server. Please try again."
//     onRetry={() => refetch()}
//   />

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
};

export function ErrorState({
  title = "Hitilafu Imetokea",
  message,
  onRetry,
  retryLabel = "Jaribu Tena",
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "tpf-empty",
        compact && "py-8 px-4",
        className
      )}
    >
      <div className="tpf-empty-icon !bg-[var(--tpf-status-danger-bg)]">
        <AlertTriangle size={compact ? 20 : 24} className="text-[var(--tpf-status-danger)]" />
      </div>
      {title && <p className="tpf-empty-title">{title}</p>}
      <p className="tpf-empty-desc">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-[var(--tpf-status-info)] bg-[var(--tpf-status-info-bg)] border border-transparent hover:bg-[var(--tpf-status-info)]/10 transition-colors"
        >
          <RefreshCw size={14} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
