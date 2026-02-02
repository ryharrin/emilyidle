---
phase: 40-upgrade-status-copy-alignment
plan: 02
subsystem: ui
tags: [react, typescript]

# Dependency graph
requires:
  - phase: 39-collection-info-embedded-in-catalog
    provides: Catalog shopping surface with collection context
provides:
  - Upgrade-related UI copy aligned to enjoyment-only economy
  - Help text clarifying upgrades affect enjoyment, not cash/sec
affects:
  - phase-40-03-upgrade-previews
  - phase-41-regression-guardrails

# Tech tracking
tech-stack:
  added: []
  patterns: ["Upgrade income multipliers labeled as enjoyment in UI copy"]

key-files:
  created: []
  modified:
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/MaisonTab.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/help/helpContent.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Upgrade-related income multiplier copy references enjoyment/sec"

# Metrics
duration: 2 min
completed: 2026-02-02
---

# Phase 40 Plan 02: Upgrade Status + Copy Alignment Summary

**Upgrade effect copy now consistently labels income multipliers as enjoyment and the help text mirrors the enjoyment-first economy.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-02T07:59:32Z
- **Completed:** 2026-02-02T08:01:42Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Updated Atelier and Maison upgrade cards to describe income multipliers as enjoyment boosts.
- Reworded Maison line effects in Collection to avoid cash multiplier claims.
- Clarified upgrade and softcap help text to match the enjoyment-only economy.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Atelier and Maison upgrade effect labels to enjoyment-only wording** - `6468b4d` (fix)
2. **Task 2: Fix Maison line multiplier wording in Collection to enjoyment-only** - `ca1d583` (fix)
3. **Task 3: Align help copy about upgrades and softcap to the enjoyment-only economy** - `794b6fd` (fix)

**Plan metadata:** (docs commit created after tasks)

## Files Created/Modified
- `src/ui/tabs/WorkshopTab.tsx` - Adjusts workshop upgrade effect labels to enjoyment-only.
- `src/ui/tabs/MaisonTab.tsx` - Adjusts maison upgrade effect labels to enjoyment-only.
- `src/ui/tabs/CollectionTab.tsx` - Adjusts maison line effect labels to enjoyment-only.
- `src/ui/help/helpContent.ts` - Aligns upgrade and softcap help copy with enjoyment economy.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Copy alignment complete; ready for remaining Phase 40 upgrade preview adjustments.

---
*Phase: 40-upgrade-status-copy-alignment*
*Completed: 2026-02-02*
