---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [game-loop, simulation, raf, pnpm, vite]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Vite + TypeScript scaffold
provides:
  - Deterministic fixed-timestep simulation runtime
  - Basic watch purchase action that increases income
  - Minimal DOM UI displaying currency/income/item count
affects: [01-03, 02-collection-loop]

# Tech tracking
tech-stack:
  added: [pnpm]
  patterns: ["requestAnimationFrame + accumulator fixed-timestep sim", "pure sim step(state, dtMs)", "pure purchase actions in state module"]

key-files:
  created:
    - pnpm-lock.yaml
    - src/game/format.ts
    - src/game/sim.ts
    - src/game/state.ts
  modified:
    - package.json
    - src/main.ts

key-decisions:
  - "Use requestAnimationFrame with an accumulator to keep sim deterministic across refresh rates"
  - "Model purchases as pure state transitions in src/game/state.ts"

patterns-established:
  - "Simulation tick: step(state, SIM_TICK_MS) in a while-loop accumulator"
  - "UI: render(state) writes to explicit DOM nodes; actions update state via pure helpers"

issues-created: []

duration: 1h 59m
completed: 2026-01-15
---

# Phase 1 Plan 2: Game Loop Core Summary

**Deterministic ticking economy wired to the UI, with a first purchasable that increases income.**

## Performance

- **Duration:** 1h 59m
- **Started:** 2026-01-15T04:25:46Z
- **Completed:** 2026-01-15T06:25:36Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Wired a fixed-timestep simulation loop driven by `requestAnimationFrame` and an accumulator.
- Added a minimal UI showing vault cash, income rate, and basic watch count.
- Implemented a first purchase action (basic watch) with a simple price growth curve and affordability gating.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire deterministic simulation runtime** - `63eda86` (feat)
2. **Task 2: Add basic watch purchase action** - `d994950` (feat)

**Plan metadata:** _pending_

## Files Created/Modified

- `src/main.ts` - RAF-driven tick loop + DOM rendering + buy button wiring
- `src/game/sim.ts` - Pure `step(state, dtMs)` simulation step with dt clamp
- `src/game/state.ts` - `GameState` plus basic watch pricing + buy action helpers
- `src/game/format.ts` - Money/rate format helpers
- `package.json` - Recorded `packageManager` (pnpm)
- `pnpm-lock.yaml` - pnpm lockfile for reproducible installs

## Decisions Made

- Used a fixed-timestep accumulator loop so sim speed is independent of frame rate.
- Kept “buy” logic pure (no DOM/time reads), returning a new `GameState`.

## Deviations from Plan

- Ran verification using pnpm scripts (`pnpm run typecheck`, `pnpm run build`) instead of npm; scripts are equivalent.

## Issues Encountered

- None.

## Next Phase Readiness

- Ready for `.planning/phases/01-foundation/01-03-PLAN.md` (localStorage persistence + import/export).

---
*Phase: 01-foundation*
*Completed: 2026-01-15*
