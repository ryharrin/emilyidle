---
phase: 25-watch-models-and-duplicates
plan: 01
subsystem: game
tags: [catalog, state, selectors, tests]

# Dependency graph
requires: []
provides:
  - Deterministic watch model roster derived from catalog entries
  - GameState model-level ownership map (watchModels) with save-load sanitization
  - Duplicate reward multiplier helpers with 0.10x floor and unit coverage
affects:
  - 25-02
  - 25-03

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-brand reference numbering by catalog order"
    - "Save decoding sanitizes sparse maps by whitelist + finite integer clamp"
    - "Duplicate rewards use exponential decay with explicit floor"

key-files:
  added:
    - src/game/data/watchModels.ts
    - src/game/selectors/duplicates.ts
    - tests/duplicate-rewards.unit.test.ts
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/selectors/index.ts
    - src/game/state.ts

# Metrics
duration: 0 min
completed: 2026-01-28
---

# Phase 25 Plan 01: Watch Models + Duplicate Rewards Summary

**Introduced watch-model primitives (roster + ownership state) and a transparent duplicate diminishing-returns curve (floor 10%), without changing purchasing or economy wiring yet.**

## Accomplishments

- Added `WATCH_MODELS` roster derived from `CATALOG_ENTRIES`, with per-brand reference numbers and display names that include the reference.
- Extended `GameState` + `PersistedGameState` to track owned model counts via `watchModels: Record<string, number>`.
- Sanitized save restore to drop unknown model ids and clamp counts to finite integers >= 0.
- Added duplicate reward helpers (`getDuplicateRewardMultiplierForCopy`, `getDuplicateRewardMultiplierForNextPurchase`, `getDuplicateRewardSum`) with `DUPLICATE_REWARD_FLOOR = 0.1`.
- Added unit coverage for first/second copy values, floor enforcement, monotonic non-increasing behavior, and sum behavior.

## Verification

- `pnpm run typecheck` (pass)
- `pnpm run test:unit` (pass)

---
*Phase: 25-watch-models-and-duplicates*
*Completed: 2026-01-28*
