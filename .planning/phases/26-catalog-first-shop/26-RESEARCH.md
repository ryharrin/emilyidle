# Phase 26: Catalog-First Shop - Research

**Researched:** 2026-01-28
**Domain:** Catalog-first purchase UX in a Vite + React + TypeScript idle game (tab navigation + localStorage state + model-level purchases)
**Confidence:** HIGH

## Summary

Phase 26 is primarily a UI/navigation refactor: make Catalog the default landing surface (with a deterministic override hierarchy), and move model purchases into Catalog cards with inline affordability/lock messaging and on-demand help.

This repo already has the core primitives you need:
- Model-level purchasing (`buyWatchModel`) and gating (`getWatchModelPurchaseGate`) live in pure domain code.
- Catalog entries and watch models are 1:1 (model id == catalog entry id), so Catalog cards can directly buy models.
- The app already has a global Help modal and a way to open it to a specific section via `ExplainButton`/`useHelp`.

Main planning risk: existing Phase 26 plan docs in `.planning/phases/26-catalog-first-shop/` contain assumptions that conflict with the locked decisions in `26-CONTEXT.md` (notably existing-save landing behavior and lock/CTA presentation). Treat `26-CONTEXT.md` as authoritative.

**Primary recommendation:** Implement Catalog-first landing + purchases by wiring Catalog cards directly to `buyWatchModel` + `getWatchModelPurchaseGate`, and implement landing-tab resolution as `deep link` → `fresh session first-run` → `persisted last tab` → `Catalog fallback`.

## Standard Stack

No new libraries are required; Phase 26 should stay within the existing stack.

### Core
| Library | Version (repo) | Purpose | Why Standard |
|---------|-----------------|---------|--------------|
| react | ^18.3.1 | UI rendering + state | Existing app architecture |
| react-dom | ^18.3.1 | DOM rendering | Existing app architecture |
| vite | ^6.0.0 | Dev/build tooling | Existing app tooling |
| typescript | ^5.8.0 | Static typing | Existing app tooling |

### Supporting
| Library | Version (repo) | Purpose | When to Use |
|---------|-----------------|---------|-------------|
| @testing-library/react | ^16.1.0 | Unit/integration tests | Update/extend Catalog unit coverage |
| @testing-library/user-event | ^14.5.2 | Realistic user interactions | Tab switching, clicking Buy, opening Help |
| vitest | ^1.6.0 | Unit test runner | `pnpm run test:unit` |
| @playwright/test | ^1.49.1 | E2E tests | Phase 26-05 human verification; optional smoke later |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-app tab state + URLSearchParams | React Router | Not needed; repo is intentionally router-less for now |
| New per-card modal UX | Existing inline/expand patterns | Decisions explicitly require inline expand/collapse, not modals |

**Installation:**

No new packages.

## Architecture Patterns

### Recommended Project Structure
Relevant existing locations:

```
src/
├── App.tsx                 # tab state + wiring + help modal + runtime
├── ui/tabs/CatalogTab.tsx  # Catalog UI
├── ui/help/*               # Help modal + ExplainButton
└── game/
    ├── actions/index.ts    # buyWatchModel()
    ├── selectors/watchModels.ts # getWatchModelPurchaseGate(), price/owned
    ├── selectors/duplicates.ts  # duplicate multiplier helpers
    └── catalog.ts          # CatalogEntry + getCatalogImageUrl()
```

### Pattern 1: “Purchase Dispatch” stays centralized in `App.tsx`
**What:** Tabs compute derived UI and call pure actions; only `App.tsx` commits state + persists.
**When to use:** Any purchase/upgrade/craft/etc.
**Example:**

```ts
// Source: src/App.tsx
const handlePurchase = (nextState: GameState, meta?: PurchaseMeta) => {
  if (nextState !== state) {
    setState(nextState);
    markSaveDirty();
    persistNow("purchase", nextState);
  }
};
```

Planning implication: Catalog purchases should call `onPurchase(buyWatchModel(state, entry.id))` (and not call persistence directly).

### Pattern 2: Catalog entry id == watch model id
**What:** `WATCH_MODELS` are generated from `CATALOG_ENTRIES` with `id: entry.id`.
**When to use:** Treat `CatalogEntry.id` as the `modelId` everywhere.
**Example:**

```ts
// Source: src/game/data/watchModels.ts
return {
  id: entry.id,
  brand: entry.brand,
  model: entry.model,
  tierId,
  catalogEntryIds: [entry.id],
};
```

