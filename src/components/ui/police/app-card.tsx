"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── App Card ────────────────────────────────────────────────
// Universal card component for the Police Design System.
// Replaces all page-specific card variations.
//
// Variants:
//   default   → Standard content card (white surface, subtle border)
//   metric    → KPI card with accent top bar
//   action    → Clickable card with hover lift
//   alert     → Attention-grabbing card (warning/error/info styling)
//
// Usage:
//   <AppCard variant="default">
//     <AppCardHeader title="Title" description="Subtitle" />
//     <AppCardContent>...</AppCardContent>
//   </AppCard>

type CardVariant = "default" | "metric" | "action" | "alert";

type AlertLevel = "info" | "warning" | "danger" | "success";

type AppCardProps = {
  variant?: CardVariant;
  alertLevel?: AlertLevel;
  accent?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const alertStyles: Record<AlertLevel, string> = {
  info:    "border-[var(--tpf-status-info)] bg-[var(--tpf-status-info-bg)]",
  warning: "border-[var(--tpf-status-warning)] bg-[var(--tpf-status-warning-bg)]",
  danger:  "border-[var(--tpf-status-danger)] bg-[var(--tpf-status-danger-bg)]",
  success: "border-[var(--tpf-status-success)] bg-[var(--tpf-status-success-bg)]",
};

export function AppCard({
  variant = "default",
  alertLevel,
  accent,
  className,
  children,
  onClick,
}: AppCardProps) {
  return (
    <div
      className={cn(
        "tpf-card",
        variant === "action" && "tpf-card-interactive",
        variant === "metric" && "tpf-kpi",
        variant === "alert" && alertLevel && alertStyles[alertLevel],
        className
      )}
      onClick={onClick}
      style={
        variant === "metric" && accent
          ? ({ "--kpi-accent": accent } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

// ── Card Sub-components ──────────────────────────────────────

type AppCardHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function AppCardHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: AppCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 pb-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--tpf-surface-2)]">
            <Icon size={18} className="text-[var(--tpf-text-3)]" />
          </div>
        )}
        <div>
          <h3 className="tpf-font-h3 text-[var(--tpf-text)]" style={{ font: "var(--tpf-font-h3)" }}>
            {title}
          </h3>
          {description && (
            <p className="tpf-font-caption text-[var(--tpf-text-3)]" style={{ font: "var(--tpf-font-caption)" }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type AppCardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppCardContent({ children, className }: AppCardContentProps) {
  return <div className={cn("flex flex-col gap-3", className)}>{children}</div>;
}

type AppCardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppCardFooter({ children, className }: AppCardFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2 border-t border-[var(--tpf-border)] pt-4 mt-4", className)}>
      {children}
    </div>
  );
}
