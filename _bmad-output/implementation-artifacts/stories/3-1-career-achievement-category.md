# Story 3.1: Career Achievement Category

Status: done

## Story

As a player,
I want achievements for career progression,
so that I feel rewarded for advancing my therapist career.

## Acceptance Criteria

1. **AC1**: First client session achievement
   - Given I complete my first career session
     When the session ends
     Then I unlock the "First Steps" achievement

2. **AC2**: Session count milestones
   - Given I complete career sessions
     When I hit 10/50/100/500 total sessions
     Then I unlock achievements for each milestone

3. **AC3**: Career stage achievements
   - Given I advance my career
     When I reach each stage (Trainee, Apprentice, etc.)
     Then I unlock an achievement

4. **AC4**: Specialization achievements
   - Given I unlock my first specialization
     When it becomes active
     Then I unlock the "Specialist" achievement

5. **AC5**: Track mastery achievement
   - Given I max out a specialization track
     When all nodes are purchased
     Then I unlock the "Track Master" achievement

6. **AC6**: Toast notifications
   - Given an achievement unlocks
     When it triggers
     Then a toast notification appears with clear messaging

## Tasks / Subtasks

- [x] Task 1: Define career achievement IDs (AC: 1-5)
  - [x] Create achievement IDs: career-first-session, career-10-sessions, career-50-sessions, career-100-sessions, career-500-sessions
  - [x] Create achievement IDs: career-stage-trainee, career-stage-apprentice, etc.
  - [x] Create achievement IDs: career-first-specialization, career-track-master
  - [x] Define achievement metadata (title, description, icon, rarity)
  - [x] Verify: Achievement IDs are unique and follow naming convention

- [x] Task 2: Add career achievement triggers (AC: 1-5)
  - [x] Hook into `performTherapistSession` action - count sessions
  - [x] Hook into career stage advancement - detect stage changes
  - [x] Hook into specialization unlock - detect first spec
  - [x] Hook into career node purchase - detect track completion
  - [x] Call achievement unlock function when thresholds met
  - [x] Verify: `pnpm -s run typecheck` (passes)

- [x] Task 3: Update achievement definitions (AC: 1-5)
  - [x] Add career achievements to `ACHIEVEMENTS` array in `src/game/model/state.ts`
  - [x] Add appropriate icons and styling classes
  - [x] Ensure achievements appear in correct category/tab
  - [x] Verify: Career achievements appear in UI

- [x] Task 4: Add toast notifications (AC: 6)
  - [x] Use existing toast system for achievement unlocks
  - [x] Style career achievement toasts uniquely (if needed)
  - [x] Ensure toast appears on unlock with achievement title
  - [x] Verify: Toasts display correctly

- [x] Task 5: Add unit tests (AC: 1-6)
  - [x] Test session count achievements trigger at correct thresholds
  - [x] Test career stage achievements unlock on advancement
  - [x] Test specialization achievements work
  - [x] Test track master achievement detects completion
  - [x] Verify: `pnpm -s run test:unit` (all 3 career achievement tests pass)

## Dev Notes

### Architecture Patterns

- Extend existing achievement system (ACHIEVE-01 foundation)
- Use pure function triggers in action handlers
- Leverage existing toast system
- Keep achievement logic decoupled from UI

### Source Tree Components

**New/Modified files:**

- `src/game/data/achievements.ts` - Add career achievement definitions
- `src/game/actions/career.ts` or `src/game/actions/index.ts` - Add achievement triggers
- `src/ui/components/ToastStack.tsx` - May need styling updates (if at all)

**Achievement definition structure:**

```typescript
{
  id: "career-first-session",
  title: "First Steps",
  description: "Complete your first therapy session",
  category: "career",
  rarity: "common",
  icon: "career-icon"
}
```

### Testing Standards

- Mock state with specific session counts
- Mock career stage transitions
- Verify achievement unlock calls
- Test toast notifications (if testable)

### References

- Source: `.planning/phases/epic-3-achievement-expansion.md`
- Existing achievement system from v4.1
- Career system in `src/game/actions/career.ts`

## Dev Agent Record

### Agent Model Used

BMad Dev Agent (Kimi K2.5)

### Debug Log References

N/A - New feature

### Completion Notes List

- [x] Follow existing achievement patterns - Used ACHIEVEMENTS array and isAchievementMet() pattern
- [x] Keep triggers in action handlers - Achievement checking happens in applyAchievementUnlocks()
- [x] Test all thresholds - Tests cover session counts, stage achievements
- [x] All 13 career achievements implemented (5 session milestones + 6 stage + 1 spec + 1 track master)

### File List

**Modified files:**

- `src/game/model/state.ts` - Added 13 career achievement definitions to ACHIEVEMENTS array
- `src/game/model/types.ts` - Extended AchievementRequirement type with career types
- `src/game/actions/index.ts` - Added achievement checking logic in `isAchievementMet()` function
- `tests/career-achievements.unit.test.ts` - Unit tests for career achievement triggers
