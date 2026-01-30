---
phase: 29-interactions-and-mini-games
plan: 03
subsystem: interactions
tags: [automatic, power-reserve, decay, sim, modal]

# Dependency graph
requires:
  - phase: 29-interactions-and-mini-games
    plan: 02
provides:
  - Automatic mini-game modal wired to "Charge rotor"
  - Power reserve decay in simulation
  - Power reserve surfaced on automatic cards

# Tech tracking
tech-stack:
  added: []
  patterns:
    - per-tick decay via pure sim step transformation
    - interaction routing by movement type

key-files:
  created:
    - src/ui/components/AutomaticMiniGameModal.tsx

# Metrics
completed: 2026-01-30
---

# Phase 29 Plan 03: Automatic interaction + power reserve decay Summary

Implemented an automatic-only interaction ("Charge rotor") with a distinct mini-game, and made its reward meaningful via a visible, decaying per-item power reserve.

- `src/game/sim.ts` now applies deterministic power reserve decay (full drain over 120s) during simulation ticks.
- `src/ui/tabs/CollectionTab.tsx` surfaces current reserve on automatic watch cards.
- `src/ui/components/AutomaticMiniGameModal.tsx` adds a rotor-balance mini-game that awards power reserve (Miss/Good/Perfect) and communicates the reward.

## Verification
- `pnpm run typecheck`
- `pnpm run test:unit`

---
*Phase: 29-interactions-and-mini-games*
*Completed: 2026-01-30*
