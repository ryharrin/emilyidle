# Story 5.6: Nostalgia Prestige Layer

**Story ID:** 5.6  
**Epic:** 5 - Collection & Prestige  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to unlock the Nostalgia prestige as the final layer,  
**So that** my collection reaches "museum quality" status.

## Acceptance Criteria

1. **Given** I've reached the Nostalgia unlock condition (Hour 6/endgame), when I unlock it, then Nostalgia Points currency becomes available.
2. **Given** Nostalgia is active, when I spend Nostalgia Points, then permanent bonuses unlock and "museum quality" collection status is achieved.
3. **Given** the final prestige layer, when fully invested, then the final home life gallery completes.

---

## Technical Requirements

### Nostalgia System
```typescript
interface PrestigeState {
  workshop: { ... };
  maison: { ... };
  nostalgia: {
    unlocked: boolean;
    points: number;
    upgrades: string[];
    museumQuality: boolean;
  };
}

const NOSTALGIA_UPGRADES = [
  { id: 'ultimate-multiplier', cost: 100, multiplier: 3.0 },
  { id: 'museum-status', cost: 75, achievement: 'museum-quality' },
  { id: 'final-gallery', cost: 80, unlocks: ['complete-home'] },
  { id: 'legacy-bonus', cost: 60, permanent: true }
];
```

---

## Implementation

- [ ] Add Nostalgia to prestige state
- [ ] Implement Nostalgia unlock condition (Retirement/endgame)
- [ ] Create Nostalgia Points currency
- [ ] Define Nostalgia upgrades
- [ ] Implement museum quality achievement
- [ ] Create Nostalgia UI
- [ ] Connect to endgame

---

**Depends on:** Story 5.5 (Maison Prestige)  
**Required by:** Story 7.5 (Endgame Sequence)

**Status:** ready-for-dev
