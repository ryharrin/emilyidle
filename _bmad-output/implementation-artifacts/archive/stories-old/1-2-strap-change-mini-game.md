# Story 1.2: Strap-Change Mini-Game

Status: ready-for-dev

## Story

As a watch collector,
I want to change straps on my watches via a mini-game,
so that I can customize my collection and earn rewards.

## Acceptance Criteria

1. **AC1**: All watch tiers show "Change strap" option in interaction menu
   - Given I own any watch
     When I open the interaction menu
     Then I see a "Change strap" option

2. **AC2**: Strap-change mini-game is playable with clear visual feedback
   - Given I select "Change strap"
     When the modal opens
     Then I see a mechanic to align a strap pin into a lug slot

3. **AC3**: Outcomes are Miss/Good/Perfect based on alignment accuracy
   - Given I play the mini-game
     When I complete the alignment
     Then I receive Miss, Good, or Perfect based on accuracy

4. **AC4**: Rewards are applied and cooldown set
   - Given I complete the mini-game
     When the outcome is determined
     Then I receive enjoyment rewards and a 20s cooldown is applied

5. **AC5**: Touch targets meet mobile standards
   - Given I play on mobile
     When I interact with the game
     Then all touch targets are >= 44px

## Tasks / Subtasks

- [ ] Task 1: Implement StrapMiniGameModal (AC: 2, 3, 5)
  - [ ] Create `src/ui/components/StrapMiniGameModal.tsx`
  - [ ] Add stable selectors: `data-testid="strap-modal"`, `data-testid="strap-action"`, `data-testid="strap-outcome"`
  - [ ] Implement mechanic: align strap pin into lug slot (2-3 taps)
  - [ ] Add visual feedback (highlight, progress indicator)
  - [ ] Ensure touch targets >= 44px
  - [ ] Respect reduced-motion preferences
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 2: Add applyStrapChangeReward action (AC: 4)
  - [ ] Add `applyStrapChangeReward(state, itemId, nowMs, outcome)` in `src/game/actions/interactions.ts`
  - [ ] Use existing cooldown rules (`INTERACTION_BASE_COOLDOWN_MS`)
  - [ ] Export via `src/game/state.ts`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Wire into App and menu (AC: 1, 4)
  - [ ] Add menu option "Change strap" for all tiers (unless excluded)
  - [ ] Wire completion to call `applyStrapChangeReward`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Update help content
  - [ ] Add bullet to `src/ui/help/helpContent.ts` describing strap-change

- [ ] Task 5: Add unit test coverage (AC: 1-4)
  - [ ] Extend `tests/catalog.unit.test.tsx` to cover launching and completing strap-change
  - [ ] Verify: `pnpm -s run test:unit -- tests/catalog.unit.test.tsx`

## Dev Notes

### Architecture Patterns

- Follow existing mini-game modal patterns
- Keep selectors stable for test compatibility
- Use existing modal accessibility hooks
- Provide obvious in-progress feedback

### Source Tree Components

**Modified files:**

- `src/game/actions/interactions.ts` - Add `applyStrapChangeReward` action
- `src/game/state.ts` - Export new action
- `src/App.tsx` - Wire modal and menu option
- `src/ui/components/StrapMiniGameModal.tsx` - New modal (create)
- `src/style.css` - Modal styling
- `src/ui/help/helpContent.ts` - Help documentation
- `tests/catalog.unit.test.tsx` - Test coverage

### Testing Standards

- Unit test: Seed save with owned watch, open interaction menu, launch strap-change, complete action, assert reward
- Verify touch targets via CSS inspection

### References

- Pattern reference: `src/ui/components/WindingMiniGameModal.tsx`
- Action reference: `src/game/actions/interactions.ts`
- Source: `.planning/phases/43-new-watch-mini-games/43-03-PLAN.md`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature implementation

### Completion Notes List

- [ ] Use existing modal patterns
- [ ] Ensure >= 44px touch targets
- [ ] Provide clear visual feedback

### File List

**New files:**

- `src/ui/components/StrapMiniGameModal.tsx`

**Modified files:**

- `src/game/actions/interactions.ts`
- `src/game/state.ts`
- `src/App.tsx`
- `src/style.css`
- `src/ui/help/helpContent.ts`
- `tests/catalog.unit.test.tsx`
