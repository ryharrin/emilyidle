# Phase 16: Nostalgia Prestige Reset - Research

**Researched:** 2026-01-23
**Domain:** Incremental-game “tier-3” prestige reset (state transforms, lifetime counters, persistence, UI)
**Confidence:** HIGH

## Summary

Phase 16 is best implemented by copying the repo’s existing “prestige loop” architecture: (1) pure, deterministic state transforms in `src/game/state.ts`, (2) derived selectors for gain/eligibility, (3) simulation-time accumulation of lifetime counters in `src/game/sim.ts`, and (4) a React tab panel in `src/App.tsx` that uses stable `id`/`data-testid` selectors.

The key “unknown unknown” for this phase is that “enjoyment earned since last reset” cannot be derived from the current `enjoymentCents` balance because enjoyment is spendable (e.g., Therapist sessions). You need a monotonic lifetime counter (or snapshot + delta) that increments when enjoyment is generated in the sim tick, not when the balance changes.

**Primary recommendation:** Implement Nostalgia Prestige as a pure `prestigeNostalgia()` transform + `getNostalgiaGain()` selector using a monotonic lifetime enjoyment counter delta, update save sanitization to default new fields, and build the UI using the existing tab + progress + `role="dialog"` modal patterns.

## Standard Stack

This phase should use the existing repo stack (no new libraries).

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI | Existing UI framework |
| react-dom | ^18.3.1 | UI runtime | Existing |
| vite | ^6.0.0 | dev/build | Existing |
| typescript | ^5.8.0 | types | Existing strict TS |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^1.6.0 | unit tests | Add unit tests for new nostalgia math + reset transform |
| @playwright/test | ^1.49.1 | e2e tests | Add/update tab + modal flows if needed |
| @testing-library/react | ^16.1.0 | component/unit tests | If writing component-level tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| repo’s hand-rolled `role="dialog"` pattern | modal lib | Adds deps + selector churn; existing pattern already tested (`Wind session`) |

**Installation:**
```bash
# No new packages needed for this phase.
```

## Architecture Patterns

### Recommended Project Structure
This phase fits the existing split:
```
src/
├── App.tsx              # tab UI + modal wiring
└── game/
    ├── state.ts         # GameState shape, selectors, prestige transforms
    ├── sim.ts           # per-tick income/enjoyment accumulation
    └── persistence.ts   # save sanitize/encode/decode
```

### Pattern 1: Pure Prestige Transform (State.ts)
**What:** A single function that takes `GameState` and returns the next `GameState`, with all reset effects applied atomically.
**When to use:** Any player-triggered reset (Workshop/Maison/Nostalgia).
**Example:**
```ts
// Source: src/game/state.ts
export function prestigeMaison(state: GameState): GameState {
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    enjoymentCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: state.maisonHeritage + getMaisonPrestigeGain(state),
    maisonReputation: state.maisonReputation + getMaisonReputationGain(state),
    maisonUpgrades: { ...state.maisonUpgrades },
    maisonLines: { ...state.maisonLines },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
}
```

**Phase-16-specific guidance:**
- Keep the same “pure transform” approach for `prestigeNostalgia()`.
- Do not compute nostalgia rewards in the UI. Compute them in `src/game/state.ts` via a selector and pass the computed gain into the transform or have the transform compute it internally.

### Pattern 2: Prestige Gain Selectors With Threshold + Diminishing Returns
**What:** A selector that computes gain from a continuous resource using a diminishing-returns function and a separate threshold constant.
**When to use:** For preview + eligibility + reward.
**Example:**
```ts
// Source: src/game/state.ts
export function getWorkshopPrestigeGain(state: GameState): number {
  const enjoyment = getEnjoymentCents(state);
  const baseGain = Math.max(0, Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5));
  return Math.floor(baseGain * getCraftedBoostPrestigeMultiplier(state));
}
```

**Phase-16-specific guidance:**
- Use the same shape for nostalgia: `gain = floor(sqrt(enjoymentEarnedSinceReset / NOSTALGIA_THRESHOLD))`.
- Define eligibility as `gain > 0`; this automatically satisfies “min 1 when eligible” once `enjoymentEarnedSinceReset >= threshold`.
- Implement the progress bar as `min(1, enjoymentEarnedSinceReset / threshold)`.

