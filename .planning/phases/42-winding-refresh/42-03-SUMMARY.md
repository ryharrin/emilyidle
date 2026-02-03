---
phase: 42-winding-refresh
plan: 3
subsystem: ui
tags: [react, css, vitest, accessibility]

# Dependency graph
requires:
  - phase: 42-winding-refresh
    plan: 42-01
    provides: winding telemetry + animation flow for the modal
  - phase: 42-winding-refresh
    plan: 42-02
    provides: regression coverage for band boundaries and conditional rendering
provides:
  - relaxed penalty window with explicit soft/strict flag signals for UI cues
  - the red glow hint and CSS hook that highlight the soft warning before the strict over-wind threshold engages
affects:
  - Phase 43 (New Watch Mini-Games)
  - winding mini-game UX and regression polish

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Soft vs. strict penalty flags drive both copy and CSS while sticking to the same telemetry math
    - Data attributes control the track glow so UI and reduced-motion overrides stay in sync

key-files:
  created: []
  modified:
    - src/ui/components/winding/windingMath.ts
    - src/ui/components/winding/useWindingRun.ts
    - src/ui/components/WindingMiniGameModal.tsx
    - src/style.css
    - tests/winding-bands.unit.test.ts
    - tests/winding-modal-a11y.unit.test.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - Relaxed the band thresholds so the soft warning only fires near 97% and the strict over-wind message waits until 98.5%.
  - Surface the hint text and track glow via a data attribute so CSS stays aligned with the penalty flags.

patterns-established:
  - "Soft warning" and strict over-wind states share the same telemetry source and drive both copy and CSS.
  - Guard the hint copy and the catalog outcome via tests that still expect the success message to remain hidden until stop.

# Metrics
completed: 2026-02-03
---

# Phase 42 Plan 3: Relaxed winding penalty margin with a soft warning hint

**Soft penalty cues and the red glow hint keep players in the sweet spot until the strict 98.5% over-wind limit triggers.**

## Performance

- **Duration:** 19s
- **Started:** 2026-02-03T15:56:45Z
- **Completed:** 2026-02-03T15:57:05Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Recalibrated the winding thresholds so the “perfect” band stretches to 98.5% and exposed soft/strict penalty flags that keep math deterministic.
- Surface the “stop before the red glow” hint, tie the track highlight to the soft warning, and keep the `Over-wound!` callout locked to the strict threshold inside the modal.
- Expanded the band, modal, and catalog tests so the soft warning copy appears before the outcome and catalog expectations still guard the hidden result.

## Task Commits

1. **Task 1: Calibrate over-wind thresholds for a softer stop margin** - `41cd40d` (fix)
2. **Task 2: Update modal/UX copy to describe the relaxed margin** - `9308787` (feat)
3. **Task 3: Harden regression coverage around the new margins** - `0c3222e` (test)

**Plan metadata:** pending execution docs commit

## Files Created/Modified

- `src/ui/components/winding/windingMath.ts` - consolidates the thresholds into soft/hard constants and returns penalty flags along with the updated tension/velocity math.
- `src/ui/components/winding/useWindingRun.ts` - surfaces the soft/strict penalty flags so the UI reacts without recomputing the math.
- `src/ui/components/WindingMiniGameModal.tsx` - presents the red glow hint, updates the live text near the soft warning, and gates the over-wound warning on the strict flag.
- `src/style.css` - adds the `data-soft-penalty` glow, hint styling, and reduced-motion overrides for the new highlight.
- `tests/winding-bands.unit.test.ts` - covers the new threshold boundaries and penalty flags.
- `tests/winding-modal-a11y.unit.test.tsx` - asserts the red glow hint is present before the outcome while the stop control remains discoverable.
- `tests/catalog.unit.test.tsx` - ensures the hint copy is present in catalog flows and the outcome stays hidden until stop.

## Decisions Made

- Soft warning styling and copy now rely on a single helper flag, and the strict warning only flips once the 98.5% over-wind threshold is reached.
- Tracking data attributes on the track keeps CSS/policy from drifting while still honoring reduced-motion and existing touch-target rules.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 42 now ships a forgiving winding penalty margin with explicit hints; Phase 43’s New Watch Mini-Games can reuse this soft/strict feedback plumbing.
- No blockers remain before transitioning to the New Watch Mini-Games work.
