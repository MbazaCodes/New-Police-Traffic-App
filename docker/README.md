# Docker / Infrastructure

This directory contains Docker configurations for deploying the TZ Police Digital Platform.

## Quick Start

```bash
# Start all services (app + PostgreSQL + Caddy)
cd docker && docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `app`   | 3000 | Next.js application |
| `db`    | 5432 | PostgreSQL 16 database |
| `caddy` | 80/443 | Reverse proxy & TLS |

## Production Notes

- Change all passwords and secrets in `docker-compose.yml`
- Set `$DOMAIN` environment variable or update `Caddyfile` for your domain
- Mount SSL certificates via Caddy's automatic HTTPS if using a public domain
- Add volume for database backups in production
