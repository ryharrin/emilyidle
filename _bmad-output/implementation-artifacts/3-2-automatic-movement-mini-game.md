# Story 3.2: Automatic Movement Mini-Game

**Story ID:** 3.2  
**Epic:** 3 - Mini-Game Suite  
**Status:** done
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to keep my automatic watch's rotor spinning through a rhythm-tap game,  
**So that** interacting with automatic watches feels rhythmic and satisfying.

## Acceptance Criteria

1. **Given** I own an automatic watch, when I tap to interact, then the Automatic Movement mini-game opens.
2. **Given** the game is active, when I tap in rhythm (like a metronome), then the rotor spins and a power reserve fills based on rhythm accuracy.
3. **Given** my tapping is off-rhythm, when timing is evaluated, then the power reserve fills more slowly (no fail state).
4. **Given** visual feedback, when I tap in rhythm, then the rotor animation uses spring physics and the power gauge fills smoothly.

---

## Technical Requirements

### Pattern 6: Mini-Game
- Local state for: last tap time, rhythm score, power reserve level
- Metronome beat at BPM
- Tap timing vs beat evaluation
- Rotor spin animation with Motion

### Constants
```typescript
const AUTOMATIC_MOVEMENT = {
  BPM: 80,                     // Target beats per minute
  PERFECT_WINDOW_MS: 100,      // +/- 100ms
  POWER_MAX: 100,
  ROTOR_SPIN_DEGREES: 360
};
```

---

## Implementation

- [ ] Create AutomaticMovementGame component
- [ ] Implement metronome beat tracker
- [ ] Add tap timing evaluation
- [ ] Animate rotor with Motion physics
- [ ] Power reserve gauge with smooth fills
- [ ] Follow Pattern 6

---

**Depends on:** Story 2.3 (mini-game pattern)  
**Required by:** Story 3.6 (Result Screen)

**Status:** ready-for-dev
