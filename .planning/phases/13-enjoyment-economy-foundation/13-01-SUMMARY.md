---
phase: 13-enjoyment-economy-foundation
plan: 01
subsystem: gameplay
tags: [typescript, vitest, enjoyment, economy]

# Dependency graph
requires:
  - phase: 12-major-updates-01-21
    provides: prestige legacy multiplier and existing income/enjoyment selectors
provides:
  - Tier-based per-watch enjoyment income via `enjoymentCentsPerSec`
  - `getWatchItemEnjoymentRateCentsPerSec` helper for UI display
  - Unit coverage for tier ordering and summed enjoyment rate
affects: [phase-14-therapist-career-economy, phase-15-dual-currency-acquisition]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Enjoyment rate = sum(per-watch enjoyment) * prestige legacy multiplier"

key-files:
  created:
    - tests/enjoyment.unit.test.tsx
  modified:
    - src/game/state.ts
    - tests/maison.unit.test.tsx

key-decisions:
  - "Use explicit per-watch enjoymentCentsPerSec instead of deriving enjoyment from collection value"

patterns-established:
  - "Expose per-watch enjoyment helper for UI display"

issues-created: []

# Metrics
duration: N/A
completed: 2026-01-22
---

# Phase 13 Plan 01: Enjoyment Tiers Summary

**Tier-based enjoyment income per watch (with prestige legacy multiplier preserved).**

## Performance

- **Duration:** N/A (work landed prior session; commits + docs completed during resume)
- **Started:** N/A
- **Completed:** 2026-01-22T22:40:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added explicit per-watch enjoyment rates and rewired overall enjoyment income to sum owned watches.
- Preserved prestige legacy scaling by applying the multiplier to the final tier-based enjoyment rate.
- Added unit coverage proving tier ordering and correct summed enjoyment behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add enjoyment tier metadata and rate calculation** - `3a36301` (feat)
2. **Task 2: Add unit coverage for enjoyment tiers** - `62e82b9` (test)

**Plan metadata:** (added in the Phase 13 docs commit)

## Files Created/Modified

- `src/game/state.ts` - Add `enjoymentCentsPerSec` and tier-based enjoyment rate calculation.
- `tests/enjoyment.unit.test.tsx` - Assert per-item enjoyment ordering and summed enjoyment behavior.
- `tests/maison.unit.test.tsx` - Align enjoyment assertions with the new per-watch helper.

## Decisions Made

- Used explicit per-watch enjoyment rates instead of deriving enjoyment from collection value so UI can show stable per-watch rates.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Ready for 13-02-PLAN.md.

---
*Phase: 13-enjoyment-economy-foundation*
*Completed: 2026-01-22*
