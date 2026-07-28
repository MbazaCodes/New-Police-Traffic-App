// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TPF POLICE DESIGN SYSTEM — Component Library
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// This is the single source of truth for all UI primitives used
// across the Tanzania Police Digital Platform.
//
// RULES:
// 1. Every new page MUST be composed from these components.
// 2. NEVER create page-specific cards, buttons, or badges.
// 3. NEVER hardcode Tailwind colors — use TPF tokens.
// 4. NEVER use inline styles unless absolutely necessary.
// 5. Every component MUST support light and dark mode.
// 6. Icons: Lucide React ONLY. No mixing icon libraries.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Layout Components ──────────────────────────────────────────
export { PageHeader } from "./page-header";
export { Section } from "./section";
export { StatsRow } from "./stats-row";
export { ActionBar } from "./action-bar";

// ── Card Components ──────────────────────────────────────────
export { AppCard, AppCardHeader, AppCardContent, AppCardFooter } from "./app-card";
export { MetricCard } from "./metric-card";

// ── Data Display ─────────────────────────────────────────────
export { DataTable, type DataTableColumn, type SortDir } from "./data-table";
export { StatusBadge } from "./status-badge";
export { SearchBar } from "./search-bar";
export { Pagination } from "./pagination";

// ── Feedback States ───────────────────────────────────────────
export { AlertBanner } from "./alert-banner";
export { EmptyState } from "./empty-state";
export { LoadingState } from "./loading-state";
export { ErrorState } from "./error-state";
export { ConfirmDialog } from "./confirm-dialog";
