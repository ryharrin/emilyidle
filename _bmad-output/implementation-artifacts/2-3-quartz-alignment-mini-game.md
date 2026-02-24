# Story 2.3: Quartz Alignment Mini-Game

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to play a precision alignment game with my quartz watches,  
so that I earn Enjoyment through skillful interaction.

## Acceptance Criteria

1. Given I own a quartz watch, when I tap to interact, then the Quartz Alignment mini-game opens in a modal.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.3]
2. Given the mini-game is active, when I drag to align hands/markers, then the game evaluates Miss/Good/Perfect based on precision.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.3]
3. Given the game uses local state, when it completes, then it calls `onComplete({ perfects, duration })` callback (never dispatches directly).  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.3]
4. Given the modal wrapper, when `onComplete` fires, then it dispatches `RECORD_INTERACTION` to the reducer with `gameType`, `perfects`, `duration`.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.3]
5. Given visual feedback, when I achieve a "Perfect", then there is satisfying animation (motion spring physics).  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.3]

## Tasks / Subtasks

- [x] Add interaction record type + reducer support (AC: 4)
  - [x] Add `RECORD_INTERACTION` action
  - [x] Add minimal state storage for interaction records (for debugging/progression later)

- [x] Implement Quartz Alignment mini-game (AC: 2, 3, 5)
  - [x] Create a pure UI component that uses local state and calls `onComplete(...)`
  - [x] Drag alignment input
  - [x] Miss/Good/Perfect evaluation thresholds
  - [x] Perfect feedback uses `motion` spring animation

- [x] Wire mini-game modal in UI (AC: 1, 4)
  - [x] Provide a way to open the mini-game by interacting with an owned quartz watch
  - [x] Wrap in a modal
  - [x] On complete: dispatch `RECORD_INTERACTION` and grant Enjoyment

- [x] Tests
  - [x] Unit tests for reducer interaction recording and any pure evaluation helper

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Mini-games are active-first: local state + callback; wrapper decides domain actions.
- Keep the first mini-game simple but satisfying.
- Modal must be safe-area aware and touch-friendly.

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.3 ACs)
- `_bmad-output/implementation-artifacts/1-7-ui-shell-and-navigation.md` (safe-area + tap targets)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Added `RECORD_INTERACTION` action + `interactionHistory` to state (persisted/migrated).
- Implemented Quartz Alignment mini-game as local state + `onComplete(...)` callback (no direct dispatch from the mini-game component).
- Wired the mini-game into the Home tab with a safe-area modal wrapper and `motion` spring feedback on "Perfect".
- Added unit tests for grading helper and interaction recording; verified gates.

### File List

- `_bmad-output/implementation-artifacts/2-3-quartz-alignment-mini-game.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/persistence.ts`
- `src/game/reducer.ts`
- `src/game/reducer.unit.test.ts`
- `src/game/types.ts`
- `src/ui/components/Modal.tsx`
- `src/ui/minigames/QuartzAlignmentGame.tsx`
- `src/ui/minigames/QuartzAlignmentGame.unit.test.tsx`
- `src/ui/minigames/quartzAlignmentEval.ts`
- `src/ui/tabs/HomeTab.tsx`

### Change Log

- 2026-02-23: Implemented Quartz Alignment mini-game + modal wiring + interaction recording; gates green; status moved to done.
