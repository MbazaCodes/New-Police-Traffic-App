#!/bin/bash
# Deploy to Vercel
set -e
echo "Building for production..."
cd "$(dirname "$0")/.."
bun run build
echo "Deploying to Vercel..."
bunx vercel --prod
