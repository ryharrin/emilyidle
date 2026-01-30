---
phase: 29-interactions-and-mini-games
plan: 01
subsystem: game
tags: [interactions, movement, persistence, selectors, actions, tests]

# Dependency graph
requires: []
provides:
  - Movement typing for watch tiers
  - Persisted per-item interaction cooldown + power reserve state
  - Pure interaction reward application helpers (winding/automatic/quartz)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - per-item interaction state stored in GameState maps
    - selector-level cooldown/availability helpers

key-files:
  created:
    - src/game/actions/interactions.ts
    - src/game/selectors/interactions.ts
    - tests/interactions.unit.test.ts

# Metrics
completed: 2026-01-30
---

# Phase 29 Plan 01: Interaction foundations Summary

Implemented movement typing for watch tiers, added persisted per-item interaction state (cooldown timestamps + power reserve), and introduced pure reward actions for winding/automatic/quartz interactions.

Automatic power reserve now affects enjoyment/sec at the per-item contribution layer, without changing the existing prestige legacy multiplier logic.

## Verification
- `pnpm run typecheck`
- `pnpm run test:unit`

---
*Phase: 29-interactions-and-mini-games*
*Completed: 2026-01-30*
