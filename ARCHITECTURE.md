# TZ Police Digital Platform — Monorepo Architecture

A solid, advanced monorepo structure for easy debugging and scalable growth.
Three apps (PWA, Flutter, Web) share types, data, UI tokens, and database.

```
TZ-POLICE/
│
├── apps/                           # ===== APPLICATIONS =====
│   │
│   ├── pwa/                        # 1. PWA — Next.js 16 (Officer Mobile App)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router (routes, layout, API)
│   │   │   │   ├── layout.tsx      # Root layout (ThemeProvider, metadata, PWA manifest)
│   │   │   │   ├── page.tsx        # Entry → MobileShell
│   │   │   │   ├── globals.css     # Tailwind 4 + police theme tokens
│   │   │   │   └── api/
│   │   │   │       ├── download/   # ZIP download endpoint
│   │   │   │       └── route.ts    # Health check
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── police/         # Officer mobile components
│   │   │   │   │   ├── mobile-shell.tsx          # Phone frame + screen router
│   │   │   │   │   ├── bottom-nav.tsx            # Traffic officer bottom nav
│   │   │   │   │   ├── general-bottom-nav.tsx    # General officer bottom nav
│   │   │   │   │   ├── top-app-bar.tsx           # Reusable top bar
│   │   │   │   │   ├── status-bar.tsx            # iOS-style status bar
│   │   │   │   │   ├── camera-scanner-modal.tsx  # QR + OCR camera scanner
│   │   │   │   │   ├── theme-toggle.tsx          # Dark/Light toggle
│   │   │   │   │   ├── police-icons.tsx          # Icon name → Lucide mapper
│   │   │   │   │   └── screens/                  # 15 mobile screens
│   │   │   │   │       ├── login-screen.tsx              # OTP login (4 roles)
│   │   │   │   │       ├── home-screen.tsx               # Traffic officer home
│   │   │   │   │       ├── general-home-screen.tsx       # General officer home (citizen search)
│   │   │   │   │       ├── traffic-screen.tsx            # Traffic page (Trafiki)
│   │   │   │   │       ├── general-police-screen.tsx     # Police page (Polisi)
│   │   │   │   │       ├── patrol-screen.tsx             # Patrol report form
│   │   │   │   │       ├── alerts-screen.tsx             # Alerts + broadcast modal
│   │   │   │   │       ├── profile-screen.tsx            # Profile + settings
│   │   │   │   │       ├── search-results-screen.tsx     # Vehicle search results
│   │   │   │   │       ├── citizen-search-results-screen.tsx # Citizen search results
│   │   │   │   │       ├── citation-screen.tsx           # Citation form (pre-filled)
│   │   │   │   │       ├── history-screen.tsx            # Citation history
│   │   │   │   │       ├── pf3-screen.tsx                # PF3 accident report
│   │   │   │   │       ├── accident-report-screen.tsx    # Accident report form
│   │   │   │   │       └── vehicle-inspection-screen.tsx # Vehicle inspection checklist
│   │   │   │   │
│   │   │   │   ├── admin/          # Admin/Commander web components
│   │   │   │   │   ├── admin-shell.tsx              # Desktop sidebar + topbar layout
│   │   │   │   │   └── screens/                    # 12 admin screens
│   │   │   │   │       ├── admin-dashboard.tsx     # KPIs + charts + live incidents
│   │   │   │   │       ├── admin-officers.tsx      # Officer management table
│   │   │   │   │       ├── admin-incidents.tsx     # Incident management
│   │   │   │   │       ├── admin-citations.tsx     # Citation management
│   │   │   │   │       ├── admin-patrols.tsx       # Patrol monitoring + map
│   │   │   │   │       ├── admin-alerts.tsx        # Broadcast + alert history
│   │   │   │   │       ├── admin-reports.tsx       # Analytics + charts
│   │   │   │   │       ├── admin-users.tsx         # User management
│   │   │   │   │       ├── admin-stations.tsx      # Station CRUD
│   │   │   │   │       ├── admin-posts.tsx         # Post CRUD
│   │   │   │   │       ├── admin-assignments.tsx   # Officer assignments
│   │   │   │   │       └── admin-settings.tsx      # System settings
│   │   │   │   │
│   │   │   │   └── ui/             # shadcn/ui component library (50+ components)
│   │   │   │
│   │   │   ├── store/
│   │   │   │   └── police-store.ts # Zustand: auth, navigation, search, scanner, theme
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   └── use-toast.ts    # Toast notification hook
│   │   │   │
│   │   │   └── lib/
│   │   │       ├── police-data.ts      # Mock data (officer app)
│   │   │       ├── admin-data.ts       # Mock data (admin app)
│   │   │       ├── admin-mgmt-data.ts  # Mock data (stations/posts/assignments)
│   │   │       ├── db.ts               # Prisma client
│   │   │       └── utils.ts            # Utility functions (cn, etc.)
│   │   │
│   │   ├── public/                 # Static assets
│   │   │   ├── police-logo.png     # TPF emblem (shared)
│   │   │   ├── manifest.json       # PWA manifest
│   │   │   └── tz-police-digital-platform.zip # Downloadable project
│   │   │
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── tailwind.config.ts
│   │
│   ├── web/                        # 2. WEB — Next.js 16 (Admin/Command Center)
│   │   ├── src/                    # (Shares components with PWA via packages)
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │   # NOTE: Currently merged with PWA via role-based routing.
│   │   # Admin/Commander roles render AdminShell (desktop) from the same Next.js app.
│   │   # To split into a separate app, move admin/ components here and add independent routing.
│   │
│   └── mobile/                     # 3. FLUTTER — Mobile App (mirrors PWA)
│       ├── lib/
│       │   ├── main.dart               # Entry point
│       │   ├── app.dart                # MaterialApp.router (themes + GoRouter)
│       │   │
│       │   ├── core/                   # Core infrastructure
│       │   │   ├── theme/
│       │   │   │   ├── app_theme.dart  # Material 3 light/dark (uses shared tokens)
│       │   │   │   └── app_colors.dart # Legacy color constants
│       │   │   ├── router/
│       │   │   │   └── app_router.dart # GoRouter with StatefulShellRoute
│       │   │   └── constants/
│       │   │       └── app_constants.dart
│       │   │
│       │   ├── shared/                 # ===== SHARED (mirrors packages/) =====
│       │   │   ├── tokens/
│       │   │   │   └── app_tokens.dart     # ← mirrors packages/ui-tokens
│       │   │   ├── constants/
│       │   │   │   └── app_constants.dart  # ← mirrors packages/shared/constants
│       │   │   ├── data/
│       │   │   │   ├── mock_data.dart      # ← mirrors packages/shared/data
│       │   │   │   └── app_data_service.dart # Data service (Supabase-ready)
│       │   │   └── theme/
│       │   │       └── app_theme.dart      # ← mirrors packages/ui-tokens (ThemeData)
│       │   │
│       │   ├── features/               # Feature-based screens
│       │   │   ├── auth/
│       │   │   │   └── login_screen.dart
│       │   │   ├── home/
│       │   │   │   ├── home_screen.dart
│       │   │   │   └── general_home_screen.dart
│       │   │   ├── traffic/
│       │   │   │   ├── traffic_screen.dart
│       │   │   │   └── general_police_screen.dart
│       │   │   ├── patrol/
│       │   │   │   └── patrol_screen.dart
│       │   │   ├── alerts/
│       │   │   │   └── alerts_screen.dart
│       │   │   ├── profile/
│       │   │   │   └── profile_screen.dart
│       │   │   ├── search/
│       │   │   │   ├── search_results_screen.dart
│       │   │   │   └── citizen_search_results_screen.dart
│       │   │   ├── citation/
│       │   │   │   ├── citation_screen.dart
│       │   │   │   └── history_screen.dart
│       │   │   ├── accident/
│       │   │   │   ├── accident_report_screen.dart
│       │   │   │   └── pf3_screen.dart
│       │   │   └── inspection/
│       │   │       └── vehicle_inspection_screen.dart
│       │   │
│       │   ├── providers/              # Riverpod state management
│       │   │   ├── auth_provider.dart
│       │   │   ├── theme_provider.dart
│       │   │   └── navigation_provider.dart
│       │   │
│       │   ├── services/
│       │   │   └── storage_service.dart # Hive local storage
│       │   │
│       │   └── widgets/                # Reusable widgets
│       │       ├── bottom_nav_bar.dart
│       │       ├── top_app_bar.dart
│       │       ├── status_bar.dart
│       │       ├── police_logo.dart
│       │       ├── police_icon.dart
│       │       ├── stat_card.dart
│       │       ├── quick_action_button.dart
│       │       ├── section_card.dart
│       │       ├── form_field.dart
│       │       └── app_toast.dart
│       │
│       ├── assets/
│       │   └── police-logo.png     # Same emblem as PWA
│       ├── pubspec.yaml            # Flutter dependencies
│       └── README.md
│
├── packages/                       # ===== SHARED PACKAGES =====
│   │
│   ├── shared/                     # @tz-police/shared
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   └── index.ts        # All TypeScript types (User, Officer, Citation, etc.)
│   │   │   ├── constants/
│   │   │   │   └── index.ts        # App constants, nav items, roles, offense types
│   │   │   ├── data/
│   │   │   │   └── index.ts        # Mock data barrel export
│   │   │   ├── utils/
│   │   │   │   └── index.ts        # Shared utilities (formatCurrency, maskPhone, etc.)
│   │   │   └── index.ts            # Barrel export
│   │   └── package.json
│   │
│   ├── ui-tokens/                  # @tz-police/ui-tokens
│   │   ├── src/
│   │   │   └── index.ts            # Colors, typography, spacing, radius, shadows, themes
│   │   ├── tokens.json             # Machine-readable tokens (consumed by Flutter)
│   │   └── package.json
│   │
│   └── database/                   # @tz-police/database
│       ├── src/
│       │   ├── schema.sql          # Full PostgreSQL schema (15 tables + indexes + RLS)
│       │   ├── client.ts           # Supabase client setup
│       │   ├── migrations/         # SQL migration files
│       │   └── seed/               # Seed data scripts
│       └── package.json
│
├── shared/                         # ===== SHARED ASSETS =====
│   └── assets/
│       └── police-logo.png         # Single source for TPF emblem
│
├── prisma/                         # Prisma ORM schema (SQLite for local dev)
│   └── schema.prisma
│
├── .env                            # Environment variables (Supabase URL, keys)
├── package.json                    # Root workspace config
├── bun.lock                        # Bun lockfile
├── tsconfig.json                   # Root TypeScript config
├── next.config.ts                  # Next.js config
├── eslint.config.mjs               # ESLint config
├── Caddyfile                       # Gateway config
├── README.md                       # Project documentation
├── ARCHITECTURE.md                 # This file — tree structure & architecture
└── worklog.md                      # Development log
```

