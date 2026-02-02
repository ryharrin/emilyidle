---
phase: 39-collection-info-embedded-in-catalog
plan: 02
subsystem: ui
tags: [react, ui-copy, catalog, collection]

# Dependency graph
requires:
  - phase: 38-catalog-lock-disabled-explanations
    provides: Catalog purchase surface with lock/explanation states
provides:
  - Collection naming standardized across primary UI and help copy
  - Prestige and upgrade copy aligned with Collection terminology
affects: [39-03, 39-04, 40-01]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Copy updates preserve selectors and persistence keys"]

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/ui/help/helpContent.ts
    - src/ui/prestigeOnboarding.ts
    - src/ui/prestigeSummary.ts
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/NostalgiaTab.tsx
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/UpgradesTab.tsx
    - src/ui/tabs/WorkshopCraftingSection.tsx
    - src/ui/tabs/WorkshopTab.tsx

key-decisions:
  - None - followed plan as specified

patterns-established:
  - "UI copy can shift terminology without touching selectors"

# Metrics
duration: 6 min
completed: 2026-02-02
---

# Phase 39 Plan 02: Collection Naming Summary

**Collection naming now matches the shopping loop across tabs, help copy, and prestige guidance without changing selectors.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-02T07:14:46Z
- **Completed:** 2026-02-02T07:20:54Z
- **Tasks:** 1
- **Files modified:** 11

## Accomplishments
- Updated primary navigation, stats, and coachmark wording to use Collection naming.
- Aligned catalog, upgrades, prestige, and nostalgia UI copy with Collection terminology.
- Cleaned help text to remove Vault references while keeping selectors and storage keys intact.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename the primary tab label and visible UI copy from “Vault” to “Collection” (VLT-04)** - `60b3725` (feat)

**Plan metadata:** _pending_

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/App.tsx` - Updates tab label, hero copy, and stats labels for Collection naming.
- `src/ui/help/helpContent.ts` - Removes Vault references in help bodies and reset copy.
- `src/ui/prestigeOnboarding.ts` - Aligns prestige messaging with Collection terminology.
- `src/ui/prestigeSummary.ts` - Updates prestige keep/lose copy to remove Vault wording.
- `src/ui/tabs/CatalogTab.tsx` - Aligns catalog archive copy with Collection naming.
- `src/ui/tabs/CollectionTab.tsx` - Renames collection header and supporting copy.
- `src/ui/tabs/NostalgiaTab.tsx` - Updates nostalgia reset messaging to Collection naming.
- `src/ui/tabs/StatsTab.tsx` - Renames metrics and journal copy to Collection naming.
- `src/ui/tabs/UpgradesTab.tsx` - Renames upgrade headers and labels to Collection naming.
- `src/ui/tabs/WorkshopCraftingSection.tsx` - Updates crafting copy to Collection naming.
- `src/ui/tabs/WorkshopTab.tsx` - Updates workshop teaser copy to Collection naming.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Collection naming is consistent across UI surfaces and help.
- Ready for Phase 39 Plan 03 (domain display strings) and Plan 04 (test updates).

---
*Phase: 39-collection-info-embedded-in-catalog*
*Completed: 2026-02-02*
