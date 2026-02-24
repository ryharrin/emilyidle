# Story 1.3: Game Loop & Simulation Tick

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want a requestAnimationFrame-based game loop with fixed 100ms simulation ticks,  
so that progression math is deterministic regardless of frame rate.

## Acceptance Criteria

1. Given the game loop is running, when a frame fires, then it accumulates delta time and steps the simulation in `SIM_TICK_MS` (100ms) chunks.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.3]
2. Given a large frame delta (e.g. tab switch returning after 30s), when the loop processes it, then the delta is clamped to prevent giant progression leaps.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.3]
3. Given the document is hidden (`visibilitychange`), when the tab goes to background, then the RAF loop pauses to conserve battery.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.3]
4. Given the `step(state, dtMs)` function, when called with a `dtMs` value, then it returns a new GameState with progression applied (pure function, no side effects).  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.3]
5. Given a test environment, when `isTestEnvironment()` returns true, then the RAF loop is skipped.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.3]

## Tasks / Subtasks

- [x] Add loop/sim constants (AC: 1, 2)
  - [x] Add `src/game/constants.ts` with:
    - [x] `export const SIM_TICK_MS = 100 as const`
    - [x] A conservative clamp for per-frame deltas (e.g. `MAX_FRAME_DELTA_MS`)
    - [x] A cap for total catch-up work per frame (e.g. `MAX_SIM_STEPS_PER_FRAME`)
  - [x] Keep constants ASCII-only and unit-suffixed (`Ms`, `Cents`) per conventions.  
    [Source: `_bmad-output/game-architecture.md` Numeric Suffixes]

- [x] Implement pure simulation step (AC: 4)
  - [x] Add `src/game/sim.ts` exporting `export function step(state: GameState, dtMs: number): GameState`.
  - [x] Constraints:
    - [x] Pure function (no `Date.now`, no randomness, no DOM/storage).
    - [x] Safe no-op allowed while economy math is not yet defined, but structure must make future progression insertion straightforward.
    - [x] Returns `state` unchanged if no fields change; otherwise returns a new object.
  - [x] Any progression math must live in domain functions/selectors, not UI.  
    [Source: `_bmad-output/game-architecture.md` Project Structure; Pattern 2: Selectors]

- [x] Add runtime environment detection (AC: 5)
  - [x] Add `src/game/env.ts` exporting `export function isTestEnvironment(): boolean`.
  - [x] The check should be deterministic and not require special build steps (e.g., `import.meta.env.MODE === "test"` and/or `import.meta.env.VITEST`).
  - [x] Keep `src/game/**` free of React/DOM dependencies.  
    [Source: `_bmad-output/game-architecture.md` Project Structure]

- [x] Wire loop to state transitions via reducer (AC: 1)
  - [x] Add a reducer action in `src/game/types.ts` for ticking, e.g.:
    - [x] `SIM_TICK { dtMs: number }` or `SIM_TICK { tickCount: number }`
  - [x] In `src/game/reducer.ts`, handle the tick action by calling `step(state, dtMs)` and returning the result.
  - [x] Ensure no mutation; state transitions remain reducer-mediated.  
    [Source: `_bmad-output/game-architecture.md` Pattern 1: State Transitions]

- [x] Implement the RAF runtime hook in UI boundary (AC: 1, 2, 3, 5)
  - [x] Add `src/ui/hooks/useGameRuntime.ts` that:
    - [x] Starts RAF when visible.
    - [x] Accumulates delta time.
    - [x] Processes `SIM_TICK_MS` steps (dispatching tick actions).
    - [x] Clamps large deltas.
    - [x] Pauses on `visibilitychange` when hidden; resumes when visible.
    - [x] Skips entirely if `isTestEnvironment()` is true.
  - [x] Ensure the hook does not compute game math; it only advances time and dispatches.  
    [Source: `_bmad-output/game-architecture.md` Game Loop; Pattern 1]

- [x] Minimal integration wiring (non-UI-feature) (AC: 1, 3)
  - [x] In `src/ui/App.tsx`, call `useGameRuntime()` from within a Provider that has access to dispatch.
  - [x] If Provider is not created yet, include it as part of this story (see Notes below).

