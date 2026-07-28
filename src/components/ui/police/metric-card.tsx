"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Metric Card ──────────────────────────────────────────────
// A standardized KPI/stat card for dashboards.
// Every dashboard metric should use this component.
//
// Usage:
//   <MetricCard
//     label="Active Officers"
//     value="1,284"
//     trend="+12%"
//     trendUp
//     icon={Users}
//   />

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: "blue" | "green" | "amber" | "red" | "navy";
  onClick?: () => void;
  className?: string;
};

const accentMap = {
  blue:  { iconBg: "bg-[var(--tpf-status-info-bg)]",    iconColor: "text-[var(--tpf-status-info)]",    bar: "var(--tpf-status-info)" },
  green: { iconBg: "bg-[var(--tpf-status-success-bg)]", iconColor: "text-[var(--tpf-status-success)]", bar: "var(--tpf-status-success)" },
  amber: { iconBg: "bg-[var(--tpf-status-warning-bg)]", iconColor: "text-[var(--tpf-status-warning)]", bar: "var(--tpf-status-warning)" },
  red:   { iconBg: "bg-[var(--tpf-status-danger-bg)]",  iconColor: "text-[var(--tpf-status-danger)]",  bar: "var(--tpf-status-danger)" },
  navy:  { iconBg: "bg-[#EFF6FF]",                      iconColor: "text-[#1E3A8A]",                    bar: "var(--tpf-blue)" },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent = "blue",
  onClick,
  className,
}: MetricCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className={cn(
        "tpf-kpi group relative",
        onClick && "cursor-pointer tpf-card-interactive",
        className
      )}
      onClick={onClick}
      style={{ "--kpi-accent": colors.bar } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="tpf-font-label text-[var(--tpf-text-3)]">{label}</p>
          <p className="tpf-font-h1 text-[var(--tpf-text)]" style={{ font: "var(--tpf-font-h2)" }}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  trendUp ? "text-[var(--tpf-status-success)]" : "text-[var(--tpf-status-danger)]"
                )}
              >
                {trend}
              </span>
              <span className="text-[11px] text-[var(--tpf-text-4)]">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", colors.iconBg)}>
            <Icon size={20} className={colors.iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}
