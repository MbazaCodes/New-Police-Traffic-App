"use client";

import { cn } from "@/lib/utils";

// ── Stats Row ────────────────────────────────────────────────
// Standardized metric cards row for dashboard tops.
// Responsive: 4 cols → 2 cols → 1 col.
//
// Usage:
//   <StatsRow>
//     <MetricCard label="Officers" value="1,284" icon={Users} accent="blue" />
//     <MetricCard label="Citations" value="432" icon={FileText} accent="amber" />
//     <MetricCard label="Incidents" value="67" icon={AlertTriangle} accent="red" />
//     <MetricCard label="Patrols" value="28" icon={Car} accent="green" />
//   </StatsRow>

type StatsRowProps = {
  children: React.ReactNode;
  className?: string;
};

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
