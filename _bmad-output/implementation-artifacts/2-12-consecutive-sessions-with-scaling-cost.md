# Story 2.12: Consecutive Sessions with Scaling Cost

Status: done

## Story

As a player,
I want to run multiple therapy sessions without waiting for cooldown, with each consecutive session costing more enjoyment,
so that I can play more actively when I want to, while maintaining economic balance and preventing exploitation.

## Overview

This feature introduces **optional cooldown bypass** with **scaling costs** that decay over time. Players can perform consecutive therapy sessions without waiting, but each back-to-back session costs progressively more enjoyment. The cost scales up with each consecutive session and decays back to the base cost when the player waits between sessions.

This creates meaningful choice:
- **Wait for cooldown**: Pay base cost (economically optimal)
- **Chain sessions**: Pay premium for immediate gratification (convenience tax)

### Key Design Principles

1. **Never punishes the player**: Cooldown bypass is optional; players can always wait for normal cooldown
2. **Economic balance**: Scaling prevents infinite grinding and maintains progression pacing
3. **Clear communication**: Players see the increasing cost before each consecutive session
4. **Fair decay**: Costs return to base over time, rewarding patience

## Acceptance Criteria

### 1. Base Cooldown System Remains Functional

- **Given** the normal cooldown system,
- **When** a player waits for the full cooldown period,
- **Then** the next session costs the base amount of enjoyment (no premium),
- **And** the consecutive session counter resets to 0.

### 2. Consecutive Session Detection

- **Given** a player has completed a therapy session,
- **When** they attempt another session before the cooldown expires,
- **Then** the system detects this as a consecutive session,
- **And** increments the consecutive session counter.

### 3. Progressive Cost Scaling

- **Given** the consecutive session counter is N (where N ≥ 1),
- **When** calculating the cost for the next session,
- **Then** the cost = baseCost × (1 + multiplier × N),
- **And** the multiplier increases cost by 50% per consecutive session (configurable).

**Example with base cost = 100 enjoyment:**
| Consecutive # | Cost Multiplier | Total Cost |
|---------------|-----------------|------------|
| 1 (base)      | 1.0×            | 100        |
| 2             | 1.5×            | 150        |
| 3             | 2.0×            | 200        |
| 4             | 2.5×            | 250        |
| 5             | 3.0×            | 300        |

### 4. Cost Decay Over Time

- **Given** the player has performed consecutive sessions,
- **When** time passes without performing another session,
- **Then** the consecutive session counter decays,
- **And** the cost returns toward base.

**Decay Rules:**
- Decay timer starts when cooldown completes
- Counter reduces by 1 every 2 minutes of real time
- Visual indicator shows decay progress
- Full reset to base cost takes: (consecutiveCount × 2 minutes)

### 5. Clear UI Communication

- **Given** the player is viewing a therapy session option,
- **When** consecutive sessions are available,
- **Then** the UI displays:
  - Current consecutive session count
  - Scaled cost with comparison to base cost
  - Decay timer showing when cost returns to normal
  - Clear warning about the premium being paid

### 6. Maximum Consecutive Limit

- **Given** the player has chained multiple sessions,
- **When** they reach the maximum allowed consecutive sessions (10),
- **Then** the system prevents further sessions,
- **And** displays: "Maximum consecutive sessions reached. Please wait for cost to decay."

### 7. Persistence Across Sessions

- **Given** the player has an active consecutive session count,
- **When** they save and reload the game,
- **Then** the consecutive count and decay timer persist,
- **And** decay continues based on real time elapsed.

### 8. Rewards Remain Constant

- **Given** a player performs a consecutive session with scaled cost,
- **When** rewards are calculated,
- **Then** cash and XP rewards remain at base values,
- **And** only the enjoyment cost scales (not the reward).

## Technical Requirements

### Data Model

```typescript
// Add to GameState
type ConsecutiveSessionState = {
  count: number;                    // Current consecutive session count (0 = base)
  lastSessionTime: number;          // Timestamp of last session completion
  decayStartedAt?: number;          // When decay timer began
};

interface GameState {
  // ... existing fields
  therapySessionState: {
    cooldownUntil: number;
    consecutiveSessions: ConsecutiveSessionState;
  };
  familyCheckInState?: {
    cooldownUntil: number;
    consecutiveSessions: ConsecutiveSessionState;
  };
}

// Configuration constants
const CONSECUTIVE_CONFIG = {
  BASE_MULTIPLIER: 1.0,
  MULTIPLIER_INCREMENT: 0.5,        // +50% per consecutive session
  MAX_CONSECUTIVE: 10,              // Hard limit
  DECAY_INTERVAL_MS: 120_000,       // 2 minutes per decay step
  DECAY_PER_INTERVAL: 1,            // Reduce count by 1 every interval
};
```

