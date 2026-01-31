---
phase: 34-progress-feedback-and-next-actions
plan: 02
subsystem: ui
tags: [career, next-action, selectors]

# Dependency graph
requires:
  - phase: 34-progress-feedback-and-next-actions
    provides: Progress card + next unlock selector
provides:
  - Next action cue (pure selector + UI)
affects: [career, ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Selector returns a single prioritized recommendation

key-files:
  created:
    - src/game/selectors/careerNextAction.ts
    - src/game/selectors/therapistSessions.ts
    - src/ui/components/CareerNextActionCard.tsx
    - tests/career-next-action.unit.test.ts
  modified:
    - src/game/selectors/index.ts
    - src/ui/tabs/career/CareerPanel.tsx

# Metrics
completed: 2026-01-30
---

# Phase 34 Plan 02: Career Next Action Cue Summary

**Career now shows a single "next action" recommendation, prioritized for stage choices first, then sessions, then passive XP.**

## What Changed

- Added `getCareerNextActionCue(state, nowMs)` selector.
- Added `CareerNextActionCard` with `data-testid="career-next-action"` and mounted it near the top of the Career tab.
- Split therapist session helpers into `src/game/selectors/therapistSessions.ts` to keep selectors modular and avoid circular imports.

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`

---
*Phase: 34-progress-feedback-and-next-actions*
*Completed: 2026-01-30*
