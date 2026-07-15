# TZ Police Digital Platform — Officer PWA

**Tanzania Police Force** digital platform for field officers.
*Usalama Wetu, Jukumu Letu* (Our Safety, Our Responsibility)

A pixel-perfect Next.js PWA implementation built directly from the supplied UI mockup images.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (New York) + Lucide icons |
| State Management | Zustand (client-side navigation & auth state) |
| Server State | TanStack Query (available) |
| Icons | lucide-react |
| Fonts | Geist Sans / Geist Mono |

---

## Screens Implemented

All 9 screens from the supplied UI image pack:

| # | Screen | Source Image | Description |
|---|--------|-------------|-------------|
| 1 | Login | `01-login.png` | Officer authentication with TPF branding |
| 2 | Home | `02-home.png` | Dashboard with stats, quick actions, quick search |
| 3 | Search Results | `03-search.png` | Vehicle/driver lookup results with violations |
| 4 | Traffic | `05-traffic.png` | Traffic offenses dashboard & quick actions |
| 5 | Patrol | `06-patrol.png` | Patrol start card & patrol report form |
| 6 | Alerts | `07-alerts.png` | Notifications & announcements feed |
| 7 | Profile | `08-profile.png` | Officer profile, dashboard stats, settings |
| 8 | Accident Report | `09-accident-report.png` | Multi-section accident report form |
| 9 | Vehicle Inspection | `11-vehicle-inspection.png` | Vehicle inspection checklist |

The police emblem (`POLICE LOGO.png`) is used throughout — **no logo was generated**.

---

## Design System

Extracted directly from the UI images:

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1A237E` / `#002B5C` | Titles, headers |
| Blue | `#2196F3` / `#0070C0` / `#3B82F6` | Primary actions, active states |
| Blue Gradient | `#1E3A8A → #3B82F6` | Home header |
| Blue Gradient | `#2196F3 → #1976D2` | Patrol hero card |
| Green | `#4CAF50` / `#10B981` | Success / paid status |
| Orange | `#FF9800` / `#F97316` | Pending / warning |
| Red | `#F44336` / `#EF4444` | Danger / unpaid |
| Purple | `#9C27B0` / `#8B5CF6` | Accent |
| Gray Text | `#757575` / `#6B7280` | Body text |
| Light Gray BG | `#F5F5F5` / `#F9FAFB` | Screen background |
| Border Radius | `12px` (cards/inputs), `16px` (banners) | Consistent throughout |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Entry — renders MobileShell
│   └── globals.css         # Tailwind + theme tokens
├── components/
│   └── police/
│       ├── mobile-shell.tsx        # Phone frame + screen router
│       ├── status-bar.tsx          # iOS-style status bar
│       ├── bottom-nav.tsx          # 5-tab bottom navigation
│       ├── top-app-bar.tsx         # Reusable top app bar
│       ├── police-icons.tsx        # Icon name → Lucide mapper
│       └── screens/
│           ├── login-screen.tsx
│           ├── home-screen.tsx
│           ├── search-results-screen.tsx
│           ├── traffic-screen.tsx
│           ├── patrol-screen.tsx
│           ├── alerts-screen.tsx
│           ├── profile-screen.tsx
│           ├── accident-report-screen.tsx
│           └── vehicle-inspection-screen.tsx
├── lib/
│   ├── police-data.ts      # Types + mock data from UI images
│   └── utils.ts
└── store/
    └── police-store.ts     # Zustand store (auth + navigation)

public/
└── police-logo.png         # TPF emblem (from upload)
```

---

## Navigation Model

The app uses a **single `/` route** with client-side screen state managed by Zustand:

- **Bottom Nav (5 tabs):** Nyumbani (Home) · Trafiki (Traffic) · Patroli (Patrol) · Arifa (Alerts) · Akaunti (Account)
- **Pushed screens** (no bottom nav, with back button): Search Results, Accident Report, Vehicle Inspection
- **Auth gate:** Login screen shown until `isAuthenticated` is set

---

## Build Instructions

### Prerequisites
- Node.js 18+ (or Bun)
- The project is already initialized with all dependencies installed.

### Development
```bash
bun run dev      # Start dev server on http://localhost:3000
bun run lint     # Run ESLint
```

### Production Build
```bash
bun run build    # Create production build
bun run start    # Start production server
```

### Database (if needed)
```bash
bun run db:push  # Push Prisma schema to SQLite
```

---

## Deployment Instructions

### Vercel (Recommended)
1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. No environment variables required (uses in-memory mock data).
5. Deploy — Vercel handles the build with `next build`.

### Self-Hosted (Docker)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### PWA Notes
This implementation is structured as a PWA-ready app. To enable full PWA (installable, offline):
1. Add a `manifest.json` to `/public`.
2. Add service worker via `next-pwa` or a custom worker.
3. Configure icons using `/public/police-logo.png`.

---

## Notes

- **Flutter (officer-mobile):** The supplied prompt requested both a Flutter app and a Next.js PWA. This environment is Next.js-only, so only the **officer-pwa** (Next.js) application was built. The Flutter app would require a separate Flutter/Dart toolchain.
- **Swahili language:** All UI text is in Swahili (Kiswahili), matching the supplied images exactly.
- **Mock data:** All data is static mock data extracted from the UI images — no backend API calls.

---

© 2026 Tanzania Police Force. *Mfumo salama wa Jeshi la Polisi Tanzania.*
