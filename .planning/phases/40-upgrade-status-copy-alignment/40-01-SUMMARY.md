---
phase: 40-upgrade-status-copy-alignment
plan: 01
subsystem: ui
tags: [react, catalog, upgrades, testing]

# Dependency graph
requires:
  - phase: 39-collection-info-embedded-in-catalog
    provides: Catalog shopping header with collection context pill
provides:
  - Catalog upgrade context helper derived from state selectors
  - Catalog header upgrade status pill with stable test id
  - Unit + e2e coverage for upgrade context rendering
affects: [40-02-upgrade-copy-alignment, 40-03-upgrade-previews, 41-stability-guardrails]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Catalog context helpers derived from selectors"]

key-files:
  created: [src/ui/catalog/upgradeContext.ts]
  modified:
    [src/ui/tabs/CatalogTab.tsx, tests/catalog.unit.test.tsx, tests/catalog-buy-buttons.spec.ts]

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Catalog header status pills are pure selector-derived summaries"

# Metrics
duration: 2 min
completed: 2026-02-02
---

# Phase 40 Plan 01: Catalog Upgrade Status Summary

**Catalog now surfaces upgrade progress counts in the shopping header via a selector-derived context helper with regression coverage.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-02T07:59:35Z
- **Completed:** 2026-02-02T08:02:05Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added a catalog upgrade context helper derived from upgrade selectors.
- Rendered a new catalog header upgrade status pill with a stable test id.
- Extended unit and e2e coverage to guard the upgrade context pill.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a Catalog upgrade context helper** - `b6cec8e` (feat)
2. **Task 2: Render upgrade status in the Catalog header without changing existing selectors** - `34e7430` (feat)
3. **Task 3: Add unit + e2e regression coverage for the upgrade status pill** - `d326a30` (test)

**Plan metadata:** (docs commit)

## Files Created/Modified
- `src/ui/catalog/upgradeContext.ts` - derives catalog-ready upgrade status totals.
- `src/ui/tabs/CatalogTab.tsx` - renders the upgrade status pill in the header.
- `tests/catalog.unit.test.tsx` - asserts upgrade context pill exists in unit coverage.
- `tests/catalog-buy-buttons.spec.ts` - checks upgrade context pill visibility in e2e.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 40-02-PLAN.md (copy alignment pass).

---
*Phase: 40-upgrade-status-copy-alignment*
*Completed: 2026-02-02*
