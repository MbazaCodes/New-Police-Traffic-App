#!/bin/bash
# Seed database with sample data
set -e
echo "Seeding database..."
cd "$(dirname "$0")/.."
bunx supabase db seed
echo "Seed complete."
