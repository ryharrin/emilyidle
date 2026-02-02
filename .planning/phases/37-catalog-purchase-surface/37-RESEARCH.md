# Phase 37: Catalog Purchase Surface - Research

**Researched:** 2026-02-02
**Domain:** React UI purchase surface consolidation (catalog-card watch purchases) + affordance styling
**Confidence:** HIGH

## Summary

This repo already has a complete “buy a watch model” domain action (`buyWatchModel`) plus a UI purchase surface implemented as catalog cards (`CatalogPurchasePanel` in `src/ui/tabs/CatalogTab.tsx`). Today, that purchase surface is embedded inside the Vault/Collection tab as a “Shop” section (`src/ui/tabs/CollectionTab.tsx`) and the standalone Catalog tab component exists but is not wired into primary navigation (`src/App.tsx` keeps `catalog` visibility `false`). Tests and help copy currently reinforce “Shop in Vault” as the purchase entry point.

Phase 37 should be planned as a UI consolidation: make catalog cards the only manual purchase entry point by moving/removing the embedded “Shop” purchase section from Vault/Collection and wiring a dedicated, visible Catalog purchase tab/panel. Preserve existing `data-testid`/`id` anchors where possible (notably `catalog-buy-*`, `catalog-gate-*`, and the `catalog-shop` anchor used by help and navigation scroll logic) to minimize regressions.

CAT-04 (“actionable vs locked at a glance”) should be planned as a styling/classification change on the existing catalog card rendering: add explicit card state classes driven by `unlocked` + `getWatchModelPurchaseGate(state, modelId).ok` and style them in `src/style.css` without changing test selectors.

**Primary recommendation:** Promote the catalog-card purchase grid into a first-class Catalog tab (wired in `src/App.tsx`), remove the Vault/Collection embedded “Shop” purchase panel, and add explicit `catalog-actionable`/`catalog-nonactionable` classes to cards to make affordability obvious.

## Standard Stack

This phase should use the repo’s existing UI/domain stack only.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI components/hooks | Existing app framework |
| react-dom | ^18.3.1 | DOM rendering | Existing |
| typescript | ^5.8.0 | Type safety | Existing strict TS |
| vite | ^6.0.0 | Dev/build tooling | Existing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | ^16.1.0 | Unit tests | Update unit tests for moved purchase surface |
| @playwright/test | ^1.49.1 | E2E tests | Update e2e flows for new purchase entry point |
| lucide-react | 0.563.0 | Icons | If new icon affordances are needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only affordances | New component library | Not needed; would add dependency and visual inconsistency |

**Installation:**
```bash
# No new dependencies expected for Phase 37
```

## Architecture Patterns

### Current Purchase Architecture (What Exists Today)

**Domain action:** `buyWatchModel(state, modelId)` in `src/game/actions/index.ts`.
- Validates unlock: `isItemUnlocked(state, getWatchModelTierId(modelId))`
- Validates affordability: `getWatchModelPurchaseGate(state, modelId)` (cash + enjoyment requirement)
- Applies state changes (currency/item/model counts)
- Triggers catalog discovery + milestone/achievement unlock application

**UI purchase surface:** `CatalogPurchasePanel` in `src/ui/tabs/CatalogTab.tsx`.
- Renders each catalog card with:
  - `data-testid="catalog-card"`
  - Purchase CTA `data-testid={\`catalog-buy-${entry.id}\`}` when affordable
  - Gate label `data-testid={\`catalog-gate-${entry.id}\`}` when not affordable or locked
- Performs purchase via `onPurchase(buyWatchModel(state, entryId))`.

**Current entry point:** `CatalogPurchasePanel` is embedded in Vault/Collection tab under `id="catalog-shop"` / `data-testid="catalog-shop"` in `src/ui/tabs/CollectionTab.tsx`.

**Navigation affordance:** `navigateTo(tabId, scrollTargetId)` in `src/App.tsx` special-cases `scrollTargetId === "catalog-shop"` by scrolling the first buy button into view.

### Recommended Project Structure (for Phase 37 changes)
Keep changes localized to existing UI/tab modules.

