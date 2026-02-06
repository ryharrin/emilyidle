---
phase: 50-catalog-collection-depth
plan: 1
subsystem: domain
tags: [selectors, analytics, prestige, set-bonuses, vitest]
requires: []
provides:
  - Collection insight selectors for set bonus progress, prestige preview, and analytics snapshots
  - State/selectors export surface for phase-50 collection depth UI work
affects:
  - Phase 50 Plan 02: Collection depth integration
  - Phase 50 Plan 03: Catalog compare and readiness indicators
tech-stack:
  added: []
  patterns:
    - Keep collection depth math in pure selectors and expose the results through the existing state facade.
    - Use deterministic sorting for distribution rows to keep UI rendering and tests stable.
key-files:
  created:
    - src/game/selectors/collectionInsights.ts
    - tests/collection-analytics.unit.test.ts
  modified:
    - src/game/selectors/index.ts
key-decisions:
  - Use `state.watchModels` ownership as the source of truth for analytics so value/distribution panels reflect model-level inventory.
  - Define prestige preview against fixed workshop/maison/nostalgia thresholds with nearest-locked target behavior for predictable UI contracts.
patterns-established:
  - Collection insight selectors return fully typed, UI-ready rows (ratios, remaining counts, labels) without side effects.
metrics:
  completed: 2026-02-06
---

# Phase 50 Plan 01 Summary

Implemented the selector foundation for set bonus progress, next-prestige preview, and collection analytics so the remaining Phase 50 UI plans can consume deterministic domain outputs.

## Accomplishments
- Added `getSetBonusProgressRows`, `getNextPrestigePreview`, and `getCollectionAnalyticsSnapshot` in `src/game/selectors/collectionInsights.ts`.
- Exported the new selector module through `src/game/selectors/index.ts` so it is available through the existing `src/game/state.ts` facade.
- Added `tests/collection-analytics.unit.test.ts` covering set bonus transitions, prestige gap calculation, and analytics breakdown stability.

## Verification
- `pnpm typecheck`
- `pnpm test:unit -- tests/collection-analytics.unit.test.ts`

## Next Plan Readiness
- `50-02-PLAN.md` is unblocked; collection UI can now read typed selector outputs for progress, prestige preview, and analytics panels.
