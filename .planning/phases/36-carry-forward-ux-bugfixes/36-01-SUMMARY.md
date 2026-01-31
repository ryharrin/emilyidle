---
phase: 36-carry-forward-ux-bugfixes
plan: 01
subsystem: ui
tags: [quartz, interaction, alignment, playwright]

# Dependency graph
requires:
  - phase: 35-balance-and-help-clarity
    provides: Career depth + help clarity baseline
provides:
  - Quartz set-time dial/hand pivot anchored at dial center (desktop + mobile)
  - Playwright regression coverage for quartz alignment
affects: [ui, interactions, testing]

# Metrics
completed: 2026-01-31
---

# Phase 36 Plan 01: Quartz Set-Time Alignment Summary

Quartz set-time mini-game now anchors the hand pivot at the dial center across desktop and mobile, avoiding transform ordering issues and preventing off-center rendering on narrow viewports.

## Accomplishments

- Updated `QuartzMiniGameModal` to render a center anchor element and rotate the hand around a stable pivot.
- Adjusted quartz CSS so the hand is positioned relative to the center anchor (`bottom: 0`) and rotates without translate/rotate coupling.
- Added Playwright regression coverage that opens the quartz modal and asserts the anchor stays centered for both desktop and mobile viewports.

## Verification

- `pnpm run typecheck`
- `pnpm run test:e2e`

## Files Modified

- `src/ui/components/QuartzMiniGameModal.tsx`
- `src/style.css`
- `tests/quartz-alignment.spec.ts`
