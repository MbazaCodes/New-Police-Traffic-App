"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Page Header ──────────────────────────────────────────────
// Standardized page header for all admin/command/role pages.
// Enforces consistent layout: icon + title + subtitle + actions.
//
// Usage:
//   <PageHeader
//     title="Officers"
//     subtitle="Manage police officer accounts"
//     icon={Users}
//     actions={<Button>Ongeza</Button>}
//   />

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[11px] text-[var(--tpf-text-4)]">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-[var(--tpf-text-4)]">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-[var(--tpf-text-3)] transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--tpf-text-3)] font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--tpf-surface-2)] shrink-0">
              <Icon size={22} className="text-[var(--tpf-text-3)]" />
            </div>
          )}
          <div>
            <h1 className="tpf-font-h1 text-[var(--tpf-text)]" style={{ font: "var(--tpf-font-h1)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[13px] text-[var(--tpf-text-3)] leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
