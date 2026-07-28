"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Alert Banner ────────────────────────────────────────────
// Standardized alert/notification banner for critical information.
// Used for system alerts, warnings, and important notices.
//
// Variants: info | warning | danger | success
//
// Usage:
//   <AlertBanner
//     variant="warning"
//     title="System Maintenance"
//     message="The system will be offline from 2:00 AM to 4:00 AM."
//     onDismiss={() => {}}
//   />

type AlertVariant = "info" | "warning" | "danger" | "success";

type AlertBannerProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
  icon?: LucideIcon;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

const variantStyles: Record<AlertVariant, { border: string; bg: string; iconColor: string; textColor: string }> = {
  info: {
    border: "border-l-[var(--tpf-status-info)]",
    bg: "bg-[var(--tpf-status-info-bg)]",
    iconColor: "text-[var(--tpf-status-info)]",
    textColor: "text-[var(--tpf-status-info)]",
  },
  warning: {
    border: "border-l-[var(--tpf-status-warning)]",
    bg: "bg-[var(--tpf-status-warning-bg)]",
    iconColor: "text-[var(--tpf-status-warning)]",
    textColor: "text-[var(--tpf-status-warning)]",
  },
  danger: {
    border: "border-l-[var(--tpf-status-danger)]",
    bg: "bg-[var(--tpf-status-danger-bg)]",
    iconColor: "text-[var(--tpf-status-danger)]",
    textColor: "text-[var(--tpf-status-danger)]",
  },
  success: {
    border: "border-l-[var(--tpf-status-success)]",
    bg: "bg-[var(--tpf-status-success-bg)]",
    iconColor: "text-[var(--tpf-status-success)]",
    textColor: "text-[var(--tpf-status-success)]",
  },
};

// Default icons per variant (imported lazily to avoid circular deps)
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from "lucide-react";

const defaultIcons: Record<AlertVariant, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
};

export function AlertBanner({
  variant = "info",
  title,
  message,
  icon: Icon,
  onDismiss,
  action,
  className,
  compact = false,
}: AlertBannerProps) {
  const styles = variantStyles[variant];
  const VariantIcon = Icon ?? defaultIcons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border-l-4 p-4",
        styles.border,
        styles.bg,
        compact && "p-3 gap-2",
        className
      )}
      role="alert"
    >
      <VariantIcon size={compact ? 16 : 18} className={cn("mt-0.5 shrink-0", styles.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-semibold text-sm", compact ? "text-xs" : "text-[13px]", "text-[var(--tpf-text)]")}>
            {title}
          </p>
        )}
        <p className={cn(
          "text-[var(--tpf-text-2)]",
          compact ? "text-xs mt-0.5" : "text-[13px] mt-1",
          !title && "mt-0"
        )}>
          {message}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-[var(--tpf-text-4)] hover:bg-black/5 hover:text-[var(--tpf-text-3)] transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
