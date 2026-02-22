# Story 1.1: Set-Date Mini-Game

Status: ready-for-dev

## Story

As a watch collector,
I want to set the date on my classic and chronograph watches via a mini-game,
so that I have more ways to interact with my collection.

## Acceptance Criteria

1. **AC1**: Classic and chronograph watches show "Set date" option in interaction menu
   - Given I own a classic or chronograph watch
     When I open the interaction menu
     Then I see a "Set date" option

2. **AC2**: Set-date mini-game is playable with clear mechanics
   - Given I select "Set date"
     When the modal opens
     Then I see a date wheel/strip that I can stop on a target

3. **AC3**: Outcomes are Miss/Good/Perfect based on accuracy
   - Given I play the mini-game
     When I stop the wheel
     Then I receive Miss, Good, or Perfect based on distance to target

4. **AC4**: Rewards are applied and cooldown set
   - Given I complete the mini-game
     When the outcome is determined
     Then I receive enjoyment rewards and a 20s cooldown is applied

5. **AC5**: Help content documents the feature
   - Given I view the Interactions help section
     Then I see an explanation of the set-date mini-game

## Tasks / Subtasks

- [ ] Task 1: Add tier-level eligibility flag (AC: 1)
  - [ ] Extend `WatchItemDefinition` with `supportsDateSetting?: boolean`
  - [ ] Set `classic: true`, `chronograph: true`, `starter: false`, `tourbillon: false`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 2: Implement DateMiniGameModal (AC: 2, 3)
  - [ ] Create `src/ui/components/DateMiniGameModal.tsx`
  - [ ] Add stable selectors: `data-testid="date-modal"`, `data-testid="date-action"`, `data-testid="date-outcome"`
  - [ ] Implement mechanic: date wheel/strip with stop target
  - [ ] Style with CSS, ensure touch targets >= 44px
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Add applyDateReward action (AC: 4)
  - [ ] Add `applyDateReward(state, itemId, nowMs, outcome)` in `src/game/actions/interactions.ts`
  - [ ] Use existing cooldown rules (`INTERACTION_BASE_COOLDOWN_MS`)
  - [ ] Export via `src/game/state.ts`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Wire into App and menu (AC: 1, 4)
  - [ ] Add menu option "Set date" when `supportsDateSetting` is true
  - [ ] Wire completion to call `applyDateReward`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 5: Update help content (AC: 5)
  - [ ] Add bullet to `src/ui/help/helpContent.ts` describing set-date

- [ ] Task 6: Add unit test coverage (AC: 1-4)
  - [ ] Extend `tests/catalog.unit.test.tsx` to cover launching and completing set-date
  - [ ] Verify: `pnpm -s run test:unit -- tests/catalog.unit.test.tsx`

## Dev Notes

### Architecture Patterns

- Follow existing mini-game modal patterns (WindingMiniGameModal, etc.)
- Keep selectors stable (`data-testid`) for test compatibility
- Use existing modal accessibility hooks (`useModalAccessibility`)
- Respect `reduced-motion` media query

### Source Tree Components

**Modified files:**

- `src/game/model/types.ts` - Add `supportsDateSetting` to WatchItemDefinition
- `src/game/data/items.ts` - Set eligibility flags per watch
- `src/game/actions/interactions.ts` - Add `applyDateReward` action
- `src/game/state.ts` - Export new action
- `src/App.tsx` - Wire modal and menu option
- `src/ui/components/DateMiniGameModal.tsx` - New modal (create)
- `src/style.css` - Modal styling
- `src/ui/help/helpContent.ts` - Help documentation
- `tests/catalog.unit.test.tsx` - Test coverage

### Testing Standards

- Unit test: Seed save with eligible watch, launch mini-game, complete action, assert reward applied
- E2E not required (covered by existing interaction flow tests)

### References

- Pattern reference: `src/ui/components/WindingMiniGameModal.tsx`
- Action reference: `src/game/actions/interactions.ts` (see `applyWindingReward`)
- Eligibility pattern: From Phase 43-02 PLAN.md
- Source: `.planning/phases/43-new-watch-mini-games/43-02-PLAN.md`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature implementation

### Completion Notes List

- [ ] Follow existing modal patterns
- [ ] Maintain stable selectors
- [ ] Respect reduced-motion preferences

### File List

**New files:**

- `src/ui/components/DateMiniGameModal.tsx`

**Modified files:**

- `src/game/model/types.ts`
- `src/game/data/items.ts`
- `src/game/actions/interactions.ts`
- `src/game/state.ts`
- `src/App.tsx`
- `src/style.css`
- `src/ui/help/helpContent.ts`
- `tests/catalog.unit.test.tsx`
