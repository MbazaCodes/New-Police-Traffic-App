"use client";

import { cn } from "@/lib/utils";
import { Search, X, ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Pagination } from "./pagination";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

// ── Data Table ───────────────────────────────────────────────
// Unified, reusable data table for the Police Design System.
// Every table in the app (officers, citations, vehicles, etc.)
// should use this component for consistent look & behavior.
//
// Features:
//   - Column sorting (click headers)
//   - Built-in search
//   - Row click handler
//   - Status badges via render functions
//   - Consistent styling via TPF tokens
//   - Automatic pagination
//
// Usage:
//   <DataTable
//     columns={[
//       { key: "name", label: "Jina", sortable: true },
//       { key: "rank", label: "Daraja" },
//       { key: "status", label: "Hali", render: (v) => <StatusBadge status={v} /> },
//     ]}
//     data={officers}
//     loading={isLoading}
//     emptyLabel="Hakuna Afisa"
//     onRowClick={(row) => navigate(`/officers/${row.id}`)}
//     searchable
//   />

export type SortDir = "asc" | "desc" | null;

export type DataTableColumn<T = Record<string, unknown>> = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
};

type DataTableProps<T = Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyLabel?: string;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  headerAction?: React.ReactNode;
  className?: string;
  compact?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyLabel = "Hakuna Data",
  emptyMessage,
  searchable = false,
  searchPlaceholder = "Tafuta...",
  searchKeys,
  pageSize = 20,
  onRowClick,
  headerAction,
  className,
  compact = false,
  error,
  onRetry,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  // Filter data by search
  const filtered = useMemo(() => {
    if (!search || !searchable) return data;
    const keys = searchKeys ?? columns.map((c) => c.key);
    const q = search.toLowerCase();
    return data.filter((row) =>
      keys.some((k) => {
        const val = row[k];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchable, searchKeys, columns]);

  // Sort data
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Reset page on search change.
  // FIX (build-stabilize): was `useMemo(() => setPage(1), [search])` —
  // calling setState inside useMemo is a render-phase side effect that
  // can cause infinite re-render loops. Use useEffect (runs after commit).
  useEffect(() => setPage(1), [search]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey)
      return <ChevronsUpDown size={13} className="text-[var(--tpf-text-4)]" />;
    if (sortDir === "asc")
      return <ChevronUp size={13} className="text-[var(--tpf-blue)]" />;
    return <ChevronDown size={13} className="text-[var(--tpf-blue)]" />;
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search + header actions */}
      {(searchable || headerAction) && (
        <div className="flex items-center gap-3">
          {searchable && (
            <div className="tpf-search flex-1">
              <Search size={15} className="shrink-0 text-[var(--tpf-text-4)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-[13px] text-[var(--tpf-text)] outline-none placeholder:text-[var(--tpf-text-4)]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[var(--tpf-text-4)] hover:text-[var(--tpf-text-3)]">
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {headerAction}
        </div>
      )}

      {/* Table */}
      <div className="tpf-table-wrap">
        {loading ? (
          <LoadingState variant="skeleton" rows={5} className="p-4" />
        ) : error ? (
          <EmptyState
            title="Hitilafu"
            description={error}
            compact
          />
        ) : (
          <table className="tpf-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      col.sortable && "cursor-pointer select-none hover:text-[var(--tpf-text)]",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right"
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className={cn("flex items-center gap-1.5", col.align === "center" && "justify-center", col.align === "right" && "justify-end")}>
                      {col.label}
                      {col.sortable && <SortIcon columnKey={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={Search}
                      title={emptyLabel}
                      description={emptyMessage ?? `Hakuna matokeo "${search}"`}
                      compact
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      compact && "[& td]:!py-2.5 [& th]:!py-2"
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
