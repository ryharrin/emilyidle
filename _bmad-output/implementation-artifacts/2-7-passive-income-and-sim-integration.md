# Story 2.7: Passive Income & Sim Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want my watches to generate passive Enjoyment over time,  
so that the economy flows even during brief check-ins.

## Acceptance Criteria

1. Given I own watches, when the sim tick runs, then passive Enjoyment accrues based on owned watch quality.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.7]
2. Given Emily's favorite watches (Royal Oaks, Rolexes, rose gold), when passive income is calculated, then they generate bonus passive Enjoyment.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.7]
3. Given the Home tab, when I look at currency displays, then I see live-updating Cash, Enjoyment, and income rate values.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.7]
4. Given a "Collect passive income" tap, when I tap it on the Home tab, then accumulated passive Enjoyment is collected (smaller than active mini-game earnings).  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.7]

## Tasks / Subtasks

- [x] Implement passive enjoyment accrual in sim (AC: 1, 2)
  - [x] Compute passive enjoyment per second from owned watches
  - [x] Apply favorite bonus
  - [x] Accumulate as uncollected passive enjoyment

- [x] Add collect action (AC: 4)
  - [x] Add `COLLECT_PASSIVE_ENJOYMENT` action that moves accumulated enjoyment into `enjoyment`

- [x] Update Home tab displays (AC: 3, 4)
  - [x] Show Cash, Enjoyment, and passive income rate
  - [x] Add "Collect passive income" button

- [x] Tests
  - [x] Unit test for sim accrual + collect action

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Passive enjoyment should feel like a small background assist; the game is still active-first.
- Keep sim deterministic and pure.

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.7 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Implemented passive enjoyment accrual during sim ticks based on owned watches (favorites get a bonus via multiplier).
- Added `uncollectedEnjoyment` to state and a `COLLECT_PASSIVE_ENJOYMENT` action to collect it.
- Updated Home tab to display passive rate + uncollected amount + collect button.
- Added unit tests for accrual and collect behavior; verified gates.

### File List

- `_bmad-output/implementation-artifacts/2-7-passive-income-and-sim-integration.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/passiveIncome.ts`
- `src/game/passiveIncome.unit.test.ts`
- `src/game/persistence.ts`
- `src/game/reducer.ts`
- `src/game/reducer.unit.test.ts`
- `src/game/sim.ts`
- `src/game/types.ts`
- `src/ui/App.test.tsx`
- `src/ui/tabs/HomeTab.tsx`

### Change Log

- 2026-02-23: Implemented passive enjoyment accrual + collect flow; gates green; status moved to done.
