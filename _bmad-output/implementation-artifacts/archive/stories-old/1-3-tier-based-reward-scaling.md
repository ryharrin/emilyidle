# Story 1.3: Tier-Based Reward Scaling

Status: ready-for-dev

## Story

As a player,
I want higher-tier watches to give better interaction rewards,
so that owning luxury watches feels meaningful.

## Acceptance Criteria

1. **AC1**: Rewards scale by watch tier
   - Given I complete an interaction with a tourbillon watch
     When rewards are calculated
     Then I receive more than with a starter watch at the same performance

2. **AC2**: Rewards scale by performance tier
   - Given I achieve "Perfect" vs "Good" on the same watch
     When rewards are calculated
     Then Perfect yields proportionally better rewards

3. **AC3**: Centralized resolver drives all interactions
   - Given any interaction completes
     When rewards are calculated
     Then a single `resolveInteractionReward()` function determines the reward

4. **AC4**: Reward scaling is unit-tested
   - Given the reward system
     When tests run
     Then they verify tier scaling, performance scaling, and monotonic outcomes

## Tasks / Subtasks

- [ ] Task 1: Design reward resolver signature (AC: 3)
  - [ ] Create `resolveInteractionReward(itemId, interactionId, tier, performance)` in `src/game/actions/interactions.ts`
  - [ ] Return `{ enjoymentDeltaCents, currencyDeltaCents, reserveDelta }`
  - [ ] Use `WatchItemDefinition` to derive base scale from `enjoymentCentsPerSec` or `collectionValueCents`
  - [ ] Apply bounded performance multiplier (e.g., 0.8-1.2 within tier)
  - [ ] Ensure results are clamped and deterministic (no randomness)

- [ ] Task 2: Implement resolver logic (AC: 1, 2)
  - [ ] Define tier multipliers: starter=1.0, classic=1.2, chronograph=1.5, tourbillon=2.0 (adjust as needed)
  - [ ] Define performance multipliers: miss=0.8, good=1.0, perfect=1.2
  - [ ] Calculate base reward from watch definition
  - [ ] Apply tier × performance scaling
  - [ ] Clamp to reasonable bounds
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Refactor existing actions to use resolver (AC: 3)
  - [ ] Update `applyWindingReward` to call resolver
  - [ ] Update `applyAutomaticReward` to call resolver
  - [ ] Update `applyQuartzReward` to call resolver
  - [ ] Update `applyDateReward` (from Story 1.1) to call resolver
  - [ ] Update `applyStrapChangeReward` (from Story 1.2) to call resolver
  - [ ] Keep cooldown rules unchanged (`INTERACTION_BASE_COOLDOWN_MS`)
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Plumb performance through App (AC: 2)
  - [ ] Update action signatures to accept performance scalar
  - [ ] Update `src/App.tsx` to pass `outcome.performance` to actions
  - [ ] Export updated actions via `src/game/state.ts`
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 5: Add unit tests for reward scaling (AC: 4)
  - [ ] Create/extend `tests/interactions.unit.test.ts`
  - [ ] Test: Better performance yields better rewards (same tier)
  - [ ] Test: Higher tier yields higher rewards (same performance)
  - [ ] Test: Rewards remain monotonic across Miss/Good/Perfect
  - [ ] Verify: `pnpm -s run test:unit -- tests/interactions.unit.test.ts`

## Dev Notes

### Architecture Patterns

- Keep reward calculation pure and deterministic
- Centralize scaling logic in one resolver function
- Don't break existing save compatibility
- Don't change cooldown rules

### Source Tree Components

**Modified files:**

- `src/game/actions/interactions.ts` - Add resolver, refactor existing actions
- `src/game/state.ts` - Export updated actions
- `src/App.tsx` - Pass performance to actions
- `tests/interactions.unit.test.ts` - Add reward scaling tests

**Data references:**

- `src/game/data/items.ts` - Watch definitions with `enjoymentCentsPerSec`, `collectionValueCents`
- `src/game/model/types.ts` - WatchItemDefinition type

### Testing Standards

- Unit tests must verify:
  1. Performance scaling (Perfect > Good > Miss at same tier)
  2. Tier scaling (Tourbillon > Chronograph > Classic > Starter at same performance)
  3. Monotonicity (no edge cases where higher tier + lower performance < lower tier + higher performance)
- Use seeded state, mock watches of different tiers

### References

- Current hardcoded rewards: `src/game/actions/interactions.ts` lines 13-29
- Source: `.planning/phases/44-interaction-feedback-and-rewards/44-01-PLAN.md`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature implementation

### Completion Notes List

- [ ] Maintain deterministic rewards (no randomness)
- [ ] Preserve existing cooldown behavior
- [ ] Ensure unit test coverage for scaling logic
- [ ] Don't break save compatibility

### File List

**Modified files:**

- `src/game/actions/interactions.ts`
- `src/game/state.ts`
- `src/App.tsx`
- `tests/interactions.unit.test.ts`
