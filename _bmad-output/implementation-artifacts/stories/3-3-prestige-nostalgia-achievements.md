# Story 3.3: Prestige & Nostalgia Achievements

Status: ready-for-dev

## Story

As a player,
I want achievements for prestige milestones,
so that reset decisions feel impactful.

## Acceptance Criteria

1. **AC1**: First prestige achievements
   - Given I prestige for the first time
     When I complete first workshop/maison/nostalgia reset
     Then I unlock "First [Tier]" achievements

2. **AC2**: Reset count achievements
   - Given I prestige multiple times
     When I hit 5/10/25 total resets across all tiers
     Then I unlock reset count achievements

3. **AC3**: Collection completion achievement
   - Given I collect watches
     When I complete the collection at least once
     Then I unlock "Complete Collection" achievement

4. **AC4**: Speed run achievement
   - Given I complete the collection
     When I do it in under X hours (determine X)
     Then I unlock "Speed Collector" achievement

5. **AC5**: Wealth accumulation achievements
   - Given I earn money
     When I reach 1M/10M/100M total earned
     Then I unlock wealth achievements

6. **AC6**: Progress tracking
   - Given I view achievements
     When I look at prestige achievements
     Then I see progress counters where applicable

## Tasks / Subtasks

- [ ] Task 1: Define prestige achievement IDs (AC: 1-5)
  - [ ] Create IDs: prestige-first-workshop, prestige-first-maison, prestige-first-nostalgia
  - [ ] Create IDs: prestige-resets-5, prestige-resets-10, prestige-resets-25
  - [ ] Create IDs: collection-complete, collector-speed-run
  - [ ] Create IDs: wealth-1m, wealth-10m, wealth-100m
  - [ ] Define metadata (titles, descriptions, rarity - mostly gold/platinum)
  - [ ] Verify: IDs follow naming convention

- [ ] Task 2: Track prestige history (AC: 1-2)
  - [ ] Extend GameState with:
    - prestigeHistory: { tier: string, count: number }[]
    - totalResets: number
  - [ ] Update persistence
  - [ ] Initialize existing saves (migration: count from existing prestige counts)
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Track lifetime earnings (AC: 5)
  - [ ] Add `lifetimeEarningsCents` to GameState
  - [ ] Update on all income (career, watches, events)
  - [ ] Update persistence
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Hook into prestige actions (AC: 1-2)
  - [ ] Update `prestigeWorkshop`, `prestigeMaison`, `prestigeNostalgia`
  - [ ] Track first-time and count-based achievements
  - [ ] Update total reset counter
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 5: Hook into collection completion (AC: 3-4)
  - [ ] Detect when all watches are owned
  - [ ] Track first completion time
  - [ ] Check if under speed run threshold
  - [ ] Unlock appropriate achievements
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 6: Update achievement definitions (AC: 1-6)
  - [ ] Add all prestige achievements to ACHIEVEMENT_DEFINITIONS
  - [ ] Set high rarity (mostly gold/platinum)
  - [ ] Add progress counters (resets, wealth)
  - [ ] Verify: Achievements appear correctly

- [ ] Task 7: Add unit tests (AC: 1-6)
  - [ ] Test first prestige achievements
  - [ ] Test reset count achievements at thresholds
  - [ ] Test collection completion detection
  - [ ] Test speed run timing
  - [ ] Test wealth accumulation
  - [ ] Verify: `pnpm -s run test:unit`

## Dev Notes

### Architecture Patterns

- Extend GameState with tracking fields
- Hook into prestige action functions
- Track lifetime stats across resets
- Use existing achievement system

### State Extension

```typescript
interface GameState {
  // ... existing fields
  prestigeHistory: {
    workshop: number;
    maison: number;
    nostalgia: number;
  };
  totalResets: number;
  lifetimeEarningsCents: number;
  collectionFirstCompletedAtMs?: number;
}
```

### Source Tree Components

**Modified files:**

- `src/game/model/types.ts` - Add tracking fields
- `src/game/model/state.ts` - Initialize fields
- `src/game/persistence.ts` - Save/load new fields
- `src/game/actions/prestige.ts` - Track prestige events
- `src/game/selectors/collection.ts` - Detect collection completion
- `src/game/data/achievements.ts` - Add prestige achievements

### Migration Notes

Existing saves need:

- prestigeHistory: calculate from existing prestige counts
- lifetimeEarningsCents: could estimate or start from 0
- totalResets: sum of existing prestige counts

### Testing Standards

- Mock state with specific prestige counts
- Test collection completion detection
- Verify speed run timing calculation
- Test wealth thresholds

### References

- Source: `.planning/phases/epic-3-achievement-expansion.md`
- Prestige system in `src/game/actions/prestige.ts`
- Collection selectors in `src/game/selectors/collection/`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature

### Completion Notes List

- [ ] Carefully extend state with defaults
- [ ] Handle save migration
- [ ] Test collection completion edge cases
- [ ] Verify speed run timing

### File List

**Modified files:**

- `src/game/model/types.ts`
- `src/game/model/state.ts`
- `src/game/persistence.ts`
- `src/game/actions/prestige.ts`
- `src/game/selectors/collection.ts`
- `src/game/data/achievements.ts`