### Cost Calculation Functions

```typescript
// src/game/career.ts

export const calculateSessionCost = (
  baseCost: number,
  consecutiveState: ConsecutiveSessionState,
  currentTime: number
): { cost: number; multiplier: number; decayRemainingMs: number } => {
  // First, apply any decay that should have occurred
  const decayedCount = calculateDecayedCount(consecutiveState, currentTime);
  
  if (decayedCount === 0) {
    return {
      cost: baseCost,
      multiplier: CONSECUTIVE_CONFIG.BASE_MULTIPLIER,
      decayRemainingMs: 0
    };
  }
  
  const multiplier = CONSECUTIVE_CONFIG.BASE_MULTIPLIER + 
    (CONSECUTIVE_CONFIG.MULTIPLIER_INCREMENT * decayedCount);
  
  const cost = Math.round(baseCost * multiplier);
  const decayRemainingMs = calculateDecayRemaining(consecutiveState, decayedCount, currentTime);
  
  return { cost, multiplier, decayRemainingMs };
};

export const calculateDecayedCount = (
  state: ConsecutiveSessionState,
  currentTime: number
): number => {
  if (state.count === 0) return 0;
  
  const decayStartTime = state.decayStartedAt || state.lastSessionTime;
  const elapsedMs = currentTime - decayStartTime;
  const intervalsPassed = Math.floor(elapsedMs / CONSECUTIVE_CONFIG.DECAY_INTERVAL_MS);
  
  return Math.max(0, state.count - (intervalsPassed * CONSECUTIVE_CONFIG.DECAY_PER_INTERVAL));
};

export const calculateDecayRemaining = (
  state: ConsecutiveSessionState,
  currentCount: number,
  currentTime: number
): number => {
  if (currentCount === 0) return 0;
  
  const decayStartTime = state.decayStartedAt || state.lastSessionTime;
  const intervalsNeeded = Math.ceil(currentCount / CONSECUTIVE_CONFIG.DECAY_PER_INTERVAL);
  const totalDecayTime = intervalsNeeded * CONSECUTIVE_CONFIG.DECAY_INTERVAL_MS;
  const elapsedMs = currentTime - decayStartTime;
  
  return Math.max(0, totalDecayTime - elapsedMs);
};

export const canPerformConsecutiveSession = (
  state: GameState,
  currentTime: number
): { allowed: boolean; reason?: string } => {
  const consecutiveCount = state.therapySessionState.consecutiveSessions.count;
  
  if (consecutiveCount >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE) {
    return {
      allowed: false,
      reason: `Maximum consecutive sessions (${CONSECUTIVE_CONFIG.MAX_CONSECUTIVE}) reached. Wait for cost to decay.`
    };
  }
  
  return { allowed: true };
};
```

### State Management Actions

```typescript
type Action =
  | { type: 'START_THERAPY_SESSION'; timestamp: number }
  | { type: 'COMPLETE_THERAPY_SESSION'; timestamp: number; rewards: SessionRewards }
  | { type: 'UPDATE_CONSECUTIVE_DECAY'; currentTime: number }
  | { type: 'RESET_CONSECUTIVE_COUNT' };  // Manual reset (e.g., after long absence)

// Reducer logic
const therapySessionReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'COMPLETE_THERAPY_SESSION': {
      const currentConsecutive = state.therapySessionState.consecutiveSessions.count;
      const newCount = Math.min(
        currentConsecutive + 1,
        CONSECUTIVE_CONFIG.MAX_CONSECUTIVE
      );
      
      return {
        ...state,
        therapySessionState: {
          ...state.therapySessionState,
          consecutiveSessions: {
            count: newCount,
            lastSessionTime: action.timestamp,
            decayStartedAt: undefined  // Reset decay timer on new session
          }
        }
      };
    }
    
    case 'UPDATE_CONSECUTIVE_DECAY': {
      const decayedCount = calculateDecayedCount(
        state.therapySessionState.consecutiveSessions,
        action.currentTime
      );
      
      // If decayed to 0, reset completely
      if (decayedCount === 0) {
        return {
          ...state,
          therapySessionState: {
            ...state.therapySessionState,
            consecutiveSessions: {
              count: 0,
              lastSessionTime: state.therapySessionState.consecutiveSessions.lastSessionTime,
              decayStartedAt: undefined
            }
          }
        };
      }
      
      return state;  // No change needed, calculated on-demand
    }
    
    default:
      return state;
  }
};
```

