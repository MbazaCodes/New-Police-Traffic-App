# TZ Police Digital Platform — Monorepo

A production-ready police platform with 4 role-based apps sharing types, data, UI tokens, database, and auth.

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase + NextAuth values

# Start development (all apps)
bun run dev

# Or use Turbo
bunx turbo dev
```

## Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full tree structure, shared dependency map, and design decisions.

## Apps

| App | Tech | Port | Purpose |
|-----|------|------|---------|
| **officer-pwa** | Next.js 16 | 3000 | Officer mobile PWA (phone frame, vehicle + citizen search) |
| **admin-web** | Next.js 16 | 3000 | Admin panel (users, stations, posts, assignments) |
| **command-center** | Next.js 16 | 3000 | Commander dashboard (full operational oversight) |
| **officer-mobile** | Flutter 3.44+ | — | Native mobile app (mirrors PWA) |

> **Note:** PWA, Admin, and Command Center currently share a single Next.js app with role-based routing. To split into separate deployments, move components into `apps/admin-web/` and `apps/command-center/` with independent `next.config.ts`.

## Shared Packages

| Package | Purpose |
|---------|---------|
| `@tz-police/shared` | Types, constants, mock data, utilities |
| `@tz-police/ui-tokens` | Colors, typography, spacing, radius, shadows |
| `@tz-police/database` | Supabase schema, client, typed queries |
| `@tz-police/auth` | NextAuth config, RBAC, session management |
| `@tz-police/notifications` | Push notifications, SMS, email |
| `@tz-police/permissions` | Permission matrix, role hierarchy |
| `@tz-police/analytics` | Event tracking, metrics |
| `@tz-police/sdk` | API client SDK for all apps |
| `@tz-police/maps` | Map utilities (GPS, geocoding) |

## Roles (8)

```
SUPER_ADMIN > COMMANDER > REGIONAL_COMMANDER > DISTRICT_COMMANDER > OFFICER > TRAFFIC_OFFICER > INVESTIGATOR > VIEWER
```

## Database

- **PostgreSQL** via Supabase
- **15 tables** with RLS (Row Level Security)
- **6 migrations** in `supabase/migrations/`
- **5 Edge Functions** in `supabase/functions/`
- Schema: `packages/database/src/schema.sql`

## Authentication

- **NextAuth v4** with JWT strategy (7-day expiry)
- **Credentials provider** with OTP verification
- **RBAC** with 8 roles and permission matrix
- Session includes: role, idNumber, station

## Scripts

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # ESLint
bun run type-check   # TypeScript check
bun run db:push      # Push Prisma schema
bun run db:seed      # Seed database
bun run supabase:start  # Start local Supabase
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **Mobile**: Flutter 3.44+, Riverpod, GoRouter, Material 3, Hive
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Auth**: NextAuth v4, JWT, RBAC
- **State**: Zustand (PWA), Riverpod (Flutter)
- **Monorepo**: Turborepo, Bun workspaces
