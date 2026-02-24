# Story 3.3: Enhanced Therapy Session Mini-Game

**Story ID:** 3.3  
**Epic:** 3 - Mini-Game Suite  
**Status:** done  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** therapy sessions to feel authentic with patient vignettes,  
**So that** the career system feels meaningful and true to Emily's profession.

## Acceptance Criteria

1. **Given** I start a therapy session, when the session begins, then a patient presents with a text vignette.
2. **Given** the patient speaks, when I tap to respond, then I'm shown 3 randomized therapist response options to choose from (all advance the conversation equally - pure flavor).
3. **Given** the session progresses, when multiple exchanges complete, then the session ends with Cash + Career XP rewards.
4. **Given** different career stages, when I'm at a higher stage, then patient scenarios become more nuanced (but never harder).

---

## Technical Requirements

### Data Structure
```typescript
interface TherapyVignette {
  id: string;
  stage: CareerStage;
  patientText: string[];       // Array of statements
  exchangeCount: number;       // How many exchanges
  reward: {
    cashCents: number;
    xp: number;
  };
}

const THERAPY_VIGNETTES: TherapyVignette[] = [
  // Stage-specific scenarios
];
```

### Pattern 6: Mini-Game
- Local state for: current exchange index, session timer
- Simple tap-to-continue flow
- No fail state - always completes
- Rewards based on career stage

---

## Implementation

- [ ] Create TherapySessionGame component
- [ ] Implement vignette data structure
- [ ] Add patient text display with typing effect
- [ ] Create tap-to-continue interaction
- [ ] Stage-specific vignette selection
- [ ] Calculate rewards (Cash + XP)
- [ ] Follow Pattern 6

---

**Depends on:** Story 2.4 (Therapy Sessions base)  
**Required by:** Story 3.6 (Result Screen)

**Status:** ready-for-dev
