# Story 3.6: Mini-Game Result Screen and Rewards

**Story ID:** 3.6  
**Epic:** 3 - Mini-Game Suite  
**Status:** done
**Created:** 2026-02-23

---

## Story

**As a** player,  
**I want** a consistent, beautiful result screen after every mini-game,  
**So that** I always understand my rewards regardless of which game I played.

## Acceptance Criteria

1. **Given** I complete any mini-game, when the result screen appears, then it shows the Miss/Good/Perfect outcome with consistent styling.
2. **Given** the result screen, when rewards are displayed, then it clearly shows Enjoyment earned, tier bonus, and any special bonuses.
3. **Given** enjoyment rewards are shown, when values render, then they are whole numbers only.
4. **Given** tier-based scaling, when rewards are calculated, then higher-tier watches give proportionally better rewards.
5. **Given** the result screen on mobile, when it renders, then touch targets are >= 44px and text is readable.

---

## Technical Requirements

### Result Screen Component
```typescript
interface MiniGameResult {
  gameType: string;
  perfects: number;
  goods: number;
  misses: number;
  durationMs: number;
  baseReward: number;
  tierBonus: number;
  totalReward: number;
}

function ResultScreen({ result, onClose }: { 
  result: MiniGameResult; 
  onClose: () => void;
}) {
  // Consistent styling across all games
}
```

### Reward Calculation
```typescript
function calculateRewards(
  gameType: string,
  perfects: number,
  goods: number,
  watchTier: string
): MiniGameResult {
  const base = GAME_REWARDS[gameType].baseEnjoyment;
  const perfectBonus = perfects * GAME_REWARDS[gameType].perfectBonus;
  const tierMultiplier = TIER_MULTIPLIERS[watchTier];
  
  const total = Math.floor((base + perfectBonus) * tierMultiplier);
  
  return {
    baseReward: base,
    tierBonus: Math.floor((base + perfectBonus) * (tierMultiplier - 1)),
    totalReward: total
  };
}
```

---

## Implementation

- [ ] Create ResultScreen component
- [ ] Implement reward calculation logic
- [ ] Add tier bonus display
- [ ] Show Perfect/Good/Miss breakdown
- [ ] Ensure whole-number display
- [ ] Mobile-optimized layout (44px touch targets)
- [ ] Integrate into MiniGameShell

---

**Depends on:** Stories 3.1-3.5 (all mini-games)  
**Required by:** All future mini-games

**Status:** ready-for-dev
