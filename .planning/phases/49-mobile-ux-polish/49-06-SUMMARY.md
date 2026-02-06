---
phase: 49-mobile-ux-polish
plan: 6
subsystem: ui
tags: [react, virtualization, playwright, bottom-sheet]

# Dependency graph
requires:
  - phase: 49-05
    provides: compact filters + price sort foundation for new affordances
provides:
  - hover/focus stat previews, affordable glow cues, and dismantle gating for catalog cards
  - virtualization hook + thresholded rendering so long lists stay performant while preserving selectors
  - mobile bottom-sheet details that reuse the catalog detail renderer and restore focus
affects:
  - 49-07

# Tech tracking
tech-stack:
  added: [@tanstack/react-virtual]
  patterns: [bottom-sheet portal with focus return, thresholded virtualization for long lists]

key-files:
  created: [src/ui/components/catalog/CatalogCardDetailsSheet.tsx, src/ui/hooks/useCatalogVirtualizer.ts]
  modified: [src/ui/tabs/CatalogTab.tsx, src/style.css, src/App.tsx, tests/catalog.unit.test.tsx, tests/catalog-actionable-visual.spec.ts, tests/touch-targets.spec.ts, tests/catalog-tier-sections.spec.ts, package.json, pnpm-lock.yaml]

key-decisions:
  - "Virtualize the catalog only when 200+ entries are present so range selectors stay intact in the majority of use cases."
  - "Portal the mobile detail sheet while reusing the catalog detail renderer and returning focus to the trigger when closed."

patterns-established:
  - "Portal-backed bottom sheet that directly renders catalog detail markup and restores focus."
  - "Threshold-driven virtualization with overscan while keeping lane selectors untouched under the default sort."

# Metrics
duration: 17min
completed: 2026-02-06
---

# Phase 49-mobile-ux-polish Plan 06 Summary

**Catalog cards now show hover stat previews and affordable glows, long lists virtualize, and mobile users get a focus-returning detail sheet while tests cover the new flows.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-02-06T08:23:12Z
- **Completed:** 2026-02-06T08:40:11Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Layered hover/focus stat previews, glow affordances, and workshop-gated dismantle buttons into each catalog card with matching unit tests.
- Added @tanstack/react-virtual + a catalog virtualizer hook so long lists render only the visible rows while lane selectors stay stable.
- Built a bottom-sheet detail surface that portals catalog content, restores focus, and keeps new Playwright regressions green.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add catalog actionability affordances and dismantle gating** - `31203da` (feat)
2. **Task 2: Integrate virtualization and mobile bottom-sheet details** - `14944b9` (feat)
3. **Task 3: Refresh catalog visual/mobile regressions** - `8197aac` (test)

**Plan metadata:** 5ac0ed7 (docs: complete plan)

## Files Created/Modified

- `src/ui/components/catalog/CatalogCardDetailsSheet.tsx` - modal/bottom-sheet wrapper used by catalog cards on mobile.
- `src/ui/hooks/useCatalogVirtualizer.ts` - reusable wrapper around TanStack Virtual used by the catalog grid.
- `src/ui/tabs/CatalogTab.tsx` - wires previews, gating, virtualization, and the bottom sheet into the catalog UI.
- `src/style.css` - preview glow/dismantle styling, virtualized grid padding, and bottom-sheet chrome.
- `tests/catalog.unit.test.tsx` - unit guards for previews and workshop gating.
- `tests/catalog-actionable-visual.spec.ts`, `tests/touch-targets.spec.ts`, `tests/catalog-tier-sections.spec.ts` - refreshed Playwright coverage for new affordances.
- `package.json` / `pnpm-lock.yaml` - add @tanstack/react-virtual for virtualization.
- `src/App.tsx` - forwards `atelierUnlocked` so gating respects workshop unlocks.

## Decisions Made

- Adding virtualization only when 200+ entries are present keeps quick loads fast while letting long lists stay usable without players noticing virtualization.
- Portaling the detail sheet through the catalog detail renderer keeps copy/testing consistent and lets the sheet restore focus to the triggering button.

## Deviations from Plan

None – plan executed exactly as written.

## Issues Encountered

- TypeScript complained when `CatalogTab` did not expose `atelierUnlocked` after wiring the new gating props, so the prop was bubbled through `CatalogTabProps` before rerunning typecheck.

## User Setup Required

None – no external services involved.

## Next Phase Readiness

- The catalog list now virtualizes and the detail sheet flows are in place, so the next plan can build on top of those affordances without reintroducing regressions.
- No blockers remain; the refreshed tests lock in the new behavior for future phases.

---
*Phase: 49-mobile-ux-polish*
*Completed: 2026-02-06*
