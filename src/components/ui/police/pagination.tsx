"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// ── Pagination ────────────────────────────────────────────────
// Standardized pagination for data tables.
//
// Usage:
//   <Pagination
//     page={1}
//     totalPages={12}
//     onPageChange={setPage}
//   />

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, totalPages * 20);

  return (
    <div className={cn("flex items-center justify-between gap-4 pt-4", className)}>
      <p className="text-[12px] text-[var(--tpf-text-4)]">
        Kurasa {page} ya {totalPages} ({startItem}-{endItem})
      </p>
      <div className="flex items-center gap-1">
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft size={14} />
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={14} />
        </PaginationButton>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1.5 text-[12px] text-[var(--tpf-text-4)]">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-[12px] font-semibold transition-colors",
                  p === page
                    ? "bg-[var(--tpf-blue)] text-white"
                    : "text-[var(--tpf-text-3)] hover:bg-[var(--tpf-surface-2)]"
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        <PaginationButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={14} />
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight size={14} />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg transition-colors",
        disabled
          ? "text-[var(--tpf-text-4)] opacity-40 cursor-not-allowed"
          : "text-[var(--tpf-text-3)] hover:bg-[var(--tpf-surface-2)]"
      )}
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
