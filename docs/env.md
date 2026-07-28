# Environment Variables

This document lists every environment variable used by the Tanzania Police
Digital Platform. Copy `.env.example` to `.env.local` and fill in the
values. Never commit `.env.local` — it is gitignored by default.

## 1. Required for development

| Variable              | Example                          | Purpose                            |
|-----------------------|----------------------------------|------------------------------------|
| `DATABASE_URL`        | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string  |
| `NEXTAUTH_SECRET`     | (32+ random chars)               | JWT signing secret                 |
| `NEXTAUTH_URL`        | `http://localhost:3000`          | NextAuth base URL                  |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000`          | Public app URL for client-side     |

## 2. Database (VPS)

| Variable              | Example             | Purpose                                  |
|-----------------------|---------------------|------------------------------------------|
| `DB_HOST`             | `104.152.50.173`    | PostgreSQL host (VPS)                    |
| `DB_PORT`             | `5432`              | PostgreSQL port                          |
| `DB_NAME`             | `police_traffic`    | Database name                            |
| `DB_USER`             | `police_app`        | Application user (limited privileges)    |
| `DB_PASSWORD`         | (strong password)   | Application user password                |
| `DB_SSL`              | `false`             | Enable SSL (true in production)          |

The app uses `DATABASE_URL` if set, otherwise falls back to the discrete
`DB_*` variables. See `src/lib/db/client.ts` for the resolution logic.

## 3. Authentication

| Variable              | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `NEXTAUTH_SECRET`     | JWT signing secret (required)                 |
| `NEXTAUTH_URL`        | Canonical app URL for callbacks               |
| `OTP_TTL_MINUTES`     | OTP code expiry (default: 5)                  |
| `OTP_MAX_ATTEMPTS`    | Max OTP attempts before lockout (default: 3)  |
| `OTP_LOCKOUT_MINUTES` | Lockout duration after max attempts (default: 15) |

## 4. SMS / Notifications (optional)

| Variable              | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `SMS_PROVIDER`        | `africastalking` or `twilio` (default: none)  |
| `SMS_API_KEY`         | Provider API key                              |
| `SMS_SENDER_ID`       | Sender ID (max 11 chars)                      |
| `SMS_SANDBOX`         | `true` to log messages instead of sending     |

When `SMS_PROVIDER` is unset, OTP messages are logged to the console and
the audit log — useful for local development.

## 5. File storage (optional)

| Variable              | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `UPLOAD_DIR`          | Local upload directory (default: `./uploads`) |
| `MAX_UPLOAD_MB`       | Max file size (default: 10)                   |

A future migration to S3-compatible storage (MinIO, Backblaze B2) is
planned but not yet implemented. For now, files are stored on the VPS
disk under `UPLOAD_DIR`.

## 6. Feature flags

| Variable              | Default | Purpose                                       |
|-----------------------|---------|-----------------------------------------------|
| `FEATURE_CITIZEN_PWA` | `true`  | Enable citizen PWA install prompt             |
| `FEATURE_OFFICER_PWA` | `true`  | Enable officer PWA install prompt             |
| `FEATURE_OTP_LOGIN`   | `true`  | Enable OTP login for citizens                 |
| `FEATURE_DEBUG_PANEL` | `false` | Show debug panel in dev mode                  |

## 7. CI / build

| Variable              | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `NODE_ENV`            | `production` / `development` / `test`         |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (optional, error tracking)      |

The CI workflows do not require any of these — they run `tsc`, `eslint`,
`vitest`, and `next build` with empty env vars (the test setup stubs
them in `tests/utils/setup.ts`).

## 8. Production checklist

Before deploying to production:

- [ ] `DATABASE_URL` points to the production PostgreSQL instance
- [ ] `NEXTAUTH_SECRET` is a fresh 32+ char random string
- [ ] `NEXTAUTH_URL` matches the production domain
- [ ] `DB_SSL=true` (or behind a private network)
- [ ] `SMS_PROVIDER` is set if OTP login is enabled
- [ ] `UPLOAD_DIR` is on a persistent volume with adequate disk space
- [ ] `FEATURE_DEBUG_PANEL=false`
- [ ] `NODE_ENV=production`

Never reuse development secrets in production. Rotate `NEXTAUTH_SECRET`
periodically (every 90 days) — rotating it invalidates all active sessions.
