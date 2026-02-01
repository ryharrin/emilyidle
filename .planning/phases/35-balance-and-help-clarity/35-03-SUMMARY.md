---
phase: 35-balance-and-help-clarity
plan: 03
subsystem: gameplay
tags: [career, therapist-sessions, selectors, vitest]

# Dependency graph
requires:
  - phase: 35-balance-and-help-clarity
    provides: Salary window loop and Career session UX
provides:
  - Pre-track therapist session policy fallback before track unlock
  - Unit regressions for salary window refresh and pre-track sessions
affects: [career-loop, phase-35-uat]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Resolve an effective career track for session policy before track unlock"

key-files:
  created:
    - src/game/selectors/therapistSessions.ts
    - tests/career-salary-window.unit.test.ts
    - tests/therapist.unit.test.tsx
  modified: []

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Selector-level fallback track id for pre-track session policy"

# Metrics
duration: 5m 26s
completed: 2026-02-01
---

# Phase 35 Plan 03: Pre-Track Session Availability Summary

**Pre-track therapist sessions now use a selector-only fallback policy to refresh the salary window before level 3 while preserving track choice gating.**

## Performance

- **Duration:** 5m 26s
- **Started:** 2026-02-01T03:20:09Z
- **Completed:** 2026-02-01T03:25:35Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Allowed session policy computation with a fallback track before track unlock, keeping retirement and post-unlock gating intact.
- Updated salary window regression to prove refresh works before selecting a track.
- Added therapist policy regression asserting pre-track session terms are non-zero.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add selector-level pre-track fallback session policy (no state mutation)** - `1ee4170` (feat)
2. **Task 2: Add unit regressions for pre-track sessions and salary-window refresh** - `56ea542` (test)

## Files Created/Modified
- `src/game/selectors/therapistSessions.ts` - Resolves effective track id and computes pre-track session policy.
- `tests/career-salary-window.unit.test.ts` - Asserts salary window refresh before track unlock.
- `tests/therapist.unit.test.tsx` - Covers pre-track session policy terms.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Pre-track session availability is restored; rerun Phase 35 UAT salary window check to confirm the gap is closed.

---
*Phase: 35-balance-and-help-clarity*
*Completed: 2026-02-01*
