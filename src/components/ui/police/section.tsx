"use client";

import { cn } from "@/lib/utils";

// ── Section ───────────────────────────────────────────────────
// Content section wrapper with consistent spacing and optional header.
// Used to group related content within pages.
//
// Usage:
//   <Section title="Recent Activity" description="Last 24 hours">
//     <Card>...</Card>
//   </Section>

type SectionProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

export function Section({
  title,
  description,
  action,
  children,
  className,
  noPadding = false,
}: SectionProps) {
  return (
    <section className={cn("flex flex-col", noPadding ? "gap-2" : "gap-4", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="tpf-font-h3 text-[var(--tpf-text)]" style={{ font: "var(--tpf-font-h3)" }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] text-[var(--tpf-text-3)]">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
