# Admin Web Panel

The Admin Web panel is the desktop-oriented interface for system
administrators, commanders, and senior officers. It provides
cross-station oversight, user management, audit log review, and
system-wide configuration.

## 1. Access

The admin panel is at `/admin/*` routes. Access requires one of the
following roles:

- `SYSTEM_ADMIN` — full system access
- `ADMIN` — station-level admin
- `SUPER_ADMIN` — god mode (use sparingly)
- `REGIONAL_COMMANDER`, `DISTRICT_COMMANDER` — read-only + station
  management in their region/district
- `NATIONAL_CLERK`, `REGIONAL_CLERK`, `DISTRICT_CLERK` — clerk
  workflows

Users with other roles (`TRAFFIC_OFFICER`, `CID_OFFICER`, etc.) are
redirected to their role-specific shell, not the admin panel.

## 2. Layout

The admin shell (`src/components/admin/admin-shell.tsx`) provides:

- **Sidebar** — collapsible navigation grouped by section
- **Top bar** — user menu, notifications, theme toggle
- **Main content area** — renders the active page

The shell is responsive — on screens <1024px, the sidebar collapses to
a hamburger menu. On screens <768px, the layout is single-column with
the sidebar as an overlay.

## 3. Pages

### `/admin` (dashboard)

System-wide stats: total users, active officers, citations today,
incidents today, alerts active. Plus a recent activity feed.

### `/admin/users`

User management — list, search, filter by role/station/status. Create
new users, edit profile, reset password, suspend/activate. Deletion is
soft (`status='suspended'`) to preserve audit-log referential integrity.

### `/admin/roles`

Read-only RBAC role hierarchy browser. Shows all 19+ roles with their
permission matrix. See `src/lib/rbac.ts` for the source of truth.

### `/admin/permissions`

Permissions matrix — all roles × all resources, color-coded by
permission level (view/create/update/delete/manage).

### `/admin/stations`

Station management — create, edit, deactivate. Each station has a
region, district, phone, and assigned officers.

### `/admin/officers`

Officer management — list, search, assign to station/post, view
performance metrics (citations, arrests, patrol hours).

### `/admin/audit-logs`

Append-only audit log viewer. Filter by user, action, resource, date
range. Export to CSV for compliance reports.

### `/admin/citizens`

Citizen profile search — lookup by NIDA, phone, or name. View
citation/arrest history, points status, good-conduct score.

### `/admin/reports`

System-generated reports: daily/weekly/monthly summaries of citations,
arrests, incidents, fines collected. Export to PDF or Excel.

### `/admin/settings`

System-wide settings: service prices (fine amounts), feature flags,
SMS provider config, upload limits.

## 4. Data scoping

Admin pages enforce data scoping via `applyScopeToQuery`:

- `ADMIN` sees only their station's data
- `REGIONAL_COMMANDER` sees all stations in their region
- `SUPER_ADMIN`, `SYSTEM_ADMIN` see everything

The scope is applied transparently in the API route handlers — the
admin UI does not need to pass a station filter explicitly.

## 5. Audit logging

Every mutating action in the admin panel is logged via `logAction`:

- User creation, edit, suspension
- Station creation, edit, deactivation
- Officer assignment change
- Settings change
- Report export

The log entries include the admin's user ID, role, the action, the
target entity, before/after values (for edits), and the IP address.

## 6. Theme

The admin panel supports light and dark mode. The toggle is in the top
bar. The preference is stored in `localStorage` and applied via the
`dark` class on `<html>`.

All colors use TPF design tokens (`--tpf-*`) — no hardcoded hex values.
The theme toggle swaps the token values via CSS variables in
`src/app/globals.css`.

## 7. Performance

The admin panel serves 231 static pages (prerendered at build time) +
dynamic API routes. List pages use server-side pagination (default 20
items per page) to keep response sizes small.

For tables with >10k rows, the DataTable component supports virtualized
scrolling — see `src/components/ui/police/data-table.tsx`.

## 8. Keyboard shortcuts

Power users can navigate the admin panel via keyboard:

- `g` then `d` — go to dashboard
- `g` then `u` — go to users
- `g` then `s` — go to stations
- `g` then `a` — go to audit logs
- `/` — focus the search bar
- `?` — show the keyboard shortcut help overlay

These are implemented in `src/components/admin/admin-shell.tsx` via
a global keydown listener.

## 9. Browser support

The admin panel is tested on:

- Chrome 120+ (primary)
- Firefox 120+
- Safari 17+
- Edge 120+

IE 11 is not supported. Users on IE 11 see a banner advising them to
upgrade.
