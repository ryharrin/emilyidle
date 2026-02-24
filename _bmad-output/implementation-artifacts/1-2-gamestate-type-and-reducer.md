# Story 1.2: GameState Type & Reducer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want the core `GameState` type and pure reducer with discriminated union actions,  
so that all game state mutations flow through a single, testable, serializable pipeline.

## Acceptance Criteria

1. Given the `GameState` type, when I inspect its definition, then it includes all primary fields: `currencyCents`, `enjoyment`, `love`, `careerXp`, `careerStage`, `ownedWatchIds`, `pendingToasts`, `pendingUnlocks`, and `version`.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2]
2. Given the `Action` union type, when I inspect it, then it uses discriminated unions with `UPPER_SNAKE_CASE` `type` names.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2]
3. Given the reducer function, when I dispatch an unknown action `type`, then it returns the current state unchanged.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2]
4. Given the reducer function, when I dispatch a valid action, then it returns a new state object (never mutates).  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2]
5. Given the `Result<T>` type, when I import it from `game/types`, then it provides `{ ok: true; value: T } | { ok: false; error: string }`.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2]

## Tasks / Subtasks

- [x] Create domain types for the authoritative state (AC: 1, 5)
  - [x] Add `src/game/types.ts` exporting:
    - [x] `export type Result<T> = { ok: true; value: T } | { ok: false; error: string }`
    - [x] `export type CareerStage = "PhDStudent" | "Externship" | "VAHospital" | "PrivatePractice" | "GroupPractice" | "Retirement"`
    - [x] `export type Toast = { id: string; message: string; createdAtMs: number }` (serializable)
    - [x] `export type UnlockId = string` (kebab-case ids)
    - [x] `export type GameState = { ... }` with the required primary fields
    - [x] `export const initialGameState: GameState = { ... }` (single place for default values)
  - [x] Ensure every `GameState` field is JSON-serializable (no functions, no Dates, no Maps/Sets).

- [x] Create action union and reducer (AC: 2, 3, 4)
  - [x] In `src/game/types.ts`, define and export `export type Action = ...` with `UPPER_SNAKE_CASE` `type` strings.
  - [x] Include a minimal starter action set sufficient to exercise the state fields without implementing later systems:
    - [x] `EARN_CURRENCY_CENTS { amountCents: number }`
    - [x] `SPEND_CURRENCY_CENTS { amountCents: number }` (guard: cannot go negative)
    - [x] `GAIN_ENJOYMENT { delta: number }`
    - [x] `GAIN_LOVE { delta: number }`
    - [x] `GAIN_CAREER_XP { delta: number }`
    - [x] `SET_CAREER_STAGE { stage: CareerStage }`
    - [x] `ADD_OWNED_WATCH { watchId: string }` (guard: no duplicates)
    - [x] `QUEUE_TOAST { toast: Toast }`
    - [x] `DISMISS_TOAST { toastId: string }`
    - [x] `QUEUE_UNLOCK { unlockId: UnlockId }`
    - [x] `ACKNOWLEDGE_UNLOCK { unlockId: UnlockId }`
  - [x] Add `src/game/reducer.ts` exporting `export function gameReducer(state: GameState, action: Action | { type: string }): GameState`.
  - [x] Reducer rules:
    - [x] Pure function only (no side effects, no randomness, no time reads, no storage).
    - [x] For unknown `action.type`, return `state` unchanged (same object).
    - [x] For state-changing actions, return a new `GameState` object (shallow copy) and never mutate arrays in-place.

- [x] Add unit tests for reducer contract (AC: 3, 4)
  - [x] Add `src/game/reducer.unit.test.ts` (or similar) verifying:
    - [x] Unknown action returns the same state reference.
    - [x] A state-changing action returns a new state reference.
    - [x] Input state is not mutated (freeze state and nested arrays in the test before calling reducer).
    - [x] Guards work (no negative currency; no duplicate `ownedWatchIds`; toast dismiss removes exactly one; unlock ack removes exactly one).

