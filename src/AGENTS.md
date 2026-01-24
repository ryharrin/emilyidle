# AGENTS

## Overview

React UI and runtime entry for Emily Idle.

## Where to look

- `main.tsx`: ReactDOM bootstrap and global CSS import.
- `App.tsx`: UI composition root; wires tabs + runtime hook.
- `ui/tabs/*`: One component per tab panel; keep selectors stable.
- `game/runtime/*`: RAF tick + autosave + lifecycle persistence hooks.
- `style.css`: global styling and layout.
- `game/`: domain logic (see `src/game/AGENTS.md`).
- `vite-env.d.ts`: Vite type declarations.

## Conventions

- Simulation loop uses `requestAnimationFrame` and `SIM_TICK_MS` from `src/game/sim.ts`, owned by `game/runtime`.
- Autosave triggers on `visibilitychange`, `pagehide`, and a 2s interval when dirty via `useGameRuntime`.
- Keep DOM ids and data-testid attributes stable for tests.

## Anti-patterns

- Don’t change `#app` root handling without updating `main.tsx` and tests.
