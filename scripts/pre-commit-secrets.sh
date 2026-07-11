#!/usr/bin/env bash
# ============================================================
# pre-commit hook: detect potential secrets before committing
# ============================================================
# Installation:
#   cp scripts/pre-commit-secrets.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
# ============================================================

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Patterns that suggest leaked secrets
PATTERNS=(
  'API_KEY\s*=\s*["\x27][^"\x27]{8,}'
  'SECRET\s*=\s*["\x27][^"\x27]{8,}'
  'PASSWORD\s*=\s*["\x27][^"\x27]{4,}'
  'TOKEN\s*=\s*["\x27][^"\x27]{8,}'
  'aws_secret_access_key'
  'PRIVATE.KEY'
  'Bearer\s+[A-Za-z0-9\-._~+/]+=*'
)

# Files to exclude from scanning
EXCLUDE_FILES=".env.example|package-lock.json|yarn.lock|pre-commit-secrets.sh"

echo -e "${YELLOW}🔍 Scanning staged files for potential secrets...${NC}"

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  # Search only staged files, exclude known safe files
  MATCHES=$(git diff --cached --name-only | grep -Ev "$EXCLUDE_FILES" | xargs grep -lEi "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}⚠️  Possible secret detected (pattern: $pattern):${NC}"
    echo "$MATCHES" | while read -r file; do
      echo "   → $file"
    done
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo -e "${RED}🚫 Commit blocked. Review the files above and remove any secrets.${NC}"
  echo -e "${YELLOW}   If these are false positives, use: git commit --no-verify${NC}"
  exit 1
fi

echo -e "✅ No secrets detected. Proceeding with commit."
exit 0
