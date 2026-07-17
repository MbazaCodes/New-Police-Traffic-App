# Local Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ LTS | https://nodejs.org |
| Bun (optional, faster) | latest | `powershell -c "irm bun.sh/install.ps1 \| iex"` |
| Flutter SDK | 3.27+ | https://flutter.dev/docs/get-started/install/windows |
| Git | any | https://git-scm.com |

---

## 1. Clone the repo

```powershell
git clone https://github.com/MbazaCodes/New-Police-Traffic-App.git
cd New-Police-Traffic-App
```

---

## 2. Next.js PWA (Web + Admin + Command Center)

```powershell
# From repo root

copy .env.example .env

bun install
bun dev

# OR with npm:
npm install
npm run dev
```

Open **http://localhost:3000**

### Login roles (mock — no password needed)

| Role | What you see |
|------|-------------|
| `officer-traffic` | Officer PWA — citations, vehicle search, PF3, accident report |
| `officer-general` | Officer PWA — citizen search, patrols, alerts |
| `admin` | Admin panel — users, stations, posts, assignments, settings |
| `commander` | Command Center — live map, dispatch, SOS, radio log |

---

## 3. Flutter Officer Mobile App

### Prerequisites
```powershell
# Check Flutter is installed
flutter doctor
```

If Flutter is missing:
```powershell
winget install Google.Flutter
# Restart PowerShell after install
```

### Run the app
```powershell
cd apps\officer-mobile

flutter pub get

flutter devices                  # see connected devices

flutter run                      # auto-select device
flutter run -d chrome            # run in browser
flutter run -d windows           # Windows desktop app
flutter run -d emulator-5554     # Android emulator (if running)
```

### Build for release
```powershell
# Android APK
flutter build apk --release
# Output: apps\officer-mobile\build\app\outputs\flutter-apk\app-release.apk

# Windows desktop
flutter build windows
# Output: apps\officer-mobile\build\windows\x64\runner\Release\
```

---

## 4. Quick automated setup

```powershell
# From repo root — interactive menu
.\scripts\setup-all.ps1

# Or individual platform:
.\scripts\setup-web.ps1
.\scripts\setup-flutter.ps1
```

---

## Project structure at a glance

```
New-Police-Traffic-App/
├── src/                    # Next.js app (PWA + Admin)
│   ├── app/               # Routes + API endpoints
│   ├── components/
│   │   ├── police/        # Officer PWA (14 screens)
│   │   └── admin/         # Admin + Command Center (13 screens)
│   ├── store/             # Zustand state
│   └── lib/               # Mock data (police-data, admin-data)
│
├── apps/
│   └── officer-mobile/    # Flutter app
│       └── lib/
│           ├── screens/   # 12 Flutter screens
│           ├── providers/ # Riverpod state
│           ├── widgets/   # Shared widgets
│           └── shared/    # Design tokens + mock data
│
├── packages/
│   ├── shared/            # TypeScript shared types
│   ├── ui-tokens/         # Design tokens
│   └── database/          # Supabase SQL schema
│
├── prisma/schema.prisma   # Full DB schema (12 models)
├── scripts/               # Setup PowerShell scripts
├── .env.example           # Environment template
└── SETUP.md               # This file
```

---

## API endpoints (all mock, Supabase-ready)

```
GET  /api/officers          List officers
POST /api/officers          Create officer
GET  /api/citations         List citations
POST /api/citations         Create citation
GET  /api/incidents         List incidents
GET  /api/incidents?live=true  Live incidents only
POST /api/incidents         Create incident
GET  /api/patrols           List patrols
POST /api/patrols           Create patrol
GET  /api/alerts            List alerts
GET  /api/search?q=T123ABC&type=plate   Vehicle/citizen search
GET  /api/download          Download project ZIP
```

---

## Environment variables

Copy `.env.example` to `.env`. For mock/dev mode, defaults are fine — no changes needed.

When you're ready for Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Common issues

**`bun` not recognized**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
# Close and reopen PowerShell
```

**`flutter` not recognized**
```powershell
winget install Google.Flutter
# Close and reopen PowerShell
flutter doctor
```

**`npm install` fails on Windows**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install --legacy-peer-deps
```

**Flutter `pub get` fails**
```powershell
flutter clean
flutter pub cache repair
flutter pub get
```
