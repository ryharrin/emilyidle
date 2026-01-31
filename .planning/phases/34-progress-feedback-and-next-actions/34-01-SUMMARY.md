---
phase: 34-progress-feedback-and-next-actions
plan: 01
subsystem: ui
tags: [career, progress, selectors]

# Dependency graph
requires:
  - phase: 33-career-stages-and-permanent-choices
    provides: Stage thresholds + permanent choice surfaces
provides:
  - Career progress bar + next unlock callout
affects: [career, ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure selector-driven UI for progress + callouts

key-files:
  created:
    - src/game/selectors/careerProgress.ts
    - src/ui/components/CareerProgressCard.tsx
    - src/ui/tabs/career/CareerPanel.tsx
    - tests/career-progress.unit.test.ts
  modified:
    - src/game/selectors/index.ts
    - src/game/selectors/therapistPolicy.ts
    - src/ui/tabs/CareerTab.tsx

# Metrics
completed: 2026-01-30
---

# Phase 34 Plan 01: Career Progress UI Summary

**Career now shows a progress card with a progress bar and explicit next-unlock messaging driven by pure selectors.**

## What Changed

- Added `getCareerNextUnlock()` and `getCareerNextStageProgress()` selectors:
  - prefers available permanent choices as the next unlock
  - otherwise targets the next stage threshold
- Added `CareerProgressCard` with stable selectors:
  - `career-progress-card`, `career-progress-bar`, `career-next-unlock`, `career-next-unlock-levels`
- Refactored `src/ui/tabs/CareerTab.tsx` to keep file size under 300 LOC by moving the main body into `src/ui/tabs/career/CareerPanel.tsx`.

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`

---
*Phase: 34-progress-feedback-and-next-actions*
*Completed: 2026-01-30*