### UI Components

#### 1. ConsecutiveSessionIndicator (`src/ui/components/ConsecutiveSessionIndicator.tsx`)

```typescript
interface ConsecutiveSessionIndicatorProps {
  consecutiveState: ConsecutiveSessionState;
  baseCost: number;
  currentTime: number;
}

// Shows:
// - Current consecutive count (e.g., "Session 3 of 10")
// - Scaled cost with visual comparison (e.g., "150 enjoyment (base: 100)")
// - Decay timer (e.g., "Cost returns to normal in 3:45")
// - Warning when approaching max (orange at 7+, red at 9+)
```

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ Consecutive Session Mode                │
├─────────────────────────────────────────┤
│                                         │
│   Session #: 3 of 10                    │
│                                         │
│   Cost: 150 enjoyment                   │
│   (Base: 100)                           │
│   ▓▓▓▓▓▓▓▓▓▓░░░░░░░░  +50%             │
│                                         │
│   Cost returns to normal in: 3:45       │
│   ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░         │
│                                         │
│   [Start Session]  [Wait for Cooldown]  │
│                                         │
└─────────────────────────────────────────┘
```

#### 2. CostComparisonTooltip

- Hover over cost shows breakdown
- Shows math: base × multiplier = total
- Shows potential savings if waiting

### Selectors

```typescript
// src/game/selectors/career.ts

export const getTherapySessionCost = (state: GameState): {
  baseCost: number;
  scaledCost: number;
  multiplier: number;
  consecutiveCount: number;
  canAfford: boolean;
  decayRemainingMs: number;
  isAtMaxConsecutive: boolean;
} => {
  const baseCost = CAREER_STAGE_CONFIG[state.career.currentStage].sessionCost;
  const consecutiveState = state.therapySessionState.consecutiveSessions;
  const currentTime = state.clockMs;
  
  const { cost, multiplier, decayRemainingMs } = calculateSessionCost(
    baseCost,
    consecutiveState,
    currentTime
  );
  
  return {
    baseCost,
    scaledCost: cost,
    multiplier,
    consecutiveCount: consecutiveState.count,
    canAfford: state.enjoyment >= cost,
    decayRemainingMs,
    isAtMaxConsecutive: consecutiveState.count >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE
  };
};

export const getConsecutiveSessionProgress = (state: GameState): {
  current: number;
  max: number;
  percentage: number;
  warningLevel: 'none' | 'caution' | 'warning' | 'critical';
} => {
  const count = state.therapySessionState.consecutiveSessions.count;
  const max = CONSECUTIVE_CONFIG.MAX_CONSECUTIVE;
  const percentage = (count / max) * 100;
  
  let warningLevel: 'none' | 'caution' | 'warning' | 'critical' = 'none';
  if (count >= 9) warningLevel = 'critical';
  else if (count >= 7) warningLevel = 'warning';
  else if (count >= 4) warningLevel = 'caution';
  
  return { current: count, max, percentage, warningLevel };
};
```

## UI/UX Specifications

### Home Tab Integration

The Consecutive Session indicator appears in the Career section when:
1. Player has completed at least one session
2. Cooldown has not fully elapsed
3. Player has enough enjoyment for scaled cost

```
┌─────────────────────────────────────────┐
│ Career                                  │
├─────────────────────────────────────────┤
│ PhD Student - Level 3                   │
│ ████████████████░░░░  340 / 500 XP      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ CONSECUTIVE MODE ACTIVE      │   │
│  │                                 │   │
│  │ Session 2 of 10                 │   │
│  │ Cost: 150 ★ (was 100 ★)        │   │
│  │                                 │   │
│  │ Cost normalizes in: 2:15       │   │
│  │ ━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░ │   │
│  │                                 │   │
│  │ [Start Therapy Session]         │   │
│  │ or wait 0:45 for base cost      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View Career Details]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Cost Display Patterns