Planning implication: don’t build a mapping layer; buying from Catalog is a direct call into watch model APIs.

### Pattern 3: “Gate” objects are the canonical lock reason
**What:** Affordability + enjoyment requirements are encoded by `getWatchModelPurchaseGate()`.
**When to use:** Any UI that needs to show “why locked?” for watch purchases.
**Example:**

```ts
// Source: src/game/selectors/watchModels.ts
export type WatchModelPurchaseGate =
  | { ok: true; cashPriceCents: number; enjoymentRequiredCents: number }
  | {
      ok: false;
      cashPriceCents: number;
      enjoymentRequiredCents: number;
      blocksBy: "enjoyment" | "cash";
      enjoymentDeficitCents?: number;
      cashDeficitCents?: number;
    };
```

Planning implication: Phase 26 lock UX should be derived from this object; do not re-derive deficits.

### Anti-Patterns to Avoid
- **Persisting game save directly from CatalogTab:** use `onPurchase` (App-owned) so autosave semantics stay consistent.
- **Creating a router or per-card modals:** explicitly out of scope and conflicts with decisions.
- **Reintroducing per-card explain triggers:** Phase 26 requires a single Catalog Help button.
- **Tier-based “owned” semantics:** Catalog owned/unowned must reflect model ownership (`state.watchModels[entry.id]`) per decisions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Watch purchase gating | Custom “can afford” logic in UI | `getWatchModelPurchaseGate()` | Canonical source of truth for cash + enjoyment gating |
| Purchase state mutation | Direct state edits in components | `buyWatchModel()` + `handlePurchase()` | Keeps domain logic pure and persistence centralized |
| Duplicate preview math | New diminishing-return formulas | `getNextDuplicateRewardMultiplier()` / `getDuplicateRewardMultiplierForNextPurchase()` | Existing tuned constants and floor |
| Help modal navigation | New modal/overlay | `HelpModal` + `ExplainButton`/`useHelp` | Existing persisted help section selection |
| URL parsing | String splitting | `new URLSearchParams(window.location.search)` | Existing repo pattern (used for `?dev`) |

**Key insight:** The domain layer already models the economy (prices, gates, duplicates). Phase 26 should be almost entirely “surface wiring” + UX polish.

## Common Pitfalls

### Pitfall 1: Phase 26 plan docs conflict with locked decisions
**What goes wrong:** Plans implement “existing saves land on Catalog” or show lock reasons *under* a disabled button, conflicting with `26-CONTEXT.md`.
**Why it happens:** The plan templates under `.planning/phases/26-catalog-first-shop/` were authored before the context decisions were locked.
**How to avoid:** Treat `.planning/phases/26-catalog-first-shop/26-CONTEXT.md` as the single source of truth; update/replace plan tasks accordingly.
**Warning signs:** PR/task text says “existing saves default to Catalog” or “disabled CTA + separate lock reason” rather than “CTA replaced by lock reason.”

### Pitfall 2: “Fresh save first session” is hard to detect after mount
**What goes wrong:** App always lands on Catalog, or never does, because “fresh session” is inferred incorrectly.
**Why it happens:** `useGameRuntime()` doesn’t expose `loadSave()` result (empty vs loaded).
**How to avoid:** Decide a concrete signal in planning (recommended: check for presence of `emily-idle:save` at mount) and keep it one-time only.
**Warning signs:** Tab flips after the first render, or initial tab differs between reloads with the same save.

### Pitfall 3: Deep links accidentally overwrite “last tab” persistence
**What goes wrong:** User opens `/?tab=save`, later reloads and unexpectedly lands on Save.
**Why it happens:** Tab persistence is updated by any activation, including deep-link activation.
**How to avoid:** In planning, separate “activation caused by deep link” from “user navigation”, and never write deep-link selections to the last-tab store.
**Warning signs:** Reload behavior changes after testing a deep link.

### Pitfall 4: Owned/unowned filtering still uses tier tags
**What goes wrong:** Catalog “Owned” shows entries because a tier is owned, not because the specific model is owned.
**Why it happens:** Current Catalog filtering infers ownership from entry tags and tier ownership.
**How to avoid:** Switch to `getWatchModelOwnedCount(state, entry.id) > 0` for owned/unowned.
**Warning signs:** Buying a single model doesn’t immediately move it into the Owned view.

### Pitfall 5: Expand/collapse state is lost on filter changes
**What goes wrong:** Expanded card details collapse when the list re-renders (filter/sort/purchase).
**Why it happens:** Uncontrolled `<details>` elements are recreated.
**How to avoid:** Store “open card ids” in component state keyed by `entry.id` (session-only), per decisions.
**Warning signs:** Expand a card, change a filter, and it collapses unexpectedly.

