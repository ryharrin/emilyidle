# Story 3.4: Family Check-in Interaction

**Story ID:** 3.4  
**Epic:** 3 - Mini-Game Suite  
**Status:** done
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to check in with my family between sessions,  
**So that** Love currency accrues and boosts my Enjoyment generation.

## Acceptance Criteria

1. **Given** the Home tab, when I tap the family check-in button, then a brief, warm family moment plays (text + visual).
2. **Given** a check-in completes, when rewards are applied, then Love currency increases, which boosts Enjoyment generation rate.
3. **Given** a cooldown exists, when I've recently checked in, then the button shows time remaining before next check-in.

---

## Technical Requirements

### State Additions
```typescript
interface GameState {
  love: number;
  lastFamilyCheckIn: number;   // Timestamp
}

const FAMILY_CHECKIN_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
```

### Love Boost Calculation
```typescript
function calculateEnjoymentMultiplier(love: number): number {
  // Linear boost: 0 love = 1.0x, 100 love = 2.0x
  return 1 + (love / 100);
}
```

### Actions
```typescript
type Action =
  | { type: "FAMILY_CHECKIN"; loveGained: number }
  | { type: "UPDATE_LOVE"; amount: number };
```

---

## Implementation

- [ ] Add love to GameState
- [ ] Create FamilyCheckIn component
- [ ] Implement cooldown tracking
- [ ] Add family moment vignettes
- [ ] Calculate Love boost on enjoyment
- [ ] Show cooldown timer UI
- [ ] Update Home tab with check-in button

---

**Depends on:** Story 2.1 (Currency System)  
**Required by:** Story 6.x (Home Life integration)

**Status:** ready-for-dev
