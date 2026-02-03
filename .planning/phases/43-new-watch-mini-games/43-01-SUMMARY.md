---
phase: 43-new-watch-mini-games
plan: 1
subsystem: ui
tags: [react, vitest, typescript, ui]

# Dependency graph
requires:
  - phase: 42-winding-refresh
    provides: Winding modal math + modal shell that rewound the core interaction
provides:
  - Wider quartz Good/perfect math with modal narrative that still showcases the tiered payouts
affects:
  - Phase 44: Interaction Feedback & Rewards

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exported deterministic outcome helpers so tests and UI share identical math"

key-files:
  created:
    - tests/quartz-outcome.unit.test.ts
  modified:
    - src/ui/components/QuartzMiniGameModal.tsx

key-decisions:
  - "Widened the Good window while keeping Perfect reserved for the tightest hits so starter quartz players land Good instead of Miss near the center"
  - "Exported the outcome helpers so regression tests can guard the same deterministic math the modal uses"

patterns-established:
  - "Keep junior helper math exported so regression suites read the same thresholds as the visible outcome"

duration: 4 min
completed: 2026-02-03
---

# Phase 43 Plan 1: Quartz outcome forgiveness summary

**Widened the quartz Good window, called it out in the modal copy, and wrote regression tests that guard the new math.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-03T16:11:12Z
- **Completed:** 2026-02-03T16:15:14Z
- **Tasks:** 3
- **Files modified:** 2
- **Testing:** `pnpm test:unit -- tests/quartz-outcome.unit.test.ts`

## Accomplishments

- Extended the Good margin around the dial center while keeping the Perfect tier razor tight through configurable math constants and exported helpers.
- Updated the modal launch copy to highlight the wider Good window without touching the Miss/Good/Perfect result messaging or reduced-motion knobs.
- Added `tests/quartz-outcome.unit.test.ts` to assert the new tier boundaries and the monotonic performance drop-off.

## Task Commits

Each task was committed atomically:

1. **Task 1: Widen the quartz outcome thresholds** - `4f2a9e4` (feat)
2. **Task 2: Clarify the quartz modal messaging** - `6fe0dd2` (feat)
3. **Task 3: Guard the new margins with regression tests** - `4095e30` (test)

**Plan metadata:** docs(43-01): complete quartz outcome forgiveness plan

## Files Created/Modified

- `tests/quartz-outcome.unit.test.ts` - Regression coverage of the widened Good/miss boundaries and performance taper.
- `src/ui/components/QuartzMiniGameModal.tsx` - Adjustable Good/perfect margins, exported outcome helpers, and updated launch copy that highlights the larger sweet spot.

## Decisions Made

- Widen the Good window while keeping Perfect reserved for the tightest hits so starter quartz players land Good instead of Miss near the center.
- Export the outcome helpers so regression tests consume the same deterministic math as the modal.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external services were introduced.

## Next Phase Readiness

- Quartz mini-game math now reports a forgiving Good zone with descriptive copy, so Phase 44 (Interaction Feedback & Rewards) can build consistent tier feedback without reworking this modal.
