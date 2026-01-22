# Phase 12 Plan 09 - Prestige Improvements (Design Spike)

## Goal

Make Workshop (Atelier) and Maison prestiges feel like a meaningful, compounding loop:

- The *next run* should be noticeably faster (Workshop prestige).
- Maison prestige should feel like a bigger “chapter reset” that still leaves a lasting payoff.
- The payoff should integrate cleanly with the existing multiplier stack (set bonuses, crafted boosts, event multipliers).
- Changes must be deterministic and testable.

## Current State

### Workshop prestige

- Trigger: enough enjoyment to earn at least 1 blueprint via `getWorkshopPrestigeGain`.
- Effect: resets currency/enjoyment/items/upgrades; increments `workshopPrestigeCount`; grants `workshopBlueprints`.
- Long-term value comes from Workshop upgrades purchased with blueprints.

### Maison prestige

- Trigger: enough enjoyment and/or workshopPrestigeCount to earn heritage/reputation.
- Effect: resets Workshop progress more aggressively (blueprints + workshop upgrades) but keeps Maison upgrades/lines and crafted boosts.

## Problems Observed

- Workshop prestige payoff is mostly indirect (you *eventually* buy upgrades), so the immediate feeling of “second run is faster” can be weak.
- Maison prestige is strong mechanically, but the “lasting” payoff is mostly tied to buying Maison upgrades/lines, which can feel opaque.
- There is no single, always-on, visible “legacy bonus” that communicates compounding power.

## Proposed Changes

### 1) Add always-on prestige multipliers

Introduce two always-on multipliers applied to both cash and enjoyment rates:

1. **Atelier legacy multiplier** (from Workshop prestiges)
2. **Maison legacy multiplier** (from Maison heritage)

These multipliers stack multiplicatively with existing multipliers (set bonuses, crafted boosts, workshop/maison multipliers, catalog tier multipliers, and active event multipliers).

#### Formulas

All inputs are clamped to >= 0.

```
atelierLegacy = 1.05 ^ workshopPrestigeCount
maisonLegacy  = 1.03 ^ maisonHeritage

prestigeLegacy = atelierLegacy * maisonLegacy
```

Safety cap to prevent runaway scaling:

```
prestigeLegacy = min(prestigeLegacy, 10)
```

Rationale:
- 5% per Workshop prestige makes the *next run* noticeably faster without instantly breaking balance.
- 3% per Heritage makes Maison prestige payoffs feel permanent and compounding.
- Cap prevents extreme saves from producing absurd rates.

### 2) Integrate legacy multipliers into rate calculation

Apply `prestigeLegacy` inside:

- `getRawIncomeRateCentsPerSec`
- `getEnjoymentRateCentsPerSec`

This ensures:
- The multiplier affects both currencies in the dual-currency loop.
- It naturally composes with existing systems (crafting, set bonuses, events).

### 3) Keep existing prestige gain formulas for now

Do not change:

- `getWorkshopPrestigeGain` / thresholds
- `getMaisonPrestigeGain` / `getMaisonReputationGain` / thresholds

Rationale: minimize scope and avoid refactoring while still improving “meaningfulness”. The new always-on multipliers provide the main perceived improvement.

## Acceptance Criteria (Testable)

1. **Workshop prestige improves the next run**
   - After `workshopPrestigeCount` increases by 1, `getRawIncomeRateCentsPerSec` and `getEnjoymentRateCentsPerSec` are multiplied by ~1.05 (within floating tolerance), holding everything else equal.

2. **Maison prestige provides lasting benefit via heritage**
   - With `maisonHeritage > 0`, rates are multiplied by `1.03 ^ maisonHeritage` (capped) holding everything else equal.

3. **Integration with multiplier stack**
   - Existing set bonus tests still pass with updated expected values.
   - Crafted boosts, workshop multipliers, maison multipliers, and catalog tiers continue to compose correctly.

4. **No save migration required**
   - Uses existing `workshopPrestigeCount` and `maisonHeritage` fields.

5. **Test coverage**
   - Unit tests cover:
     - the new multiplier function (including cap)
     - workshop prestige count impact
     - maison heritage impact

## Implementation Notes

- Implement a helper function in `src/game/state.ts`:
  - `getPrestigeLegacyMultiplier(state): number`
- Multiply both raw cash and enjoyment rates by this value.
- Update unit tests in `tests/maison.unit.test.tsx`:
  - Update expected formulas to include the prestige legacy multiplier.
  - Add focused tests that assert the 1.05 and 1.03 scaling.
