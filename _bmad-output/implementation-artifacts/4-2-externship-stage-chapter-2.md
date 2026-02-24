# Story 4.2: Externship Stage (Chapter 2)

**Story ID:** 4.2  
**Epic:** 4 - Career Journey  
**Status:** done  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to progress to the Externship stage,  
**So that** I experience Emily's growth into supervised practice.

## Acceptance Criteria

1. **Given** I've earned enough Career XP as a PhD Student, when I advance to Externship, then income increases to Low-Moderate and Enjoyment cost rises slightly.
2. **Given** the Externship stage, when therapy sessions run, then patient vignettes reflect supervised practice themes.
3. **Given** the stage transition, when Externship unlocks, then Manual watches become available in the market.

---

## Technical Requirements

### Stage Data (in careers.ts)
```typescript
{
  id: 'externship',
  title: 'Externship',
  xpRequired: 100,
  incomePerSecCents: 25,
  enjoymentCost: 8,
  description: 'Supervised practice, finding her voice',
  unlocks: ['manual-tier']
}
```

### Vignettes
- Supervision scenarios
- First independent decisions
- Building confidence themes

### Unlock Triggers
- Manual watch tier in market
- Home life photo from this era
- Message from Ryan about this stage

---

## Implementation

- [x] Add Externship to career stages
- [x] Create therapy vignettes for this stage
- [x] Implement manual watch tier unlock
- [x] Add stage transition celebration
- [x] Create Ryan message for this milestone

## File List

- src/game/watchSelectors.ts
- src/ui/tabs/MarketTab.tsx
- src/game/discovery/registry.ts
- src/ui/components/UnlockToasts.tsx
- src/game/watchSelectors.unit.test.ts
- src/game/reducer.unit.test.ts
- src/game/data/therapyVignettes.unit.test.ts

## Dev Agent Record

### Debug Log

- Added market-tier gating so manual watches require Externship unlock progression.
- Added Externship milestone unlock events for celebration, home photo, and Ryan message.
- Added unlock presentation copy for Externship transition and milestone messaging in unlock toasts.
- Added unit tests for market tier gating, Externship milestone unlock fanout, and Externship vignette coverage.
- Ran full Vitest suite after changes.

### Completion Notes

- Externship stage data and thresholds are active in the career progression path.
- Therapy sessions for Externship now use dedicated clinical/supervision vignette content.
- Manual-tier watches remain hidden in Market until `career-Externship-manual` unlock is triggered.
- Advancing into Externship now emits celebration + chapter milestone unlocks, including a Ryan message unlock.

## Change Log

- 2026-02-23: Implemented Story 4.2 externship progression, milestone unlocks, and market gating.

## Senior Developer Review (AI)

### Reviewer

- Ryan (AI-assisted adversarial review)

### Outcome

- Approve

### Notes

- AC coverage confirmed for Externship progression values, stage-specific vignette content, and manual-tier market unlock behavior.
- Externship transition now also emits chapter celebration and milestone unlock events used by unlock toasts.

### Verification

- `pnpm -s exec vitest run` (30 files, 195 tests passed)

---

**Depends on:** Story 4.1 (Career State Machine)  
**Required by:** Story 4.3 (VA Hospital)

**Status:** done
