# AGENTS

## Overview

Pure TypeScript domain logic for simulation, state, persistence, and catalog data. Runtime side
effects live under `runtime/`.

## Modules

- `model/`: GameState types and state constructors.
- `data/`: static item/upgrade/milestone definitions.
- `selectors/`: derived computations (pure, no side effects).
- `actions/`: state transitions (pure).
- `runtime/`: RAF tick + autosave + lifecycle persistence.
- `state.ts`: facade that re-exports model/data/selectors/actions.
- `sim.ts`: `SIM_TICK_MS = 100`; `step()` clamps dt and applies events/achievements.
- `persistence.ts`: save v2; localStorage keys `emily-idle:save` and legacy `watch-idle:save`.
- `catalog.ts`: catalog entries + licensing; maps Wikimedia URLs to `/catalog/`.
- `format.ts`: money/rate formatting helpers.

## Conventions

- Monetary values are cents; rates are cents/sec.
- State transitions are functional (return new GameState).
- Selectors and actions remain pure (no Date.now, no browser APIs).
- Save decoding must validate shape before use.
- Catalog entries must include attribution/license metadata.

## Anti-patterns

- Don’t remove legacy save key handling.
- Don’t change save version without migration logic.