- [x] Tests for determinism and clamps (AC: 1, 2, 5)
  - [x] Add `src/game/sim.unit.test.ts` verifying `step` purity/no side effects and immutability.
  - [x] Add unit tests for the accumulator/clamp logic (prefer extracting a pure helper for step scheduling so it is testable without RAF).
  - [x] Keep tests small but real: assert counts/dispatches, not just “doesn’t crash”.

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Emily At Last is an **active incremental** gift for Emily only; the runtime must feel stable and respectful of battery (pause when hidden, clamp huge deltas).
- This story is a core “heartbeat” system. Treat it like a boss fight:
  - Deterministic tick scheduling
  - No runaway catch-up work
  - No hidden side effects
- Do not implement persistence (Story 1.4) or discovery (Story 1.8) inside this loop yet.

### Technical Requirements

- Fixed timestep: `SIM_TICK_MS = 100`
- Deterministic simulation step: `step(state, dtMs)` in `src/game/sim.ts` (pure)
- Loop pause/resume on `visibilitychange`

### Architecture Compliance

- Domain code in `src/game/**` must be framework-agnostic (no React, no DOM).  
  [Source: `_bmad-output/game-architecture.md` Project Structure]
- Use reducer-driven state transitions (loop dispatches actions; reducer calls `step`).  
  [Source: `_bmad-output/game-architecture.md` Pattern 1: State Transitions]

### Library / Framework Requirements

- No new libraries required for this story.

### File Structure Requirements

- Expected touched/created files:
  - `src/game/constants.ts`
  - `src/game/env.ts`
  - `src/game/sim.ts`
  - `src/game/types.ts` (add tick action type)
  - `src/game/reducer.ts` (handle tick action)
  - `src/ui/hooks/useGameRuntime.ts`
  - `src/ui/App.tsx` (wire runtime invocation once Provider exists)

### Testing Requirements

- Provide at least one unit test that proves clamp behavior is enforced for large deltas (no “30s catch-up” explosion).
- Provide at least one unit test that proves `isTestEnvironment()` disables the runtime.

### Previous Story Intelligence (1.2)

- Maintain strict immutability and safe no-op behavior for unknown actions.
- Keep `GameState` serializable at all times.
  [Source: `_bmad-output/implementation-artifacts/1-2-gamestate-type-and-reducer.md`]

### Latest Tech Information

- No version bump required; follow pinned stack from Story 1.1.
  [Source: `_bmad-output/implementation-artifacts/1-1-project-initialization-and-tooling.md`]

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.3 ACs)
- `_bmad-output/game-architecture.md` (Game Loop; Pattern 1; Project Structure; Naming conventions)
- `_bmad-output/implementation-artifacts/1-2-gamestate-type-and-reducer.md` (state and reducer foundation)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.3)
- Loop constraints sourced from Game Architecture (fixed timestep, clamp, pause on hidden)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented fixed-timestep loop constants and tick scheduling helper with clamp behavior.
- Added pure `step(state, dtMs)` seam in `src/game/sim.ts` (safe no-op until progression math is implemented).
- Added `isTestEnvironment()` gate to disable RAF during tests.
- Wired a minimal `GameProvider` + runtime hook into `src/ui/App.tsx`.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-3-game-loop-and-simulation-tick.md`
- `src/game/constants.ts`
- `src/game/env.ts`
- `src/game/env.unit.test.ts`
- `src/game/loop.ts`
- `src/game/loop.unit.test.ts`
- `src/game/sim.ts`
- `src/game/sim.unit.test.ts`
- `src/game/types.ts`
- `src/game/reducer.ts`
- `src/ui/context/GameContext.ts`
- `src/ui/context/GameProvider.tsx`
- `src/ui/hooks/useGameRuntime.ts`
- `src/ui/hooks/useGameState.ts`
- `src/ui/App.tsx`
- `src/ui/context/GameContext.tsx` (deleted)

### Change Log

- 2026-02-23: Implemented Story 1.3 fixed-timestep runtime seam + tick scheduling + pause/clamp behavior; gates green; status moved to review.
- 2026-02-23: Review completed with no further issues found; status moved to done.
