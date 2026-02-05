---
phase: 48-session-atelier
plan: 48-07
subsystem: ui
tags: [react, selectors, tooltips, typescript]

# Dependency graph
requires:
  - phase: 48-session-atelier/48-06
    provides: "Blueprint shopping UI + workshop scaffolding so the detail helper could reuse the same data"
provides:
  - "Selector-level `getWorkshopBlueprintCostDetail` describing current/next costs + delta for the Atelier reset"
  - "Blueprint cost detail component with anchored tooltip listing enjoyment/cash multipliers and tier unlocks"
  - "Workshop and Upgrades panels showing the same current/next blueprint cost detail for clarity"
affects:
  - 48-11
# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralize blueprint cost math in selectors and re-export via the facade"
    - "Anchor tooltip copy reuse ensures Workshop + Upgrades panels explain the same rewards"
key-files:
  modified:
    - src/game/selectors/index.ts
    - src/ui/components/BlueprintCostDetail.tsx
    - src/ui/helpers/blueprintTooltip.ts
    - src/ui/tabs/WorkshopTab.tsx
    - src/ui/tabs/UpgradesTab.tsx
    - src/style.css
    - tests/workshop-atelier.unit.test.ts
key-decisions:
  - "Keep blueprint cost detail in selectors so any UI surface can share the same canonical currency math."
  - "Use an anchored tooltip to spell out the enjoyment/cash multipliers and next Atelier tier without cluttering the panel."
patterns-established:
  - "Blueprint detail components combine current/next/delta rows with consistent tooltip copy."
  - "Workshop and Upgrades use the same helper to keep the display synchronized across tabs."
# Metrics
duration: 9m57s
completed: 2026-02-05
---
# Phase 48-session-atelier Plan 48-07 Summary

**Blueprint cost detail surfaces current/next values plus reward math in both the Workshop reset and atelier upgrade surfaces**

## Performance

- **Duration:** 9 m 57 s
- **Started:** 2026-02-05T18:09:00Z
- **Completed:** 2026-02-05T18:18:57Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Added `getWorkshopBlueprintCostDetail` so the model exposes current cost, next cost, delta, and availability in a single helper.
- Built `BlueprintCostDetail` plus `buildBlueprintTooltip` so the tooltip can explain the enjoyment/cash multipliers and tier unlocks tied to the next run.
- Wired the new component into Workshop and Upgrades tabs so both surfaces display the same current/next blueprint cost detail.

## Task Commits
1. **Task 1: Add blueprint cost detail selector helper (current + next)** - `16bc7b8` (feat)
2. **Task 2: Show current + next blueprint cost in Workshop and Upgrades UI** - `a7b1717` (feat)

**Plan metadata:** pending final docs commit

## Files Created/Modified
- `src/game/selectors/index.ts` - Blueprint cost detail helper + exported type.
- `src/ui/components/BlueprintCostDetail.tsx` - Reusable component showing current/next/delta rows and anchored tooltip.
- `src/ui/helpers/blueprintTooltip.ts` - Tooltip builder describing multiplier rewards and tier unlocks.
- `src/ui/tabs/WorkshopTab.tsx` - Injected the detail component inside the reset panel and reused the tooltip data.
- `src/ui/tabs/UpgradesTab.tsx` - Added the same detail component above the workshop upgrade list.
- `src/style.css` - Visual styling for the new blueprint detail gadget.
- `tests/workshop-atelier.unit.test.ts` - Unit coverage cold ensuring costs stay monotonic and change when enjoyment increases.

## Decisions Made
- Blueprint cost detail logic remains in selectors to avoid duplicating math across panels.
- Tooltip copy now uses crafted boost and Maison line multipliers so players see how enjoyment/cash rates rise along with each reset.

## Deviations from Plan

None - implemented as scoped in the plan.

## Issues Encountered
- None beyond polishing styling and ensuring the tooltip tied to the same helper math.

## User Setup Required
None - no external services require configuration.

## Next Phase Readiness
- Blueprint cost clarity anchors future Atelier plans (48-11) and gives Claude consistent tooltip copy for metric reviews.

---
*Phase: 48-session-atelier*
*Completed: 2026-02-05*
