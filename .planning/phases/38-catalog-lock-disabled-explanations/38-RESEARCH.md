# Phase 38: Catalog Lock + Disabled Explanations - Research

**Researched:** 2026-02-02
**Domain:** React UI (Catalog cards) + pure purchase/discovery selectors
**Confidence:** HIGH

## Summary

Phase 38 is a UI/UX surfacing phase over already-existing state and gate logic. The game already tracks catalog discovery via `state.discoveredCatalogEntries` (persisted in saves) and already computes purchase availability via `isItemUnlocked(state, tierId)` and `getWatchModelPurchaseGate(state, modelId)` (cash/enjoyment only). The Catalog UI already renders undiscovered entries (via `catalog-locked` styling + an “Undiscovered” badge) and renders disabled purchase states as `catalog-gate-*` chips (“Locked”, “Requires …”, “Need … more”).

To plan this phase well, treat it as a presentation/refactor job:
- Make the “undiscovered” visual state explicitly read as “locked” by adding a lock icon overlay (without hiding cards).
- Add a contextual “Why can’t I buy?” explanation UI for any disabled purchase action *without changing existing buy/gate selectors that tests depend on*.
- Avoid duplicating purchase gate logic: reuse existing selectors’ computed values (unlocked + gate object + unlock progress detail) and only format them for display.

**Primary recommendation:** Keep `catalog-buy-*` rendering rules unchanged; add a new inline explanation affordance next to/under `catalog-gate-*`, and add a lock icon overlay for `!discovered` cards.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI rendering | Existing app framework |
| typescript | ^5.8.0 | Type safety | Repo-wide strict TS |
| vite | ^6.0.0 | Build/dev server | Existing tooling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icon components | Use existing `LockIcon` for lock overlay |
| vitest | ^1.6.0 | Unit tests | Add selector/UI unit tests |
| @playwright/test | ^1.49.1 | E2E tests | Add a smoke test for lock/explanation UX |
| @testing-library/react | ^16.1.0 | Component testing | Assert new explanation UI shows correct content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New tooltip/popover library | Custom popover/tooltip libs | Not needed; repo already uses plain inline UI patterns (`<details>`, chips, hint cards) |

## Architecture Patterns

### Current Data Flow (Keep This)

- **Discovery state** is stored in `GameState.discoveredCatalogEntries: string[]` and persisted.
- **Discovery updates** occur in actions (not UI): `discoverCatalogEntries()` is called from `buyWatchModel()` (and other purchase actions) and also updates tier unlocks.
- **Purchase gating** is computed from:
  - `isItemUnlocked(state, tierId)` (milestone/nostalgia unlock gating)
  - `getWatchModelPurchaseGate(state, modelId)` (cash/enjoyment gating)
  - UI-level unlock progress details via `getMilestoneUnlockProgressDetail(state, unlockMilestoneId)`

Relevant sources:
- `src/game/model/types.ts` (persisted fields)
- `src/game/actions/index.ts` (`discoverCatalogEntries`, `buyWatchModel`)
- `src/game/selectors/watchModels.ts` (`getWatchModelPurchaseGate`)
- `src/game/selectors/index.ts` (`isItemUnlocked`, `getCatalogDiscovery`)
- `src/ui/tabs/CatalogTab.tsx` (card rendering)

### Recommended Project Structure (for Phase 38 work)

`src/ui/tabs/CatalogTab.tsx` is currently very large and duplicates card rendering for “unowned” and “owned”. For Phase 38 changes (lock icon + explanations), plan to extract reusable pieces so logic stays consistent.

Recommended additions:
```
src/ui/components/catalog/
├── CatalogCard.tsx                 # shared card rendering (unowned/owned toggle props)
├── CatalogPurchaseGate.tsx         # renders buy button vs gate chip + "Why can't I buy?" trigger
└── CatalogDisabledExplanation.tsx  # inline explanation panel (pure formatting)
```

If refactoring is too risky, at minimum extract a helper to render the gate/explanation block and use it in both duplicated sections.

