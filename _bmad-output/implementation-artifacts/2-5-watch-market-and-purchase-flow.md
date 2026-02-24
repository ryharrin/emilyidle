# Story 2.5: Watch Market & Purchase Flow

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to browse available watches and buy them with Cash,  
so that I can grow my collection.

## Acceptance Criteria

1. Given I navigate to the Market tab, when it renders, then I see available watches with prices, images, and affordability indicators.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.5]
2. Given I have enough Cash, when I tap "Buy" on a watch, then the purchase succeeds: Cash is deducted, watch is added to `ownedWatchIds`.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.5]
3. Given I don't have enough Cash, when I view a watch, then the buy button is disabled with a clear indicator of the remaining cost.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.5]
4. Given I already own a watch, when I view it in the market, then it shows "Owned" instead of a buy button.  
   [Source: `_bmad-output/planning-artifacts/epic-2-core-loop.md` Story 2.5]

## Tasks / Subtasks

- [x] Implement market selectors (AC: 1, 3, 4)
  - [x] Available watches excludes owned (selectors available; UI renders owned state)
  - [x] Affordability checks compare against `currencyCents`

- [x] Implement purchase action and reducer logic (AC: 2)
  - [x] Deduct cash
  - [x] Add watch id to owned list (no duplicates)

- [x] Implement Market tab UI (AC: 1, 2, 3, 4)
  - [x] List watches with image, name, tier, price
  - [x] Buy button / Owned state
  - [x] Disabled buy with remaining cost

- [x] Tests
  - [x] Reducer test for purchase
  - [x] UI test for owned indicator presence in Market tab

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Market UI must be touch-first and calm.
- Use static watch data and local state only (no network).

### References

- `_bmad-output/planning-artifacts/epic-2-core-loop.md` (Story 2.5 ACs)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Completion Notes List

- Implemented a Market tab list with images, pricing, affordability indicators, and Owned state.
- Added atomic purchase action (`PURCHASE_WATCH`) to deduct cash and add watch ownership.
- Added tests for purchase behavior and a basic UI assertion for Owned state; gates verified.

### File List

- `_bmad-output/implementation-artifacts/2-5-watch-market-and-purchase-flow.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/data/watches.ts`
- `src/game/economy.ts`
- `src/game/reducer.ts`
- `src/game/reducer.unit.test.ts`
- `src/game/types.ts`
- `src/ui/App.test.tsx`
- `src/ui/tabs/MarketTab.tsx`

### Change Log

- 2026-02-23: Implemented market browsing + purchase flow; gates green; status moved to done.
