# Module Boundaries & Dependency Rules

**TZ Police Digital Platform — Modular Monolith Architecture**

This document defines the module boundaries and dependency rules that keep the platform maintainable as it grows. Every package, library, and directory must follow these rules.

---

## 1. Module Map

```
src/
├── app/                      # Next.js App Router (pages + API routes)
│   ├── api/                  # API route handlers (thin wrappers)
│   ├── admin/                # Admin portal pages
│   ├── officer/              # Officer portal pages
│   ├── command/              # Commander portal pages
│   ├── cid/                  # CID portal pages
│   ├── clerk/                # Clerk portal pages
│   ├── citizen/              # Citizen portal pages
│   ├── system/               # System admin pages
│   └── viewer/               # Viewer portal pages
│
├── components/
│   ├── ui/                   # shadcn/ui primitives (Button, Dialog, etc.)
│   │   └── police/           # TPF Design System (AppCard, DataTable, etc.)
│   ├── admin/                # Admin-specific page components
│   ├── police/               # Officer mobile PWA components
│   ├── citizen/              # Citizen portal components
│   ├── command/              # Commander components
│   ├── role/                 # Role-based shell components
│   └── shared/               # Cross-portal shared components
│
├── lib/                      # Core libraries (platform foundation)
│   ├── auth.ts               # NextAuth config + OTP + session
│   ├── api-guard.ts          # API route guard factory (auth + audit + scope)
│   ├── api-error.ts          # Error message formatting
│   ├── audit-log.ts          # PostgreSQL audit logging
│   ├── rbac.ts               # Role-Based Access Control matrix
│   ├── data-scope.ts         # Role-based data filtering
│   ├── db/                   # Database layer
│   │   ├── client.ts         # PostgreSQL pool + query builder
│   │   ├── auth.ts           # User lookup for auth
│   │   └── data-service.ts    # Data access patterns
│   ├── route-access.ts       # Role → allowed route prefixes
│   ├── scope.ts              # Scope context builder
│   ├── utils.ts              # General utilities (cn, etc.)
│   └── *.ts                  # Domain-specific helpers
│
├── hooks/                    # React hooks
│
├── store/                    # Zustand state stores
│
└── types/                    # TypeScript type definitions

packages/
├── database/                 # Database schema, migrations, typed queries
├── auth/                     # Auth utilities (shared with mobile)
├── permissions/             # Permission definitions
├── analytics/                # Analytics module
├── notifications/            # Notification service
├── maps/                    # Map/geolocation utilities
├── sdk/                      # Public SDK for external integrations
├── shared/                   # Shared constants, types, utilities
└── ui-tokens/                # Design token definitions
```

---

## 2. Dependency Rules

These rules define WHAT can import WHAT. A violation means broken architecture.

### Rule 1: Unidirectional Dependencies

Dependencies flow **downward** only. A higher layer may import from a lower layer, but never the reverse.

```
Layer 1 (Highest)  →  app/ (pages, API routes)
Layer 2            →  components/ (UI components)
Layer 3            →  hooks/, store/ (React state)
Layer 4            →  lib/ (core libraries)
Layer 5 (Lowest)   →  packages/ (domain modules)
```

