phase: 45-per-watch-stats-surfaces
plan: 1
subsystem: domain
tags: [selectors, stats, vitest]
requires:
  - phase: 44-01
    provides: Tiered mini-game outcomes with deterministic reward math so downstream stats can trust the same multipliers
provides:
  - Pure per-watch stats view-model selectors plus equipped contribution helpers so the UI can source rows without redoing the math
  - Career-anchored cash semantics (row data includes the therapist salary rate + explanation) and event multiplier sanitization for per-watch outputs
  - Regression coverage that locks down enjoyment scaling, cash/public row counts, and the equipped watch delta math
tech-stack:
  added: []
  patterns: [per-watch view model, career cash explanation, event multiplier sanitization]
key-files:
  created: [src/game/selectors/perWatchStats.ts, tests/per-watch-stats.unit.test.ts]
  modified: [src/game/selectors/index.ts]
key-decisions:
  - "Keep cash rows tied to the therapist career rate and surface an explicit explanation so UI consumers never invent per-watch cash allocations."
  - "Derive the equipped watch delta by comparing `getEnjoymentRateCentsPerSec` with/without the worn watch instead of recomputing all multipliers."
duration: 8 min
completed: 2026-02-03
---

# Phase 45: Per-Watch Stats Surfaces Summary

**Selectors now produce stable rows keyed by model, highlight reserve payloads, and explain that only enjoyment varies per watch while cash stays anchored to the career rate.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-03T19:16:21Z
- **Completed:** 2026-02-03T19:24:15Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `src/game/selectors/perWatchStats.ts` with `getPerWatchStatsRows` (per-model enjoyment, reserve-aware totals, career cash info, event multiplier sanitization) plus `getEquippedWatchContribution` (enjoyment delta vs. unworn state and cash explanation).
- Exposed the new selectors through the domain barrel so UI code can import them from `src/game/state.ts` instead of deep paths.
- Added `tests/per-watch-stats.unit.test.ts` to cover row counts, event multiplier scaling, and the equipped watch delta while proving cash remains career-based.

## Task Commits

1. **Task 1: Add selector-backed per-watch stats rows** — pending (local diff in `src/game/selectors/perWatchStats.ts`).
2. **Task 2: Wire selectors through the facade** — pending (diff in `src/game/selectors/index.ts`).
3. **Task 3: Regression tests for rows + equipped contribution** — pending (diff in `tests/per-watch-stats.unit.test.ts`).

## Files Created/Modified

- `src/game/selectors/perWatchStats.ts` — new per-watch view model + equipped contribution math that exposes cash explanation and event multiplier sanitization.
- `src/game/selectors/index.ts` — re-exported the new selectors so the facade stays the UI’s single import surface.
- `tests/per-watch-stats.unit.test.ts` — asserts per-model row counts, enjoyment/cash scaling across event multipliers, and the equipped watch delta while keeping cash delta at zero.

## Decisions Made

- Cash rate in the stats rows remains the therapist career salary; each row carries a `cashExplanation` string so UI designers and testers know no per-watch cash allocation was invented.
- Equipped contribution reuses `getEnjoymentRateCentsPerSec` with and without the worn watch to deliver a deterministic delta without duplicating multiplier math.

## Deviations from Plan

None.

## Issues Encountered

- TypeScript requires `therapistCareer.careerStartId` to stay the literal `"phd-program"`, so the tests now assign it with `as const` to satisfy `GameState` without weakening the type.

## User Setup Required

None.

## Next Phase Readiness

- Wave 2 (per-watch stats UI/table in Catalog plus the equipped-watch call-out in Collection) can now focus on wiring these selectors without redoing the math.
- Wave 3 (unit + Playwright regression coverage for sorting/filtering and the contribution call-out) can hook into the stable selectors/tests produced here.

---
*Phase: 45-per-watch-stats-surfaces*
*Completed: 2026-02-03*
