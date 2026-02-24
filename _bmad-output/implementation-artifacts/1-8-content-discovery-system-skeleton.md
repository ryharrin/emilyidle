# Story 1.8: Content Discovery System Skeleton

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want a data-driven unlock registry skeleton,  
so that all future content unlocks flow through a centralized, auditable system.

## Acceptance Criteria

1. Given the discovery system, when I inspect `src/game/discovery/`, then it exports a registry of unlock entries with: `id`, `category`, `condition(state) -> boolean`, `onUnlock(state) -> state`.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.8]
2. Given a registered unlock, when `condition(state)` returns true, then the unlock is marked as triggered in state.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.8]
3. Given the UI, when `pendingUnlocks` exist in state, then the UI can render reveal animations and dispatch `ACKNOWLEDGE_UNLOCK`.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.8]
4. Given the skeleton implementation, when no content is registered yet, then the system operates correctly with an empty registry.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.8]

## Tasks / Subtasks

- [x] Define unlock entry types + registry (AC: 1, 4)
  - [x] Create `src/game/discovery/types.ts` exporting:
    - [x] `export type UnlockCategory = "home-life" | "career" | "collection" | "prestige" | "meta"` (expand later)
    - [x] `export type UnlockEntry = { id: UnlockId; category: UnlockCategory; condition: (state: GameState) => boolean; onUnlock?: (state: GameState) => GameState }`
  - [x] Create `src/game/discovery/registry.ts` exporting `export const UNLOCK_REGISTRY: readonly UnlockEntry[] = []`.

- [x] Implement evaluation logic (AC: 2, 4)
  - [x] Create `src/game/discovery/evaluateUnlocks.ts` exporting:
    - [x] `export function evaluateUnlocks(state: GameState): GameState`
  - [x] Behavior:
    - [x] Scan registry in a deterministic order.
    - [x] For each entry where `condition(state)` is true:
      - [x] If `unlockId` not already triggered/acknowledged, enqueue it in `pendingUnlocks`.
      - [x] Optionally apply `onUnlock` once.
    - [x] If registry is empty, return `state` unchanged.

- [x] Connect discovery to reducer or sim step (AC: 2)
  - [x] Decide one integration point (pick one and document in code):
    - [x] Option A: call `evaluateUnlocks` in reducer for specific actions (preferred early).
    - [ ] Option B: call it inside `step` after sim tick (once Story 1.3 exists).
  - [x] Ensure unlock evaluation stays pure and deterministic.

- [x] Ensure state + actions support pending unlocks (AC: 3)
  - [x] Ensure `GameState.pendingUnlocks` exists (Story 1.2 already requires it).
  - [x] Ensure `ACKNOWLEDGE_UNLOCK` action exists and removes an unlock id from `pendingUnlocks` (Story 1.2 action set includes this).

- [x] UI wiring stub (AC: 3)
  - [x] Add a minimal UI component (e.g., `src/ui/components/UnlockToasts.tsx`) that:
    - [x] Reads `pendingUnlocks`
    - [x] Renders a basic list/overlay (no animation polish required yet)
    - [x] Dispatches `ACKNOWLEDGE_UNLOCK`

- [x] Tests (AC: 2, 4)
  - [x] Unit test with empty registry: `evaluateUnlocks(state)` returns same state reference.
  - [x] Unit test with a small registry: condition true enqueues unlock; acknowledge removes it.

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- The discovery system is a pacing safety system. It prevents emotional beats from being scattered across random UI code.
- Keep the registry empty in this story if needed; the skeleton must still be correct and testable.
- Make it easy to audit: a single place to see “what can unlock and why”.

### Technical Requirements

- Central registry of unlock entries (data-driven).
- All `condition` and `onUnlock` functions are pure.
- Deterministic ordering and idempotent unlock application.

### Architecture Compliance

- Discovery system lives in `src/game/discovery/**` and is pure domain code.  
  [Source: `_bmad-output/game-architecture.md` Content Discovery / Unlock System]
- UI should only render and dispatch `ACKNOWLEDGE_UNLOCK`; it must not embed unlock conditions.  
  [Source: `_bmad-output/game-architecture.md` Content Discovery / Unlock System]

### File Structure Requirements

- `src/game/discovery/types.ts`
- `src/game/discovery/registry.ts`
- `src/game/discovery/evaluateUnlocks.ts`
- (Optional) `src/game/discovery/index.ts` barrel export
- `src/ui/components/UnlockToasts.tsx`

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.8 ACs)
- `_bmad-output/game-architecture.md` (Discovery system design)
- `_bmad-output/implementation-artifacts/1-2-gamestate-type-and-reducer.md` (pendingUnlocks + ACKNOWLEDGE_UNLOCK)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.8)
- Discovery constraints sourced from Game Architecture

### Completion Notes List

- Added a data-driven discovery skeleton (`src/game/discovery/**`) with an empty unlock registry.
- Implemented `evaluateUnlocks` that deterministically enqueues unlocks and records them as triggered in state.
- Added `GameState.triggeredUnlockIds` so unlocks are idempotent across acknowledges.
- Wired unlock evaluation into the reducer (post-action) while keeping the registry empty by default.
- Added a minimal UI overlay (`UnlockToasts`) to render `pendingUnlocks` and dispatch `ACKNOWLEDGE_UNLOCK`.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-8-content-discovery-system-skeleton.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/discovery/evaluateUnlocks.ts`
- `src/game/discovery/evaluateUnlocks.unit.test.ts`
- `src/game/discovery/registry.ts`
- `src/game/discovery/types.ts`
- `src/game/persistence.ts`
- `src/game/reducer.ts`
- `src/game/types.ts`
- `src/ui/App.css`
- `src/ui/App.tsx`
- `src/ui/components/UnlockToasts.tsx`

### Change Log

- 2026-02-23: Implemented discovery/unlock skeleton with triggered tracking + UI acknowledge overlay; wired evaluation into reducer; gates green; status moved to done.
