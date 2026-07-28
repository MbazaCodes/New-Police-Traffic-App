# TPF Police Design System v1.0

**Tanzania Police Force — Digital Platform Design System**

This document defines the authoritative design language for the TZ Police Digital Platform. Every screen, every component, every interaction must follow these rules. Consistency is more important than creativity — an officer should instantly recognize where everything is, regardless of which page they are on.

---

## 1. Design Tokens

### 1.1 Color Palette

All colors are defined as CSS custom properties in `src/app/globals.css`. Pages MUST use these tokens, never hardcode hex values.

#### Base Brand Colors (TPF Layer)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--tpf-navy` | `#0F2557` | `#1E40AF` | Deep navy — sidebar backgrounds |
| `--tpf-navy-2` | `#1A3A8A` | `#3B82F6` | Secondary navy — accents |
| `--tpf-blue` | `#2563EB` | `#60A5FA` | Primary blue — CTAs, links |
| `--tpf-blue-light` | `#3B82F6` | `#93C5FD` | Light blue — info states |
| `--tpf-red` | `#DC2626` | `#F87171` | Danger — errors, destructive |
| `--tpf-green` | `#059669` | `#34D399` | Success — confirmations |
| `--tpf-amber` | `#D97706` | `#FCD34D` | Warning — caution states |

#### Surface Colors

| Token | Usage |
|---|---|
| `--tpf-surface` | Page background |
| `--tpf-surface-2` | Elevated surfaces, inputs |
| `--tpf-card` | Card backgrounds |
| `--tpf-border` | Default borders |
| `--tpf-border-2` | Emphasized borders |

#### Text Colors

| Token | Usage |
|---|---|
| `--tpf-text` | Primary text |
| `--tpf-text-2` | Secondary text |
| `--tpf-text-3` | Muted/helper text |
| `--tpf-text-4` | Disabled/placeholder text |

### 1.2 Status Tokens (Operational States)

Every status indicator in the platform MUST use these tokens:

| Token | Color | Semantic Meaning |
|---|---|---|
| `--tpf-status-success` | Green | Active, online, completed, approved, paid |
| `--tpf-status-warning` | Amber | On-leave, escalated, caution |
| `--tpf-status-danger` | Red | Suspended, critical, expired, cancelled |
| `--tpf-status-info` | Blue | Processing, assigned, in-progress |
| `--tpf-status-pending` | Orange | Pending, review, submitted, draft |
| `--tpf-status-neutral` | Gray | Offline, archived, off-duty, inactive |

Each status token has a corresponding `-bg` variant (e.g., `--tpf-status-success-bg`) for badge/text backgrounds.

### 1.3 Spacing Scale

Use ONLY these values. Never use arbitrary spacing.

| Token | Value |
|---|---|
| `--tpf-space-xs` | `4px` |
| `--tpf-space-sm` | `8px` |
| `--tpf-space-md` | `12px` |
| `--tpf-space-base` | `16px` |
| `--tpf-space-lg` | `24px` |
| `--tpf-space-xl` | `32px` |
| `--tpf-space-2xl` | `48px` |
| `--tpf-space-3xl` | `64px` |

### 1.4 Elevation (Shadows)

| Token | Usage |
|---|---|
| `--tpf-shadow-none` | Flat elements |
| `--tpf-shadow-xs` | Subtle lift (cards) |
| `--tpf-shadow-sm` | Standard cards |
| `--tpf-shadow-md` | Dropdowns, popovers |
| `--tpf-shadow-lg` | Modals, dialogs |
| `--tpf-shadow-xl` | Overlays |

### 1.5 Typography Scale

| Token | Size/Weight | Usage |
|---|---|---|
| `--tpf-font-display` | 30px/700 | Hero numbers, dashboard KPIs |
| `--tpf-font-h1` | 24px/700 | Page titles |
| `--tpf-font-h2` | 20px/600 | Section headers |
| `--tpf-font-h3` | 16px/600 | Card titles, subsections |
| `--tpf-font-body` | 14px/400 | Body text, descriptions |
| `--tpf-font-caption` | 12px/400 | Captions, helper text |
| `--tpf-font-label` | 11px/600 | Labels, overlines |
| `--tpf-font-overline` | 10px/600 | Section overlines, categories |

### 1.6 Border Radius

| Token | Usage |
|---|---|
| `--radius-sm` | Small elements (badges, pills) |
| `--radius-md` | Inputs, buttons |
| `--radius-lg` | Cards, modals |
| `--radius-xl` | Large panels, hero cards |

---

## 2. Component Library

All components live in `src/components/ui/police/` and are exported via `src/components/ui/police/index.ts`.

### 2.1 Layout Components

| Component | File | Purpose |
|---|---|---|
| `PageHeader` | `page-header.tsx` | Standard page header with icon, title, subtitle, breadcrumbs, actions |
| `Section` | `section.tsx` | Content section wrapper with optional title and action |
| `StatsRow` | `stats-row.tsx` | Responsive 4-column grid for dashboard KPI cards |
| `ActionBar` | `action-bar.tsx` | Button/action bar between header and content |

### 2.2 Card Components

| Component | File | Purpose |
|---|---|---|
| `AppCard` | `app-card.tsx` | Universal card: default, metric, action, alert variants |
| `AppCardHeader` | `app-card.tsx` | Card header with icon, title, description, action |
| `AppCardContent` | `app-card.tsx` | Card body content wrapper |
| `AppCardFooter` | `app-card.tsx` | Card footer with actions |
| `MetricCard` | `metric-card.tsx` | KPI/stat card with label, value, trend, icon |

