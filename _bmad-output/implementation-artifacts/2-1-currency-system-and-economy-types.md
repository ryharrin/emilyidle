# Story 2.1: Currency System & Economy Types

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want the complete currency system with Cash (cents), Enjoyment, and Love,  
so that the economy engine has typed, precise values for all transactions.

## Acceptance Criteria

1. Given the economy types, when I inspect GameState, then `currencyCents` is a number (integer cents), `enjoyment` is a number, `love` is a number.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.1]
2. Given money calculations, when income is applied, then it uses `rate * dtMs / 1000` formula (cents per second × time).  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.1]
3. Given the currency display selector, when I call `getCurrencyDisplay(state)`, then it returns formatted string like `$12.34`.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.1]
4. Given currency limits, when values reach `MAX_CURRENCY_CENTS` (999_999_999), then they are clamped, not overflowed.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.1]

## Tasks / Subtasks

- [x] Ensure economy types are represented in state (AC: 1)
  - [x] Confirm `GameState.currencyCents`, `GameState.enjoyment`, and `GameState.love` exist and remain numbers.

- [x] Add money math helpers (AC: 2, 4)
  - [x] Add `MAX_CURRENCY_CENTS = 999_999_999` and a clamp helper.
  - [x] Add an income helper that applies `rateCentsPerSecond * dtMs / 1000`.
  - [x] Ensure all currency mutation paths clamp to `MAX_CURRENCY_CENTS`.

- [x] Add currency display selector (AC: 3)
  - [x] Implement `getCurrencyDisplay(state)` returning `$12.34` format (cents-based).

- [x] Tests (AC: 2, 3, 4)
  - [x] Unit tests for:
    - [x] `getCurrencyDisplay` formatting.
    - [x] income math uses the required formula.
    - [x] clamping behavior at MAX.

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This is an Emily-only active incremental game. Cash is stored in cents to avoid floating precision.
- Keep money math pure and testable (domain).
- Clamp currency safely; never overflow or go negative.

### Architecture Compliance

- Domain logic stays in `src/game/**` with no React/DOM imports.  
  [Source: `_bmad-output/game-architecture.md` Project Structure]

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.1 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from Epic 2 Core Loop.

### Completion Notes List

- Added `MAX_CURRENCY_CENTS` and clamping for all cash mutations.
- Implemented economy helpers (`applyRateCentsPerSecond`, `getCurrencyDisplay`) as pure domain code.
- Added unit tests for display formatting, income math, and clamping.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/2-1-currency-system-and-economy-types.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/constants.ts`
- `src/game/economy.ts`
- `src/game/economy.unit.test.ts`
- `src/game/reducer.ts`

### Change Log

- 2026-02-23: Implemented currency helpers (rate formula + display) and MAX clamping; gates green; status moved to done.