## Shared Dependencies Map

```
                    ┌─────────────────┐
                    │  packages/shared │
                    │  (types, data,   │
                    │   constants)     │
                    └──────┬──────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
    │   apps/pwa   │ │   apps/web   │ │ apps/mobile│
    │  (Next.js)   │ │  (Next.js)   │ │ (Flutter)  │
    └──────┬──────┘ └──────┬──────┘ └─────┬──────┘
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐       │
    │packages/    │ │packages/    │       │
    │ui-tokens    │ │ui-tokens    │       │
    └──────┬──────┘ └──────┬──────┘       │
           │               │               │
           │     ┌─────────▼────────┐      │
           │     │ packages/database │      │
           │     │ (Supabase schema  │      │
           │     │  + client)        │      │
           │     └─────────┬────────┘      │
           │               │               │
    ┌──────▼───────────────▼───────┐ ┌─────▼──────────┐
    │     Shared Supabase DB       │ │ Dart mirror:    │
    │  (PostgreSQL — 15 tables)    │ │ lib/shared/     │
    └──────────────────────────────┘ │ (tokens+data)   │
                                      └─────────────────┘
```

## How PWA & Flutter Stay in Sync

| Layer | PWA (Next.js) | Flutter | Source of Truth |
|-------|---------------|---------|-----------------|
| **Colors** | `packages/ui-tokens/src/index.ts` → CSS variables in `globals.css` | `lib/shared/tokens/app_tokens.dart` → `AppColors` class | `packages/ui-tokens/tokens.json` |
| **Typography** | Tailwind classes (Inter font) | `AppTypography` (Inter via google_fonts) | `packages/ui-tokens` |
| **Spacing** | Tailwind spacing (4px base) | `AppSpacing` (4px base) | `packages/ui-tokens` |
| **Types** | `packages/shared/src/types/` | `lib/shared/data/mock_data.dart` (Dart maps) | `packages/shared` |
| **Mock Data** | `packages/shared/src/data/` | `lib/shared/data/mock_data.dart` | `packages/shared` |
| **Constants** | `packages/shared/src/constants/` | `lib/shared/constants/app_constants.dart` | `packages/shared` |
| **Database** | `packages/database/src/schema.sql` | Same SQL (Supabase Flutter SDK) | `packages/database` |
| **Screens** | 15 React screens (TSX) | 15 Dart screens (mirrors) | Visual parity enforced |
| **Navigation** | Zustand store (role-based) | Riverpod + GoRouter (role-based) | Same 4 roles, same nav items |

