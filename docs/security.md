# Security Audit Checklist

This document defines the security baseline for the Tanzania Police
Digital Platform. It is enforced both at code-review time and via the
automated `security-audit.yml` GitHub Actions workflow that runs daily.

## 1. Authentication & sessions

- [ ] All API routes use `withAuth` or `withAuthAny` — no direct `getServerSession` calls except in `police/me/route.ts` (legacy multi-fallback).
- [ ] JWT secret (`NEXTAUTH_SECRET`) is at least 32 characters and stored in env, never in code.
- [ ] Session cookie is `httpOnly`, `secure` in production, `SameSite=Lax`.
- [ ] Session expiry is 30 days max (configurable down to 1 day for high-security roles).
- [ ] Passwords hashed with bcrypt (10 rounds minimum).
- [ ] OTP codes are 6 digits, hashed at rest, single-use, expire in 5 minutes.
- [ ] OTP lockout after 3 failed attempts, 15-minute cooldown.

## 2. Authorization (RBAC)

- [ ] Every mutating route (`POST`/`PATCH`/`DELETE`) declares a resource + action via `withAuth("resource", "action", ...)`.
- [ ] Read routes (`GET`) declare `withAuth("resource", "view", ...)`.
- [ ] `withAuthAny` is only used for endpoints that any authenticated user may call (e.g. activity-log ingestion).
- [ ] Data scope (`applyScopeToQuery`) is applied to every list endpoint that returns user-specific data.
- [ ] Role escalation is impossible: a user cannot promote themselves or another user to a higher role.

## 3. Input validation

- [ ] All request bodies are validated with zod schemas or explicit type checks.
- [ ] SQL parameters are always parameterized — never string-concatenated.
- [ ] File uploads are size-limited (`MAX_UPLOAD_MB`, default 10) and type-checked.
- [ ] URL query params are parsed with `searchParams.get(...)` and validated before use.
- [ ] No `eval`, `Function()` constructor, or `dangerouslySetInnerHTML` with untrusted input.

## 4. Secrets management

- [ ] No secrets in source code (the `gitleaks` scan enforces this).
- [ ] `.env.local` is gitignored.
- [ ] CI secrets are scoped to the minimum required repositories.
- [ ] Production secrets are rotated at least every 90 days.
- [ ] Database credentials use a dedicated app user with limited privileges (not the superuser).

## 5. Audit logging

- [ ] Every mutating action is logged via `logAction` (the `withAuth` wrapper does this automatically).
- [ ] Audit logs include: user ID, role, action, resource, target ID, timestamp, IP address.
- [ ] Audit logs are append-only — no `UPDATE` or `DELETE` on the `audit_logs` table.
- [ ] Audit log retention is at least 1 year (configurable).

## 6. Transport security

- [ ] Production is HTTPS-only (HSTS enabled).
- [ ] Internal API calls use `http://` only on localhost; production uses `https://`.
- [ ] WebSocket connections (`wss://`) validate the Origin header.
- [ ] CORS is restricted to known origins (no `*`).

## 7. Dependency security

- [ ] `npm audit` runs daily via CI; high+ vulnerabilities block the build.
- [ ] Dependencies are pinned in `package-lock.json` (no `^` ranges in production deps).
- [ ] Renovate/Dependabot PRs are reviewed within 7 days.
- [ ] No `postinstall` scripts from untrusted packages (npm 7+ `--ignore-scripts` recommended).

## 8. PWA security

- [ ] Service worker (`citizen-sw.js`, `police-sw.js`) is served over HTTPS.
- [ ] Service worker scope is restricted (e.g. `/citizen/`).
- [ ] No sensitive data is cached in `localStorage` — only non-sensitive UI prefs.
- [ ] Tokens in `sessionStorage` are cleared on logout.

## 9. Database security

- [ ] PostgreSQL is behind a firewall (only the app server can reach port 5432).
- [ ] App user has `SELECT, INSERT, UPDATE, DELETE` on application tables only — no DDL.
- [ ] `audit_logs` table has `REVOKE UPDATE, DELETE FROM police_app`.
- [ ] Backups are encrypted at rest and tested monthly.

## 10. Incident response

- [ ] On suspected breach: rotate `NEXTAUTH_SECRET` (invalidates all sessions), rotate DB password, review audit logs for the affected window.
- [ ] Notify the system admin via the emergency contact in `docs/env.md`.
- [ ] File a post-mortem within 7 days documenting the root cause and remediation.