```
src/
├── App.tsx                     # navigation + tab wiring (add Catalog tab)
├── ui/
│   ├── tabs/
│   │   ├── CatalogTab.tsx      # purchase surface and card rendering
│   │   └── CollectionTab.tsx   # remove embedded Shop purchase surface
│   └── help/helpContent.ts     # update copy: purchase surface location
└── style.css                   # add actionable/non-actionable card styles
tests/
├── catalog.unit.test.tsx       # update navigation expectations
└── phase35-uat.spec.ts         # update “Shop vs Catalog” assertions
```

### Pattern 1: “UI Delegates to Pure Action”
**What:** UI calls `onPurchase(action(state, args))`; action returns either unchanged state (no-op) or a new state.
**When to use:** All manual purchases and state transitions.
**Example:**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
const handlePurchase = React.useCallback(
  (entryId: string) => {
    onPurchase(buyWatchModel(state, entryId));
    triggerPurchaseHighlight(entryId);
  },
  [onPurchase, state, triggerPurchaseHighlight],
);
```

### Pattern 2: “Selector-Driven Gating, Not UI Math”
**What:** Determine affordability with `getWatchModelPurchaseGate` and lock with `isItemUnlocked`.
**When to use:** Rendering actionable vs blocked states.
**Example:**
```ts
// Source: src/game/selectors/watchModels.ts
export function getWatchModelPurchaseGate(state: GameState, modelId: string): WatchModelPurchaseGate {
  // Computes cash price, enjoyment required, and deficits.
}
```

### Anti-Patterns to Avoid
- **Re-implementing purchase gates in UI:** always use `getWatchModelPurchaseGate` / `isItemUnlocked`.
- **Adding new purchase entry points:** do not add a separate “Buy” button outside catalog cards.
- **Changing `data-testid` strings for existing catalog card elements:** tests rely on `catalog-buy-*`, `catalog-gate-*`, `catalog-card`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Purchase gating logic | Ad-hoc affordability checks in UI | `getWatchModelPurchaseGate` | Handles cash vs enjoyment deficits consistently |
| Purchase state transition | Custom state mutation in UI | `buyWatchModel` + `onPurchase` | Keeps domain logic pure and centralized |
| Money formatting | Manual string formatting | `formatMoneyFromCents` | Consistent currency display |
| Discovery side effects | UI-driven “discover” flags | `discoverCatalogEntries` via action | Ensures achievements/milestones apply |

**Key insight:** this phase is primarily UI surface + styling; the purchase rules already exist and should remain the single source of truth.

## Common Pitfalls

### Pitfall 1: Leaving a Second Purchase Surface in Vault/Collection
**What goes wrong:** Players can still buy from the embedded `catalog-shop` panel inside Vault/Collection, violating CAT-01/Phase 37 success criteria.
**Why it happens:** Current architecture intentionally embeds the purchase panel in `CollectionTab` and hides the standalone Catalog tab.
**How to avoid:** Move the purchase panel out of `CollectionTab` and wire a dedicated Catalog tab/panel in `src/App.tsx`.
**Warning signs:** `src/ui/tabs/CollectionTab.tsx` still renders `CatalogPurchasePanel` or still contains `data-testid="catalog-shop"`.

### Pitfall 2: Breaking Navigation/Help Anchors
**What goes wrong:** “Buy watches” CTAs or `navigateTo(..., "catalog-shop")` no longer scroll to the purchase grid.
**Why it happens:** `src/App.tsx` has a special-case scroll behavior tied to `scrollTargetId === "catalog-shop"`.
**How to avoid:** Keep a stable anchor element with `id="catalog-shop"` and/or update the scroll special-case alongside tab changes.
**Warning signs:** CTAs navigate to Catalog but do not scroll to buy buttons; Playwright tests fail to find `catalog-shop`.

### Pitfall 3: Affordance Styling Based on “Discovered” Instead of “Actionable”
**What goes wrong:** Cards look “locked” because `catalog-locked` currently means “undiscovered,” not “cannot buy.”
**Why it happens:** Current card class is derived from `discoveredCatalogIds.includes(entry.id)`.
**How to avoid:** Add explicit actionable state classes keyed off `unlocked && gate.ok` and style those; do not overload “discovered” styling.
**Warning signs:** Affordable cards are not visually distinct unless the player reads the gate text.

### Pitfall 4: Test Drift From Copy/Tab Changes
**What goes wrong:** Unit/e2e tests fail because they assert “Shop in Vault” copy or tab names.
**Why it happens:** Existing tests explicitly click the Vault tab and assert shop-vs-catalog phrasing.
**How to avoid:** Plan coordinated updates to `tests/catalog.unit.test.tsx` and `tests/phase35-uat.spec.ts` to reflect the new purchase entry point.
**Warning signs:** Tests search for `"Shop is the purchase flow"` or for a tab labeled “Vault” to reach purchase grid.

## Code Examples

### Purchase Action (Domain)
```ts
// Source: src/game/actions/index.ts
export function buyWatchModel(state: GameState, modelId: string): GameState {
  const tierId = getWatchModelTierId(modelId);
  if (!isItemUnlocked(state, tierId)) {
    return state;
  }

  const gate = getWatchModelPurchaseGate(state, modelId);
  if (!gate.ok) {
    return state;
  }

  // Deduct cash, increment tier + model counts, then discover + unlock.
}
```

### Gate Computation (Selector)
```ts
// Source: src/game/selectors/watchModels.ts
export function getWatchModelPurchaseGate(state: GameState, modelId: string) {
  const cashDeficitCents = Math.max(0, cashPriceCents - state.currencyCents);
  const enjoymentDeficitCents = Math.max(0, enjoymentRequiredCents - state.enjoymentCents);
  // blocksBy: "enjoyment" or "cash" (enjoyment takes precedence when both lacking)
}
```

### Navigation Scroll Behavior
```ts
// Source: src/App.tsx
if (scrollTargetId === "catalog-shop") {
  const buyButton = target.querySelector('[data-testid^="catalog-buy-"]');
  if (buyButton instanceof HTMLElement) {
    buyButton.scrollIntoView({ block: "start", behavior: "auto" });
    return;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Buy from Vault/Collection “Shop” section | Buy from Catalog tab/panel via catalog cards | Phase 37 (planned) | Single, obvious purchase surface; removes duplicate entry point |

**Deprecated/outdated (after Phase 37):**
- “Shop lives inside the Vault tab” phrasing in `src/ui/help/helpContent.ts` should be replaced with Catalog-as-shop copy.

## Open Questions

1. **Should the Catalog tab be visible from the start or unlocked by a milestone?**
   - What we know: `src/App.tsx` currently hard-codes `catalog: false` in tab visibility.
   - What's unclear: Whether Catalog should be always visible for early purchase, or gated (and by which condition).
   - Recommendation: Make Catalog visible whenever the player can buy watches (at minimum on fresh saves). Keep gating behavior inside cards via `isItemUnlocked` + `getWatchModelPurchaseGate`.

## Sources

### Primary (HIGH confidence)
- `src/ui/tabs/CatalogTab.tsx` - `CatalogPurchasePanel` card rendering, `catalog-buy-*` / `catalog-gate-*` selectors, purchase callback
- `src/ui/tabs/CollectionTab.tsx` - embedded purchase panel in Vault/Collection (`data-testid="catalog-shop"`)
- `src/game/actions/index.ts` - `buyWatchModel` purchase state transition
- `src/game/selectors/watchModels.ts` - `getWatchModelPurchaseGate` (cash/enjoyment gating)
- `src/App.tsx` - tab visibility, navigation scroll special-case for `catalog-shop`
- `src/ui/help/helpContent.ts` - help copy defining Shop vs Catalog surfaces
- `tests/catalog.unit.test.tsx`, `tests/phase35-uat.spec.ts` - current test expectations around Vault/Shop purchase surface

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from `package.json`
- Architecture: HIGH - derived from current code paths cited above
- Pitfalls: HIGH - derived from explicit selectors/tests and wiring patterns

**Research date:** 2026-02-02
**Valid until:** 2026-03-03
