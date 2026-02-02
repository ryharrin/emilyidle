---
phase: 39-collection-info-embedded-in-catalog
plan: 03
subsystem: ui
tags: [typescript, copy, game-data, selectors]

# Dependency graph
requires:
  - phase: 38-catalog-lock-disabled-explanations
    provides: Catalog purchase surface with lock/disabled explanations
provides:
  - Collection naming aligned in milestone and domain strings
  - Player-facing requirement labels updated to Collection wording
affects:
  - 39-04 tests for Collection naming
  - 40-upgrade-status-copy-alignment

# Tech tracking
tech-stack:
  added: []
  patterns: [Display-string renames without id changes]

key-files:
  created: []
  modified:
    - src/game/data/milestones.ts
    - src/game/data/items.ts
    - src/game/data/upgrades.ts
    - src/game/model/state.ts
    - src/game/selectors/index.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Player-facing copy renamed while keeping persisted ids stable"

# Metrics
duration: 0m 12s
completed: 2026-02-02
---

# Phase 39 Plan 03: Collection Naming in Domain Strings Summary

**Milestone, item, upgrade, and requirement copy now references Collection while all ids remain unchanged.**

## Performance

- **Duration:** 0m 12s
- **Started:** 2026-02-02T07:16:43Z
- **Completed:** 2026-02-02T07:16:55Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Renamed milestone display strings to use Collection naming
- Updated item and upgrade descriptions away from Vault wording
- Refreshed achievement and requirement labels to Collection phrasing

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename milestone display strings to use “Collection” (ids unchanged)** - `1327d6d` (feat)
2. **Task 2: Rename player-visible domain descriptions to avoid “Vault” while keeping ids stable** - `e442ac2` (feat)

## Files Created/Modified
- `src/game/data/milestones.ts` - Collection rename for milestone display name
- `src/game/data/items.ts` - Updated item descriptions to Collection wording
- `src/game/data/upgrades.ts` - Updated upgrade descriptions to Collection wording
- `src/game/model/state.ts` - Renamed achievement/event/bonus display strings to Collection phrasing
- `src/game/selectors/index.ts` - Updated requirement label copy for total item achievements

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Collection naming is aligned in domain strings for upcoming test updates
- Ready to execute Phase 39 naming test plans

---
*Phase: 39-collection-info-embedded-in-catalog*
*Completed: 2026-02-02*
