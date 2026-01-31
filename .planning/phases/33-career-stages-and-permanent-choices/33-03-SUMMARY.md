---
phase: 33-career-stages-and-permanent-choices
plan: 03
subsystem: testing
tags: [career, stages, permanence, e2e]

# Dependency graph
requires:
  - phase: 33-career-stages-and-permanent-choices
    provides: Career stages + permanence actions + UI
provides:
  - Unit coverage for stage thresholds and permanent-choice enforcement
  - Playwright coverage for previews + persistence across refresh
affects: [tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Seeded save payloads in Playwright to assert persistence

key-files:
  created:
    - tests/career-stages.unit.test.ts
    - tests/career-permanent-choices.unit.test.ts
    - tests/career-permanent-choices.spec.ts

# Metrics
completed: 2026-01-30
---

# Phase 33 Plan 03: Career Stages + Permanent Choice Tests Summary

**Added unit + e2e coverage for stage unlock mapping, permanence enforcement, preview deltas, and persistence across refresh.**

## What Changed

- Unit tests:
  - `tests/career-stages.unit.test.ts` covers derived stage boundaries (1/3/6/10/15 thresholds).
  - `tests/career-permanent-choices.unit.test.ts` covers:
    - save migration: `activeTrackId` becomes locked `primaryTrackId`
    - one-way selection for track and modality
    - preview and selector deltas (salary/session terms)
- Playwright:
  - `tests/career-permanent-choices.spec.ts` seeds a save, chooses track + modality, asserts preview deltas, waits for autosave, and verifies locked state persists after refresh.

## Verification

- `pnpm run test:unit`
- `pnpm run test:e2e`

## Notes

- The Playwright seeding uses a guarded init script so `page.reload()` exercises persistence instead of re-seeding.

---
*Phase: 33-career-stages-and-permanent-choices*
*Completed: 2026-01-30*
