# Tanzania Police Force — Digital Operations Platform

**Stack:** Next.js 16 · TypeScript · PostgreSQL (VPS) · Tailwind CSS · PM2 · Ubuntu VPS

## Architecture

```
src/                          ← Single Next.js app (main)
├── app/                      ← App Router pages
│   ├── admin/                ← System admin
│   ├── command/              ← National/Regional/District/Station commanders
│   ├── officer/              ← Traffic/General/Post officers
│   ├── cid/                  ← CID & investigators
│   ├── clerk/                ← Clerks
│   ├── citizen/              ← Citizen portal (PWA)
│   └── api/                  ← API routes
├── components/               ← UI components
│   ├── admin/                ← Admin screens
│   ├── citizen/              ← Citizen portal
│   ├── police/               ← Officer screens
│   └── role/                 ← Role-specific shells
├── lib/                      ← Auth, RBAC, DB, data-scope
└── store/                    ← Zustand stores

database/
├── migrations/               ← Ordered SQL migrations (000000...XX)
└── seeds/                    ← Seed data

public/                       ← Static assets + PWA files
├── manifest.json             ← PWA manifest
└── sw.js                     ← Service worker
```

## Roles & Access

| Role | Badge Format | Dashboard |
|------|-------------|-----------|
| IGP / DIG | IGP-001 | /command/national |
| Regional CP | CP-DSM-001 | /command/regional |
| District DSP | SP-ILA-001 | /command/district |
| Station OCS | OCS-ILA-001 | /command/station |
| Traffic Officer | TP-DSM-001 | /officer/traffic |
| General Officer | GP-DSM-001 | /officer/general |
| Post Officer | PO-DSM-001 | /officer/post |
| CID Officer | CID-DSM-001 | /cid/home |
| Clerk | CLK-NAT-001 | /clerk/records |
| Admin | ADM-001 | /admin/dashboard |
| Citizen | Phone/NIDA | /citizen/dashboard |

## Deploy

```bash
# VPS
git pull origin main && rm -rf .next && npm run build && pm2 restart all

# Run migrations
sudo -u postgres psql -d police_platform -f database/migrations/00000000000036_fix_varchar_lengths.sql
```

## PWA Install

- **Officers:** Visit `http://104.152.50.173` → Install TPDOP
- **Citizens:** Visit `http://104.152.50.173/citizen` → Install TPDOP Raia
