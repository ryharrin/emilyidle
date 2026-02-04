---
phase: 47-mobile-ui-polish
plan: 1
subsystem: ui
tags: [react, catalog, tier-badge, css]

requires:
  - phase: 46-catalog-expansion
    provides: Tiered catalog variety and per-watch stats foundations
provides:
  - TierBadge component, shared tier metadata, and helpers for catalog/stats consumers
  - Catalog wiring that surfaces tierBadge metadata on every card and powers the per-watch view
affects:
  - 47-mobile-ui-polish Plan 47-02
  - 47-mobile-ui-polish Plan 47-03

tech-stack:
  added: []
  patterns:
    - Tier metadata travels from watch models to catalogs and stats via the same helper set
    - TierBadge styles read CSS variables so the palette remains configurable without JS changes

key-files:
  created:
    - src/ui/components/TierBadge.tsx
    - src/game/tierBadges.ts
    - src/game/selectors/perWatchStats.ts
  modified:
    - src/style.css
    - src/game/data/watchModels.ts
    - src/game/catalog.ts
    - src/ui/components/PerWatchStatsTable.tsx
    - src/ui/tabs/CatalogTab.tsx

key-decisions:
  - "TierBadge metadata plus CSS variable theming drive catalog and per-watch badges"
patterns-established:
  - "Shared tier definitions keep catalog cards and per-watch rows aligned on label, description, and color"
  - "CSS variables supply TierBadge background/text/border colors so the palette is configurable"

duration: 35min
completed: 2026-02-04
---
# Phase 47 Plan 1 Summary

**TierBadge metadata and CSS theming unify catalog cards and per-watch stats around tier cues**

## Performance

- **Duration:** 35 min
- **Started:** 2026-02-04T02:16:13Z
- **Completed:** 2026-02-04T02:51:04Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments

- Added a reusable `TierBadge` component that reads tier color variables, adds an accessible dot/label, and anchors to `data-tier-badge` for automation.
- Stored tier badge metadata centrally, surfaced it through selectors, and rendered TierBadge chips in the per-watch stats table.
- Wired catalog cards to the shared helper so each entry renders the proper label, description, and color-coded badge while showing the per-watch stats block for quick comparison.
- Verified with `pnpm test:unit -- tests/catalog.unit.test.tsx` and `pnpm typecheck` (lint continues to fail for unrelated files listed below).

## Task Commits

1. **Task 1: Create TierBadge component** - `e05f56e` (feat)
2. **Task 2: Add tier metadata to watch models** - `6eca646` (feat)
3. **Task 3: Wire tier badge to catalog renderer** - `f3b075b` (feat)
4. **Task 4: Theme badge colors with CSS vars** - `9ee64fe` (feat)

## Files Created/Modified

- `src/ui/components/TierBadge.tsx` - Reusable tier badge component with optional extra label text and CSS-variable theming.
- `src/game/tierBadges.ts` - Central library of badge labels, descriptions, and CSS variable names for each tier.
- `src/game/data/watchModels.ts` - Each watch model now carries tierBadge metadata for catalog and stats consumers.
- `src/game/selectors/perWatchStats.ts` - Returns per-watch rows with tierBadge data and reuses the shared metadata.
- `src/ui/components/PerWatchStatsTable.tsx` - Renders the badge dot beside each watch name when metadata is available.
- `src/game/catalog.ts` - Exposes `getWatchModelTierBadge` helper so catalog cards share the same metadata.
- `src/ui/tabs/CatalogTab.tsx` - Pulls the helper into each card, renders `TierBadge`, and shows the per-watch stats section near the catalog.
- `src/style.css` - Defines CSS variables and helper classes for the badge, the catalog title layout, and per-watch row alignment.

## Decisions Made

- TierBadge metadata plus CSS variable theming drive catalog and per-watch badges so that labels, descriptions, and colors stay synchronized across surfaces while remaining configurable.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm lint` currently fails because `src/ui/components/QuartzMiniGameModal.tsx`, `src/ui/components/WindingMiniGameModal.tsx`, and `src/ui/components/winding/WindingCrown.tsx` already violate ESLint rules (`@typescript-eslint/no-unused-vars`, `@typescript-eslint/prefer-as-const`). These files were untouched by this plan and will need separate cleanup.

## Next Phase Readiness

- TierBadge + metadata are ready for reuse in Plans 47-02/47-03, so the remaining mobile polish work can proceed without redoing tier wiring.
- No blockers remain; the catalog and per-watch surfaces now share a single source of truth for tier badges.
