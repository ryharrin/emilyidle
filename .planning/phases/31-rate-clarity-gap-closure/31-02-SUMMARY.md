---
phase: 31-rate-clarity-gap-closure
plan: 02
subsystem: gameplay
tags: [enjoyment, upgrades, multipliers, events, rate-preview]

# Dependency graph
requires:
  - phase: 31-01
    provides: event-adjusted cash rate helpers
provides:
  - Upgrade-driven multipliers now apply to enjoyment/sec
  - Enjoyment breakdowns list all applied multipliers
  - Upgrades copy reflects enjoyment impact and event-truthful previews
affects: [31-rate-clarity-gap-closure, upgrades-preview]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Shared income multiplier helpers for enjoyment + breakdowns"]

key-files:
  created: [src/game/selectors/incomeMultipliers.ts]
  modified:
    - src/game/selectors/enjoyment.ts
    - src/game/selectors/index.ts
    - src/game/data/upgrades.ts
    - src/game/model/state.ts
    - src/ui/tabs/UpgradesTab.tsx
    - src/App.tsx
    - tests/maison.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Enjoyment rate uses the same income multiplier stack as rate breakdowns"

# Metrics
duration: 13m 13s
completed: 2026-01-30
---

# Phase 31: Rate Clarity Gap Closure Summary

**Upgrade income multipliers now drive enjoyment/sec, with truthful breakdowns and event-aware preview rates.**

## Performance

- **Duration:** 13m 13s
- **Started:** 2026-01-30T15:34:06Z
- **Completed:** 2026-01-30T15:47:19Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Applied upgrade-driven multipliers to enjoyment rates and breakdowns.
- Rewrote upgrade copy/effect labels to describe enjoyment instead of cash.
- Made rate previews event-truthful for both cash and enjoyment.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make enjoyment rate use upgrade-driven non-cash multipliers** - `705146a` (feat)
2. **Task 2: Update upgrades data + UI copy to remove cash/sec claims** - `185bbcb` (feat)
3. **Task 3: Make Upgrades rate previews event-truthful by passing current event multiplier** - `bd98af9` (feat)

**Plan metadata:** (docs commit)

## Files Created/Modified
- `src/game/selectors/incomeMultipliers.ts` - Shared multiplier helpers for enjoyment + income rates.
- `src/game/selectors/enjoyment.ts` - Applies upgrade-driven multipliers to enjoyment/sec.
- `src/game/selectors/index.ts` - Enjoyment breakdown includes applied multipliers.
- `src/ui/tabs/UpgradesTab.tsx` - Enjoyment-focused copy and event-aware preview rates.
- `src/App.tsx` - Passes current event multiplier to upgrades preview.
- `src/game/data/upgrades.ts` - Upgrade descriptions aligned to enjoyment.
- `src/game/model/state.ts` - Workshop/Maison upgrade copy aligned to enjoyment.
- `tests/maison.unit.test.tsx` - Expectations updated for enjoyment multipliers.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated maison enjoyment expectation for ability multipliers**
- **Found during:** Task 2 (unit test verification)
- **Issue:** Unit test assumed watch ability multipliers applied to cash only.
- **Fix:** Updated expected enjoyment rate to include watch ability multiplier.
- **Files modified:** tests/maison.unit.test.tsx
- **Verification:** pnpm run test:unit
- **Committed in:** 66568d1 (test commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required test alignment after enjoyment multiplier changes; no scope creep.

## Issues Encountered
- Unit test expectation mismatch after enjoyment multiplier changes; updated test to match new behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for 31-03 (remaining gap closure) with updated enjoyment multipliers and previews.
- No blockers noted.

---
*Phase: 31-rate-clarity-gap-closure*
*Completed: 2026-01-30*
