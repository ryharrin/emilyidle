phase: 45-per-watch-stats-surfaces
plan: 2
subsystem: ui
tags: [catalog, stats, css, vitest]
requires:
  - phase: 45-01
    provides: Selector-backed per-watch rows and equipped contribution helpers so UI can stop duplicating the math
provides:
  - `PerWatchStatsTable` (sticky controls + expandable per-model rows) reuses the view-model selectors and exposes stable test ids
  - Catalog simply renders the table ahead of the shop cards while passing the current event multiplier and worn watch highlight
  - Collection surfaces the equipped watch contribution call-out with the selector-based enjoyment delta, career cash explanation, and event multiplier reminder
  - Styling updates keep the new table sticky, readable on mobile, and in sync with existing panel chrome
tech-stack:
  added: []
  patterns: [stats table, sticky controls, contribution call-out]
key-files:
  created: [src/ui/components/PerWatchStatsTable.tsx]
  modified:
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/style.css
key-decisions:
  - "Sort + filter controls need to stay sticky so the stats surface can work on long lists without rewinding the scroll context."
  - "Collection’s contribution call-out should reuse the selector math we already wrote instead of recomputing the multiplier manually."
duration: 20 min
completed: 2026-02-03T19:42:59Z
---

# Phase 45: Per-Watch Stats Surfaces Summary

**Catalog now surfaces the per-watch table (sortable/filterable) and Collection explains what the equipped watch contributes, all driven by the selector-backed view model plus the new styling for sticky controls.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-03T19:22:00Z
- **Completed:** 2026-02-03T19:42:59Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added `PerWatchStatsTable` (`src/ui/components/PerWatchStatsTable.tsx`) with sticky sort/filter controls, stable expansion keyed by `modelId`, and `data-testid` anchors for every row and control.
- Wired `CatalogTab`/`CatalogPurchasePanel` to compute rows via `getPerWatchStatsRows`, pass the event multiplier/highlight, and render the table above the catalog grid.
- Added the equipped watch contribution panel in `CollectionTab`, driven by `getEquippedWatchContribution`, so the player can see the enjoyment delta, the career-anchored cash explanation, and the active event multiplier.
- Extended `src/style.css` with the new panel/z-order rules, sticky controls, responsive grid, and contribution call-out styling.

## Task Commits

1. **Task 1: Build a reusable per-watch stats table component** — delivered `src/ui/components/PerWatchStatsTable.tsx` with sorting, filtering, and expandable rows.
2. **Task 2: Wire per-watch stats into Catalog and the equipped contribution call-out into Collection** — done via `src/ui/tabs/CatalogTab.tsx` and `src/ui/tabs/CollectionTab.tsx` with the selector wiring described above.
3. **Task 3: Add styling for sticky controls and table/list layout** — implemented in `src/style.css` for the table, sticky header, and contribution call-out.

## Files Created/Modified

- `src/ui/components/PerWatchStatsTable.tsx` — stats table/view-model renderer with sticky controls and details.
- `src/ui/tabs/CatalogTab.tsx` — edges in the table ahead of the shop, wires `currentEventMultiplier`/`nowMs`, and re-exports new props to the Purchase Panel.
- `src/ui/tabs/CollectionTab.tsx` — new contribution call-out panel that references the selector delta and event multiplier.
- `src/style.css` — new CSS for the table, controls, rows, and call-out (including responsive/44px touch rules).

## Decisions Made

- Sticky controls keep filters accessible while scrolling through the long stats table; the controls use `position: sticky` with a transparent backdrop that matches the panel chrome.
- The Collection call-out reuses `getEquippedWatchContribution` so story logic stays in selectors and the UI simply explains the resulting delta.

## Deviations from Plan

None.

## Issues Encountered

None.

## Verification

- `pnpm typecheck`
- `pnpm test:unit -- tests/per-watch-stats.unit.test.ts`

## Next Phase Readiness

- Wave 3 (regression coverage for sorting/filtering stability and the contribution call-out) can now hook into these selectors and UI surfaces.
- Phase 45 overall is ready for automation/UAT once the tests and Playwright checks wrap the new UI.

---
*Phase: 45-per-watch-stats-surfaces*
*Completed: 2026-02-03*
