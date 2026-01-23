# Phase 15: Dual-Currency Acquisition - Research

**Researched:** 2026-01-23
**Domain:** In-game economy gating (watch acquisition) across cash + enjoyment
**Confidence:** MEDIUM

## Summary

Phase 15 changes watch acquisition from a single-currency purchase (cash only) to a dual-gate model: cash is spent, while enjoyment is a threshold gate that is checked at click time and never consumed.

This repo already has the right separation for this: all purchase rules live in pure functions in `src/game/state.ts` (e.g. `canBuyItem`, `buyItem`, `getItemPriceCents`), and the UI in `src/App.tsx` only renders derived state and calls these pure functions. The correct implementation strategy is to centralize the dual-gate logic in `src/game/state.ts`, then update the Vault watch cards to present the new rule (cash always shown; enjoyment requirement shown only when it blocks purchase; disabled + lock icon + per-watch reason).

**Primary recommendation:** Implement dual-gate purchase rules as a single “purchase eligibility” computation in `src/game/state.ts` and have both manual buy buttons and auto-buy use it.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---|---:|---|---|
| react | ^18.3.1 | UI rendering | Existing app + state loop is React-based |
| typescript | ^5.8.0 | Type safety | `src/game/state.ts` relies heavily on strict typing |
| vite | ^6.0.0 | Dev/build tooling | Existing build pipeline |

### Supporting
| Library | Version | Purpose | When to Use |
|---|---:|---|---|
| vitest | ^1.6.0 | Unit tests | Pure function tests for purchase gating + pricing |
| @playwright/test | ^1.49.1 | E2E tests | Ensure Vault UI disables/enables buy buttons and shows gating messaging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Adding a new state management library | N/A | Not needed; repo already uses local React state + pure game reducers |

## Architecture Patterns

### Recommended Project Structure
Dual-currency acquisition should follow the existing split:

```
src/
├── game/state.ts        # source of truth for costs + gating + purchases
├── game/sim.ts          # passive income/enjoyment tick
├── game/persistence.ts  # save/load; should not need schema changes for Phase 15
└── App.tsx              # renders watch cards; disables buttons; shows gating reasons
```

### Pattern 1: Centralize Purchase Rules in `state.ts`
**What:** All eligibility checks and state transitions live in `src/game/state.ts`; UI should never re-implement business rules.

**When to use:** Any time the UI needs to enable/disable an action, show a reason, or perform the action.

**Example:** Current single-currency implementation lives in `src/game/state.ts` via:
- `getItemPriceCents(state, id, quantity)`
- `canBuyItem(state, id, quantity)`
- `buyItem(state, id, quantity)`

Phase 15 should extend this same trio to incorporate enjoyment gating and the new cash curve.

### Pattern 2: UI Renders Derived State and Uses Pure Actions
**What:** `src/App.tsx` computes display booleans and prices, then calls pure actions (e.g. `buyItem`) via `handlePurchase(...)`.

**When to use:** Vault watch cards and auto-buy.

**Example:** Vault watch purchase buttons (today) use:
- `disabled={!canBuyItem(state, item.id, 1) || !unlocked}`
- button label: `Buy (${formatMoneyFromCents(price)})`

Phase 15 UI changes should continue to depend on `state.ts` for whether a purchase is allowed and why.

### Anti-Patterns to Avoid
- **Duplicating gating logic in UI:** leads to “button enabled but click does nothing” drift; the click-time guard must match the disabled state.
- **Storing “unlocked by enjoyment” flags:** Phase 15 explicitly requires re-locking if enjoyment drops.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Bulk purchase cost sums | Manual loops adding per-unit prices | `getSeriesTotal(...)` in `src/game/state.ts` | Avoid rounding drift; already handles geometric series |
| “Max affordable” bulk count | Trial-and-error loops | `getMaxAffordableCount(...)` in `src/game/state.ts` | Avoid O(n) loops; already handles growth != 1 |
| Cross-cutting purchase gating | Multiple ad-hoc booleans | A single “purchase gate” function (new) used by UI + auto-buy + `buyItem` | Keeps rules consistent across manual + automation |

**Key insight:** In this repo, any action that can be triggered manually and automatically (auto-buy) must share a single eligibility function, or the automation will behave differently than the UI.

## Common Pitfalls

### Pitfall 1: Auto-buy bypasses enjoyment gating
**What goes wrong:** Auto-buy currently relies on `getMaxAffordableItemCount` + `buyItem`; if only `disabled` UI logic changes, auto-buy will still buy locked watches.

**How to avoid:** Update `canBuyItem`, `buyItem`, and `getMaxAffordableItemCount` to incorporate enjoyment gating (or introduce a single shared eligibility helper that all three use).

### Pitfall 2: UI messaging violates “enjoyment deficit wins”
**What goes wrong:** When both cash and enjoyment are insufficient, UI shows both deficits or prioritizes cash.

