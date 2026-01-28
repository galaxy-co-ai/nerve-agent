#!/bin/bash

# NERVE AGENT Pre-Push Validation Script
# Run this before pushing to prevent Vercel build failures

set -e

echo "==================================="
echo "NERVE AGENT - Pre-Push Validation"
echo "==================================="
echo ""

cd "$(dirname "$0")/../apps/web"

echo "[1/3] TypeScript Check..."
npx tsc --noEmit
echo "  TypeScript: OK"
echo ""

echo "[2/3] Production Build..."
npm run build
echo "  Build: OK"
echo ""

echo "[3/3] Checking for common issues..."

# Check for TODO/FIXME that might indicate incomplete work
if grep -r "// TODO:" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -5; then
  echo "  Warning: Found TODO comments (review before pushing)"
fi

# Check for console.log in non-test files
if grep -r "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v ".test." | head -5; then
  echo "  Warning: Found console.log statements (consider removing)"
fi

echo ""
echo "==================================="
echo "All validations passed!"
echo "Safe to push."
echo "==================================="
