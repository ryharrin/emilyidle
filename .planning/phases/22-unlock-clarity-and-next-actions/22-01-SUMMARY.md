---
phase: 22-unlock-clarity-and-next-actions
plan: 01
subsystem: selectors
tags: [unlocks, progress, milestones, achievements]

# Dependency graph
requires:
  - phase: 21-06
    provides: Phase 21 regression coverage baseline
provides:
  - Unlock progress detail helpers for milestones/achievements/reveal/prestige
  - Unit coverage for progress detail helpers
affects:
  - 22-02

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Single UnlockProgressDetail output for consistent UI lock rendering
    - Clamp current/ratio for display (no extra selector fallbacks)

key-files:
  created:
    - tests/unlock-progress.unit.test.ts
  modified:
    - src/game/selectors/index.ts

key-decisions:
  - "Achievement requirement labels mirror milestone requirement label helper"
  - "Reveal ratio helper normalizes raw ratios to the 80% reveal threshold"

patterns-established:
  - "UI can import UnlockProgressDetail from src/game/state without duplicating requirement math"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 22 Plan 01: Unlock Progress Detail Helpers Summary

**Added pure selector helpers for unlock progress details so UI can render lock reasons and progress consistently for milestones, achievements, reveal thresholds, and prestige unlocks.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T05:19:43Z
- **Completed:** 2026-01-27T05:19:43Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 1

## Accomplishments

- Added `UnlockProgressDetail` and helpers:
  - `getMilestoneUnlockProgressDetail`
  - `getAchievementUnlockProgressDetail`
  - `getAchievementRequirementLabel`
  - `getUnlockRevealProgressRatio`
  - `getPrestigeUnlockProgressDetail`
- Added unit coverage in `tests/unlock-progress.unit.test.ts` for milestone/achievement types, reveal normalization, and prestige thresholds.

## Verification

- `pnpm -s run lint` (pass)
- `pnpm -s run test:unit` (pass)

## Decisions Made

- Achievement requirement labels mirror milestone labels, and prestige labels use “Reach {threshold label}”.

## Next Phase Readiness

Ready for 22-02 (shared unlock hint + next unlock panel + empty CTA components).

---
*Phase: 22-unlock-clarity-and-next-actions*
*Completed: 2026-01-27*
