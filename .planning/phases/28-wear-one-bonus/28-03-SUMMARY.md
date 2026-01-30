---
phase: 28-wear-one-bonus
plan: 03
subsystem: ui
tags: [worn-watch, vault, modal]

# Dependency graph
requires:
  - phase: 28-01
    provides: Worn watch state + persistence
provides:
  - Vault/Collection equip UX (wear one or none)
  - Worn watch summary card + picker modal
  - Stable test ids for wear/equipped/picker controls
affects: [28-06, 28-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Reuse existing modal overlay styling (nostalgia-modal)

key-files:
  modified:
    - src/ui/tabs/CollectionTab.tsx

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 03: Vault equip UX Summary

Added the “wear one watch” interaction to the Collection tab: a top-of-list worn summary card, one-click Wear on owned watch cards, an Equipped indicator, and a Change modal that lists owned watches plus a wear-none option.

## Accomplishments
- Added `data-testid="worn-watch-summary"` summary card with `data-testid="worn-watch-change"` Change button.
- Added one-click Wear buttons on owned watch cards (`data-testid="watch-wear-{watchId}"`).
- Added an Equipped indicator on the worn card (`data-testid="watch-equipped-{watchId}"`) and ensured switching replaces the previous worn watch.
- Implemented Change picker modal (`data-testid="worn-watch-picker-modal"`) with owned options (`data-testid="worn-watch-option-{watchId}"`), wear none (`data-testid="worn-watch-option-none"`), and close (`data-testid="worn-watch-picker-close"`).

## Verification
- `pnpm run typecheck`

## Files Modified
- `src/ui/tabs/CollectionTab.tsx` - Adds summary card, Wear controls, Equipped indicator, and picker modal.

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
