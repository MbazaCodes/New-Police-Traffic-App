#!/bin/bash
# Start local Supabase
set -e
echo "Starting local Supabase..."
cd "$(dirname "$0")/.."
bunx supabase start
echo "Supabase running on http://localhost:54323"
