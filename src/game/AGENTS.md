# AGENTS

## Overview

Pure TypeScript domain logic for simulation, state, persistence, and catalog data.

## Modules

- `state.ts`: GameState types, item/upgrades/milestones/events, selectors.
- `sim.ts`: `SIM_TICK_MS = 100`; `step()` clamps dt and applies events/achievements.
- `persistence.ts`: save v2; localStorage keys `emily-idle:save` and legacy `watch-idle:save`.
- `catalog.ts`: catalog entries + licensing; maps Wikimedia URLs to `/catalog/`.
- `format.ts`: money/rate formatting helpers.

## Conventions

- Monetary values are cents; rates are cents/sec.
- State transitions are functional (return new GameState).
- Save decoding must validate shape before use.
- Catalog entries must include attribution/license metadata.

## Anti-patterns

- Don’t remove legacy save key handling.
- Don’t change save version without migration logic.
