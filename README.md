# TZ Police Digital Platform

Tanzania Police Force digital operations platform — Officer PWA + Flutter Mobile App + Admin/Command Center Web.

> **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Recharts · shadcn/ui
> **Mobile:** Flutter (Dart) · Officer App
> **Backend (future):** Supabase · PostgreSQL · Prisma

---

## Quick Start

```powershell
# 1. Clone
git clone https://github.com/MbazaCodes/New-Police-Traffic-App.git
cd New-Police-Traffic-App

# 2. Install dependencies
bun install

# 3. Copy env file
copy .env.example .env

# 4. Run dev server
bun dev
```

Open http://localhost:3000

---

## Roles and Access

| Role | Portal | Description |
|------|--------|-------------|
| officer-traffic | Officer PWA | Citations, vehicle search, PF3, accident reports |
| officer-general | Officer PWA | Citizen search, patrols, alerts |
| admin | Admin Web | Users, stations, posts, assignments, settings |
| commander | Command Center | Live map, dispatch, radio, all admin screens |

Login: Select any role on the login screen — no password needed in dev/mock mode.

---

## Flutter Setup

```bash
cd apps/officer-mobile
flutter pub get
flutter run
```

---

## API Routes (Mock, ready for Supabase swap)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| /api/officers | GET POST | Officer list + create |
| /api/citations | GET POST | Citations list + create |
| /api/incidents | GET POST | Incidents list + create |
| /api/patrols | GET POST | Patrols list + create |
| /api/alerts | GET | Alerts list |
| /api/search | GET | Vehicle plate / NIDA / citizen lookup |
| /api/download | GET | Download project ZIP |

---

## Roadmap

- [x] Officer PWA (14 screens)
- [x] Admin Web (12 screens)
- [x] Command Center (live map, dispatch, SOS, radio)
- [x] Flutter app (shared tokens, all screens)
- [x] PWA manifest + service worker
- [x] Mock API routes (officers, citations, incidents, patrols, alerts, search)
- [x] Full Prisma/PostgreSQL schema
- [ ] Supabase auth
- [ ] Real-time patrol tracking
- [ ] RLS policies
- [ ] Push notifications
- [ ] CI/CD

---

Built by MbazaCodes — Usalama Wetu, Jukumu Letu.
