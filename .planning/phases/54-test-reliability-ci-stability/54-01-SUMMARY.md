---
phase: 54-test-reliability-ci-stability
plan: 1
subsystem: selector-hardening
tags: [playwright, selectors, reliability]
requires: []
provides:
  - Unique save import/export trigger anchors for strict-mode-safe selection
  - Explicit owned-tab targeting in catalog flows to avoid role/text ambiguity
  - Targeted desktop/mobile verification for collection loop and toast flows
key-files:
  modified:
    - src/ui/tabs/SaveTab.tsx
    - tests/collection-loop.spec.ts
    - tests/achievements-toast.spec.ts
    - .planning/phases/54-test-reliability-ci-stability/54-TASKLIST.md
    - .planning/phases/54-test-reliability-ci-stability/54-01-SUMMARY.md
metrics:
  completed: 2026-02-07
---

# Phase 54 Plan 01 Summary

Executed selector disambiguation + strict-mode hardening by replacing ambiguous text/role matches
with explicit anchors in the highest-failure e2e flows identified by the phase plan.

## Accomplishments
- Added stable save-action anchors in `SaveTab`:
  - export button now has `id=\"export-save\"` and `data-testid=\"export-save-trigger\"`,
  - import button now has `id=\"import-save\"` and `data-testid=\"import-save-trigger\"`.
- Updated `collection-loop.spec.ts` to use strict selectors for save import/export flow:
  - switched from broad role-name matches (`Export` / `Import`) to `#export-save` / `#import-save`,
  - tightened event-card assertion to explicit `data-testid=\"event-calendar-auction-weekend\"`.
- Updated catalog-owned tab targeting in both specs:
  - `tests/collection-loop.spec.ts` and `tests/achievements-toast.spec.ts` now use `#catalog-owned-tab`
    instead of broad role/text matching for `Owned`.

## Verification
- `pnpm exec playwright test --project=chromium tests/collection-loop.spec.ts -g \"export and import save round trip|achievements and events panels render\"`
- `pnpm exec playwright test --project=chromium-mobile-pixel5 tests/achievements-toast.spec.ts`

## Notes
- `pnpm test:e2e -- ...` wrapper command currently expands in a way that does not reliably scope
  `-g` filtering; targeted verification was run directly via `pnpm exec playwright test`.
