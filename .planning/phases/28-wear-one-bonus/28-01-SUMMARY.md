---
phase: 28-wear-one-bonus
plan: 01
subsystem: state
tags: [worn-watch, persistence, actions]

# Dependency graph
requires: []
provides:
  - Persisted single-slot worn watch state (wear one or none)
  - Strict save/load sanitization for wornWatchId
affects: [28-02, 28-03, 28-04, 28-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Persisted optional field wired through sanitizeState() + createStateFromSave()

key-files:
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/actions/index.ts
    - src/game/persistence.ts

key-decisions:
  - "Use a single persisted wornWatchId slot (string | null) and validate ownership on set + restore; invalid values load as wear none."

# Metrics
completed: 2026-01-29
---

# Phase 28 Plan 01: Worn watch state + persistence sanitization Summary

Implemented a persisted, single-slot worn watch primitive (`state.wornWatchId`) with strict save/load sanitization and a single action to set/clear it.

## Accomplishments
- Added `wornWatchId: string | null` to `GameState` and `wornWatchId?: string | null` to `PersistedGameState`.
- Initialized `wornWatchId` to `null` for new saves and ensured restore logic coerces missing/invalid/unknown/unowned ids to `null`.
- Added `setWornWatchId(state, modelId)` action that overwrites the slot and validates ownership (unowned/invalid -> `null`).
- Threaded `wornWatchId` through the strict persistence whitelist in `sanitizeState()`.

## Verification
- `pnpm run typecheck`

## Files Modified
- `src/game/model/types.ts` - Adds wornWatchId to runtime + persisted shapes.
- `src/game/model/state.ts` - Defaults wornWatchId to null; restores and validates wornWatchId from saves.
- `src/game/actions/index.ts` - Adds `setWornWatchId()` action.
- `src/game/persistence.ts` - Whitelists `wornWatchId` in strict save sanitization.

---
*Phase: 28-wear-one-bonus*
*Completed: 2026-01-29*