**Normal State (count = 0):**
```
Start Therapy Session
Cost: 100 enjoyment
```

**Consecutive State (count > 0):**
```
Start Therapy Session (Consecutive #3)
Cost: 200 enjoyment (base: 100, +100%)
⚠️ Cost returns to normal in 4:30
```

**Max Consecutive Reached:**
```
🔒 Maximum Consecutive Sessions Reached
You've reached the limit of 10 consecutive sessions.

Cost will begin decreasing in 0:15
Full reset to base cost in 5:00

[View Progress] [Back to Home]
```

## Animation Specifications

### Cost Scaling Animation
- When cost increases: Number animates up with spring physics
- Color shift: Green (base) → Yellow (+50%) → Orange (+100%) → Red (+200%+)
- Scale pulse on significant jumps (> 100% increase)

### Decay Timer
- Smooth countdown (updates every second)
- Progress bar fills as decay progresses
- Gentle pulse when approaching 0
- Completion celebration (small sparkle effect)

### Consecutive Counter
- Number increments with bounce animation
- Background color changes with warning level
- At max: Shake animation + lock icon appears

## Integration Points

### Career Tab (`src/ui/tabs/CareerTab.tsx`)

```typescript
// Show consecutive session UI when applicable
const CareerTab: React.FC = () => {
  const sessionCost = useSelector(getTherapySessionCost);
  const consecutiveProgress = useSelector(getConsecutiveSessionProgress);
  
  return (
    <div>
      {/* ... existing career UI ... */}
      
      {sessionCost.consecutiveCount > 0 && (
        <ConsecutiveSessionIndicator
          cost={sessionCost}
          progress={consecutiveProgress}
        />
      )}
      
      <TherapySessionButton
        cost={sessionCost.scaledCost}
        disabled={!sessionCost.canAfford || sessionCost.isAtMaxConsecutive}
        onClick={handleStartSession}
      />
    </div>
  );
};
```

### Sim Tick Integration (`src/game/loop.ts`)

```typescript
const gameTick = (state: GameState, deltaMs: number): GameState => {
  // ... existing tick logic ...
  
  // Update consecutive session decay every 5 seconds
  if (state.clockMs % 5000 < deltaMs) {
    state = therapySessionReducer(state, {
      type: 'UPDATE_CONSECUTIVE_DECAY',
      currentTime: state.clockMs
    });
  }
  
  return state;
};
```

## Files to Create/Modify

### New Files

1. **`src/ui/components/ConsecutiveSessionIndicator.tsx`**
   - Visual indicator for consecutive sessions
   - Shows count, cost, decay timer
   - Warning level styling

2. **`src/ui/components/CostComparisonDisplay.tsx`**
   - Comparison between base and scaled cost
   - Tooltip with calculation breakdown

3. **`src/game/selectors/consecutiveSessions.ts`**
   - Selectors for consecutive session state
   - Cost calculation memoization

### Modified Files

1. **`src/game/types.ts`**
   - Add `ConsecutiveSessionState` type
   - Update `GameState` with consecutive session fields

2. **`src/game/career.ts`**
   - Add cost calculation functions
   - Add decay calculation functions
   - Add consecutive session validation

3. **`src/game/reducer.ts`**
   - Handle consecutive session actions
   - Update consecutive count on session completion

4. **`src/ui/tabs/CareerTab.tsx`**
   - Add consecutive session indicator
   - Update cost display
   - Handle max consecutive reached state

5. **`src/ui/tabs/HomeTab.tsx`**
   - Show consecutive mode indicator in career section
   - Quick action to start consecutive session

6. **`src/game/constants.ts`**
   - Add `CONSECUTIVE_CONFIG` constants

## Testing Requirements

### Unit Tests

