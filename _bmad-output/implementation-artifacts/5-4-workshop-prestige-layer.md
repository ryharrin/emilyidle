# Story 5.4: Workshop Prestige Layer

**Story ID:** 5.4  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to unlock the Workshop prestige at Hour 2,  
**So that** I gain permanent bonuses and new content without losing progress.

## Acceptance Criteria

1. **Given** I've reached the Workshop unlock condition, when I unlock it, then Blueprints currency becomes available.
2. **Given** Workshop is active, when I spend Blueprints, then I unlock: basic income multipliers, manual/automatic watches, first home life expansion.
3. **Given** soft prestige design, when Workshop unlocks, then NO progress is reset — everything carries forward.

---

## Technical Requirements

### Workshop System
```typescript
interface PrestigeState {
  workshop: {
    unlocked: boolean;
    blueprints: number;
    upgrades: string[];
  };
}

const WORKSHOP_UPGRADES = [
  { id: 'income-boost-1', cost: 10, multiplier: 1.2 },
  { id: 'income-boost-2', cost: 25, multiplier: 1.5 },
  { id: 'manual-unlock', cost: 15, unlocks: ['manual-tier'] },
  { id: 'home-expansion-1', cost: 20, unlocks: ['home-gallery'] }
];
```

### Soft Prestige (No Reset)
```typescript
// Workshop unlock adds bonuses on top of existing progress
case "UNLOCK_WORKSHOP": {
  return {
    ...state,
    prestige: {
      ...state.prestige,
      workshop: {
        unlocked: true,
        blueprints: calculateBlueprintReward(state),
        upgrades: []
      }
    }
  };
}
```

---

## Implementation

- [ ] Add prestige state to GameState
- [ ] Implement Workshop unlock condition
- [ ] Create Blueprints currency
- [ ] Define Workshop upgrades
- [ ] Calculate blueprint rewards
- [ ] Ensure no reset on unlock
- [ ] Create Workshop UI

---

**Depends on:** Story 4.2 (Externship - unlocks at this stage)  
**Required by:** Story 5.5 (Maison Prestige)

**Status:** ready-for-dev
