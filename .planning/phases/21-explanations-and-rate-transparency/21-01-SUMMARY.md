---
phase: 21-explanations-and-rate-transparency
plan: 01
subsystem: selectors
tags: [selectors, rates, breakdown]

# Dependency graph
requires:
  - phase: 20-02
    provides: Help modal entry point (Phase 20)
provides:
  - Selector-level cash/enjoyment rate breakdown helpers
  - Unit tests asserting breakdown totals match authoritative selectors
affects:
  - 21-04
  - 21-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Represent rates as base + modifier terms (read-only), with totals tested against existing selectors

key-files:
  created:
    - tests/rate-breakdowns.unit.test.ts
  modified:
    - src/game/selectors/index.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Rate breakdowns expose event multiplier + softcap efficiency while preserving authoritative selector math"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 21 Plan 01: Rate Breakdown Selector Exports Summary

**Added selector-level rate breakdown helpers (cash/enjoyment) so UI can explain rates as base + modifiers without re-deriving formulas.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T04:44:32Z
- **Completed:** 2026-01-27T04:44:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `getEnjoymentRateBreakdown(state, eventMultiplier)` exposing base rate + multiplier terms (prestige legacy, event) and an effective total matching simulation behavior.
- Added `getCashRateBreakdown(state, eventMultiplier)` exposing vault base addend, multiplier terms, softcap metadata/efficiency, therapist salary addend, and a total matching `getTotalCashRateCentsPerSec`.
- Added `tests/rate-breakdowns.unit.test.ts` to lock totals to the existing selector outputs.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit` (pass)

## Decisions Made

None - followed plan as specified.

## Next Phase Readiness

Ready for 21-02-PLAN.md (Help deep-linking + ExplainButton wiring) and 21-04-PLAN.md (Stats rate breakdown disclosures).

---
*Phase: 21-explanations-and-rate-transparency*
*Completed: 2026-01-27*