```typescript
// src/game/career.unit.test.ts

describe('consecutive session cost calculation', () => {
  it('returns base cost when count is 0', () => {
    const result = calculateSessionCost(100, { count: 0, lastSessionTime: 0 }, 1000);
    expect(result.cost).toBe(100);
    expect(result.multiplier).toBe(1.0);
  });
  
  it('scales cost correctly for consecutive sessions', () => {
    const state = { count: 3, lastSessionTime: 0 };
    const result = calculateSessionCost(100, state, 1000);
    // Base 100 + (3 × 0.5 × 100) = 250
    expect(result.cost).toBe(250);
    expect(result.multiplier).toBe(2.5);
  });
  
  it('applies decay correctly over time', () => {
    const state = { 
      count: 5, 
      lastSessionTime: 0,
      decayStartedAt: 0 
    };
    // After 4 minutes (2 intervals), should reduce by 2
    const result = calculateDecayedCount(state, 240_000);
    expect(result).toBe(3);
  });
  
  it('caps at maximum consecutive sessions', () => {
    const state = { count: 15, lastSessionTime: 0 };
    const canPerform = canPerformConsecutiveSession(
      { therapySessionState: { consecutiveSessions: state } } as GameState,
      1000
    );
    expect(canPerform.allowed).toBe(false);
  });
  
  it('returns to base cost after full decay', () => {
    const state = { 
      count: 3, 
      lastSessionTime: 0,
      decayStartedAt: 0 
    };
    // After 6 minutes (3 intervals of 2 min each)
    const decayedCount = calculateDecayedCount(state, 360_000);
    expect(decayedCount).toBe(0);
  });
});

describe('consecutive session persistence', () => {
  it('saves and loads consecutive state correctly', () => {
    const state = createGameState({
      therapySessionState: {
        consecutiveSessions: {
          count: 5,
          lastSessionTime: 1000,
          decayStartedAt: 2000
        }
      }
    });
    
    const serialized = serializeGameState(state);
    const deserialized = deserializeGameState(serialized);
    
    expect(deserialized.therapySessionState.consecutiveSessions.count).toBe(5);
    expect(deserialized.therapySessionState.consecutiveSessions.decayStartedAt).toBe(2000);
  });
});
```

### E2E Tests

```gherkin
Scenario: Player chains three consecutive sessions
  Given I have 500 enjoyment
  And base therapy cost is 100 enjoyment
  When I start therapy session #1
  Then cost is 100 enjoyment
  When I immediately start session #2
  Then cost is 150 enjoyment
  When I immediately start session #3
  Then cost is 200 enjoyment
  And I have 50 enjoyment remaining

Scenario: Cost decays after waiting
  Given I have performed 3 consecutive sessions
  And I wait 4 minutes
  When I view the therapy option
  Then the consecutive count shows 1
  And the cost shows 150 enjoyment

Scenario: Maximum consecutive sessions reached
  Given I have performed 10 consecutive sessions
  When I try to start another session
  Then I see "Maximum consecutive sessions reached"
  And the start button is disabled

Scenario: Normal cooldown still works
  Given I have performed 1 session
  When I wait for the full cooldown to elapse
  And I start a new session
  Then the cost is 100 enjoyment (base cost)
  And consecutive count is 0
```

## Performance Considerations

1. **Decay Calculation**: Calculate on-demand in selectors rather than storing computed values
2. **UI Updates**: Throttle decay timer updates to every 5 seconds (not every tick)
3. **Memoization**: Use reselect pattern for expensive cost calculations
4. **Persistence**: Save lightweight state (just count and timestamps), calculate on load

## Balance Tuning Guide

| Parameter | Current Value | Tuning Notes |
|-----------|---------------|--------------|
| Multiplier Increment | 0.5 (+50%) | Increase to make chaining more expensive; decrease to make it more accessible |
| Max Consecutive | 10 | Increase to allow longer chains; decrease to enforce more breaks |
| Decay Interval | 2 minutes | Shorter = faster recovery; longer = more commitment to waiting |
| Decay Per Interval | 1 | Higher = faster decay; lower = slower recovery |

### Tuning Recommendations

**For Harder Mode:**
- Increase multiplier increment to 0.75 (+75% per session)
- Reduce max consecutive to 7
- Increase decay interval to 3 minutes

**For Easier Mode:**
- Decrease multiplier increment to 0.25 (+25% per session)
- Increase max consecutive to 15
- Decrease decay interval to 1 minute

## Dev Notes

### Edge Cases Handled

1. **Time Jump (System Clock Change)**: Decay calculation uses monotonic clock, not wall clock
2. **Background Tab**: Decay continues based on real time when tab regains focus
3. **Save/Load Mid-Session**: State persists correctly, decay continues from loaded time
4. **Negative Values**: All calculations clamped to minimum 0
5. **Overflow**: Consecutive count capped at MAX_CONSECUTIVE (10)

