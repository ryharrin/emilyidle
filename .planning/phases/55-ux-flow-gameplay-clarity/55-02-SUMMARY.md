---
phase: 55-ux-flow-gameplay-clarity
plan: 2
subsystem: career-primary-action
tags: [career, ux, gameplay]
requires:
  - 55-01-SUMMARY.md
provides:
  - Canonical Career primary-action lane without competing hero prompts
  - Deterministic now/next guidance copy for first-glance decision clarity
  - Stable selectors for Career primary action contracts
key-files:
  modified:
    - src/ui/tabs/career/CareerPanel.tsx
    - src/ui/components/CareerNextActionCard.tsx
    - src/ui/components/CareerProgressCard.tsx
    - src/style.css
    - tests/career-next-action.unit.test.ts
    - tests/career-landing.unit.test.ts
    - tests/collection-loop.spec.ts
metrics:
  completed: 2026-02-06
---

# Phase 55 Plan 02 Summary

Consolidated Career guidance into one canonical primary-action surface so players get a single, unambiguous next step in the loop.

## Accomplishments
- Unified competing immediate/next prompts into one primary-action lane on Career.
- Clarified top-of-panel priority by separating high-frequency action guidance from lower-priority diagnostics.
- Preserved selector contracts used by unit/e2e coverage for Career action targeting.

## Verification
- `pnpm test:unit -- tests/career-next-action.unit.test.ts tests/career-landing.unit.test.ts tests/career-progress.unit.test.ts`
- `pnpm test:e2e -- tests/collection-loop.spec.ts -g "fresh save career session leads into first catalog purchase"`

## Notes
- Follow-on mobile ergonomics adjustments for this canonical lane were implemented in `55-03-PLAN.md`.
