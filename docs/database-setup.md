# Database Setup (VPS)

This guide walks through provisioning PostgreSQL on a fresh VPS for the
Tanzania Police Digital Platform. It assumes a Debian/Ubuntu-based VPS
with root access.

## 1. Install PostgreSQL

```bash
ssh root@<vps-ip>
apt update && apt install -y postgresql postgresql-contrib
systemctl enable --now postgresql
```

PostgreSQL 15+ is recommended. Verify with `psql --version`.

## 2. Create the application database and user

Switch to the postgres user and create the database + role:

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE police_traffic;
CREATE USER police_app WITH ENCRYPTED PASSWORD '<strong-password>';
GRANT ALL PRIVILEGES ON DATABASE police_traffic TO police_app;
\c police_traffic
GRANT ALL ON SCHEMA public TO police_app;
SQL
```

Use a strong password (32+ chars). Store it in your password manager and
in the VPS `.env` file — never in git.

## 3. Apply the schema

From your local machine (or the VPS, after cloning the repo):

```bash
npm run db:migrate
```

This applies all SQL files in `packages/database/migrations/` in order.
The script tracks applied migrations in a `_migrations` table.

To apply the full schema from scratch (fresh database):

```bash
psql "postgresql://police_app:<password>@<vps-ip>:5432/police_traffic" \
  -f packages/database/src/schema.sql
```

## 4. Restrict privileges (production hardening)

After the schema is applied, revoke DDL privileges from the app user so
a compromised app cannot drop tables:

```bash
sudo -u postgres psql <<'SQL'
\c police_traffic
REVOKE CREATE ON SCHEMA public FROM police_app;
-- audit_logs must be append-only
REVOKE UPDATE, DELETE ON audit_logs FROM police_app;
SQL
```

A separate `police_admin` user with DDL privileges should be used only
for running migrations.

## 5. Configure the firewall

PostgreSQL should only be reachable from the application server, not the
public internet:

```bash
# On the VPS
ufw allow from <app-server-ip> to any port 5432
ufw deny 5432
ufw enable
```

If the app and database are on the same VPS, bind PostgreSQL to
localhost only:

```bash
# /etc/postgresql/15/main/postgresql.conf
listen_addresses = 'localhost'
```

Then restart: `systemctl restart postgresql`.

## 6. Configure pg_hba.conf

Force SSL for non-localhost connections:

```conf
# /etc/postgresql/15/main/pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
hostssl police_traffic  police_app      <app-server-ip>/32      scram-sha-256
host    all             all             0.0.0.0/0               reject
```

Reload: `systemctl reload postgresql`.

## 7. Set up backups

Daily automated backups via cron:

```bash
# /etc/cron.daily/backup-police-db
#!/bin/bash
set -e
BACKUP_DIR=/var/backups/postgres
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d)
pg_dump -U postgres police_traffic | gzip > "$BACKUP_DIR/police_traffic-$DATE.sql.gz"
# Keep 30 days
find "$BACKUP_DIR" -name "police_traffic-*.sql.gz" -mtime +30 -delete
```

Make it executable: `chmod +x /etc/cron.daily/backup-police-db`.

For offsite backups, sync to S3/Backblaze via `aws s3 sync` or `rclone`.

## 8. Verify the connection

From your local machine:

```bash
psql "postgresql://police_app:<password>@<vps-ip>:5432/police_traffic" \
  -c "\dt"
```

You should see the 14 core tables plus `_migrations`, `audit_logs`,
`activity_logs`, and `otp_codes`.

## 9. Set the env vars

In your app's `.env.local` (development) or `/etc/systemd/system/police-app.service`
(production):

```bash
DATABASE_URL=postgresql://police_app:<password>@<vps-ip>:5432/police_traffic
DB_SSL=true   # if you configured SSL in step 6
```

Restart the app: `systemctl restart police-app`.

## 10. Performance tuning (optional, for production loads)

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

These values assume a 2GB VPS. Adjust proportionally for larger boxes.
Run `pgbench` to baseline performance before and after changes.
