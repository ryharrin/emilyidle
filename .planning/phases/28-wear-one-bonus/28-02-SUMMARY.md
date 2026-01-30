---
phase: 28-wear-one-bonus
plan: 02
subsystem: economy
tags: [worn-watch, enjoyment, breakdown]

# Dependency graph
requires:
  - phase: 28-01
    provides: Worn watch state + persistence
provides:
  - Bucket-based worn-watch enjoyment multiplier
  - Enjoyment breakdown term when a watch is worn
affects: [28-03, 28-04, 28-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Single-source selector used by both rate math and breakdown

key-files:
  modified:
    - src/game/data/items.ts
    - src/game/selectors/enjoyment.ts
    - src/game/selectors/index.ts

key-decisions:
  - "Worn watch bonus is a bucket-based enjoyment multiplier: starter 1.02, classic 1.05, chronograph 1.08, tourbillon 1.12."

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 02: Worn-watch enjoyment bonus Summary

Implemented the Phase 28 “unique bonus” as an enjoyment-rate multiplier derived from the worn watch’s bucket, and surfaced it as a conditional enjoyment breakdown line.

## Accomplishments
- Added `getWatchBucket(id)` helper to map known bucket ids (`starter|classic|chronograph|tourbillon`) deterministically.
- Added `getWornWatchEnjoymentMultiplier(state)` as the single source of truth for the worn bonus.
- Wired the worn multiplier into `getEnjoymentRateCentsPerSec()` so gameplay accrual changes.
- Updated `getEnjoymentRateBreakdown()` to include a stable `id: "worn-watch"` multiplier term only when a watch is worn.

## Verification
- `pnpm run typecheck`

## Files Modified
- `src/game/data/items.ts` - Adds bucket lookup helper.
- `src/game/selectors/enjoyment.ts` - Adds worn multiplier selector and applies it to enjoyment rate.
- `src/game/selectors/index.ts` - Adds conditional enjoyment breakdown term for worn watch.

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
