"use client";

import { cn } from "@/lib/utils";
import { InboxIcon } from "lucide-react";

// ── Empty State ──────────────────────────────────────────────
// Standardized empty state placeholder.
// Used when tables, lists, or pages have no data.
//
// Usage:
//   <EmptyState
//     icon={FileSearch}
//     title="No Citations Found"
//     description="No citations match your search criteria."
//     action={<Button>Clear Filters</Button>}
//   />

type EmptyStateProps = {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "tpf-empty",
        compact && "py-8 px-4",
        className
      )}
    >
      <div className="tpf-empty-icon">
        <Icon size={compact ? 20 : 24} />
      </div>
      <p className="tpf-empty-title">{title}</p>
      {description && <p className="tpf-empty-desc">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
