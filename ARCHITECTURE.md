# TZ Police Digital Platform — Architecture

This document describes the high-level architecture of the Tanzania Police
Digital Platform (TPF). It covers the monorepo layout, the runtime stack,
the request lifecycle, and the boundaries between modules. New contributors
should read this before diving into individual modules.

## 1. Repository layout

The repository is structured as an enterprise monorepo. The top level is
intentionally flat so that any engineer can locate a module by name without
traversing nested folders.

```
/
├── src/
│   ├── app/                 # Next.js 16 app router — pages, layouts, route handlers
│   │   ├── api/             # 37 API route groups (REST endpoints)
│   │   ├── admin/           # Admin panel pages
│   │   ├── officer/         # Officer PWA pages (traffic, post, general)
│   │   ├── citizen/         # Citizen portal pages
│   │   ├── command/         # Commander dashboard entry
│   │   └── system/          # System admin / dispatch / audit pages
│   ├── components/
│   │   ├── ui/police/       # TPF design system primitives (16 components)
│   │   ├── police/          # Officer PWA shell + screens
│   │   ├── citizen/         # Citizen portal shell + screens
│   │   ├── role/            # Per-role shells (cid, clerk, viewer, system, etc.)
│   │   └── admin/           # Admin panel components
│   ├── lib/
│   │   ├── api-guard.ts     # withAuth / withAuthAny — central route guard
│   │   ├── auth.ts          # NextAuth config + getServerSession
│   │   ├── rbac.ts          # Role hierarchy + permission matrix
│   │   ├── data-scope.ts    # Officer/commander data scoping
│   │   ├── audit-log.ts     # logAction helper
│   │   ├── api-error.ts     # errMsg + error normalization
│   │   └── db/              # PostgreSQL client (VPS)
│   ├── store/               # Zustand stores (police-store, etc.)
│   └── hooks/               # React hooks (use-api-data, etc.)
├── tests/
│   ├── unit/lib/            # rbac, data-scope, route-access tests
│   └── integration/lib/     # api-guard integration tests
├── docs/                    # All project documentation
├── scripts/                 # DB migrate, deploy, security-audit, seed
├── .github/workflows/       # CI: typecheck, lint, test, build, security audit
└── package.json
```

## 2. Runtime stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Framework    | Next.js 16 (canary) — app router, RSC, route handlers|
| Language     | TypeScript 5                                         |
| UI           | React 19, Tailwind CSS, shadcn/ui, Radix primitives  |
| Auth         | NextAuth (JWT cookie, credentials provider)          |
| Database     | PostgreSQL on VPS (`@/lib/db/client.ts`)            |
| State        | Zustand for client state                             |
| Forms        | react-hook-form + zod                                |
| Tests        | Vitest (unit + integration)                          |
| CI           | GitHub Actions (typecheck, lint, test, build, audit) |

## 3. Request lifecycle (API routes)

Every API route handler should be wrapped with `withAuth` or `withAuthAny`
from `@/lib/api-guard`. The wrapper performs the following steps in order:

1. **Resolve session** via `getServerSession()`. If absent → 401.
2. **Check RBAC permission** for the requested resource + action
   (`withAuth` only — `withAuthAny` skips this). If denied → 403.
3. **Apply data scope** — officers are restricted to their station/region,
   commanders to their region, admins have full access.
4. **Parse body** — JSON body is destructured and passed to the handler.
5. **Execute handler** — receives `{ session, db, body, searchParams }`.
6. **Audit log** — `logAction` records the action (unless `skipAudit: true`).
7. **Normalize result** — `{ ok: true, data }` → 200, `{ ok: false, error }` → 4xx/5xx.

Handlers return a `HandlerResult` object; the wrapper converts it to a
`NextResponse.json()` with the appropriate status code.

## 4. Module boundaries

Module boundaries are enforced by `docs/MODULE_BOUNDARIES.md`. The key rules:

- **`@/lib`** is the shared kernel — no dependencies on `@/components` or `@/app`.
- **`@/components/ui/police`** is the design system — depends only on `@/lib/utils`.
- **`@/components/police`** (officer PWA) may import from `@/lib` and `@/components/ui/police`.
- **`@/components/citizen`** (citizen portal) may import from `@/lib` and `@/components/ui/police`.
- **`@/app`** pages may import from anywhere, but route handlers MUST go through `withAuth`.

Cross-shell imports (e.g. citizen importing from police) are forbidden.

## 5. Design system

The TPF design system lives in `src/components/ui/police/`. It exposes 16
primitives: `PageHeader`, `Section`, `StatsRow`, `ActionBar`, `FormSection`,
`FormField`, `FormActions`, `AppCard`, `MetricCard`, `DataTable`,
`StatusBadge`, `SearchBar`, `Pagination`, `AlertBanner`, `EmptyState`,
`LoadingState`, `ErrorState`, `ConfirmDialog`.

All visual styling MUST use TPF CSS tokens defined in `src/app/globals.css`
(e.g. `--tpf-navy`, `--tpf-status-success`, `--tpf-citizen-accent`).
Hardcoded hex colors in components are forbidden — they break dark mode and
prevent theme-wide restyles.

## 6. CI pipeline

Three GitHub Actions workflows guard the main branch:

1. **ci.yml** — runs on every push/PR: `tsc --noEmit`, `eslint .`, `vitest run`, `next build`.
2. **build.yml** — verifies the production build artifact and uploads it.
3. **security-audit.yml** — daily `npm audit` (high+) + `gitleaks` secret scan.

A pull request cannot merge if any of these fail.

## 7. Deployment

Deployment is currently manual via `scripts/deploy.sh` (SSH to VPS, pull,
rebuild, restart PM2). A Vercel deployment guide is planned but not yet
implemented — the VPS path is the canonical deployment for now.
