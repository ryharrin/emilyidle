---
phase: 18-codebase-refactor
plan: 05
subsystem: ui
tags: [react, hooks, runtime, persistence, localstorage, raf]

# Dependency graph
requires:
  - phase: 18-03
    provides: game state selectors/actions split and facade exports
  - phase: 18-04
    provides: tab components extracted from App
provides:
  - runtime hook for RAF tick/autosave/lifecycle persistence
  - App wired to runtime helper with test gating
affects: [phase-18, phase-19]

# Tech tracking
tech-stack:
  added: none
  patterns: runtime hook encapsulating side effects

key-files:
  created:
    - src/game/runtime/isTestEnvironment.ts
    - src/game/runtime/useGameRuntime.ts
  modified:
    - src/App.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Runtime orchestration lives in src/game/runtime/useGameRuntime.ts with isTestEnvironment gating"

# Metrics
duration: 11 min
completed: 2026-01-24
---

# Phase 18 Plan 5: Runtime Hook Summary

**Game runtime hook encapsulating RAF ticks, autosave cadence, and lifecycle persistence with App wiring and test gating.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-01-24T03:21:56Z
- **Completed:** 2026-01-24T03:33:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extracted runtime side effects into `useGameRuntime`, including RAF cadence and autosave handling
- Centralized save/load lifecycle persistence with shared test-environment gating
- Wired App game state updates through runtime helpers for consistent save-dirty tracking

## Task Commits

Each task was committed atomically:

1. **Task 1: Introduce src/game/runtime/useGameRuntime.ts and move RAF + autosave orchestration out of App.tsx** - `79badb9` (feat)
2. **Task 2: Validate runtime gating and persistence behavior via unit + e2e tests** - no code changes (tests only)

**Plan metadata:** pending docs commit

## Files Created/Modified
- `src/game/runtime/isTestEnvironment.ts` - shared helper for disabling runtime work in tests
- `src/game/runtime/useGameRuntime.ts` - runtime hook owning RAF ticks, autosave, and lifecycle persistence
- `src/App.tsx` - uses runtime hook and marks save-dirty via runtime helpers

## Decisions Made
None - followed plan as specified

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Runtime orchestration is isolated; App wiring is stable for further refactors.
No blockers noted.

---
*Phase: 18-codebase-refactor*
*Completed: 2026-01-24*
