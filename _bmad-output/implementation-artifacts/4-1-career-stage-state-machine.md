# Story 4.1: Career Stage State Machine

**Story ID:** 4.1  
**Epic:** 4 - Career Journey  
**Status:** done  
**Created:** 2026-02-23

---

## Story

**As a** developer,  
**I want** the complete 6-stage career state machine with XP thresholds and pre-PhD entry integration,  
**So that** career progression drives the narrative arc.

## Acceptance Criteria

1. **Given** the career data, when I inspect `game/data/careers.ts`, then all 6 stages are defined: PhD Student, Externship, VA Hospital, Private Practice, Group Practice, Retirement.
2. **Given** onboarding integration, when I inspect career state entry rules, then a pre-PhD state is supported as the only allowed entry path into PhD Student.
3. **Given** each stage, when I inspect its properties, then it has: id, title, xpRequired, incomePerSecCents, enjoymentCost, description.
4. **Given** the career state machine, when Career XP reaches the next stage threshold, then `canAdvanceCareer(state)` returns true.
5. **Given** career advancement, when the player advances, then the ADVANCE_CAREER action updates careerStage and triggers discovery unlocks.

---

## Technical Requirements

### Career Data Structure
```typescript
export interface CareerStage {
  id: string;
  title: string;
  xpRequired: number;
  incomePerSecCents: number;
  enjoymentCost: number;
  description: string;
  unlocks: string[];  // Watch tiers, features, etc.
}

export const CAREER_STAGES: CareerStage[] = [
  { id: 'phd-student', title: 'PhD Student', xpRequired: 0, incomePerSecCents: 10, enjoymentCost: 5, description: 'Learning and first clients', unlocks: ['quartz'] },
  { id: 'externship', title: 'Externship', xpRequired: 100, incomePerSecCents: 25, enjoymentCost: 8, description: 'Supervised practice', unlocks: ['manual'] },
  { id: 'va-hospital', title: 'VA Hospital', xpRequired: 500, incomePerSecCents: 50, enjoymentCost: 12, description: 'Serving veterans', unlocks: ['automatic', 'jlc-award'] },
  { id: 'private-practice', title: 'Private Practice', xpRequired: 2000, incomePerSecCents: 100, enjoymentCost: 20, description: 'Independence', unlocks: ['tourbillon'] },
  { id: 'group-practice', title: 'Group Practice', xpRequired: 8000, incomePerSecCents: 200, enjoymentCost: 35, description: 'Collaboration', unlocks: ['all-tiers'] },
  { id: 'retirement', title: 'Retirement', xpRequired: 25000, incomePerSecCents: 50, enjoymentCost: 0, description: 'Legacy', unlocks: ['endgame'] }
];
```

### Selectors
```typescript
export function getCareerProgress(state: GameState): number {
  const currentStage = CAREER_STAGES.find(s => s.id === state.career.stage);
  const nextStage = CAREER_STAGES.find(s => s.xpRequired > state.career.xp);
  if (!nextStage) return 1;
  return (state.career.xp - currentStage.xpRequired) / 
         (nextStage.xpRequired - currentStage.xpRequired);
}

export function canAdvanceCareer(state: GameState): boolean {
  const nextStage = CAREER_STAGES.find(s => s.xpRequired > state.career.xp);
  if (!nextStage) return false;
  return state.career.xp >= nextStage.xpRequired;
}
```

### Actions
```typescript
type Action =
  | { type: "ADVANCE_CAREER" }
  | { type: "ADD_CAREER_XP"; amount: number };
```

---

## Implementation

- [x] Create career data file with all 6 stages
- [x] Define XP thresholds and income scaling
- [x] Implement getCareerProgress selector
- [x] Implement canAdvanceCareer selector
- [x] Add ADVANCE_CAREER action
- [x] Integrate pre-PhD onboarding entry
- [x] Create career unlock triggers

## File List

- src/game/data/careers.ts
- src/game/career.ts
- src/game/types.ts
- src/game/reducer.ts
- src/game/persistence.ts
- src/game/discovery/registry.ts
- src/game/career.unit.test.ts
- src/game/reducer.unit.test.ts
- src/game/reducer.onboarding.unit.test.ts
- src/ui/tabs/HomeTab.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Dev Agent Record

### Debug Log

- Implemented stage catalog as first-class data in `src/game/data/careers.ts`.
- Reworked career progression logic to compute ratio against current-stage baseline and next threshold.
- Added guarded `ADVANCE_CAREER` reducer path and enforced pre-PhD-only entry into `PhDStudent`.
- Added career-stage-driven discovery unlock rules in unlock registry.
- Ran full Vitest suite after implementation.

### Completion Notes

- Career state machine now has all six narrative stages with required properties plus unlock metadata.
- `canAdvanceCareer(state)` now returns true exactly at/after threshold for the next stage.
- `ADVANCE_CAREER` transitions to the next stage and queues corresponding discovery unlocks.
- Persistence now accepts `pre-phd` so onboarding-stage saves are preserved correctly.
- Added focused unit coverage for career progression and reducer advancement behavior.

## Change Log

- 2026-02-23: Implemented Story 4.1 career stage state machine, advancement action, and unlock triggers.
- 2026-02-23: Code review fixes applied for onboarding-stage guard, pre-PhD progress handling, and stage-driven therapy economy wiring.

## Senior Developer Review (AI)

### Reviewer

- Ryan (AI-assisted adversarial review)

### Outcome

- Approve

### Findings Resolved

- Added `COMPLETE_ONBOARDING` stage guard to enforce pre-PhD-only entry into `PhDStudent`.
- Corrected pre-PhD progress semantics (`ratio = 0`) to avoid false-complete UI state.
- Wired career stage economy data into therapy session flow (stage enjoyment cost + base income floor).
- Updated story File List to include additional touched source and tracking artifacts.

### Verification

- `pnpm -s exec vitest run src/game/career.unit.test.ts src/game/reducer.unit.test.ts src/game/reducer.onboarding.unit.test.ts` (37 passed)
- `pnpm -s exec vitest run` (193 passed)

---

**Depends on:** Story 2.4 (Career base + pre-PhD)  
**Required by:** Stories 4.2-4.7 (all career stages)

**Status:** done
