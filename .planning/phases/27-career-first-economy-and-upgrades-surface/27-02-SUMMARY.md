---
phase: 27-career-first-economy-and-upgrades-surface
plan: 02
subsystem: gameplay
tags: [typescript, react, vitest, economy, career]

# Dependency graph
requires:
  - phase: 27-01
    provides: career tracks + progression tree state
provides:
  - Career-only cash rate in sim + stats breakdown
  - Track-aware therapist session gating with free-first policy
affects:
  - 27-03
  - 27-04
  - 27-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Career-only cash rate selector + breakdown
    - Track-aware session policy selectors

key-files:
  created: []
  modified:
    - src/game/selectors/index.ts
    - src/game/actions/index.ts
    - src/game/sim.ts
    - src/App.tsx
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/CareerTab.tsx
    - tests/rate-breakdowns.unit.test.ts
    - tests/therapist.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - Cash rate derived solely from therapist career salary
  - Session policy selectors incorporate track support and free-first logic

# Metrics
duration: 15 min
completed: 2026-01-29
---

# Phase 27 Plan 02: Career-First Economy Summary

**Career salary now drives cash/sec while therapist sessions respect track policy and a free-first rule.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-29T18:32:20Z
- **Completed:** 2026-01-29T18:47:19Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Rewired cash/sec to use only therapist career salary, independent of events or vault income.
- Simplified cash rate breakdown to a single career-salary line matching sim and stats totals.
- Added track-aware therapist session policies with free-first labeling and unit coverage.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewire cash generation to be career-only (no events multiplier)** - `21d5894` (feat)
2. **Task 2: Implement track-aware therapist sessions with free-first-session policy** - `120c260` (feat)

**Plan metadata:** [pending]

## Files Created/Modified
- `src/game/selectors/index.ts` - career-only cash rate and session policy selectors
- `src/game/actions/index.ts` - therapist session action uses free-first and track cooldowns
- `src/game/sim.ts` - cash income uses career-only selector
- `src/App.tsx` - stats cash rate ignores event multiplier
- `src/ui/tabs/StatsTab.tsx` - cash breakdown shows career salary only
- `src/ui/tabs/CareerTab.tsx` - session cost label reflects free-first rule
- `tests/rate-breakdowns.unit.test.ts` - cash breakdown expectations aligned to career-only model
- `tests/therapist.unit.test.tsx` - session policy and free-first behavior coverage

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 27-03-PLAN.md.

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
