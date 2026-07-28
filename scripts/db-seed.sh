#!/bin/bash
# Seed database with sample data against PostgreSQL (VPS)
set -e
echo "Seeding database..."
cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Source your .env first."
  exit 1
fi

for f in packages/database/seeds/*.sql; do
  echo "  Seeding: $(basename "$f")"
  psql "$DATABASE_URL" -f "$f" || true
done

echo "Seed complete."
