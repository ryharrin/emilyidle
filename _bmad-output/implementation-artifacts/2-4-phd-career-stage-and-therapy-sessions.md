# Story 2.4: PhD Career Stage & Therapy Sessions

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to conduct therapy sessions as a PhD student to earn Cash,  
so that I can fund my watch collection.

## Acceptance Criteria

1. Given the career system, when the game starts, then I am at career stage "PhD Student" with appropriate income rate.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.4]
2. Given I have enough Enjoyment, when I start a therapy session, then Enjoyment is consumed and Career XP + Cash are earned.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.4]
3. Given the therapy session mini-game, when I engage, then patients speak text and I tap to continue ("That's interesting, tell me more").  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.4]
4. Given a cooldown exists, when I complete a session, then I must wait before the next one.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.4]
5. Given the career progress bar, when I inspect it, then it shows XP toward the next career stage.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.4]

## Tasks / Subtasks

- [x] Add career constants + selectors (AC: 1, 5)
  - [x] XP thresholds
  - [x] Derived progress (current xp / next threshold)

- [x] Add therapy session actions + state (AC: 2, 4)
  - [x] Consume Enjoyment cost on completion
  - [x] Earn Cash + Career XP on completion
  - [x] Store cooldown timing in state (deterministic using game clock)

- [x] Implement therapy session UI on Career tab (AC: 2, 3, 4, 5)
  - [x] Start session button gated by enjoyment + cooldown
  - [x] Simple text-based patient dialog with tap-to-continue
  - [x] Progress bar visible

- [x] Tests
  - [x] Reducer tests for session completion effects and cooldown
  - [x] UI test for gating (enjoyment requirement)

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This is an Emily-only gift build: keep therapy tone warm and respectful.
- Cooldown prevents spam clicking and helps pacing.
- Keep story scope limited to PhD stage and one simple session loop.

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.4 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Added deterministic career progress helpers and a PhD therapy session loop (enjoyment cost -> cash + XP reward).
- Implemented cooldown using a monotonic in-game clock (`clockMs`) updated via sim ticks (no UI dependency on wall-clock time).
- Implemented the Career tab UI: progress bar + start session gating + text-driven tap-to-continue session modal.
- Added/updated tests and verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/2-4-phd-career-stage-and-therapy-sessions.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/career.ts`
- `src/game/persistence.ts`
- `src/game/reducer.ts`
- `src/game/reducer.unit.test.ts`
- `src/game/sim.ts`
- `src/game/sim.unit.test.ts`
- `src/game/types.ts`
- `src/ui/App.test.tsx`
- `src/ui/tabs/CareerTab.tsx`

### Change Log

- 2026-02-23: Implemented PhD therapy sessions + cooldown + career progress UI; gates green; status moved to done.
