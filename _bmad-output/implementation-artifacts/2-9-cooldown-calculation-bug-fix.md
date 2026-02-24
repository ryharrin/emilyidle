# Story 2.9: Cooldown Calculation Bug Fix

Status: done

## Story

As a player,
I want cooldown timers to work correctly,
so that interactions have proper pacing and I can't exploit the game economy.

## Overview

This is a **critical bug fix**. The cooldown system is producing impossible values like `1771887708s` (approximately 56 years), which breaks the core game loop. This likely stems from a timestamp calculation error where the wrong reference point is being used or there's integer overflow in the subtraction.

## Acceptance Criteria

1. **Cooldown timer displays reasonable time**
   - Given I have just performed an action with a cooldown
   - When I view the cooldown timer
   - Then it should display a value under 60 seconds
   - And it should count down accurately

2. **Cooldown calculation handles edge cases**
   - Given the game has been running for any amount of time
   - When a cooldown is triggered
   - Then the calculation should use the correct time delta
   - And should not produce values like 1771887708s

3. **Cooldown persists across sessions**
   - Given I have an active cooldown
   - When I save and reload the game
   - Then the cooldown should continue from the correct remaining time

4. **Bounds checking prevents extreme values**
   - Given any cooldown calculation
   - When the result is computed
   - Then values over 300 seconds should be clamped
   - And negative values should be treated as 0

## Technical Analysis

### Root Cause Hypotheses

1. **Timestamp Reference Mismatch**: Using `Date.now()` in one place and `performance.now()` in another
2. **Integer Overflow**: 32-bit integer overflow in time calculations
3. **Wrong Base Time**: Subtracting from wrong reference timestamp
4. **Persistence Bug**: Saved timestamp being interpreted incorrectly on load

### Investigation Checklist

- [ ] Check all uses of `Date.now()` vs `performance.now()`
- [ ] Verify cooldown calculations use consistent time source
- [ ] Check for any 32-bit integer arithmetic that could overflow
- [ ] Review save/load serialization of cooldown timestamps
- [ ] Add logging to capture actual values when bug occurs

## Files to Investigate

### Primary Files

1. **`src/game/economy.ts`**
   - Likely location of cooldown logic
   - Check functions like `canInteract()`, `getCooldownRemaining()`
   - Look for timestamp subtraction patterns

2. **`src/game/selectors/`**
   - Review any cooldown-related selectors
   - Check `rewards.ts` and `collection.ts`
   - May have derived cooldown calculations

3. **`src/game/types.ts`**
   - Verify `CooldownState` or similar type definitions
   - Check timestamp field types (should be `number` for ms)

4. **`src/game/reducer.ts`**
   - Check how cooldowns are set and updated
   - Look for `SET_COOLDOWN`, `UPDATE_COOLDOWN` actions

### UI Files (Secondary)

5. **`src/ui/components/`**
   - Any components displaying cooldown timers
   - May reveal where the 1771887708 value is being rendered

## Implementation Plan

### Phase 1: Investigation (Reproduce & Locate)

1. Add debug logging to capture:
   - Current timestamp when cooldown set
   - Timestamp being compared against
   - Calculated remaining time
   - Any intermediate values

2. Reproduce the bug:
   - Perform action that triggers cooldown
   - Observe the displayed value
   - Check console for debug logs

3. Identify exact line causing the issue

### Phase 2: Fix Implementation

1. **Fix the calculation bug**:
   ```typescript
   // BAD (hypothetical):
   const remaining = endTime - Date.now(); // May overflow or use wrong reference
   
   // GOOD:
   const remaining = Math.max(0, endTime - Date.now());
   const clamped = Math.min(remaining, MAX_COOLDOWN_MS);
   ```

2. **Add defensive bounds checking**:
   ```typescript
   const MAX_COOLDOWN_MS = 300_000; // 5 minutes max
   const remainingMs = Math.max(0, Math.min(calculatedRemaining, MAX_COOLDOWN_MS));
   ```

3. **Fix any persistence issues**:
   - Ensure timestamps save as numbers, not strings
   - Validate on load (reject impossible future timestamps)

### Phase 3: Testing

1. **Unit Tests**:
   - Test normal cooldown (30s)
   - Test cooldown near expiration (< 1s)
   - Test expired cooldown (should be 0)
   - Test cooldown save/load
   - Test with simulated time jumps (daylight savings, etc.)
   - Test with max bound (300s)

2. **Edge Case Tests**:
   - Very long game sessions (timer overflow scenarios)
   - Save/load mid-cooldown
   - Multiple simultaneous cooldowns
   - Browser tab background/foreground changes

## Dev Notes

### Architecture Patterns to Follow

**State Management**:
- Use existing `useReducer` pattern
- Cooldown state in `GameState` under appropriate section
- Actions: `SET_COOLDOWN`, `CLEAR_COOLDOWN`, `TICK_COOLDOWN`

