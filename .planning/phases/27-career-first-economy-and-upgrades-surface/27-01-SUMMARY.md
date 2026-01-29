---
phase: 27-career-first-economy-and-upgrades-surface
plan: 01
subsystem: database
tags: [career, persistence, gamestate, typescript]

# Dependency graph
requires:
  - phase: 26-catalog-first-shop
    provides: Catalog-first purchase flow and save v2 persistence
provides:
  - Career track metadata and progression nodes
  - Therapist career state for tracks, points, nodes, and free session marker
  - Save sanitization for career progression fields
affects: [27-02, 27-03, 27-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Sanitized career state in createStateFromSave

key-files:
  created:
    - src/game/data/career.ts
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/persistence.ts
    - src/game/actions/index.ts
    - tests/therapist.unit.test.tsx
    - tests/nostalgia-prestige.unit.test.tsx
    - tests/vitest.setup.ts
    - vitest.config.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Career track/node definitions live in src/game/data/career.ts"
  - "Therapist career persistence sanitizes unknown track/node ids"

# Metrics
duration: 2 min
completed: 2026-01-29
---

# Phase 27 Plan 01: Career primitives Summary

**Career track/node data model with persisted therapist specialization state and save sanitization.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T13:23:34-05:00
- **Completed:** 2026-01-29T13:25:56-05:00
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Defined career tracks with core-to-branching progression nodes for a tree UI.
- Extended therapist career state with track selection, point pool, spent nodes, and free-session marker.
- Hardened save/load sanitization and coverage for new career persistence fields.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define career tracks + progression nodes (data-only)** - `1e98941` (feat)
2. **Task 2: Extend GameState career fields and persist them in saves** - `e119707` (feat)

**Plan metadata:** (docs commit after summary)

## Files Created/Modified
- `src/game/data/career.ts` - career tracks, nodes, and branching constant
- `src/game/model/types.ts` - TherapistCareerState extensions for track/nodes
- `src/game/model/state.ts` - career defaults and save restoration sanitization
- `src/game/persistence.ts` - save decoding support for career fields
- `src/game/actions/index.ts` - preserve/reset new career fields on prestige/session updates
- `tests/therapist.unit.test.tsx` - round-trip coverage for new career save fields
- `tests/nostalgia-prestige.unit.test.tsx` - updated career reset fixture
- `tests/vitest.setup.ts` - scrollIntoView test shim
- `vitest.config.ts` - load shared test setup

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Preserved new career fields in therapist actions**
- **Found during:** Task 2 (typecheck)
- **Issue:** therapistCareer resets dropped new fields, causing type errors and lost state
- **Fix:** extended prestige/session updates to carry or reset new fields
- **Files modified:** src/game/actions/index.ts
- **Verification:** pnpm run typecheck && pnpm run test:unit
- **Committed in:** e119707

**2. [Rule 3 - Blocking] Updated test fixtures and setup for new career fields**
- **Found during:** Task 2 (unit tests)
- **Issue:** therapist fixtures lacked new fields; scrollIntoView spy failed without setup
- **Fix:** expanded fixtures and wired vitest setup with scrollIntoView shim
- **Files modified:** tests/therapist.unit.test.tsx, tests/nostalgia-prestige.unit.test.tsx, tests/vitest.setup.ts, vitest.config.ts
- **Verification:** pnpm run typecheck && pnpm run test:unit
- **Committed in:** e119707

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Required for type safety and test stability; no scope creep.

## Issues Encountered
- Unit tests failed due to missing scrollIntoView shim; resolved by wiring vitest setup.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Career primitives and persistence are ready for track-aware economy rules.
- Ready for 27-02-PLAN.md.

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
