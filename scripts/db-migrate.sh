#!/bin/bash
# Run database migrations against PostgreSQL (VPS)
# Uses psql with DATABASE_URL from .env
set -e
echo "Running database migrations..."
cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Source your .env first."
  exit 1
fi

for f in packages/database/migrations/*.sql; do
  echo "  Applying: $(basename "$f")"
  psql "$DATABASE_URL" -f "$f" || true
done

echo "Migrations complete."