### Pattern 1: Discovery State = Visual Treatment (Not a Gate)
**What:** Treat `discoveredCatalogEntries` as an “archive/reference discovered” flag that changes styling and secondary UI, not purchase eligibility.
**When to use:** Always; discovery drives the “Archive shelf” section and tier bonus progress.
**Example:**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
const discovered = discoveredCatalogIds.includes(entry.id);
<article className={`catalog-card ${discovered ? "catalog-discovered" : "catalog-locked"}`}>
  {!discovered && <span className="catalog-badge">Undiscovered</span>}
</article>
```

### Pattern 2: Disabled Purchase = Explain Using Existing Computations
**What:** Compute “why disabled” by combining existing booleans/objects already computed for rendering.
**When to use:** Whenever `catalog-buy-*` is not rendered and `catalog-gate-*` is rendered.
**Example:**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx + src/game/selectors/watchModels.ts
const unlocked = isItemUnlocked(state, tierId);
const gate = getWatchModelPurchaseGate(state, entry.id);

if (!unlocked) {
  // explanation should reuse unlockDetail from getMilestoneUnlockProgressDetail()
}

if (!gate.ok) {
  // explanation should use gate.enjoymentDeficitCents and/or gate.cashDeficitCents
  // (do not recompute price/requirements in UI)
}
```

### Anti-Patterns to Avoid
- **Changing `catalog-buy-*` semantics:** tests rely on *absence* of buy buttons when gated (locked/insufficient funds).
- **Duplicating gate math in UI:** do not re-derive deficits/prices; use `getWatchModelPurchaseGate()` output.
- **Touching persistence keys/shape:** `discoveredCatalogEntries` is part of save v2; do not rename or migrate in Phase 38.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Purchase-gate computation | Recompute prices/deficits in React | `getWatchModelPurchaseGate()` | Keeps logic single-source-of-truth; avoids drift |
| Unlock eligibility | New “locked” rules in UI | `isItemUnlocked()` + `getMilestoneUnlockProgressDetail()` | Existing, consistent with milestones |
| Icons | Inline SVGs for locks | `LockIcon` (`lucide-react`) | Already used + consistent styling |
| Popovers/tooltips | New dependency | Inline expandable block (`<details>` or simple toggle state) | Avoid extra complexity; easier to test |

**Key insight:** The domain already tells you whether purchase can happen; Phase 38 should only format and present those reasons.

## Common Pitfalls

### Pitfall 1: Breaking test selector expectations
**What goes wrong:** Switching to always render a disabled “Buy” button will break tests that assert `catalog-buy-*` count is 0 when gated.
**Why it happens:** Tests select by `[data-testid^="catalog-buy-"]` and treat “no button” as the gated state.
**How to avoid:** Keep `catalog-buy-*` only when `unlocked && gate.ok`; add new explanation UI separately.
**Warning signs:** Playwright specs like `tests/collection-loop.spec.ts` start failing around assertions for locked tiers.

### Pitfall 2: Only showing one reason when multiple apply
**What goes wrong:** Current UI displays only `gate.blocksBy`, which is a single “primary” reason.
**Why it happens:** `blocksBy` chooses enjoyment-first when both are missing.
**How to avoid:** Explanation UI should list both deficits when present by checking `gate.enjoymentDeficitCents` and `gate.cashDeficitCents` (independent of `blocksBy`).
**Warning signs:** Players see “Requires enjoyment …” but still can’t buy after meeting enjoyment because cash is still short.

### Pitfall 3: Confusing “undiscovered” with “unlocked”
**What goes wrong:** Adding a lock icon that implies “can’t buy” to entries that are simply not yet discovered.
**Why it happens:** Discovery is a separate axis from purchase eligibility.
**How to avoid:** Use copy/affordances that clarify the lock is for “reference discovered” rather than “purchase locked” (or visually distinguish tier-locked vs undiscovered).
**Warning signs:** Actionable cards look locked without any purchase affordance; players assume they can’t buy.

