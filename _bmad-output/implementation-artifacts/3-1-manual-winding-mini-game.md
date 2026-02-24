# Story 3.1: Manual Winding Mini-Game

**Story ID:** 3.1  
**Epic:** 3 - Mini-Game Suite  
**Status:** done
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** to wind my manual watches through a timing-based hold-and-release game,  
**So that** interacting with manual watches feels tactile and meditative.

## Acceptance Criteria

1. **Given** I own a manual watch, when I tap to interact, then the Manual Winding mini-game opens.
2. **Given** the game is active, when I hold to wind and release at the optimal point, then the game evaluates Miss/Good/Perfect based on timing precision.
3. **Given** the visual feedback, when I wind, then I see a smooth winding animation with spring physics (motion library).
4. **Given** the game completes, when results are calculated, then Enjoyment rewards scale by watch tier × performance.

---

## Technical Requirements

### Pattern 6: Mini-Game
- Local state for: rotation angle, perfect count, start time
- Hold-and-release input detection
- Timing evaluation at release point
- Spring physics for rotation animation

### Constants
```typescript
const MANUAL_WINDING = {
  HOLD_DURATION_MS: 2000,      // Optimal hold time
  PERFECT_WINDOW_MS: 200,      // +/- 200ms window
  GOOD_WINDOW_MS: 500,
  ROTATION_PER_WIND: 45        // Degrees
};
```

---

## Implementation

- [ ] Create ManualWindingGame component
- [ ] Implement hold-and-release detection
- [ ] Add timing evaluation (Perfect/Good/Miss)
- [ ] Animate watch crown rotation with Motion
- [ ] Calculate rewards based on tier × perfects
- [ ] Follow Pattern 6 (local state + callback)

---

**Depends on:** Story 2.3 (Quartz Calibration - mini-game pattern)  
**Required by:** Story 3.6 (Result Screen)

**Status:** ready-for-dev
