# Story 3.5: Secret/Hidden Achievements

Status: ready-for-dev

## Story

As a player,
I want secret achievements to discover,
so that there are surprises and Easter eggs.

## Acceptance Criteria

1. **AC1**: Speed Demon achievement
   - Given I play mini-games
     When I complete any mini-game in under X seconds
     Then I unlock the "Speed Demon" secret achievement

2. **AC2**: Hoarder achievement
   - Given I collect watches
     When I own 10 watches without equipping any
     Then I unlock the "Hoarder" secret achievement

3. **AC3**: Patient achievement
   - Given I avoid interactions
     When I don't play any mini-games for 24 hours
     Then I unlock the "Patient" secret achievement

4. **AC4**: Clicker achievement
   - Given I interact with the UI
     When I click 1000 times on the crown/interaction element
     Then I unlock the "Clicker" secret achievement

5. **AC5**: Lucky achievement
   - Given I play mini-games
     When I get 3 perfects in a row by accident
     Then I unlock the "Lucky" secret achievement

6. **AC6**: Secret achievement display
   - Given secret achievements exist
     When they are locked
     Then they appear as "???" with cryptic hints

7. **AC7**: Reveal on unlock
   - Given a secret achievement is locked
     When it unlocks
     Then it reveals its true title, description, and icon

8. **AC8**: Fun/humorous descriptions
   - Given secret achievements unlock
     When I view them
     Then they have witty or humorous descriptions

## Tasks / Subtasks

- [ ] Task 1: Define secret achievement IDs (AC: 1-5)
  - [ ] Create IDs: secret-speed-demon, secret-hoarder, secret-patient, secret-clicker, secret-lucky
  - [ ] Define hidden metadata (shown as "???" when locked)
  - [ ] Define revealed metadata (actual titles/descriptions)
  - [ ] Create cryptic hints for locked state
  - [ ] Verify: IDs follow naming convention

- [ ] Task 2: Track secret stats (AC: 1-5)
  - [ ] Add to GameState:
    - miniGameCompletionTimes: number[] (last 10)
    - unequippedOwnedCount: number
    - lastInteractionAtMs: number
    - crownClickCount: number
    - luckyPerfectStreak: number
  - [ ] Update persistence
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 3: Implement Speed Demon (AC: 1)
  - [ ] Track mini-game completion time
  - [ ] Check if under threshold (e.g., 3 seconds)
  - [ ] Unlock achievement if condition met
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 4: Implement Hoarder (AC: 2)
  - [ ] Track watches owned vs equipped
  - [ ] Check if 10+ owned and none equipped
  - [ ] Trigger achievement check on purchase/equip changes
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 5: Implement Patient (AC: 3)
  - [ ] Track last mini-game interaction time
  - [ ] Check on app load/game tick if 24h passed
  - [ ] Unlock if condition met
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 6: Implement Clicker (AC: 4)
  - [ ] Track clicks on crown/interaction button
  - [ ] Increment counter on each click
  - [ ] Unlock at 1000 clicks
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 7: Implement Lucky (AC: 5)
  - [ ] Track perfect streak
  - [ ] Check if 3 perfects in a row without existing streak achievement
  - [ ] Unlock "Lucky" if achieved organically (not during streak grinding)
  - [ ] Verify: `pnpm -s run typecheck`

- [ ] Task 8: Add secret display logic (AC: 6-7)
  - [ ] Update AchievementList component
  - [ ] Show "???" for locked secrets
  - [ ] Show cryptic hint instead of description
  - [ ] Reveal true info when unlocked
  - [ ] Add visual indicator (mystery icon)
  - [ ] Verify: UI displays correctly

- [ ] Task 9: Add unit tests (AC: 1-8)
  - [ ] Test each secret achievement trigger
  - [ ] Test secret display in locked state
  - [ ] Test reveal on unlock
  - [ ] Verify: `pnpm -s run test:unit`

## Dev Notes

### Architecture Patterns

- Track special stats in GameState
- Check conditions in various places (actions, selectors, tick)
- Use existing achievement system with hidden flag
- Extend achievement UI for secret display

### State Extension

```typescript
interface GameState {
  // ... existing fields
  secretStats: {
    miniGameCompletionTimes: number[];
    lastInteractionAtMs: number;
    crownClickCount: number;
    luckyPerfectStreak: number;
  };
}
```

### Secret Achievement Structure

```typescript
{
  id: "secret-speed-demon",
  title: "???", // Hidden until unlocked
  description: "???", // Hidden until unlocked
  revealedTitle: "Speed Demon",
  revealedDescription: "Complete a mini-game in under 3 seconds",
  crypticHint: "Time is of the essence...",
  isSecret: true,
  rarity: "gold"
}
```

### Source Tree Components

**Modified files:**

- `src/game/model/types.ts` - Add secret stats
- `src/game/model/state.ts` - Initialize stats
- `src/game/persistence.ts` - Save/load stats
- `src/game/actions/interactions.ts` - Track timing and clicks
- `src/game/data/achievements.ts` - Add secret achievements
- `src/ui/components/AchievementList.tsx` - Secret display logic

### Testing Standards

- Mock specific conditions for each secret
- Test timing-based triggers
- Test secret display states
- Verify reveal on unlock

### References

- Source: `.planning/phases/epic-3-achievement-expansion.md`
- Achievement system foundation from v4.1

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature

### Completion Notes List

- [ ] Keep secrets fun and discoverable
- [ ] Don't make them too hard or frustrating
- [ ] Ensure hints are cryptic but fair
- [ ] Test all trigger conditions

### File List

**Modified files:**

- `src/game/model/types.ts`
- `src/game/model/state.ts`
- `src/game/persistence.ts`
- `src/game/actions/interactions.ts`
- `src/game/data/achievements.ts`
- `src/ui/components/AchievementList.tsx`
