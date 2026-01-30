---
phase: 31-rate-clarity-gap-closure
plan: 01
subsystem: gameplay
tags: [events, cash-rate, selectors, react, stats]

# Dependency graph
requires:
  - phase: 30-workshop-atelier-and-docs
    provides: Rate transparency UI and v3.0 Help/Stats baseline
provides:
  - Event-adjusted cash accrual and cash rate breakdown aligned with sim
affects: [rate-clarity, upgrades, stats]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Event-adjusted cash rate helper in selectors shared by sim and UI

key-files:
  created:
    - .planning/phases/31-rate-clarity-gap-closure/31-01-SUMMARY.md
  modified:
    - src/game/selectors/index.ts
    - src/game/sim.ts
    - src/App.tsx
    - src/ui/tabs/StatsTab.tsx
    - tests/rate-breakdowns.unit.test.ts
    - tests/career-first-economy.unit.test.ts
    - .planning/STATE.md

key-decisions:
  - None - followed plan as specified

patterns-established:
  - "getEffectiveCashRateCentsPerSec applies event multipliers for cash"

# Metrics
duration: 3m 31s
completed: 2026-01-30
---

# Phase 31 Plan 01: Rate Clarity Gap Closure Summary

**Event multipliers now drive cash accrual and all dollars/sec displays via a shared effective cash rate helper.**

## Performance

- **Duration:** 3m 31s
- **Started:** 2026-01-30T15:26:20Z
- **Completed:** 2026-01-30T15:29:51Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Applied event multipliers to cash accrual in the sim using a shared selector helper
- Aligned header dollars/sec and Stats cash breakdown with event-adjusted cash rate
- Updated unit coverage for cash breakdown totals and event multiplier behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply event multiplier to cash accrual via a shared selector helper** - `b083e96` (feat)
2. **Task 2: Make dollars/sec display + breakdown use event-adjusted cash rate** - `97d3616` (feat)

**Plan metadata:** _pending_

## Files Created/Modified
- `.planning/phases/31-rate-clarity-gap-closure/31-01-SUMMARY.md` - Plan 31-01 execution summary
- `src/game/selectors/index.ts` - Effective cash rate helper and event-aware cash breakdown
- `src/game/sim.ts` - Event-adjusted cash accrual in step loop
- `src/App.tsx` - Header dollars/sec uses effective cash rate
- `src/ui/tabs/StatsTab.tsx` - Cash breakdown includes event multiplier term
- `tests/rate-breakdowns.unit.test.ts` - Cash breakdown expectations updated
- `tests/career-first-economy.unit.test.ts` - Event-adjusted cash rate assertions

## Decisions Made
None - followed plan as specified

## Deviations from Plan

None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
Phase 31 gap closure can proceed with remaining plans (31-02, 31-03); no blockers identified.

---
*Phase: 31-rate-clarity-gap-closure*
*Completed: 2026-01-30*
