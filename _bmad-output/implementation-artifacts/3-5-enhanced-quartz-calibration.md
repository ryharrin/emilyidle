# Story 3.5: Enhanced Quartz Calibration

**Story ID:** 3.5  
**Epic:** 3 - Mini-Game Suite  
**Status:** done
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** the Quartz Calibration game to have progressive difficulty, clear flavor, and polished feel,  
**So that** it remains engaging as I acquire better watches.

## Acceptance Criteria

1. **Given** a higher-tier quartz watch, when I play the calibration game, then the timing windows are slightly tighter.
2. **Given** the game opens, when I read the intro, then I understand what is happening: I am calming a drifting quartz beat back to center.
3. **Given** the game is active, when the beat dot crosses center and I tap "Calibrate", then Miss/Good/Perfect is evaluated by distance from center.
4. **Given** repeated successful calibrations, when Perfect is achieved, then the beat visibly steadies and a celebration animation with spring physics plays.
5. **Given** the game balance, when difficulty scales, then timing windows remain generous (gift context — never frustrating).

---

## Technical Requirements

### Tier-Based Difficulty
```typescript
const QUARTZ_DIFFICULTY = {
  entry: { perfectWindow: 15, goodWindow: 30 },    // Most generous
  mid: { perfectWindow: 10, goodWindow: 25 },
  premium: { perfectWindow: 8, goodWindow: 20 }    // Still generous
};

function getDifficultyForWatch(watchTier: string) {
  switch (watchTier) {
    case 'budget': return QUARTZ_DIFFICULTY.entry;
    case 'standard': return QUARTZ_DIFFICULTY.mid;
    case 'luxury': return QUARTZ_DIFFICULTY.premium;
    default: return QUARTZ_DIFFICULTY.entry;
  }
}
```

### Enhancements to Base Game
- Progressive jitter reduction (beat gets calmer)
- Celebration animation on Perfect streaks
- Clearer Goal/How/Reward guidance
- Tier-based reward scaling

---

## Implementation

- [ ] Enhance QuartzCalibrationGame from Story 2.3
- [ ] Add tier-based difficulty scaling
- [ ] Implement progressive calming effect
- [ ] Add Perfect streak celebration
- [ ] Polish Goal/How/Reward instructions
- [ ] Ensure generous timing (no frustration)

---

**Depends on:** Story 2.3 (Quartz Calibration base)  
**Required by:** Story 3.6 (Result Screen)

**Status:** ready-for-dev
