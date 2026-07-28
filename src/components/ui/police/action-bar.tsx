"use client";

import { cn } from "@/lib/utils";

// ── Action Bar ────────────────────────────────────────────────
// Standardized action bar for quick actions on pages.
// Sits between the page header and content area.
//
// Usage:
//   <ActionBar>
//     <Button variant="primary">Ongeza Afisa</Button>
//     <Button variant="secondary">Export</Button>
//   </ActionBar>

type ActionBarProps = {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "between";
};

export function ActionBar({
  children,
  className,
  align = "between",
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2",
        align === "left" && "justify-start",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
