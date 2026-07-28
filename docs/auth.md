# Authentication

This document describes how authentication works in the Tanzania Police
Digital Platform — the NextAuth setup, the credentials provider, the OTP
flow, session management, and how route handlers enforce auth.

## 1. NextAuth configuration

NextAuth is configured in `src/lib/auth.ts`. It uses the credentials
provider, which validates username/password (or badge/phone) against the
`users` table in PostgreSQL. The JWT strategy is used (not database
sessions) so the server can scale horizontally without sharing session
state.

```ts
// src/lib/auth.ts (excerpt)
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: { identifier: {}, password: {} },
      async authorize(creds) {
        // 1. Look up user by badge_no / phone / email / id_number
        // 2. Verify password hash (bcrypt)
        // 3. Return { id, role, name, ... } or null
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt:   ({ token, user }) => { /* attach role, station_id, region */ },
    session: ({ session, token }) => { /* expose role on session.user */ },
  },
};
```

## 2. OTP flow

For citizen accounts that opt into OTP verification, the flow is:

1. Citizen enters phone number on `/citizen/login`.
2. `POST /api/auth/otp/send` generates a 6-digit code, stores it hashed
   in the `otp_codes` table with a 5-minute expiry, and sends it via SMS.
3. Citizen enters the code. `POST /api/auth/otp/verify` validates it and
   issues a NextAuth JWT cookie.
4. Subsequent citizen API calls use `withAuthAny` which reads the session
   from the cookie.

OTP codes are single-use. After 3 failed attempts the phone number is
locked out for 15 minutes.

## 3. Session management

Sessions are JWT-based. The cookie is `next-auth.session-token` (or
`__Secure-next-auth.session-token` in production). The token contains:

- `sub` — user ID
- `role` — RBAC role (e.g. `TRAFFIC_OFFICER`, `ADMIN`)
- `stationId` — officer's station (for data scoping)
- `region` — officer's region (for data scoping)
- `exp` — 30-day expiry (configurable via `NEXTAUTH_SECRET`)

The client-side Zustand store (`usePoliceStore`) mirrors the auth state
for the shell UI, but the server-side source of truth is always the JWT
cookie. On page reload, Zustand is empty until `/api/auth/session` is
fetched and the role is restored.

## 4. Route handler auth

Every API route handler must use `withAuth` or `withAuthAny` from
`@/lib/api-guard`. Direct calls to `getServerSession` in route handlers
are forbidden outside of `police/me/route.ts` (which has a multi-fallback
auth strategy for legacy clients).

```ts
// Correct
export const GET = withAuth("citations", "view", async ({ db, session }) => {
  const { data } = await db.from("citations").select("*");
  return { ok: true, data };
});

// Also correct — any authenticated user, no RBAC check
export const POST = withAuthAny(async ({ body, db }) => {
  // ...
}, { skipAudit: true });
```

The wrapper handles 401 (no session), 403 (RBAC denied), 500 (handler
throw), and audit logging. Handlers receive a typed context and return
a `HandlerResult` that the wrapper normalizes to a NextResponse.

## 5. Data scoping

Once authenticated, the user's role and station determine what data they
can see. `applyScopeToQuery` from `@/lib/data-scope.ts` modifies a
Supabase-style query builder to filter rows:

- `TRAFFIC_OFFICER` / `POST_OFFICER` — only rows in their station
- `REGIONAL_COMMANDER` / `REGIONAL_CLERK` — only rows in their region
- `ADMIN`, `SUPER_ADMIN`, `SYSTEM_ADMIN` — all rows
- `VIEWER` — read-only on assigned scope

This is enforced in the GET handlers for arrests, citations, incidents,
stations, officers, and others. POST/UPDATE handlers implicitly inherit
the scope via the session.

## 6. Password storage

Passwords are hashed with bcrypt (10 rounds). The hash is stored in the
`users.password_hash` column. Plaintext passwords are NEVER logged, NEVER
sent to the client, and NEVER included in audit logs.

Password reset is currently manual (admin resets via SQL). A self-service
reset flow is planned but not yet implemented.
