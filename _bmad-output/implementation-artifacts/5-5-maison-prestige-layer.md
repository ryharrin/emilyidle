# Story 5.5: Maison Prestige Layer

**Story ID:** 5.5  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to unlock the Maison prestige at Hour 4,  
**So that** I gain access to premium content and stronger multipliers.

## Acceptance Criteria

1. **Given** I've reached the Maison unlock condition, when I unlock it, then Heritage currency becomes available.
2. **Given** Maison is active, when I spend Heritage, then I unlock: tourbillon watches, better multipliers, premium home features.
3. **Given** soft prestige, when Maison unlocks, then Workshop bonuses remain; nothing resets.

---

## Technical Requirements

### Maison System
```typescript
interface PrestigeState {
  workshop: { ... };
  maison: {
    unlocked: boolean;
    heritage: number;
    upgrades: string[];
  };
}

const MAISON_UPGRADES = [
  { id: 'income-boost-3', cost: 30, multiplier: 2.0 },
  { id: 'tourbillon-unlock', cost: 50, unlocks: ['tourbillon-tier'] },
  { id: 'premium-home', cost: 40, unlocks: ['premium-features'] },
  { id: 'collection-bonus', cost: 35, bonus: 0.1 }  // +10% per owned watch
];
```

### Multiplier Stacking
```typescript
function calculateTotalMultiplier(state: GameState): number {
  let multiplier = 1.0;
  
  // Workshop bonuses
  if (state.prestige.workshop.unlocked) {
    multiplier *= getWorkshopMultiplier(state);
  }
  
  // Maison bonuses (stack on top)
  if (state.prestige.maison.unlocked) {
    multiplier *= getMaisonMultiplier(state);
  }
  
  return multiplier;
}
```

---

## Implementation

- [ ] Add Maison to prestige state
- [ ] Implement Maison unlock condition (Hour 4/Private Practice)
- [ ] Create Heritage currency
- [ ] Define Maison upgrades
- [ ] Implement multiplier stacking
- [ ] Create Maison UI
- [ ] Ensure soft prestige (no reset)

---

**Depends on:** Story 5.4 (Workshop Prestige)  
**Required by:** Story 5.6 (Nostalgia Prestige)

**Status:** ready-for-dev
