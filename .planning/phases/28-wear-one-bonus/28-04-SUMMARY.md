---
phase: 28-wear-one-bonus
plan: 04
subsystem: tests
tags: [worn-watch, persistence, breakdown, vitest]

# Dependency graph
requires:
  - phase: 28-02
    provides: Worn watch enjoyment multiplier + breakdown term
provides:
  - Unit coverage for worn-watch multiplier values and breakdown term behavior
  - Unit coverage for wornWatchId persistence roundtrip + sanitization
affects: [28-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Encode/decode save payload tests via existing persistence exports

key-files:
  created:
    - tests/persistence.unit.test.ts
  modified:
    - tests/rate-breakdowns.unit.test.ts

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 04: Worn watch unit coverage Summary

Added Vitest coverage to lock in the worn-watch multiplier values, breakdown behavior, and strict persistence handling.

## Accomplishments
- Extended `tests/rate-breakdowns.unit.test.ts` to assert:
  - No `worn-watch` term when wear none.
  - Correct multipliers per bucket (starter/classic/chronograph/tourbillon).
  - Switching worn watch changes the breakdown term.
- Added `tests/persistence.unit.test.ts` to assert:
  - Roundtrip restores valid/owned `wornWatchId`.
  - Missing `wornWatchId` defaults to `null`.
  - Invalid and unknown `wornWatchId` values sanitize to `null`.

## Verification
- `pnpm run test:unit`

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
