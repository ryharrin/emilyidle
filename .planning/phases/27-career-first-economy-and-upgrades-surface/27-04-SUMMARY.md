---
phase: 27-career-first-economy-and-upgrades-surface
plan: 04
subsystem: ui
tags: [react, typescript, upgrades, vitest]

# Dependency graph
requires:
  - phase: 27-03
    provides: Career-first economy surfaces and tab framework updates
provides:
  - Dedicated Upgrades tab with grouped upgrade cards and rate preview deltas
  - Vault callout routing upgrade purchases to the Upgrades tab
  - Updated tab navigation to include upgrades
affects: [27-05, 27-06, upgrades-surface]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Rate preview deltas computed via buy* state simulation in UI

key-files:
  created:
    - src/ui/tabs/UpgradesTab.tsx
  modified:
    - src/App.tsx
    - src/style.css
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CareerTab.tsx
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/MaisonTab.tsx
    - src/ui/tabs/NostalgiaTab.tsx
    - src/ui/tabs/SaveTab.tsx
    - src/ui/tabs/StatsTab.tsx
    - src/ui/tabs/WorkshopTab.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Upgrade rate preview deltas computed via buy* simulation before purchase"

# Metrics
duration: 6 min
completed: 2026-01-29
---

# Phase 27 Plan 04: Career-First Economy & Upgrades Surface Summary

**Dedicated Upgrades tab with grouped upgrade cards, rate-preview deltas, and a Vault callout pointing to the new surface.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-29T19:29:54Z
- **Completed:** 2026-01-29T19:36:03Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Added a dedicated Upgrades tab with grouped cash, Atelier, and Maison upgrade cards plus preview deltas.
- Removed Vault sidebar upgrade browsing in favor of a callout linking to the Upgrades tab.
- Updated tab navigation coverage to include the new Upgrades focus order.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a top-level Upgrades tab and render a new Upgrades panel** - `b18d95a` (feat)
2. **Task 2: Remove duplicate upgrade browsing from Vault sidebar (Collection tab)** - `1939859` (feat)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `src/ui/tabs/UpgradesTab.tsx` - Consolidated upgrade browsing with rate preview deltas.
- `src/App.tsx` - Adds Upgrades tab and wires the new panel.
- `src/style.css` - Layout styles for the Upgrades surface.
- `src/ui/tabs/CollectionTab.tsx` - Replaces Vault upgrade list with an Upgrades callout.
- `src/ui/tabs/CareerTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/CatalogTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/MaisonTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/NostalgiaTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/SaveTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/StatsTab.tsx` - Includes Upgrades in the tab id union.
- `src/ui/tabs/WorkshopTab.tsx` - Includes Upgrades in the tab id union.
- `tests/catalog.unit.test.tsx` - Updates navigation focus tests for the new tab order.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated navigation focus test for the Upgrades tab**
- **Found during:** Task 2 (Remove duplicate upgrade browsing from Vault sidebar)
- **Issue:** Unit test expected keyboard focus to move directly from Career to Save; the Upgrades tab now sits between them.
- **Fix:** Updated `tests/catalog.unit.test.tsx` to include Upgrades in the arrow navigation sequence.
- **Files modified:** `tests/catalog.unit.test.tsx`
- **Verification:** `pnpm run typecheck && pnpm run test:unit`
- **Committed in:** `1939859`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to keep tests aligned with the new tab order; no scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 27-05-PLAN.md; no blockers noted.

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