## Role-Based Access

| Role | App | Screens |
|------|-----|---------|
| **Afisa Trafiki** | PWA (mobile) | Home, Trafiki, Patroli, Arifa, Akaunti + Vehicle Search, Citation, PF3, History, Inspection, Accident Report |
| **Afisa Polisi** | PWA (mobile) | Home (citizen search), Polisi, Patroli, Arifa, Akaunti + Citizen Search Results |
| **Admin** | Web (desktop) | Watumiaji, Vituo, Posti, Mgao, Mipangilio |
| **Kamanda** | Web (desktop) | Dashboard, Maofisa, Matukio, Citations, Patroli, Arifa, Ripoti, Watumiaji, Vituo, Posti, Mgao, Mipangilio |

## Database Schema (15 Tables)

```
users → officers → assignments → stations → posts
  │         │           │
  │         │           └── assignments.officer_id → officers.id
  │         │
  │         ├── citations (officer_id)
  │         ├── incidents (assigned_officer_id)
  │         ├── patrols (officer_id)
  │         ├── pf3_forms (officer_id)
  │         └── vehicle_inspections (officer_id)

vehicles → citations (vehicle_id)
drivers → citations (driver_id)
citizens → (standalone, linked by NIDA/mobile)
alerts → (sent_by → users.id)
```

All tables have: UUID primary keys, created_at/updated_at timestamps, RLS enabled, and proper indexes.
