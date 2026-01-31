---
phase: 33-career-stages-and-permanent-choices
plan: 01
subsystem: gameplay
tags: [career, persistence, migration]

# Dependency graph
requires:
  - phase: 32-career-landing-and-defaults
    provides: Career-first landing baseline
provides:
  - Persisted career permanence fields (track + stage choices) with backward-compatible migration
affects: [save-compat, career]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Persisted optional fields + createStateFromSave migration for save evolution

key-files:
  created:
    - .planning/phases/33-career-stages-and-permanent-choices/33-01-SUMMARY.md
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/persistence.ts
    - src/game/actions/index.ts
    - tests/persistence.unit.test.ts

key-decisions:
  - Added permanent stage choice fields without introducing explicit stage IDs (stages remain level-derived)
  - Migrated existing saves: if activeTrackId exists, it becomes primaryTrackId and pins activeTrackId

# Metrics
duration: 25m
completed: 2026-01-30
---

# Phase 33 Plan 01: Career Permanence Schema Summary

**Extended the career save schema with permanent-choice fields and migrated existing saves safely.**

## What Changed

- Added new persisted fields on `TherapistCareerState`:
  - `primaryTrackId`, `modalityId`, `operatingStyleId`, `expansionFocusId`
- Updated save sanitization and state restoration:
  - Optional fields are accepted when present
  - Existing saves with `activeTrackId` automatically get `primaryTrackId = activeTrackId`
  - If `primaryTrackId` is set, `activeTrackId` is pinned to it on load

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`

## Next

Proceed to 33-02 to define stage thresholds and apply the permanent-choice effects in selectors/actions and wire UI for choosing with before/after previews.

---
*Phase: 33-career-stages-and-permanent-choices*
*Completed: 2026-01-30*