## Code Examples

### Catalog card can buy a model

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

  const owned = state.watchModels[modelId] ?? 0;
  const nextState: GameState = {
    ...state,
    currencyCents: state.currencyCents - gate.cashPriceCents,
    items: {
      ...state.items,
      [tierId]: getItemCount(state, tierId) + 1,
    },
    watchModels: {
      ...state.watchModels,
      [modelId]: owned + 1,
    },
  };

  const withDiscovery = discoverCatalogEntries(nextState, [modelId]);
  return applyAchievementUnlocks(applyMilestoneUnlocks(withDiscovery));
}
```

### Existing purchase-gate UI pattern (Vault) for reference

```tsx
// Source: src/ui/tabs/CollectionTab.tsx
{unlocked && !gate.ok && (
  <div className="purchase-locked" data-testid={`purchase-gate-${model.id}`}>
    <LockIcon className="inline-icon" />
    {gate.blocksBy === "enjoyment" ? (
      <>Requires {formatMoneyFromCents(gate.enjoymentRequiredCents)} enjoyment</>
    ) : (
      <>Need {formatMoneyFromCents(gate.cashDeficitCents ?? 0)} more dollars</>
    )}
  </div>
)}
```

Planning implication: Phase 26’s locked decision changes this presentation (“replace CTA with lock reason”), but this shows how to format gate copy and which fields exist.

## State of the Art

| Old Approach (in this repo) | Current Approach (in this repo) | When Changed | Impact |
|-----------------------------|----------------------------------|--------------|--------|
| Buy watch items by tier in Vault; Catalog is reference/archive | Buy watch models by id (1:1 with Catalog entries) | Phase 25 (dependency) | Enables per-entry pricing/owned/duplicates and makes Catalog a natural purchase surface |

**Deprecated/outdated:**
- Tier-based ownership inference for Catalog (current CatalogTab uses tags + tier ownership); Phase 26 should migrate owned/unowned semantics to model ownership.

## Open Questions

1. **Where should “last visited tab” be persisted (new key vs `emily-idle:settings`)?**
   - What we know: settings are stored under `emily-idle:settings` and are user preferences; no existing “last tab” persistence exists.
   - What's unclear: whether maintainers prefer a separate key (recommended) or adding a field to settings.
   - Recommendation: use a dedicated key (e.g. `emily-idle:navigation`) so preferences and navigation state don’t mix.

2. **Should Vault still expose “Buy” as prominently after Catalog-first?**
   - What we know: Success criteria says Catalog is the primary purchase surface; decisions don’t explicitly forbid buying in Vault.
   - What's unclear: whether Vault Buy CTAs should be removed, demoted, or left as-is.
   - Recommendation: keep Vault functionality intact for now but visually de-emphasize in later phases if needed; Phase 26 focuses on making Catalog excellent.

3. **How should “Undiscovered” visuals interact with a purchase-first Catalog?**
   - What we know: Catalog currently badges undiscovered entries and uses discovery for tier bonuses.
   - What's unclear: whether undiscovered should still be shown as a badge if the player can buy directly.
   - Recommendation: keep the badge as a “not yet in archive shelf” marker, but don’t block purchase on discovery.

## Sources

### Primary (HIGH confidence)
- `package.json` - stack versions
- `src/App.tsx` - tab navigation, help modal wiring, purchase dispatch pattern
- `src/ui/tabs/CatalogTab.tsx` - current Catalog grid structure + existing test ids
- `src/ui/tabs/CollectionTab.tsx` - existing purchase-gate messaging + purchase micro-feedback pattern
- `src/game/actions/index.ts` - `buyWatchModel` implementation
- `src/game/selectors/watchModels.ts` - model ownership, price, and purchase gate shape
- `src/game/data/watchModels.ts` - model id == catalog entry id mapping
- `src/game/model/state.ts` - save restore behavior for `watchModels` (migration fallback)
- `tests/catalog.unit.test.tsx` - current Catalog unit coverage patterns and selectors

### Secondary (MEDIUM confidence)
- https://react.dev/reference/react/useEffect - React effect semantics (useful when implementing one-time landing logic without StrictMode pitfalls)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions from `package.json`
- Architecture: HIGH - based on existing repo patterns and domain APIs
- Pitfalls: MEDIUM - derived from observed code + known integration risks

**Research date:** 2026-01-28
**Valid until:** 2026-02-27
