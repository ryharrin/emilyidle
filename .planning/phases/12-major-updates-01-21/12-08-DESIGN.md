# Phase 12 Plan 08 - Mini-game Improvements (Design Spike)

## Goal

Make the Vault "Interact" action feel like a real moment-to-moment payoff (not just a hidden multiplier toggle), while keeping it:

- Short (10-20 seconds)
- Repeatable but not spammy (cooldown)
- Easy to understand
- Testable/deterministic in unit + e2e tests

## Current State

"Interact" opens a modal and after 10 clicks triggers the manual event `wind-up`, which currently grants a short income multiplier.

## Proposed Mechanics

### Overview

"Interact" becomes a small decision-based minigame called **Wind Session**.

- Player picks a watch (same as today: click Interact on a watch card).
- A modal opens with a **Tension** meter.
- Player plays up to **5 rounds**. Each round is a choice:
  - **Steady wind**: +1 tension, always succeeds.
  - **Push it**: +2 tension, but has a chance to slip and end the session early.

This creates a light "skill" component as risk/reward decision-making, without requiring timing/reflex precision.

### State Model

Within the modal (UI-only state):

- `windSessionActiveItemId: WatchItemId`
- `windTension: number` (0..10)
- `windRound: number` (0..5)
- `windStatus: "active" | "slipped" | "complete"`

No persistence required for the modal itself.

### Round Rules

- Max rounds: 5
- Start: tension=0, round=0
- Each choice advances `round += 1` unless the player slips.
- **Steady wind**:
  - tension += 1
  - always continues
- **Push it**:
  - 60% success: tension += 2
  - 40% slip: windStatus becomes `"slipped"` and session ends immediately

### Completion

The session ends when:
- round reaches 5 (complete), OR
- a slip occurs

When the session ends, apply rewards and close the modal.

## Rewards

### Reward Types

On session end:

1. **Immediate cash payout** (one-time): a small burst based on tension and watch tier.
2. **Wind-up event** activation: a short buff with multiplier based on tension.

### Cash Payout

Payout formula (in cents):

```
base = max(1000, item.incomeCentsPerSec * 10)
cash = round(base * (1 + tension / 10))
```

Notes:
- This ties reward to the watch's baseline value without introducing new currencies.
- The `max(1000, ...)` prevents early-game rewards from feeling like 0.

### Wind-up Event Multiplier

Reuse the existing `wind-up` event, but scale its multiplier at activation time:

```
multiplier = 1.05 + 0.02 * tension
cap at 1.25
```

Duration/cooldown stay as defined unless tuning is needed after playtesting.

## Determinism + Testing Plan

### Randomness Control

"Push it" uses randomness. To keep unit tests deterministic:

- Implement the slip decision through a small helper that can be injected or mocked in tests.
- Acceptable approach: wrap randomness in a pure helper function exported from a module (or parameterized function), so tests can force success/failure.

### Unit Tests (Vitest)

Add tests to cover:

1. **UI gating**: dev-mode already covered separately; for the minigame:
   - clicking Interact opens the modal
   - Steady wind advances round/tension
2. **Success path**: 5 rounds of Steady yields:
   - increased cash vs pre-session
   - wind-up event active
3. **Slip path**: Push it slip yields:
   - session ends early
   - smaller reward than full completion

### E2E Tests (Playwright)

Add a minimal e2e flow (grep tag "wind"):

- Seed a save with at least 1 owned watch
- Click Interact
- Choose Steady 1-2 times
- Assert modal closes and stats change (cash increases or event indicator changes if visible)

## Acceptance Criteria (Testable)

- Interact opens Wind Session modal with round/tension UI.
- Steady wind always increases tension by 1 and advances round.
- Push it increases tension by 2 on success, ends session on slip.
- On session end:
  - cash payout applied according to formula
  - `wind-up` buff activated with multiplier based on tension
- Unit tests cover success + slip paths deterministically.
- `pnpm run test:unit` passes.
- `pnpm run test:e2e -- --project=chromium --grep "wind"` passes.