### Pitfall 4: “Capacity” reason is not implemented in v3.2 Phase 38
**What goes wrong:** Trying to add new capacity mechanics contradicts milestone constraint (“UI/UX consolidation without new domain features”).
**Why it happens:** Success criteria mentions capacity as an example, but capacity display is explicitly Phase 39 (VLT-01).
**How to avoid:** Design the explanation UI as a list of reasons so Phase 39 can add a capacity reason without reworking the UI component.
**Warning signs:** You start adding new state fields or new purchase denial logic in `buyWatchModel()`.

## Code Examples

### 1) Discovery Tracking (Save-backed)
```ts
// Source: src/game/model/types.ts
export type GameState = {
  // ...
  discoveredCatalogEntries: CatalogEntryId[];
};
```

```ts
// Source: src/game/actions/index.ts
export function buyWatchModel(state: GameState, modelId: string): GameState {
  const tierId = getWatchModelTierId(modelId);
  if (!isItemUnlocked(state, tierId)) return state;
  const gate = getWatchModelPurchaseGate(state, modelId);
  if (!gate.ok) return state;

  const nextState = { /* deduct cash, increment counts */ };
  const withDiscovery = discoverCatalogEntries(nextState, [modelId]);
  return applyAchievementUnlocks(applyMilestoneUnlocks(withDiscovery));
}
```

### 2) Existing “Disabled State” Rendering Hook Points
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
if (!unlocked) {
  return <div className="catalog-gate" data-testid={`catalog-gate-${entry.id}`}>Locked</div>;
}

if (!gate.ok) {
  return (
    <div className="catalog-gate" data-testid={`catalog-gate-${entry.id}`}>
      {/* currently shows only gate.blocksBy */}
    </div>
  );
}
```

### 3) Lock Icon Availability
```tsx
// Source: src/ui/icons/coreIcons.tsx
export function LockIcon(props: React.ComponentProps<typeof Lock>): JSX.Element {
  return <Lock {...props} aria-hidden={true} focusable={false} />;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hide undiscovered catalog content | Show undiscovered cards with `catalog-locked` styling | Phase 37 era (already in repo) | Players see the full catalog surface; discovery becomes a styling/collection-book feature |
| Generic “Locked”/“Need more” chips only | Chips + explicit “Why can’t I buy?” explanation affordance | Phase 38 | Removes confusion; makes gating actionable |

**Outdated for this phase:** Building new mechanics (capacity limits) is deferred to Phase 39 per `.planning/REQUIREMENTS.md`.

## Open Questions

1. **What exactly should the lock icon mean to the player?**
   - What we know: `catalog-locked` currently means “undiscovered reference”; purchase can still be available.
   - What's unclear: Whether the lock icon should represent “undiscovered reference” or “purchase locked”.
   - Recommendation: Use a lock icon + “Undiscovered” label for discovery, but ensure tier-locked states still show “Locked” in the gate chip and include unlock requirement in the explanation.

2. **Should explanations include both cash + enjoyment deficits when both apply?**
   - What we know: selector includes both deficits when >0.
   - What's unclear: desired copy ordering/verbosity.
   - Recommendation: Show both deficits in the expanded explanation; keep the gate chip concise.

## Sources

### Primary (HIGH confidence)
- `src/ui/tabs/CatalogTab.tsx` - discovery styling, purchase chip rendering, selector usage
- `src/game/actions/index.ts` - `discoverCatalogEntries`, `buyWatchModel`
- `src/game/selectors/watchModels.ts` - `getWatchModelPurchaseGate` (cash/enjoyment)
- `src/game/selectors/index.ts` - `isItemUnlocked`, `getCatalogDiscovery`
- `src/game/model/types.ts` - persisted `discoveredCatalogEntries`
- `src/style.css` - `.catalog-locked` grayscale styling and gate chip styles
- `src/ui/icons/coreIcons.tsx` - `LockIcon` (lucide-react)
- `tests/catalog.unit.test.tsx`, `tests/collection-loop.spec.ts` - selector stability constraints (`catalog-buy-*`, `catalog-gate-*`)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions from `package.json`
- Architecture: HIGH - confirmed by repo structure and current CatalogTab implementation
- Pitfalls: HIGH - confirmed by existing unit/e2e tests relying on current selectors

**Research date:** 2026-02-02
**Valid until:** 2026-03-04