**How to avoid:** Drive UI off a `PurchaseBlockReason` computed in `state.ts` that applies the priority rule:
- if enjoyment insufficient: show enjoyment requirement + enjoyment deficit message
- else if cash insufficient: show disabled state (cash price is already visible)

### Pitfall 3: Click-time checks don’t match disabled state
**What goes wrong:** Button shows enabled but click does nothing, or button is disabled while click would succeed.

**How to avoid:** Ensure `buyItem(...)` enforces the exact same logic that the UI uses for `disabled`, and that both read from the same helper.

### Pitfall 4: Inadvertently coupling prices to multipliers
**What goes wrong:** Purchase price accidentally uses event multipliers / prestige multipliers.

**How to avoid:** Keep Phase 15 cash prices and enjoyment requirements as fixed constants/tables (locked decision: no upgrades/events affect them).

## Code Examples

### Purchase Eligibility Helper (Recommended)
Implement a new helper that computes the full gate state in one place.

```ts
// Source: internal pattern based on src/game/state.ts buyItem/canBuyItem
export type WatchPurchaseGate =
  | { ok: true; cashPriceCents: number; enjoymentRequiredCents: number }
  | {
      ok: false;
      cashPriceCents: number;
      enjoymentRequiredCents: number;
      blocksBy: "enjoyment" | "cash";
      enjoymentDeficitCents?: number;
      cashDeficitCents?: number;
    };

export function getWatchPurchaseGate(
  state: GameState,
  id: WatchItemId,
  quantity = 1,
): WatchPurchaseGate {
  // 1) Compute cashPriceCents from the NEW tier-based curve (not the old values).
  // 2) Compute enjoymentRequiredCents from explicit per-watch requirement table.
  // 3) Apply locked priority rule: if both missing, blocksBy = "enjoyment".
}
```

### Wiring Through Existing Entry Points
Update these existing functions to call the helper:

```ts
// Source: src/game/state.ts
export function canBuyItem(state: GameState, id: WatchItemId, quantity = 1): boolean {
  return getWatchPurchaseGate(state, id, quantity).ok;
}

export function buyItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  const gate = getWatchPurchaseGate(state, id, quantity);
  if (!gate.ok) return state;
  // spend cash only; do not spend enjoyment
}
```

### UI Presentation Hook-up
In `src/App.tsx`, compute the gate per item and use it to:
- always display `cashPriceCents`
- conditionally display enjoyment requirement + reason when `blocksBy === "enjoyment"`
- disable buttons when `!gate.ok` (or when milestone-locked)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Watch purchases spend only cash (`currencyCents`) | Watch purchases require both cash and enjoyment; only cash is spent | Phase 15 | Adds “enjoyment as access” gate while preserving career cash as spend currency |

**Deprecated/outdated:**
- Treating `basePriceCents`/`priceGrowth` as the final watch purchase curve if those values are not updated to the new Phase 15 curve.

## Open Questions

1. **Exact cash curve values (base + growth per tier)**
   - What we know: Locked decision requires a new tier-based curve (not the existing one).
   - What's unclear: The intended magnitudes and whether the curve should preserve “affordable starter quickly” and “higher tiers meaningfully career-gated”.
   - Recommendation: Choose explicit `{ basePriceCents, priceGrowth }` per watch tier and encode as constants in `src/game/state.ts`.

2. **Exact enjoyment requirements per watch**
   - What we know: Explicit per-watch values; starter tier has no enjoyment gate.
   - What's unclear: The actual thresholds (in cents) and whether they should line up with existing prestige thresholds.
   - Recommendation: Add a `WATCH_ENJOYMENT_REQUIREMENTS_CENTS` table keyed by `WatchItemId` with `starter: 0`.

3. **Bulk buy semantics for enjoyment gate**
   - What we know: Enjoyment is a threshold gate, not spent.
   - What's unclear: Whether buying quantity > 1 should require any additional enjoyment beyond the single threshold.
   - Recommendation: Treat enjoyment as a per-item-type gate (single threshold), independent of quantity, and document it in code/tests.

## Sources

### Primary (HIGH confidence)
- `src/game/state.ts` - watch item definitions, pricing math, purchase actions (`getItemPriceCents`, `canBuyItem`, `buyItem`), enjoyment + therapist systems
- `src/App.tsx` - Vault watch card UI, buy button wiring, auto-buy loop
- `tests/collection-loop.spec.ts` - E2E expectations for buy button enable/disable and text matching
- `.planning/phases/15-dual-currency-acquisition/15-CONTEXT.md` - locked product/UX decisions for Phase 15

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions from `package.json`
- Architecture: HIGH - based on existing code structure and call sites
- Pitfalls: MEDIUM - inferred from existing automation/UI coupling and test expectations

**Research date:** 2026-01-23
**Valid until:** 2026-02-06
