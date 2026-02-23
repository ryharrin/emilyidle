# Story 3.4: Collection Completion Achievements

Status: ready-for-dev

## Story

As a player,
I want achievements for collection goals,
so that completionists have long-term objectives.

## Acceptance Criteria

1. **AC1**: First watch achievement
   - Given I start playing
     When I purchase my first watch
     Then I unlock "First Acquisition" achievement

2. **AC2**: Collection size milestones
   - Given I own watches
     When I reach 10/25/50/100/All watches owned
     Then I unlock collection size achievements

3. **AC3**: Brand set completion
   - Given I collect watches by brand
     When I complete my first brand set
     Then I unlock "Brand Loyalist" achievement

4. **AC4**: Multiple brand sets
   - Given I complete brand sets
     When I complete 5/10 brand sets
     Then I unlock set count achievements

5. **AC5**: Tier diversity achievement
   - Given I own watches
     When I own one of each tier (Starter, Classic, Lux, etc.)
     Then I unlock "Tier Collector" achievement

6. **AC6**: Movement type diversity
   - Given I collect watches
     When I own one of each movement type
     Then I unlock "Movement Connoisseur" achievement

7. **AC7**: Grail watch achievement
   - Given I save up
     When I purchase my first tourbillon/grail watch
     Then I unlock "Grail Collector" achievement

8. **AC8**: Ultimate collector
   - Given I collect everything
     When I own every watch in the game
     Then I unlock "Master Collector" achievement

9. **AC9**: Progress hints
   - Given achievements are locked
     When I view them
     Then I see hints (e.g., "Own 3 more watches")

## Tasks / Subtasks

- [ ] Task 1: Define collection achievement IDs (AC: 1-8)
  - [ ] Create IDs: collection-first-watch, collection-10, collection-25, collection-50, collection-100, collection-all
  - [ ] Create IDs: brand-first-set, brand-5-sets, brand-10-sets
  - [ ] Create IDs: tier-diversity, movement-diversity
  - [ ] Create IDs: grail-watch, master-collector
  - [ ] Define metadata (titles, descriptions, rarity)
  - [ ] Verify: IDs follow naming convention

- [ ] Task 2: Track collection stats (AC: 1-8)
  - [ ] Extend GameState if needed (may already have enough)
  - [ ] Ensure brand set completion is trackable
  - [ ] Verify: Collection stats accessible

- [ ] Task 3: Hook into purchase actions (AC: 1-2, 7-8)
  - [ ] Update `buyWatchModelWithUndo` to check thresholds
  - [ ] Track first purchase
  - [ ] Track total owned count milestones
  - [ ] Track grail purchases (tourbillon tier)
  - [ ] Detect "all watches" completion
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Detect brand set completion (AC: 3-4)
  - [ ] Create selector: `getCompletedBrandSets(state)`
  - [ ] Check after each purchase if new set completed
  - [ ] Track first set and set counts
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 5: Detect diversity achievements (AC: 5-6)
  - [ ] Create selector: `getOwnedTierIds(state)`
  - [ ] Create selector: `getOwnedMovementTypes(state)`
  - [ ] Check diversity on purchase
  - [ ] Unlock when all tiers/movements represented
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 6: Add progress hints (AC: 9)
  - [ ] Update AchievementList component
  - [ ] Show "X/Y collected" or "Z more needed"
  - [ ] Calculate progress for locked achievements
  - [ ] Verify: Hints display correctly

- [ ] Task 7: Update achievement definitions (AC: 1-9)
  - [ ] Add all collection achievements to ACHIEVEMENT_DEFINITIONS
  - [ ] Set appropriate rarity (bronze to platinum progression)
  - [ ] Verify: Achievements appear in UI

- [ ] Task 8: Add unit tests (AC: 1-9)
  - [ ] Test all collection size milestones
  - [ ] Test brand set completion
  - [ ] Test tier/movement diversity
  - [ ] Test grail detection
  - [ ] Test "all watches" detection
  - [ ] Test progress hint calculations
  - [ ] Verify: `pnpm -s run test:unit`

## Dev Notes

### Architecture Patterns

- Use existing collection selectors
- Hook into purchase action
- Calculate progress dynamically
- Extend achievement display for hints

### Source Tree Components

**Modified files:**

- `src/game/selectors/collection.ts` - Add completion selectors
- `src/game/actions/purchases.ts` or actions index - Add achievement triggers
- `src/game/data/achievements.ts` - Add collection achievements
- `src/ui/components/AchievementList.tsx` - Add progress hints

### Helper Selectors Needed

```typescript
// In src/game/selectors/collection.ts
export function getCompletedBrandSets(state: GameState): string[];
export function getOwnedTierIds(state: GameState): string[];
export function getOwnedMovementTypes(state: GameState): string[];
export function isGrailWatch(modelId: string): boolean;
export function getTotalOwnedCount(state: GameState): number;
```

### Testing Standards

- Mock state with specific owned watches
- Test brand set completion
- Test diversity calculations
- Verify progress hint accuracy

### References

- Source: `.planning/phases/epic-3-achievement-expansion.md`
- Collection system in `src/game/selectors/collection/`
- Purchase actions in `src/game/actions/`
- Set bonus system (similar logic)

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature

### Completion Notes List

- [ ] Reuse existing collection logic
- [ ] Efficiently calculate progress
- [ ] Test edge cases (empty collection, full collection)
- [ ] Verify hints are accurate

### File List

**Modified files:**

- `src/game/selectors/collection.ts`
- `src/game/actions/index.ts` or purchases
- `src/game/data/achievements.ts`
- `src/ui/components/AchievementList.tsx`
