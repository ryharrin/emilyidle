---
phase: 21-explanations-and-rate-transparency
plan: 03
subsystem: ui
tags: [vault, purchase-gates, help, explanations]

# Dependency graph
requires:
  - phase: 21-02
    provides: ExplainButton + Help deep-linking
provides:
  - Purchase gate messaging for both enjoyment and cash blocks
  - Inline Explain affordance from the blocked purchase state
affects:
  - 21-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Gate UI surfaces the blocking currency + deficit (no silent cash blocks)

key-files:
  created: []
  modified:
    - src/ui/tabs/CollectionTab.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "purchase-gate-* badge contains ExplainButton wired to HELP_SECTION_IDS.gates"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 21 Plan 03: Vault Purchase Gate Explanations Summary

**Vault purchase cards now explain both enjoyment and cash blocks at the point of failure and provide a one-tap ExplainButton to the gates help section.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T04:56:06Z
- **Completed:** 2026-01-27T04:56:06Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Updated `purchase-gate-*` rendering to show a badge for both `blocksBy="enjoyment"` and `blocksBy="cash"`.
- Enjoyment blocks show requirement + deficit; cash blocks show cash deficit.
- Added an inline `ExplainButton` opening Help to the gates section.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:e2e -- tests/collection-loop.spec.ts` (pass)

## Decisions Made

None - followed plan as specified.

## Next Phase Readiness

Ready for 21-04 (Stats rate breakdown disclosures) and 21-06 (e2e regression protection for explain triggers).

---
*Phase: 21-explanations-and-rate-transparency*
*Completed: 2026-01-27*