**Time Handling**:
```typescript
// Preferred pattern from codebase:
const now = Date.now();
const endTime = now + durationMs;
// Store endTime, calculate remaining on demand
const remainingMs = Math.max(0, endTime - Date.now());
```

**Selectors**:
- Pure functions that derive cooldown state
- Memoize if expensive (use reselect pattern)

### Project Structure

```
src/
├── game/
│   ├── economy.ts          # Likely main cooldown logic
│   ├── types.ts            # Cooldown type definitions
│   ├── reducer.ts          # Cooldown state updates
│   └── selectors/          # Cooldown state queries
└── ui/
    └── components/         # Cooldown display components
```

### Testing Standards

- Use Vitest for unit tests
- Test file: `src/game/economy.unit.test.ts` or similar
- Follow existing test patterns (describe/it/expect)
- Mock `Date.now()` for deterministic tests

```typescript
// Example test pattern:
describe('cooldown calculation', () => {
  it('should return 0 for expired cooldown', () => {
    const endTime = Date.now() - 1000; // 1 second ago
    const remaining = calculateRemaining(endTime);
    expect(remaining).toBe(0);
  });
  
  it('should clamp to max value', () => {
    const endTime = Date.now() + 10_000_000_000; // Way in future
    const remaining = calculateRemaining(endTime);
    expect(remaining).toBe(MAX_COOLDOWN_MS);
  });
});
```

## References

- **Epic Source**: `_bmad-output/planning-artifacts/epic-2-core-loop.md#Story 2.9`
- **Architecture**: `_bmad-output/game-architecture.md` (Time Handling section)
- **Related Stories**: 
  - 2.1 (Currency System) - Contains timing logic
  - 2.5 (Market) - May have purchase cooldowns
  - 2.7 (Passive Income) - Time-based calculations

## Critical Success Criteria

⚠️ **This bug blocks game progression. Player cannot interact with cooldown-gated features when this occurs.**

- [x] Bug root cause identified and documented in comments
- [x] Fix implemented with defensive programming (bounds checking)
- [x] Unit tests cover edge cases and prevent regression
- [x] All existing cooldown functionality still works
- [x] No console errors or warnings

## Dev Agent Record

### Agent Model Used

Claude (minimax-m2.5-free)

### Debug Log References

- Root cause found: HomeTab.tsx was using `Date.now()` instead of `state.clockMs` when completing therapy session
- This caused therapyCooldownUntilMs to be set to real-world timestamp (e.g., 1,771,887,708,000) instead of game time
- When displayed against game clock (e.g., 100,000), this produced 56 years worth of seconds

### Completion Notes List

- [x] Root cause identified: HomeTab.tsx line 423 used `Date.now()` instead of `state.clockMs` for therapy session completion
- [x] Fix applied: Changed to use `state.clockMs` for consistent game time handling
- [x] Tests added: Added 7 new tests for cooldown calculations (therapy and family check-in)
- [x] Edge cases handled: Added MAX_COOLDOWN_MS bounds checking (300s max), negative value handling, undefined lastFamilyCheckIn
- [x] Review fixes applied: Therapy cooldown hard-capped to 60s display window, family check-in keeps 300s cap
- [x] Persistence coverage added: cooldown timestamps now explicitly verified in save/load tests

### File List

- Modified: `src/ui/tabs/HomeTab.tsx` - Fixed Date.now() → state.clockMs
- Modified: `src/ui/tabs/CareerTab.tsx` - Use getTherapyCooldownRemaining helper
- Modified: `src/ui/components/FamilyCheckIn.tsx` - Use getFamilyCheckInCooldownRemaining helper
- Modified: `src/game/career.ts` - Added getTherapyCooldownRemaining, getFamilyCheckInCooldownRemaining, MAX_COOLDOWN_MS
- Tests: `src/game/career.unit.test.ts` - Added 7 cooldown calculation tests
- Modified: `src/game/career.ts` - Added `MAX_THERAPY_COOLDOWN_MS`, `FAMILY_CHECKIN_COOLDOWN_MS`, and per-cooldown clamp rules
- Modified: `src/game/persistence.unit.test.ts` - Added cooldown timestamp round-trip regression test
- Modified: `src/game/career.unit.test.ts` - Updated therapy clamp expectation and cleaned cooldown test clarity

## Senior Developer Review (AI)

Review date: 2026-02-23

- Resolved HIGH: therapy cooldown display can no longer exceed 60s (clamped by `MAX_THERAPY_COOLDOWN_MS`)
- Resolved HIGH: root-cause intent now documented inline where therapy completion payload uses simulation time
- Resolved MEDIUM: added persistence regression test to verify cooldown timestamps survive save/load
- Resolved MEDIUM: updated story metadata and file list to reflect actual implementation changes
- Remaining LOW: none blocking; test suite for touched modules passes

## Change Log

- 2026-02-23: AI review fixes applied (cooldown clamp split, persistence test coverage, story audit updates)
