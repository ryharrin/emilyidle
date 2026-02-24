# Story 2.4: Pre-PhD Onboarding and PhD Therapy Sessions

**Story ID:** 2.4  
**Epic:** 2 - Core Loop  
**Status:** complete
**Created:** 2026-02-23  
**Author:** Game Dev Scrum Master (Max)

---

## Story Foundation

### User Story
**As a** player,  
**I want** a one-time acceptance-letter onboarding before therapy income begins,  
**So that** Emily's career starts before PhD and then transitions clearly into sessions that earn Cash.

### Acceptance Criteria

**Given** the career system,  
**When** the game starts,  
**Then** I start in a Pre-PhD state with zero income and therapy sessions unavailable.

**Given** first launch,  
**When** I open Home,  
**Then** a forced one-time Mailbox task appears: "Check acceptance letter".

**Given** I open the acceptance letter,  
**When** I confirm "Enter Grad School",  
**Then** career state transitions from Pre-PhD to PhD Student.

**Given** I have enough Enjoyment,  
**When** I start a therapy session,  
**Then** Enjoyment is consumed and Career XP + Cash are earned.

**Given** the therapy session mini-game,  
**When** I engage,  
**Then** patients speak text and I tap to continue.

**Given** onboarding has completed,  
**When** I continue this save,  
**Then** the acceptance-letter gate never blocks again.

---

## DEV AGENT GUARDRAILS

### Technical Requirements

#### 1. Career State Extension
```typescript
type CareerStage = 'pre-phd' | 'phd-student' | 'externship' | 'va-hospital' | 
                   'private-practice' | 'group-practice' | 'retirement';

interface GameState {
  career: {
    stage: CareerStage;
    xp: number;
    onboardingComplete: boolean;
  };
  mailbox: {
    hasAcceptanceLetter: boolean;
    letterRead: boolean;
  };
}
```

#### 2. Actions
```typescript
type Action =
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "READ_ACCEPTANCE_LETTER" }
  | { type: "START_THERAPY_SESSION"; enjoymentCost: number }
  | { type: "COMPLETE_THERAPY_SESSION"; payload: { cashEarned: number; xpEarned: number } };
```

#### 3. Initial State
```typescript
const INITIAL_STATE: GameState = {
  career: {
    stage: 'pre-phd',
    xp: 0,
    onboardingComplete: false
  },
  mailbox: {
    hasAcceptanceLetter: true,  // Start with letter
    letterRead: false
  }
};
```

---

## Implementation Checklist

- [x] Add Pre-PhD career stage to CareerStage type
- [x] Add onboardingComplete flag to GameState
- [x] Add mailbox state for acceptance letter
- [x] Implement COMPLETE_ONBOARDING action
- [x] Implement READ_ACCEPTANCE_LETTER action
- [x] Implement therapy session actions (START_THERAPY_SESSION, COMPLETE_THERAPY_SESSION_RESULT)
- [x] Create AcceptanceLetter UI component
- [x] Integrate TherapySession mini-game (already existed in codebase)
- [ ] Add career progress bar UI (deferred to Story 4.1)
- [x] Implement cooldown between sessions

## Implementation Notes

### Files Created
- `src/ui/components/AcceptanceLetter.tsx` - UI component for acceptance letter modal
- `src/game/reducer.onboarding.unit.test.ts` - Unit tests for onboarding functionality

### Files Modified
- `src/game/types.ts` - Extended CareerStage with 'pre-phd', added onboardingComplete flag and mailbox state
- `src/game/reducer.ts` - Added handlers for COMPLETE_ONBOARDING, READ_ACCEPTANCE_LETTER, START_THERAPY_SESSION, COMPLETE_THERAPY_SESSION_RESULT
- `src/game/career.ts` - Added 'pre-phd' to NEXT_STAGE_XP mapping
- `src/ui/tabs/HomeTab.tsx` - Added mailbox section and therapy session integration

### Pre-existing Assets Used
- `src/game/data/therapyVignettes.ts` - Already existed with comprehensive vignettes for all career stages
- `src/ui/minigames/TherapySessionGame.tsx` - Already existed with full mini-game implementation

### Test Results
- All 13 new onboarding unit tests pass
- TypeScript compiles without errors
- ESLint passes without errors
- Note: 9 pre-existing test failures in QuartzCalibrationGame unrelated to this story

---

## Dependencies

**Requires:** Story 2.1 (Currency System), Story 2.3 (Mini-Game Pattern)  
**Required By:** Story 4.1 (Career Stage State Machine)

---

**Status:** done