### Related Systems

- **Cooldown System (Story 2.9)**: Consecutive sessions bypass cooldown but add cost
- **Economy (Story 2.1)**: Cost scaling affects enjoyment economy balance
- **Career Progression (Epic 4)**: Session frequency affects XP gain rate

### Migration Notes

Existing saves without consecutive session state will default to:
```typescript
consecutiveSessions: {
  count: 0,
  lastSessionTime: 0,
  decayStartedAt: undefined
}
```

## References

- **Epic Source**: `_bmad-output/planning-artifacts/epic-2-core-loop.md`
- **Related Stories**:
  - 2.9 (Cooldown Calculation Bug Fix) - Foundation cooldown system
  - 2.4 (PhD Therapy Sessions) - Base session mechanics
  - 2.1 (Currency System) - Economy balance
- **Files**:
  - Cooldown logic: `src/game/career.ts`
  - Career UI: `src/ui/tabs/CareerTab.tsx`
  - Home UI: `src/ui/tabs/HomeTab.tsx`

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

### Completion Notes List

- [x] ConsecutiveSessionState type added to GameState
- [x] Cost calculation functions implemented in career.ts
- [x] Decay logic working correctly
- [x] ConsecutiveSessionIndicator component created
- [x] CareerTab updated with consecutive mode UI
- [x] Max consecutive limit enforced
- [x] Persistence working across save/load
- [x] Unit tests passing
- [ ] Balance feels fair in playtesting (requires dedicated playtest evidence)

### File List

- Modified: `src/game/types.ts`
- Modified: `src/game/constants.ts`
- Modified: `src/game/career.ts`
- Modified: `src/game/reducer.ts`
- Modified: `src/game/persistence.ts`
- Modified: `src/game/selectors/index.ts`
- Modified: `src/ui/tabs/CareerTab.tsx`
- Modified: `src/ui/tabs/HomeTab.tsx`
- Modified: `src/game/career.unit.test.ts`
- Modified: `src/game/reducer.unit.test.ts`
- Modified: `src/game/reducer.onboarding.unit.test.ts`
- Modified: `src/game/selectors/tracking.unit.test.ts`
- Modified: `src/game/selectors/mail.unit.test.ts`
- Modified: `src/game/selectors/collection.unit.test.ts`
- Modified: `src/game/discovery/evaluateUnlocks.unit.test.ts`
- Modified: `src/game/watchSelectors.unit.test.ts`
- Modified: `src/game/economy.unit.test.ts`
- Created: `src/ui/components/ConsecutiveSessionIndicator.tsx`
- Created: `src/ui/components/CostComparisonDisplay.tsx`
- Created: `src/game/selectors/consecutiveSessions.ts`
- Created: `src/game/selectors/consecutiveSessions.unit.test.ts`
- Modified: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Modified: `_bmad-output/implementation-artifacts/2-12-consecutive-sessions-with-scaling-cost.md`

### Debug Log References

- Added consecutive-session config constants and typed state in core game model.
- Implemented cost scaling and decay calculations with 2-minute decay intervals in career logic.
- Updated reducer session validation/completion flow to support optional cooldown bypass and max-chain enforcement.
- Added consecutive-mode visual indicator and cost comparison display on Career and Home tabs.
- Added selector APIs for UI-friendly cost/progress state and test coverage for scaling, decay, and warnings.
- Code review follow-up: cooldown-expiry path now resets consecutive premium to base cost for the next session.
- Code review follow-up: added visible decay progress indicator bar alongside countdown text.
- Code review follow-up: cleaned contradictory checklist entries and retained explicit playtest-evidence TODO.

### Change Summary

- Therapy sessions can now be chained before cooldown expires, with enjoyment cost scaling by +50% per active consecutive count.
- Consecutive costs decay over time after cooldown completion, reducing by one step every 2 minutes.
- Waiting through full cooldown now resets the next-session cost back to base (counter treated as reset).
- A hard cap of 10 consecutive sessions prevents infinite chaining until decay reduces the count.
- UI now clearly communicates scaled cost, base comparison, remaining decay time, and decay progress.
- Full suite verification passed after integration.