### Pattern 3: Monotonic Lifetime Counters Updated In Sim Tick
**What:** Track lifetime earned resources using a monotonic counter updated at the source of earning (the sim tick), not derived from a spendable balance.
**When to use:** Any “earned since last reset” calculation.
**Example:**
```ts
// Source: src/game/sim.ts
const earnedEnjoyment = (enjoymentRate * clampedDtMs) / 1_000;
const withIncome = {
  ...withEvents,
  currencyCents: withEvents.currencyCents + earnedCents,
  enjoymentCents: withEvents.enjoymentCents + earnedEnjoyment,
};
```

**Phase-16-specific guidance:**
- Add a monotonic counter like `lifetimeEnjoymentEarnedCents` that increments by `earnedEnjoyment` each step.
- Store a snapshot at the last nostalgia reset (e.g., `nostalgiaBaselineLifetimeEnjoymentEarnedCents`).
- Derived delta for reward: `earnedSinceReset = lifetime - baseline`.

### Pattern 4: Tab + Dialog UI Patterns (App.tsx)
**What:** Tabs are driven by `visibleTabs` and panels are `<section id=... role="tabpanel" aria-labelledby=...>`. Dialogs are a conditional `<div role="dialog" aria-modal="true">`.
**When to use:** Adding a new top-level prestige tab and a single confirmation modal.
**Example:**
```tsx
// Source: src/App.tsx
{windActiveItemId && (
  <div role="dialog" aria-modal="true" className="panel">
    <header className="panel-header">...</header>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Using `enjoymentCents` as “earned enjoyment”:** enjoyment is spent in Career; the balance is not “lifetime earned”.
- **Reward preview mismatch:** preview and grant must call the same selector/function; don’t duplicate the formula in JSX.
- **Resetting items by accident:** Phase 16 explicitly keeps owned watches; do not call `createItemCounts()`.
- **Breaking seeded tests/saves:** v2 saves in tests often omit fields; new fields must be optional in sanitize/restore with safe defaults.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistence versioning/keys | new save key / new schema format | existing `src/game/persistence.ts` (`SAVE_KEY`, v2 sanitize) | avoids breaking localStorage + migration complexity |
| Accessible modal plumbing | custom focus trap/portal framework | existing `role="dialog" aria-modal="true"` pattern used by Wind session | already exercised by tests; minimal selector churn |
| Money/enjoyment formatting | new formatting helpers | `formatMoneyFromCents()` + existing label helpers | consistent UI + tests |
| Threshold/gain duplication | recomputing in UI | selectors in `src/game/state.ts` | prevents drift between preview and award |

**Key insight:** In this repo, “game rules” live in `src/game/state.ts` (selectors + pure transforms). The UI should only render derived values and call those functions.

## Common Pitfalls

### Pitfall 1: Counting “Earned Since Reset” Incorrectly
**What goes wrong:** Nostalgia gain is computed from the current enjoyment balance, so spending enjoyment (Career sessions) reduces the “earned” amount and can even make a player ineligible.
**Why it happens:** `enjoymentCents` is a spendable currency, not a lifetime ledger.
**How to avoid:** Track a monotonic `lifetimeEnjoymentEarnedCents` updated in `src/game/sim.ts`, and compute deltas using a stored baseline at last nostalgia reset.
**Warning signs:** A player’s projected nostalgia gain goes down after running a Therapist session.

### Pitfall 2: Reset Incompletely (Leaking Meta Progression)
**What goes wrong:** Nostalgia prestige leaves behind Workshop/Maison fields (or timers) so the reset doesn’t feel like a true higher-tier prestige.
**Why it happens:** Workshop state is spread across `workshopBlueprints`, `workshopPrestigeCount`, `workshopUpgrades`, plus crafting (`craftingParts`, `craftedBoosts`). Maison state spans multiple fields.
**How to avoid:** Reset all workshop/maison/career fields to `createInitialState()` equivalents (while explicitly preserving items).
**Warning signs:** Post-reset prestige legacy multiplier (`getPrestigeLegacyMultiplier`) is still boosted.

### Pitfall 3: Save Sanitization Breaks Test Seeds
**What goes wrong:** Playwright/Vitest seeded saves (which omit newer fields) fail to load because sanitize requires new properties.
**Why it happens:** `sanitizeState()` in `src/game/persistence.ts` is the gatekeeper; it must treat new fields as optional.
**How to avoid:** Add new persisted fields with defaults in `PersistedGameState` + sanitize; keep `currencyCents` as the only hard requirement.
**Warning signs:** Tests fail early with “Invalid save payload: invalid state”.

### Pitfall 4: Selector/ID Churn
**What goes wrong:** Existing Playwright selectors (tab names, `id`, `data-testid`) break.
**Why it happens:** Tabs and panels have tightly coupled IDs (`${tab.id}-tab`, `aria-controls`, panel `id`).
**How to avoid:** Only add a new tab ID; do not rename existing tab IDs/labels/selectors. Keep the existing `id`/`data-testid` values untouched.
**Warning signs:** `tests/collection-loop.spec.ts` or `tests/tabs.spec.ts` fails around navigation.

## Code Examples

### A: Implementing “earned since last reset”
```ts
// Source: src/game/sim.ts (pattern)
// Add a monotonic counter updated where enjoyment is earned.

