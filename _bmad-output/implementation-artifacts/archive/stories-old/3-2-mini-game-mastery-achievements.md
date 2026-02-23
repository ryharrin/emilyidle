# Story 3.2: Mini-Game Mastery Achievements

Status: ready-for-dev

## Story

As a player,
I want achievements for mini-game skill,
so that perfect play is recognized and rewarded.

## Acceptance Criteria

1. **AC1**: First perfect winding achievement
   - Given I play a winding mini-game
     When I achieve a perfect outcome for the first time
     Then I unlock the "First Perfect" achievement

2. **AC2**: Streak milestone achievements
   - Given I build perfect streaks
     When I hit 10/50/100 consecutive perfects
     Then I unlock achievements for each streak milestone

3. **AC3**: First perfect by movement type
   - Given I play different mini-game types
     When I achieve my first perfect in each type (automatic service, quartz timing)
     Then I unlock achievements for each movement type

4. **AC4**: Movement mastery achievements
   - Given I play a specific movement type
     When I achieve 10 perfects in that type
     Then I unlock the mastery achievement for that movement

5. **AC5**: Mini-game grandmaster achievement
   - Given I play all mini-game types
     When I achieve 100 total perfects across all types combined
     Then I unlock the "Grandmaster" achievement

6. **AC6**: Streak persistence safety
   - Given streak achievements exist
     When I break a streak
     Then progress is preserved (don't lose unlocked achievements)

7. **AC7**: Toast notifications
   - Given a mini-game achievement unlocks
     When it triggers
     Then a toast notification appears with clear messaging

## Tasks / Subtasks

- [ ] Task 1: Define mini-game achievement IDs (AC: 1-5)
  - [ ] Create achievement IDs: minigame-first-perfect, minigame-streak-10, minigame-streak-50, minigame-streak-100
  - [ ] Create achievement IDs: minigame-first-automatic, minigame-first-quartz
  - [ ] Create achievement IDs: minigame-master-winding, minigame-master-automatic, minigame-master-quartz, minigame-master-tourbillon
  - [ ] Create achievement ID: minigame-grandmaster
  - [ ] Define achievement metadata (title, description, icon hint, category: "mini-game")
  - [ ] Verify: Achievement IDs are unique and follow naming convention

- [ ] Task 2: Extend state tracking for per-movement perfects (AC: 3-4)
  - [ ] Add `interactionPerfectRunsByMovement: Record<WatchItemId, number>` to GameState
  - [ ] Add same to PersistedGameState for save compatibility
  - [ ] Initialize all movement counts to 0 in createInitialState()
  - [ ] Handle loading from save in createStateFromSave()
  - [ ] Verify: `pnpm -s run typecheck` passes

- [ ] Task 3: Update interaction tracking logic (AC: 3-5)
  - [ ] Modify applyInteractionTracking() in src/game/actions/interactions.ts
  - [ ] Increment per-movement counter when outcome is "perfect"
  - [ ] Pass itemId to track which movement type earned the perfect
  - [ ] Ensure practice mode doesn't increment counters (already guarded by mode check)
  - [ ] Verify: Unit tests pass for interaction tracking

- [ ] Task 4: Add mini-game achievement requirements to types (AC: 1-5)
  - [ ] Extend AchievementId type with new IDs in src/game/model/types.ts
  - [ ] Extend AchievementRequirement type:
    - Add `{ type: "interactionPerfectsByMovement"; movement: WatchItemId; threshold: number }`
  - [ ] Verify: No TypeScript errors, union type is exhaustive

- [ ] Task 5: Add mini-game achievement definitions (AC: 1-5)
  - [ ] Add 11 mini-game achievements to ACHIEVEMENTS array in src/game/model/state.ts
  - [ ] Category: "mini-game" (already exists)
  - [ ] Requirement types:
    - First perfect: `{ type: "interactionPerfects", threshold: 1 }`
    - Streak milestones: `{ type: "perfectStreak", threshold: 10/50/100 }`
    - First by movement: `{ type: "interactionPerfectsByMovement", movement, threshold: 1 }`
    - Movement mastery: `{ type: "interactionPerfectsByMovement", movement, threshold: 10 }`
    - Grandmaster: `{ type: "interactionPerfects", threshold: 100 }`
  - [ ] Verify: Achievements appear in correct category in UI

- [ ] Task 6: Implement achievement trigger logic (AC: 1-5)
  - [ ] Extend isAchievementMet() in src/game/actions/index.ts
  - [ ] Add handler for "interactionPerfectsByMovement" requirement type
  - [ ] Access state.interactionPerfectRunsByMovement[requirement.movement]
  - [ ] Compare against requirement.threshold
  - [ ] Reuse existing perfectStreak handler for streak achievements
  - [ ] Verify: All achievement conditions evaluate correctly

- [ ] Task 7: Add achievement progress tracking (AC: 1-5)
  - [ ] Extend getAchievementProgressRatio() in src/game/selectors/milestones.ts
  - [ ] Add handler for "interactionPerfectsByMovement" type
  - [ ] Return ratio: perfectCount / threshold
  - [ ] Verify: Progress bars show correctly in achievement UI

- [ ] Task 8: Add toast notifications (AC: 7)
  - [ ] Reuse existing toast system (same as Story 3.1)
  - [ ] Mini-game achievements show in "mini-game" category
  - [ ] Ensure toast appears on unlock with achievement title
  - [ ] Verify: Toasts display correctly

- [ ] Task 9: Add unit tests (AC: 1-7)
  - [ ] Test first perfect achievement unlocks on first perfect outcome
  - [ ] Test streak achievements unlock at 10/50/100 thresholds
  - [ ] Test streak preservation (breaking streak doesn't revoke achievements)
  - [ ] Test per-movement first perfect achievements
  - [ ] Test per-movement mastery achievements at 10 perfects
  - [ ] Test grandmaster unlocks at 100 total perfects
  - [ ] Test per-movement counters increment correctly
  - [ ] Verify: `pnpm -s run test:unit` (all mini-game achievement tests pass)

## Dev Notes

### Architecture Patterns

- Extend existing achievement system (Story 3.1 foundation)
- Use pure function triggers in action handlers
- Leverage existing toast system
- Keep achievement logic decoupled from UI
- Add new state field for per-movement perfect tracking

### State Tracking Changes

**New field in GameState (src/game/model/types.ts):**

```typescript
interactionPerfectRunsByMovement: Record<WatchItemId, number>;
```

**Initialization in createInitialState():**

```typescript
interactionPerfectRunsByMovement: {
  quartz: 0,
  automatic: 0,
  manual: 0,
  tourbillon: 0,
},
```

**Persistence in PersistedGameState:**

```typescript
interactionPerfectRunsByMovement?: Record<string, number>;
```

### Achievement Definitions

**Mini-game mastery achievements (11 total):**

| ID                         | Name              | Requirement                                     |
| -------------------------- | ----------------- | ----------------------------------------------- |
| minigame-first-perfect     | First Perfect     | interactionPerfects: 1                          |
| minigame-streak-10         | Streak Starter    | perfectStreak: 10                               |
| minigame-streak-50         | Streak Master     | perfectStreak: 50                               |
| minigame-streak-100        | Perfect Streak    | perfectStreak: 100                              |
| minigame-first-automatic   | Automatic Ace     | interactionPerfectsByMovement: {automatic, 1}   |
| minigame-first-quartz      | Quartz Quick      | interactionPerfectsByMovement: {quartz, 1}      |
| minigame-master-winding    | Winding Master    | interactionPerfectsByMovement: {manual, 10}     |
| minigame-master-automatic  | Automatic Master  | interactionPerfectsByMovement: {automatic, 10}  |
| minigame-master-quartz     | Quartz Master     | interactionPerfectsByMovement: {quartz, 10}     |
| minigame-master-tourbillon | Tourbillon Master | interactionPerfectsByMovement: {tourbillon, 10} |
| minigame-grandmaster       | Grandmaster       | interactionPerfects: 100                        |

### Source Tree Components

**New/Modified files:**

- `src/game/model/types.ts` - Add AchievementId, AchievementRequirement extensions
- `src/game/model/state.ts` - Add state field, achievement definitions, save/load logic
- `src/game/actions/interactions.ts` - Update applyInteractionTracking to count per-movement perfects
- `src/game/actions/index.ts` - Add achievement checking logic for new requirement type
- `src/game/selectors/milestones.ts` - Add progress tracking for new requirement type
- `tests/minigame-achievements.unit.test.ts` - Unit tests for mini-game achievement triggers

### Achievement Trigger Flow

```
applyWindingReward/applyAutomaticReward/applyQuartzReward
  → applyInteractionTracking
    → Updates interactionPerfectRuns (total)
    → Updates interactionPerfectRunsByMovement[movement] (per-type)
    → Updates interactionPerfectStreak / interactionBestPerfectStreak
  → (state transition)
  → applyAchievementUnlocks
    → isAchievementMet for each achievement
      → interactionPerfects (existing)
      → perfectStreak (existing)
      → interactionPerfectsByMovement (NEW)
```

### Testing Standards

- Mock state with specific per-movement perfect counts
- Mock perfect streaks at various lengths
- Verify achievement unlock calls via applyAchievementUnlocks
- Test that achievements persist after streak breaks
- Test progress ratios for UI display

### References

- Source: `.planning/phases/epic-3-achievement-expansion.md` (Epic 3.2 section)
- Existing achievement system from Story 3.1
- Interaction system in `src/game/actions/interactions.ts`
- Achievement definitions pattern in `src/game/model/state.ts`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature

### Completion Notes List

- [ ] Follow existing achievement patterns - Extend ACHIEVEMENTS array and isAchievementMet() pattern
- [ ] Keep triggers in action handlers - Achievement checking happens in applyAchievementUnlocks()
- [ ] Add per-movement state tracking - New field interactionPerfectRunsByMovement
- [ ] Test all thresholds - Tests cover streak milestones and per-movement counts
- [ ] Ensure save compatibility - Handle loading legacy saves without per-movement data

### File List

**Modified files:**

- `src/game/model/types.ts` - Extended AchievementId and AchievementRequirement types
- `src/game/model/state.ts` - Added interactionPerfectRunsByMovement state field + 11 achievement definitions
- `src/game/actions/interactions.ts` - Updated applyInteractionTracking() to count per-movement perfects
- `src/game/actions/index.ts` - Added achievement checking logic for interactionPerfectsByMovement
- `src/game/selectors/milestones.ts` - Added progress tracking for per-movement achievements

**New files:**

- `tests/minigame-achievements.unit.test.ts` - Unit tests for mini-game achievement triggers
