"use client";

import { cn } from "@/lib/utils";

// ── Operational Status Badge ─────────────────────────────────
// Standardized status indicator for the entire platform.
// Maps semantic status names to the TPF design token colors.
// Usage: <StatusBadge status="active" /> | <StatusBadge status="pending" />
//
// Status variants:
//   success / active / online   → green
//   warning / on-leave          → amber
//   danger  / suspended / critical → red
//   info    / processing / blue  → blue
//   pending / review             → orange
//   neutral / offline / archived → gray

const STATUS_MAP: Record<string, { label?: string; badgeClass: string; dotColor: string }> = {
  // Success / Active states
  success:     { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },
  active:      { label: "Active",      badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },
  online:      { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-online)]" },
  completed:   { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },
  approved:    { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },
  resolved:    { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },
  paid:        { badgeClass: "tpf-badge-success", dotColor: "bg-[var(--tpf-status-success)]" },

  // Warning / On-leave states
  warning:     { badgeClass: "tpf-badge-warning", dotColor: "bg-[var(--tpf-status-warning)]" },
  "on-leave":  { badgeClass: "tpf-badge-warning", dotColor: "bg-[var(--tpf-status-warning)]" },
  escalated:   { badgeClass: "tpf-badge-warning", dotColor: "bg-[var(--tpf-status-warning)]" },

  // Danger / Critical states
  danger:      { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },
  suspended:   { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },
  critical:    { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-critical)]" },
  expired:     { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },
  cancelled:   { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },
  rejected:    { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },
  revoked:     { badgeClass: "tpf-badge-danger",  dotColor: "bg-[var(--tpf-status-danger)]" },

  // Info / Processing states
  info:        { badgeClass: "tpf-badge-info",    dotColor: "bg-[var(--tpf-status-info)]" },
  processing:  { badgeClass: "tpf-badge-info",    dotColor: "bg-[var(--tpf-status-info)]" },
  assigned:    { badgeClass: "tpf-badge-info",    dotColor: "bg-[var(--tpf-status-info)]" },
  in_progress: { badgeClass: "tpf-badge-info",    dotColor: "bg-[var(--tpf-status-info)]" },
  dispatched:  { badgeClass: "tpf-badge-info",    dotColor: "bg-[var(--tpf-status-info)]" },

  // Pending / Review states
  pending:     { badgeClass: "tpf-badge-pending", dotColor: "bg-[var(--tpf-status-pending)]" },
  review:      { badgeClass: "tpf-badge-pending", dotColor: "bg-[var(--tpf-status-pending)]" },
  submitted:   { badgeClass: "tpf-badge-pending", dotColor: "bg-[var(--tpf-status-pending)]" },
  draft:       { badgeClass: "tpf-badge-pending", dotColor: "bg-[var(--tpf-status-pending)]" },

  // Neutral / Offline states
  neutral:     { badgeClass: "tpf-badge-neutral", dotColor: "bg-[var(--tpf-status-neutral)]" },
  offline:     { badgeClass: "tpf-badge-neutral", dotColor: "bg-[var(--tpf-status-offline)]" },
  archived:    { badgeClass: "tpf-badge-neutral", dotColor: "bg-[var(--tpf-status-neutral)]" },
  "off-duty":  { badgeClass: "tpf-badge-neutral", dotColor: "bg-[var(--tpf-status-neutral)]" },
  inactive:    { badgeClass: "tpf-badge-neutral", dotColor: "bg-[var(--tpf-status-neutral)]" },
};

type StatusBadgeProps = {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  className,
  size = "sm",
}: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    badgeClass: "tpf-badge-neutral",
    dotColor: "bg-[var(--tpf-status-neutral)]",
  };

  const displayLabel = label ?? config.label ?? status;

  return (
    <span
      className={cn(
        "tpf-badge",
        config.badgeClass,
        size === "md" && "px-3 py-1 text-xs",
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "inline-block shrink-0 rounded-full",
            config.dotColor,
            size === "sm" ? "size-1.5" : "size-2"
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
