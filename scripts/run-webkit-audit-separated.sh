#!/usr/bin/env bash
set -euo pipefail

PROJECT="webkit-mobile-iphone15"
MODE="all"
SPEC="tests/full-ui-coverage-audit.spec.ts"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT="${2:-}"
      if [[ -z "$PROJECT" ]]; then
        echo "--project requires a value" >&2
        exit 1
      fi
      shift 2
      ;;
    --critical)
      MODE="critical"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

run_case() {
  local pattern="$1"
  printf '\n==> %s\n' "$pattern"
  pnpm exec playwright test \
    --project="$PROJECT" \
    --retries=0 \
    "$SPEC" \
    -g "$pattern" \
    --reporter=line
}

critical_patterns=(
  'captures Catalog tab flows \(slice-1\) with per-tab manifest coverage'
  'captures Catalog tab flows \(slice-3\) with per-tab manifest coverage'
  'captures Collection tab flows with per-tab manifest coverage'
)

all_patterns=(
  'captures Career tab flows with per-tab manifest coverage'
  'captures Catalog tab flows \(slice-1\) with per-tab manifest coverage'
  'captures Catalog tab flows \(slice-2\) with per-tab manifest coverage'
  'captures Catalog tab flows \(slice-3\) with per-tab manifest coverage'
  'captures Catalog tab flows \(slice-4\) with per-tab manifest coverage'
  'captures Collection tab flows with per-tab manifest coverage'
  'captures Upgrades tab flows with per-tab manifest coverage'
  'captures Atelier tab flows with per-tab manifest coverage'
  'captures Maison tab flows with per-tab manifest coverage'
  'captures Nostalgia tab flows with per-tab manifest coverage'
  'captures Stats tab flows with per-tab manifest coverage'
  'captures Settings tab flows with per-tab manifest coverage'
  'captures home shell baseline and publishes combined project manifest'
)

if [[ "$MODE" == "critical" ]]; then
  for pattern in "${critical_patterns[@]}"; do
    run_case "$pattern"
  done
else
  for pattern in "${all_patterns[@]}"; do
    run_case "$pattern"
  done
fi

