#!/bin/bash
# Run database migrations
set -e
echo "Running database migrations..."
cd "$(dirname "$0")/.."
bunx supabase db push
echo "Migrations complete."
