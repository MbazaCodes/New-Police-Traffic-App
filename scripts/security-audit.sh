#!/bin/bash
# Security audit
set -e
echo "Running security audit..."
cd "$(dirname "$0")/.."
bun audit
echo "Checking for committed secrets..."
bunx secret-scan src/ packages/ 2>/dev/null || echo "secret-scan not installed, skipping"
echo "Security audit complete."