### 2.3 Data Display Components

| Component | File | Purpose |
|---|---|---|
| `DataTable` | `data-table.tsx` | Full-featured table: sort, search, paginate, row click |
| `StatusBadge` | `status-badge.tsx` | Standardized status indicator (30+ statuses mapped) |
| `SearchBar` | `search-bar.tsx` | Unified search with filter toggle |
| `Pagination` | `pagination.tsx` | Page navigation control |

### 2.4 Feedback Components

| Component | File | Purpose |
|---|---|---|
| `AlertBanner` | `alert-banner.tsx` | Alert banner: info, warning, danger, success |
| `EmptyState` | `empty-state.tsx` | Empty data placeholder |
| `LoadingState` | `loading-state.tsx` | Loading indicator: spinner, skeleton, overlay |
| `ErrorState` | `error-state.tsx` | Error display with retry button |
| `ConfirmDialog` | `confirm-dialog.tsx` | Confirmation dialog for destructive actions |

---

## 3. Standard Page Layout

Every page in the platform MUST follow this skeleton:

```
PageHeader (icon + title + subtitle + breadcrumbs + actions)
    |
ActionBar (quick action buttons)
    |
StatsRow (dashboard KPI cards — if applicable)
    |
Section[1] (content group with title)
    |
Section[2] (content group with title)
    |
    ... more sections as needed
```

### Example: Officers Page

```tsx
import { PageHeader, StatsRow, ActionBar, Section, DataTable, StatusBadge, SearchBar } from "@/components/ui/police";
import { Users, Shield, UserCheck, UserX } from "lucide-react";

export default function OfficersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wafisa"
        subtitle="Simamu na udhibiti wa akaunti za wafisa"
        icon={Users}
        breadcrumbs={[
          { label: "Nyumbani", href: "/admin" },
          { label: "Wafisa" },
        ]}
        actions={<Button>Ongeza Afisa</Button>}
      />

      <StatsRow>
        <MetricCard label="Jumla" value="1,284" icon={Users} accent="blue" />
        <MetricCard label="Wakazi" value="1,102" icon={Shield} accent="green" />
        <MetricCard label="Mapumziko" value="156" icon={UserCheck} accent="amber" />
        <MetricCard label="Amesimamishwa" value="26" icon={UserX} accent="red" />
      </StatsRow>

      <Section title="Orodha ya Wafisa">
        <DataTable
          columns={[
            { key: "name", label: "Jina", sortable: true },
            { key: "badge_no", label: "Namba ya Beji" },
            { key: "rank", label: "Daraja" },
            { key: "status", label: "Hali", render: (v) => <StatusBadge status={v as string} /> },
          ]}
          data={officers}
          searchable
          onRowClick={(row) => router.push(`/admin/officers/${row.id}`)}
        />
      </Section>
    </div>
  );
}
```

---

## 4. Rules

### 4.1 MUST

1. Every page MUST use components from `src/components/ui/police/`.
2. Every status indicator MUST use `StatusBadge` with a mapped status name.
3. Every data table MUST use the unified `DataTable` component.
4. Every KPI MUST use `MetricCard` inside a `StatsRow`.
5. Every page MUST use `PageHeader` for its title area.
6. Colors MUST reference TPF tokens — never hardcode hex or Tailwind colors.
7. Components MUST support light and dark mode automatically.
8. Icons MUST come from `lucide-react` — no other icon libraries.

### 4.2 MUST NOT

1. Do NOT create page-specific card styles — use `AppCard` variants.
2. Do NOT create page-specific buttons — use the TPF button classes (`tpf-btn-*`).
3. Do NOT hardcode colors like `bg-blue-500`, `text-red-600` — use tokens.
4. Do NOT use inline styles unless absolutely necessary.
5. Do NOT invent new badge colors — use the 6 semantic status variants.
6. Do NOT mix icon libraries (no Heroicons, Font Awesome, Material Icons).
7. Do NOT use arbitrary spacing — use the TPF spacing scale.
8. Do NOT create decorative animations on tables, dashboards, or operational screens.

### 4.3 Animations

Allowed (responsive feedback):
- Dialog open/close
- Notification toasts
- Drawer/sheet slide
- Skeleton loading shimmer
- Page transition (subtle fade-up)

Forbidden (decorative/distracting):
- Table row animations
- Dashboard card entrance animations (stagger is OK on initial load)
- Navigation between operational screens
- Button hover scale (only active:scale-0.97 is OK)

---

## 5. Status Mapping Reference

The `StatusBadge` component maps 30+ status strings to semantic colors:

| Status String | Badge Color | Swahili Label |
|---|---|---|
| `active`, `success`, `completed`, `approved`, `paid` | Green (success) | Kaziki / Imefanikiwa |
| `warning`, `on-leave`, `escalated` | Amber (warning) | Tahadhari / Mapumziko |
| `danger`, `suspended`, `critical`, `expired`, `cancelled`, `rejected`, `revoked` | Red (danger) | Hatari / Amesimamishwa |
| `info`, `processing`, `assigned`, `in_progress`, `dispatched` | Blue (info) | Inatendeka |
| `pending`, `review`, `submitted`, `draft` | Orange (pending) | Inangojwa |
| `neutral`, `offline`, `archived`, `off-duty`, `inactive` | Gray (neutral) | Haijafanyi Kazi |

---

## 6. Dark Mode

All TPF tokens automatically switch between light and dark values via the `.dark` class on the root element. Components built with TPF tokens will automatically adapt — no per-component dark mode handling is needed.

The system uses `next-themes` for theme management.
