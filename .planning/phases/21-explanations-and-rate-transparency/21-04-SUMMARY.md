---
phase: 21-explanations-and-rate-transparency
plan: 04
subsystem: ui
tags: [stats, rates, help, explanations]

# Dependency graph
requires:
  - phase: 21-01
    provides: Rate breakdown selectors
  - phase: 21-02
    provides: ExplainButton + Help deep-linking
provides:
  - StatsTab rate breakdown disclosures (cash/sec + enjoyment/sec)
affects:
  - 21-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Native details/summary disclosure for tap-friendly breakdowns

key-files:
  created: []
  modified:
    - src/ui/tabs/StatsTab.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "stats rate breakdown uses selector exports (no UI math)"
  - "rate breakdown disclosure uses data-testid enjoyment-rate-breakdown / cash-rate-breakdown"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 21 Plan 04: Stats Rate Breakdown Disclosures Summary

**Stats now includes tap-friendly rate breakdown disclosures for enjoyment/sec and dollars/sec, wired to the Rates help section.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T05:13:32Z
- **Completed:** 2026-01-27T05:13:32Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added two `<details>/<summary>` blocks in Stats with stable test ids for enjoyment and cash rate breakdowns.
- Breakdown rendering is driven by selector exports (`getEnjoymentRateBreakdown` / `getCashRateBreakdown`) with no UI-side math.
- Cash breakdown explicitly surfaces event multiplier, softcap efficiency, and therapist salary.
- Added inline `ExplainButton` linking to the Rates help section.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit` (pass)

## Decisions Made

None - followed plan as specified.

## Next Phase Readiness

Ready for 21-05 (Nostalgia unlock order explain affordance) and 21-06 (e2e coverage for explanations + rate breakdowns).

---
*Phase: 21-explanations-and-rate-transparency*
*Completed: 2026-01-27*