- [x] Baseline quality gates remain green (AC: 1-5)
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This game is a single-recipient gift for Emily, not a general-audience product. Optimize for reliability and clarity over extensibility.
- This is an **active incremental** game with frequent interaction. Even though it will later have passive progression, the architecture should not assume "idle-only" play patterns.
- This story establishes the *authoritative* in-memory state contract. Treat it as a long-lived API:
  - Keep it serializable.
  - Keep it deterministic.
  - Make it hard to misuse from UI code.
- Do not implement the sim loop (`sim.ts`) yet (Story 1.3), persistence (Story 1.4), unlock registry (Story 1.8), or UI navigation (Story 1.7).

### Technical Requirements

- Language: TypeScript (strict)
- Reducer: pure, deterministic, serializable state transitions
- No exceptions thrown from `src/game/**` for normal control flow; prefer return types (see `Result<T>` convention).  
  [Source: `_bmad-output/game-architecture.md` Pattern 4: Result Type]

### Architecture Compliance

- Enforce the boundary: `src/ui/**` may import from `src/game/**`, but `src/game/**` must not import React/DOM.  
  [Source: `_bmad-output/game-architecture.md` Project Structure]
- Follow the standard pattern: discriminated union actions + reducer.  
  [Source: `_bmad-output/game-architecture.md` Pattern 1: State Transitions]
- Keep files small (<300 LOC) and keep state updates immutable (use array copies, not in-place mutation).  
  [Source: `_bmad-output/game-architecture.md` Anti-Patterns to Avoid]

### Library / Framework Requirements

- Do not introduce new state libraries (no Zustand, Redux, etc.). This story is pure domain code and unit tests only.  
  [Source: `_bmad-output/game-architecture.md` Cut (with rationale)]

### File Structure Requirements

- New files should live under `src/game/**`:
  - `src/game/types.ts` (authoritative types: `GameState`, `Action`, `Result<T>`, `CareerStage`, etc.)
  - `src/game/reducer.ts` (pure reducer implementation)
  - `src/game/reducer.unit.test.ts` (unit tests)
  [Source: `_bmad-output/game-architecture.md` Directory Emergence Strategy]

### Testing Requirements

- Unit tests must prove:
  - Unknown action is a safe no-op.
  - State transitions are immutable for state-changing actions.
  - Guards prevent obviously-invalid state (negative currency, duplicates in owned ids, etc.).

### Previous Story Intelligence (Story 1.1)

- Keep ACs deterministic (port, tooling, etc.) and keep docs aligned to actual repo config.
- Keep the repo root scaffold minimal and avoid duplicate entrypoints (unused Vite template files were removed during review).
  [Source: `_bmad-output/implementation-artifacts/1-1-project-initialization-and-tooling.md` Senior Developer Review (AI)]

### Git Intelligence Summary

- Recent repo history indicates planning artifacts were committed on `main`, while active work is happening on branch `v2`.
- No assumptions should be made that story-related files are already committed; rely on `pnpm test`, `tsc`, and `eslint` as the truth gates.

### Project Context Reference

- No `project-context.md` was found in-repo at the time this story was created (not blocking).

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story created from `_bmad-output/implementation-artifacts/sprint-status.yaml` next backlog item ordering
- Primary requirements source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.2
- Architecture constraints source: `_bmad-output/game-architecture.md` (Patterns + directory emergence)
- Narrative/career stage naming source: `_bmad-output/gdd.md` (career stages: PhD → Externship → VA → Private Practice → Group Practice → Retirement)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented `GameState`, `Action`, and `Result<T>` domain types in `src/game/types.ts`.
- Implemented pure `gameReducer` with safe no-op behavior for unknown actions.
- Added unit tests proving immutability and guards (negative currency, duplicates, removal semantics).
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-2-gamestate-type-and-reducer.md`
- `src/game/types.ts`
- `src/game/reducer.ts`
- `src/game/reducer.unit.test.ts`

### Change Log

- 2026-02-23: Implemented Story 1.2 domain types + pure reducer + unit tests; gates green; status moved to review.
- 2026-02-23: Review completed with no further issues found; status moved to done.
