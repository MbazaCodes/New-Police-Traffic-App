# Row Level Security (RLS) Policies

This document describes the planned PostgreSQL Row Level Security
policies for the Tanzania Police Digital Platform. RLS is currently
**NOT enabled** — data scoping is enforced in the application layer
via `applyScopeToQuery`. This document is the design spec for a
future migration that will enable RLS as defense-in-depth.

## 1. Why RLS?

Currently, if a bug in the application layer (e.g. a route handler that
forgets to call `applyScopeToQuery`) allows an officer to query data
outside their scope, the database will happily return it. RLS provides
a second layer of protection: even if the app layer fails, the
database itself refuses to return rows the user shouldn't see.

RLS is especially valuable for:

- **Multi-tenant queries** — a single `SELECT * FROM citations` cannot
  leak cross-station data even if the WHERE clause is missing.
- **Defense-in-depth** — auditors and pentesters love it.
- **Future direct-DB access** — if we ever allow BI tools (Metabase,
  Superset) to query the DB directly with per-user credentials, RLS
  enforces scoping without app-layer involvement.

## 2. Roles

RLS uses database roles, not application roles. We will create:

- `police_app` — the application user (current).
- `police_officer` — role assumed for officer sessions.
- `police_commander` — role assumed for commander sessions.
- `police_admin` — role assumed for admin sessions.
- `police_readonly` — role for BI / reporting tools.

The application will `SET ROLE` after authenticating the user, based
on their RBAC role. The role is reset at the end of the request.

## 3. Session variables

Each request sets a session variable with the user's scope:

```sql
SET LOCAL app.user_id = '...';
SET LOCAL app.station_id = '...';
SET LOCAL app.region = '...';
SET LOCAL app.role = 'TRAFFIC_OFFICER';
```

RLS policies read these via `current_setting('app.user_id')`.

## 4. Policy examples

### citations table

```sql
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- Officers can see citations they issued OR citations in their station
CREATE POLICY citations_officer_select ON citations
  FOR SELECT TO police_officer
  USING (
    officer_id::text = current_setting('app.user_id')
    OR station_id::text = current_setting('app.station_id')
  );

-- Officers can insert citations only for themselves
CREATE POLICY citations_officer_insert ON citations
  FOR INSERT TO police_officer
  WITH CHECK (officer_id::text = current_setting('app.user_id'));

-- Commanders can see all citations in their region
CREATE POLICY citations_commander_select ON citations
  FOR SELECT TO police_commander
  USING (
    EXISTS (
      SELECT 1 FROM stations s
      WHERE s.id = citations.station_id
        AND s.region = current_setting('app.region')
    )
  );

-- Admins see everything
CREATE POLICY citations_admin_all ON citations
  FOR ALL TO police_admin
  USING (true) WITH CHECK (true);
```

### audit_logs table

Audit logs are append-only — officers can insert but never read others'
logs; admins can read everything.

```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_officer_insert ON audit_logs
  FOR INSERT TO police_officer
  WITH CHECK (user_id::text = current_setting('app.user_id'));

CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT TO police_admin
  USING (true);

-- Officers cannot SELECT from audit_logs at all (no policy = deny)
```

### users table

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Officers can see their own row
CREATE POLICY users_officer_self ON users
  FOR SELECT TO police_officer
  USING (id::text = current_setting('app.user_id'));

-- Officers can update their own row (e.g. change password)
CREATE POLICY users_officer_update_self ON users
  FOR UPDATE TO police_officer
  USING (id::text = current_setting('app.user_id'))
  WITH CHECK (id::text = current_setting('app.user_id'));

-- Admins see all users in their station
CREATE POLICY users_admin_station ON users
  FOR SELECT TO police_admin
  USING (station_id::text = current_setting('app.station_id'));

-- Super admins see everything
CREATE POLICY users_super_admin_all ON users
  FOR ALL TO police_super_admin
  USING (true) WITH CHECK (true);
```

## 5. Migration plan

Enabling RLS is a breaking change — it must be done carefully.

1. **Phase 1 (current)** — Application-layer scoping via
   `applyScopeToQuery`. No RLS.
2. **Phase 2** — Create the database roles and session-variable setters
   in code, but don't enable RLS yet. Verify the `SET ROLE` /
   `SET LOCAL` calls work end-to-end.
3. **Phase 3** — Enable RLS in staging only. Run the full test suite
   against staging. Fix any policies that are too restrictive.
4. **Phase 4** — Enable RLS in production during a maintenance window.
   Have a rollback plan ready (a single `ALTER TABLE ... DISABLE ROW
   LEVEL SECURITY` per table).
5. **Phase 5** — Monitor for 30 days. If no issues, document the
   migration as complete.

## 6. Performance considerations

RLS adds a check to every query. For simple policies (equality on an
indexed column), the overhead is negligible (<1%). For policies with
subqueries (e.g. the commander policy above), the overhead can be
significant on large tables.

Mitigations:

- Add indexes on the columns used in policies (e.g. `citations.station_id`).
- Cache the `stations.region` lookup in a materialized view if it
  becomes a bottleneck.
- Use `EXPLAIN ANALYZE` on representative queries to verify the policy
  is using the index.

## 7. Testing RLS

Test policies by connecting as each role and running queries:

```sql
-- As police_officer with station_id = 'A'
SET ROLE police_officer;
SET LOCAL app.user_id = 'officer-1';
SET LOCAL app.station_id = 'station-A';

SELECT count(*) FROM citations;
-- Should return only citations in station-A

-- As police_admin with station_id = 'A'
SET ROLE police_admin;
SET LOCAL app.station_id = 'station-A';

SELECT count(*) FROM citations;
-- Should return only citations in station-A
```

These tests will be added to `tests/integration/db/rls.test.ts` as
part of Phase 3.

## 8. Limitations

- RLS does not apply to table owners (the `postgres` superuser). The
  application user must NOT be the table owner — use a separate
  `police_app` user with limited privileges.
- RLS does not prevent `TRUNCATE`. Revoke `TRUNCATE` from `police_app`.
- RLS does not prevent side-channel attacks (e.g. `EXISTS` queries
  that reveal row existence via timing). For high-sensitivity data,
  consider additional application-layer checks.