| From | Can Import To | Cannot Import From |
|---|---|---|
| `app/api/` | `lib/`, `packages/`, `hooks/` | `components/` (API routes must not import React components) |
| `app/admin/` | `components/admin/`, `components/ui/police/`, `lib/`, `hooks/` | `app/api/` (pages don't import route handlers) |
| `components/` | `lib/`, `hooks/`, `store/` | `app/` (components don't import pages) |
| `components/ui/police/` | `lib/utils.ts` only | Other components (design primitives are leaf-level) |
| `hooks/` | `lib/`, `store/`, `packages/` | `components/` (hooks are component-agnostic) |
| `lib/` | `packages/`, `lib/` (internal) | `components/`, `hooks/`, `app/`, `store/` |
| `packages/*` | `packages/shared` only | `lib/`, `app/`, `components/` (packages are standalone) |

### Rule 2: API Routes Are Thin Wrappers

API routes (`app/api/*/route.ts`) MUST:
1. Use `withAuth()` from `lib/api-guard.ts` for auth/audit/error handling
2. Contain ONLY: request parsing → business logic call → response formatting
3. NOT import React components
4. NOT contain complex business logic (delegate to `lib/` or `packages/`)

```
✅ GOOD:  export const GET = withAuth("officers", "view", async ({ db, scope }) => { ... });
❌ BAD:   export async function GET(req) { const session = await getServerSession(); ... }
```

### Rule 3: Design System Components Are Leaf-Level

Components in `components/ui/police/` MUST:
1. Import ONLY from `lib/utils.ts` (for `cn()`)
2. NOT import other application components
3. NOT import from `hooks/` or `store/`
4. Be pure, stateless (except controlled internal state like Accordions)
5. Accept data via props, emit events via callbacks

### Rule 4: Packages Are Standalone

Each package under `packages/` MUST:
1. Have its own `package.json` with no dependency on the Next.js app
2. Import ONLY from `packages/shared/` (constants, types)
3. NOT import from `lib/`, `components/`, `hooks/`, `store/`
4. Be testable independently

| Package | Allowed Internal Imports |
|---|---|
| `packages/database` | `packages/shared` only |
| `packages/auth` | `packages/shared` only |
| `packages/permissions` | `packages/shared` only |
| `packages/analytics` | `packages/shared` only |
| `packages/notifications` | `packages/shared` only |
| `packages/maps` | `packages/shared` only |
| `packages/sdk` | `packages/shared` only |

### Rule 5: Cross-Portal Communication

Different portal components (admin, officer, citizen) MUST communicate ONLY via:
1. Shared `store/` (Zustand stores)
2. `lib/` utilities (not hooks)
3. URL parameters (for navigation)

They MUST NOT:
1. Import each other directly
2. Share component-specific state
3. Reference each other's internal types

---

## 3. The lib/ Layer — Platform Foundation

The `lib/` directory is the backbone. Every file here must be importable from anywhere above it.

### Core Lib Files (Stable API)

| File | Purpose | Used By |
|---|---|---|
| `auth.ts` | NextAuth config, OTP, session extraction | Every API route, every auth flow |
| `api-guard.ts` | Route handler factory (auth + audit + scope) | Every API route handler |
| `rbac.ts` | Permission matrix, role hierarchy | `api-guard.ts`, admin components |
| `data-scope.ts` | Role-based data filtering | `api-guard.ts`, API routes with scoped queries |
| `audit-log.ts` | PostgreSQL audit logging | `api-guard.ts` (auto), manual calls |
| `api-error.ts` | Error message formatting | `api-guard.ts`, manual error handlers |
| `db/client.ts` | PostgreSQL pool + query builder | Every data-accessing file |
| `db/auth.ts` | User lookup for authentication | `auth.ts` only |
| `utils.ts` | cn(), general utilities | All components, all lib files |

### Lib File Dependency Graph

```
auth.ts          ← (standalone, imports only db/auth.ts)
api-guard.ts     ← imports auth.ts, rbac.ts, data-scope.ts, audit-log.ts, api-error.ts
rbac.ts          ← imports auth.ts (types only)
data-scope.ts    ← imports auth.ts (types only)
audit-log.ts     ← imports db/client.ts, api-error.ts
api-error.ts     ← (standalone, no imports)
db/client.ts     ← imports pg (npm package)
db/auth.ts       ← imports db/client.ts
utils.ts         ← imports clsx, tailwind-merge (npm packages)
```

---

## 4. Enforcement

### Linting (Recommended ESLint Rules)

```javascript
// eslint.config.js — Module boundary rules
{
  "rules": {
    // API routes must not import React components
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["components/*"],
        "importNames": ["*"],
        "message": "API routes must not import React components"
      }]
    }]
  }
}
```

### Code Review Checklist

When reviewing a PR, verify:
1. ✅ Does the new API route use `withAuth()` instead of manual `getServerSession()`?
2. ✅ Are mutations automatically audited (no missing `logAction` calls)?
3. ✅ Does the error handler use `errMsg()` instead of `String(e)`?
4. ✅ Does `components/ui/police/` import ONLY from `lib/utils.ts`?
5. ✅ Does `packages/*` import ONLY from `packages/shared`?
6. ✅ Is there no circular dependency between `lib/` files?

---

## 5. Module Responsibility Summary

| Module | Single Responsibility | NOT Responsible For |
|---|---|---|
| `app/api/` | HTTP request handling, response formatting | Business logic, rendering |
| `components/ui/police/` | Reusable UI primitives | Data fetching, state management |
| `lib/api-guard.ts` | Auth, audit, scope, errors for API routes | Business logic |
| `lib/rbac.ts` | Permission definitions and checks | Session management |
| `lib/data-scope.ts` | Data filtering by role | Authorization decisions |
| `lib/audit-log.ts` | Audit trail persistence | Route handling, auth checks |
| `lib/db/client.ts` | Database connection and queries | Business logic |
| `packages/database` | Schema, migrations, typed queries | Runtime data access |
