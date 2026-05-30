#!/usr/bin/env bash
# release-check.sh — Checklist de release para Zipy
# Ejecutar antes de mergear a main.
# Usage: bash scripts/release-check.sh

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; ERR=1; }

echo "=== Release Checklist ==="
ERR=0

echo -e "\n1. Code quality"
pnpm --filter @zipy/customer-web lint 2>/dev/null && pass "lint pasa" || fail "lint falla (puede ser que no este configurado)"
pnpm --filter @zipy/customer-web typecheck 2>/dev/null && pass "typecheck pasa" || fail "typecheck falla (puede ser que no este configurado)"
pnpm --filter @zipy/customer-web build 2>/dev/null && pass "build pasa" || fail "build falla"

echo -e "\n2. Dependencies"
if git diff --name-only HEAD~1..HEAD | grep -q 'pnpm-lock.yaml'; then
  pass "lockfile actualizado"
else
  fail "lockfile NO actualizado (corre pnpm install)"
fi

echo -e "\n3. Secrets"
for var in VERCEL_TOKEN FIREBASE_TOKEN; do
  if [ -n "${!var-}" ]; then
    pass "$var configurado"
  else
    fail "$var NO configurado"
  fi
done

echo -e "\n4. Migraciones"
if git diff --name-only HEAD~1..HEAD | grep -qE 'firestore\.(rules|indexes)'; then
  echo "  ⚠  firestore.* modificado → requiere deploy manual:"
  echo "     npx firebase deploy --only firestore:rules,firestore:indexes"
fi

echo -e "\n5. Version bump"
CURRENT=$(node -p "require('./package.json').version")
echo "  Version actual: $CURRENT"

echo -e "\n=== Resultado ==="
if [ "$ERR" -eq 0 ]; then
  echo -e "${GREEN}✓ Release listo para main${NC}"
else
  echo -e "${RED}✗ Corrige $ERR error(es) antes de mergear${NC}"
  exit 1
fi