const earnedEnjoyment = (enjoymentRate * clampedDtMs) / 1_000;

const withIncome = {
  ...withEvents,
  enjoymentCents: withEvents.enjoymentCents + earnedEnjoyment,
  lifetimeEnjoymentEarnedCents: withEvents.lifetimeEnjoymentEarnedCents + earnedEnjoyment,
};
```

### B: Diminishing-returns gain selector with threshold
```ts
// Source: src/game/state.ts (pattern from getWorkshopPrestigeGain)

export function getNostalgiaGain(state: GameState): number {
  const earnedSinceReset = Math.max(
    0,
    state.lifetimeEnjoymentEarnedCents - state.nostalgiaBaselineLifetimeEnjoymentEarnedCents,
  );
  return Math.max(0, Math.floor((earnedSinceReset / NOSTALGIA_THRESHOLD_CENTS) ** 0.5));
}
```

### C: Single confirmation modal pattern
```tsx
// Source: src/App.tsx (wind modal pattern)

{nostalgiaConfirmOpen && (
  <div role="dialog" aria-modal="true" className="panel" data-testid="nostalgia-confirm-modal">
    <header className="panel-header">...</header>
    <button onClick={handleConfirmNostalgiaPrestige}>Confirm</button>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Use current resource balance as “earned” | Use monotonic lifetime counter + baseline snapshot | (common incremental design; required by this repo’s spendable enjoyment) | avoids preview drift and supports spend mechanics |
| Multiple inline confirm toggles per reset | Single confirmation modal | Phase 16 decision | centralizes copy + reduces UI duplication |

**Deprecated/outdated:**
- Deriving “earned enjoyment” from `enjoymentCents`: incorrect once enjoyment can be spent.

## Open Questions

1. **What exactly counts as “Workshop progression” for nostalgia reset?**
   - What we know: Workshop includes Blueprints + upgrades + prestige count; crafting parts/boosts are also workshop-adjacent (`tests/workshop.unit.test.tsx`).
   - What’s unclear: Whether to reset `craftingParts` and `craftedBoosts` (likely yes, to make the higher-tier reset meaningful).
   - Recommendation: Treat crafting as Workshop progression and reset both to baseline to match “reset Workshop”.

2. **Which “Collection” elements should persist besides owned watches?**
   - What we know: Decision explicitly says keep owned watches; does not mention resetting watch upgrades, milestones, achievements, catalog discovery.
   - What’s unclear: Whether “progression back to baseline” should also clear `upgrades` or discovery lists.
   - Recommendation: Keep `upgrades`, `unlockedMilestones`, `achievementUnlocks`, and discovery lists unchanged (only reset what the decision enumerates: currencies + Workshop/Maison/Career).

3. **Eligibility threshold constant sizing**
   - What we know: Must be representable as a progress bar and match “min 1 when eligible”.
   - What’s unclear: Target time-to-first-nostalgia relative to Phase 15 pacing.
   - Recommendation: Pick `NOSTALGIA_THRESHOLD_CENTS` so first reset is meaningfully after Maison unlock; verify feel by simulating a midgame save.

## Sources

### Primary (HIGH confidence)
- `package.json` - dependency versions
- `src/game/state.ts` - existing prestige transforms (`prestigeWorkshop`, `prestigeMaison`), thresholds, milestone/achievement unlock model
- `src/game/sim.ts` - authoritative place enjoyment is earned per tick
- `src/game/persistence.ts` - save sanitization rules (v2), localStorage keys
- `src/App.tsx` - tab architecture + existing `role="dialog"` modal pattern
- `tests/workshop.unit.test.tsx`, `tests/maison.unit.test.tsx`, `tests/tabs.spec.ts` - seeded state expectations and selector stability risks

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions read from `package.json`
- Architecture: HIGH - patterns verified in `src/game/state.ts`, `src/game/sim.ts`, `src/App.tsx`
- Pitfalls: HIGH - derived from existing spend/earn flows + persistence sanitizer + test seeds

**Research date:** 2026-01-23
**Valid until:** 2026-02-22
