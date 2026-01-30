---
phase: 33-career-stages-and-permanent-choices
plan: 02
subsystem: gameplay
tags: [career, stages, selectors, ui]

# Dependency graph
requires:
  - phase: 33-career-stages-and-permanent-choices
    provides: Permanent career choice fields + migration
provides:
  - Career stage thresholds with permanent choice effect definitions
  - Career stage selectors with salary/session previews and effect multipliers
  - Career stage choice UI with locked track handling
affects: [career, ui, balance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Career choice effects compose via merged salary/session multipliers

key-files:
  created:
    - src/game/data/careerStages.ts
    - src/game/selectors/careerStages.ts
    - src/game/actions/therapistCareer.ts
    - src/ui/components/CareerStageChoiceBlocks.tsx
    - src/ui/components/CareerStageChoicePreview.tsx
    - src/ui/components/CareerStageChoices.tsx
  modified:
    - src/game/selectors/index.ts
    - tests/therapist.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Career stage previews compute before/after salary and session terms from pure selectors"

# Metrics
duration: 14m
completed: 2026-01-30
---

# Phase 33 Plan 02: Career Stages + Permanent Choice Effects Summary

**Career stages now apply permanent choice multipliers to therapist salary/sessions with UI previews and locked track selection.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-01-30T18:56:18Z
- **Completed:** 2026-01-30T19:09:52Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added stage thresholds/choice definitions and selectors that merge effect multipliers and preview before/after values.
- Applied career choice multipliers to therapist salary/session policy across selectors.
- Shipped stage choice UI with locked track handling and stable test IDs for previews.

## Verification

- `pnpm run typecheck`
- `pnpm run test:e2e`

## Task Commits

Each task was committed atomically:

1. **Task 1: Define stages + choice effects and apply them to therapist salary and session policy** - `41b142e` (feat)
2. **Task 2: Add actions + UI wiring for permanent choices with stable previews and selectors** - `689b481` (feat)

**Plan metadata:** (docs commit)

## Files Created/Modified

- `src/game/data/careerStages.ts` - Stage thresholds and permanent choice effect definitions.
- `src/game/selectors/careerStages.ts` - Stage derivation, choice availability, and preview selectors.
- `src/game/selectors/index.ts` - Therapist salary/session selectors now apply career choice multipliers.
- `src/game/actions/therapistCareer.ts` - Permanent track/modality/style/focus actions with lock rules.
- `src/ui/components/CareerStageChoices.tsx` - Career stages card with current stage label + level.
- `src/ui/components/CareerStageChoiceBlocks.tsx` - Stage choice cards with previews and lock state.
- `src/ui/components/CareerStageChoicePreview.tsx` - Shared salary/session preview renderer.
- `tests/therapist.unit.test.tsx` - Updated for selector signature changes.

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Typecheck failed after selector signature updates; fixed by updating therapist unit test call sites.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Career stages, permanence actions, and UI previews are in place for Phase 33-03 unit coverage.

---
*Phase: 33-career-stages-and-permanent-choices*
*Completed: 2026-01-30*
