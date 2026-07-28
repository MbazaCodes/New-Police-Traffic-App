# Database Migrations

This document describes how database migrations work in the Tanzania
Police Digital Platform — the file layout, how to apply them, how to
write new ones, and how to roll back.

## 1. File layout

Migrations live in `packages/database/migrations/`. Each migration is
a numbered SQL file:

```
packages/database/migrations/
├── 001_initial_schema.sql
├── 002_add_citizen_points.sql
├── 003_add_otp_codes.sql
├── 004_add_audit_logs.sql
├── 005_add_pf3_forms.sql
└── ...
```

The numeric prefix determines order. Migrations are applied in
ascending order — never rename or renumber an applied migration.

## 2. The _migrations table

The migration script tracks applied migrations in a `_migrations` table:

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id          SERIAL PRIMARY KEY,
  filename    VARCHAR(255) UNIQUE NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by  VARCHAR(100) NOT NULL
);
```

Before applying a migration, the script checks if its filename is
already in `_migrations`. If yes, it skips it. If no, it applies the
SQL and inserts a row.

## 3. Applying migrations

```bash
npm run db:migrate
```

This runs `scripts/db-migrate.sh`, which:

1. Reads `DATABASE_URL` (or `DB_*` env vars).
2. Connects to PostgreSQL.
3. Lists all `*.sql` files in `packages/database/migrations/`.
4. For each file not in `_migrations`, applies it in a transaction.
5. On success, inserts a row in `_migrations`.
6. On failure, rolls back the transaction and aborts.

The script is idempotent — running it multiple times only applies
migrations that haven't been applied yet.

## 4. Writing a new migration

Create a new file with the next available number:

```bash
touch packages/database/migrations/006_add_vehicle_ownership.sql
```

Write the SQL:

```sql
-- 006_add_vehicle_ownership.sql
-- Adds the vehicle_ownerships table linking vehicles to citizens.

CREATE TABLE IF NOT EXISTS vehicle_ownerships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  citizen_id   UUID REFERENCES citizens(id),
  owner_name   VARCHAR(255),
  owner_phone  VARCHAR(20),
  start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_ownerships_vehicle_id ON vehicle_ownerships(vehicle_id);
CREATE INDEX idx_vehicle_ownerships_citizen_id ON vehicle_ownerships(citizen_id);
```

Guidelines:

- Always use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
  so the migration is idempotent.
- Always include `created_at` and `updated_at` columns.
- Always create indexes for foreign keys.
- Add a comment at the top explaining what the migration does.
- One logical change per migration — don't bundle unrelated changes.
- Never drop a column in the same migration that adds it. Split into
  two migrations: one to add, one (later) to drop after the code is
  updated.

## 5. Testing migrations locally

Before pushing a migration:

```bash
# Apply to a local test database
psql postgresql://localhost/test_police -f packages/database/migrations/006_add_vehicle_ownership.sql

# Verify
psql postgresql://localhost/test_police -c "\d vehicle_ownerships"

# Roll back (manually)
psql postgresql://localhost/test_police -c "DROP TABLE vehicle_ownerships;"
```

Then run the full app locally to verify the migration doesn't break
anything.

## 6. Rolling back

There is no automatic rollback. If a migration is bad:

1. Write a new migration (e.g. `007_revert_vehicle_ownership.sql`) that
   reverses the change.
2. Apply it via `npm run db:migrate`.
3. Mark the bad migration as reverted in `_migrations` (manually, with
   a comment).

Never `DELETE FROM _migrations` to make a migration re-apply — this
leads to inconsistent state. Always move forward with a new migration.

## 7. CI integration

The CI workflow applies migrations to a throwaway PostgreSQL container
before running tests. This catches migration failures before they hit
production.

If a migration fails in CI:

- The build is marked as failed.
- The PR cannot merge.
- The migration author must fix the SQL and force-push.

## 8. Production migrations

For production, migrations are applied manually by the deployer:

```bash
ssh deploy@<vps-ip>
cd /home/deploy/apps/police-app
git pull origin main
npm run db:migrate
npm run build
pm2 reload police-app
```

Always backup the database before applying migrations in production:

```bash
pg_dump police_traffic | gzip > /tmp/pre-migration-$(date +%Y%m%d%H%M).sql.gz
```

## 9. Long-running migrations

Migrations that touch large tables (e.g. adding a column with a default
to a 10M-row table) can lock the table for minutes. For these:

1. Use `SET lock_timeout = '3s';` at the top of the migration so it
   fails fast instead of queuing.
2. Split into multiple migrations: add the column nullable, backfill
   in batches, set the default, set NOT NULL.
3. Test on a staging database with production-sized data first.

## 10. Schema drift

If the production schema drifts from the migrations (e.g. someone
manually ran SQL on the VPS), the `_migrations` table will be out of
sync. To detect this, run `scripts/db-schema-diff.sh` periodically —
it diffs the live schema against a fresh migration-applied schema and
reports differences.

Investigate any diff before applying new migrations — drift can hide
data loss.
