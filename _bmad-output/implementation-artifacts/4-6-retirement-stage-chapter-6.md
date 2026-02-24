# Story 4.6: Retirement Stage (Chapter 6)

**Story ID:** 4.6  
**Epic:** 4 - Career Journey  
**Status:** ready-for-dev  
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to reach Retirement as the final career stage,  
**So that** the journey reaches its satisfying conclusion.

## Acceptance Criteria

1. **Given** I advance to Retirement, when the transition triggers, then Enjoyment cost drops to zero but income becomes Low (legacy/passive).
2. **Given** Retirement, when passive Enjoyment is calculated, then it is Very High (freedom and fulfillment).
3. **Given** the Retirement stage, when reached, then it triggers final achievement unlocks and the endgame sequence becomes available.

---

## Technical Requirements

### Stage Data
```typescript
{
  id: 'retirement',
  title: 'Retirement',
  xpRequired: 25000,
  incomePerSecCents: 50,
  enjoymentCost: 0,
  description: 'Legacy, wisdom, freedom',
  unlocks: ['endgame', 'nostalgia-prestige']
}
```

### Retirement Mechanics
- No Enjoyment cost for sessions (freedom)
- Very high passive income
- Access to endgame sequence
- All content unlocked

---

## Implementation

- [ ] Add Retirement to career stages
- [ ] Implement zero enjoyment cost
- [ ] Boost passive income calculation
- [ ] Trigger endgame availability
- [ ] Create final Ryan message
- [ ] Unlock Nostalgia prestige layer

---

**Depends on:** Story 4.5 (Group Practice)  
**Required by:** Story 7.5 (Endgame Sequence)

**Status:** ready-for-dev
