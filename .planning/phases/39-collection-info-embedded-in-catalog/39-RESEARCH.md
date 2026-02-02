# Phase 39: Collection Info Embedded in Catalog - Research

**Researched:** 2026-02-02
**Domain:** React UI (Catalog tab) + copy alignment ("Vault" -> "Collection")
**Confidence:** MEDIUM

## Summary

Phase 39 is a UI-only consolidation follow-on: the Catalog purchase surface already exists (`src/ui/tabs/CatalogTab.tsx#CatalogPurchasePanel`) and the domain already computes collection value (`getCollectionValueCents`). The missing pieces for this phase are (1) surfacing collection context (capacity + value) in the Catalog shopping header and (2) renaming the player-facing “Vault” label/copy to “Collection” without changing selectors or persistence.

The main planning risk is that “capacity (current/max)” is not currently a first-class concept in the domain: there is `getTotalItemCount(state)` (current count), but no canonical “max capacity” selector or state field. Planning must explicitly define what “max” means without introducing new mechanics or changing `buyWatchModel` semantics.

**Primary recommendation:** Add a small “Collection context” block to the Catalog header using existing selectors (`getTotalItemCount`, `getCollectionValueCents`) and define “max capacity” as a derived, display-only threshold (recommended: the next not-yet-unlocked `totalItems` milestone threshold). Then update UI strings to consistently say “Collection” while keeping all `id`/`data-testid` selectors and localStorage keys unchanged.

## Standard Stack

No new libraries should be introduced for Phase 39.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI | Existing app |
| typescript | ^5.8.0 | Type safety | Existing strict TS |
| vite | ^6.0.0 | Build tooling | Existing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | (repo) | Unit tests | Update tab name/copy assertions |
| @playwright/test | (repo) | E2E tests | Update tab name/copy assertions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Display-only capacity derived from existing state | New “capacity” mechanic/state | Out of scope for a consolidation milestone; would change purchase semantics |

**Installation:**
```bash
# No new dependencies expected for Phase 39
```

## Architecture Patterns

### Where This Phase Lives

- **Catalog shopping UI:** `src/ui/tabs/CatalogTab.tsx` (active path is `CatalogTab` -> `CatalogPurchasePanel`)
- **Collection value (Memories):** `src/game/model/state.ts#getCollectionValueCents` (re-exported by `src/game/state.ts`)
- **Total owned watch count:** `src/game/model/state.ts#getTotalItemCount` (re-exported by `src/game/state.ts`)
- **Tab label “Vault”:** `src/App.tsx` (`TAB_DEFINITIONS` has `{ id: "collection", label: "Vault" }`)

### Pattern 1: Catalog Header “Context Block” (display-only)
**What:** Render a compact inline block in the Catalog purchase header showing capacity + value.
**When to use:** Always in `CatalogPurchasePanel` so the info is visible “while shopping.”
**Example (recommended):**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
import {
  getCollectionValueCents,
  getMilestones,
  getTotalItemCount,
  type GameState,
} from "../../game/state";
import { formatMoneyFromCents } from "../../game/format";

function getNextTotalItemsThreshold(state: GameState): number | null {
  const owned = getTotalItemCount(state);
  const milestones = getMilestones().filter((m) => m.requirement.type === "totalItems");
  const next = milestones
    .filter((m) => !state.unlockedMilestones.includes(m.id))
    .map((m) => (m.requirement.type === "totalItems" ? m.requirement.threshold : 0))
    .filter((threshold) => threshold > owned)
    .sort((a, b) => a - b)[0];

  return Number.isFinite(next) ? next : null;
}

const owned = getTotalItemCount(state);
const max = getNextTotalItemsThreshold(state);
const memories = formatMoneyFromCents(getCollectionValueCents(state));

// Render something like:
// Collection size: {owned} / {max ?? "--"} · Memories: {memories}
```

**Notes:**
- This keeps changes UI-only. No changes to `buyWatchModel` or purchase gating.
- The “max” definition is the key planning decision (see Open Questions).

### Pattern 2: Copy Rename Without Selector Renames
**What:** Replace visible strings “Vault” -> “Collection” while leaving selectors and IDs unchanged.
**When to use:** Anywhere UI uses a visible label, title, paragraph, or help text.
**Examples (must preserve selectors):**
```ts
// Source: src/App.tsx
// Keep tab id "collection" and DOM id "collection-tab" stable; only change label.
{ id: "collection", label: "Collection" }
```

```tsx
// Source: src/ui/tabs/CatalogTab.tsx
// Keep data-testid stable even if it contains the word "vault".
<button data-testid={`vault-interact-${tierId}`}>…</button>
```

### Anti-Patterns to Avoid
- **Changing purchase semantics:** do not add a capacity check to `buyWatchModel` in this phase.
- **Renaming selectors:** do not change existing `id`/`data-testid` strings (e.g. `catalog-shop`, `catalog-buy-*`, `catalog-gate-*`, `vault-interact-*`).
- **Changing persistence keys:** do not change `emily-idle:save`, `watch-idle:save`, or navigation/settings localStorage keys.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collection value | Custom per-card summation | `getCollectionValueCents(state)` | Already canonical and used for milestones/achievements |
| Watch count | Manual loops over items | `getTotalItemCount(state)` | Canonical watch-count definition in domain |
| Currency formatting | Inline string concatenation | `formatMoneyFromCents` | Consistent formatting everywhere |
| Purchase gating | New UI-only rules | `getWatchModelPurchaseGate` + `isItemUnlocked` | Keeps eligibility single-source-of-truth |

**Key insight:** Phase 39 should only *surface* collection context; it should not invent new rules.

## Common Pitfalls

### Pitfall 1: “Capacity” meaning is undefined in the current domain
**What goes wrong:** The plan tries to display “current/max capacity” but the codebase has no “max capacity” selector/state.
**Why it happens:** Only `getTotalItemCount(state)` exists; there is no inventory limit mechanic.
**How to avoid:** Treat “max” as a display-only threshold derived from existing definitions (recommended: next not-yet-unlocked `totalItems` milestone threshold).
**Warning signs:** The plan starts adding new fields to `GameState` or adding new checks to `buyWatchModel`.

### Pitfall 2: Missing “Vault” strings outside the tab label
**What goes wrong:** The tab reads “Collection” but other player-facing areas still say “Vault,” violating success criteria.
**Why it happens:** “Vault” appears in many UI components and also in game data strings (milestones/achievements).
**How to avoid:** Use a targeted grep for `\bvault\b` / `\bVault\b` and update visible UI copy while preserving selectors.
**Warning signs:** Playwright screenshot/UA tests still show “Vault” in headers, help, or stats.

### Pitfall 3: Breaking tests that locate tabs by name
**What goes wrong:** Tests fail because they click the “Vault” tab by role/name.
**Why it happens:** Many tests use `getByRole("tab", { name: "Vault" })` or assert text like “Vault enjoyment”.
**How to avoid:** Update tests to use “Collection” for the accessible name, but keep internal ids stable (`collection-tab`, `aria-controls="collection"`).
**Warning signs:** Failures in `tests/catalog.unit.test.tsx`, `tests/collection-loop.spec.ts`, `tests/ui-screenshots.spec.ts`, `tests/uat-screenshots.spec.ts`.

## Code Examples

### 1) Collection value (Memories)
```ts
// Source: src/game/model/state.ts
export function getCollectionValueCents(state: GameState): number {
  return Object.entries(state.watchModels).reduce((total, [modelId, rawOwned]) => {
    // …sum tier.collectionValueCents * duplicateRewardSum(owned)
  }, 0);
}
```

### 2) Collection size (total owned watches)
```ts
// Source: src/game/model/state.ts
export function getTotalItemCount(state: GameState): number {
  return WATCH_ITEMS.reduce((total, item) => total + (state.items[item.id] ?? 0), 0);
}
```

### 3) Catalog purchase header insertion point
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
<header className="panel-header catalog-header">
  <div>
    <p className="eyebrow">Catalog</p>
    <h2>Catalog</h2>
    <p className="muted">Buy watches directly from catalog cards…</p>
  </div>
  <div className="catalog-header-actions">
    {/* Add collection context block here (capacity/value) */}
    <div className="results-count" data-testid="catalog-results-count">…</div>
    <div className="catalog-help" data-testid="catalog-help">…</div>
  </div>
</header>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate Vault shop vs Catalog archive | Catalog is the canonical purchase surface | Phases 37-38 | Shopping context now belongs in the Catalog UI |
| “Vault” as primary collection naming | Mixed “Vault”/“Collection” copy | Current | Phase 39 should standardize on “Collection” in player-facing text |

**Deprecated/outdated (after Phase 39):**
- Player-facing “Vault” naming in tab labels and core copy.

## Open Questions

1. **What is “max collection capacity” in this codebase?**
   - What we know: There is no explicit capacity limit in `GameState` or purchase gating; only a current count (`getTotalItemCount`).
   - What's unclear: Whether “capacity” is meant to be an inventory limit, a progress-to-next-unlock threshold, or a completion metric.
   - Recommendation (default for planning): Define `max` as the next not-yet-unlocked milestone with `requirement.type === "totalItems"` (e.g. 5 -> 50). This is display-only and uses existing milestone data.

2. **How far should the “Vault” -> “Collection” rename go?**
   - What we know: Many strings in `src/ui/*` and some in `src/game/data/*` are player-facing.
   - What's unclear: Whether milestone/achievement names/descriptions must be renamed in this phase.
   - Recommendation (default for planning): Update all UI copy and help text first; only update milestone/achievement display strings if they appear in player-visible surfaces that are explicitly part of the “Collection” loop (Milestones/Achievements panels).

## Sources

### Primary (HIGH confidence)
- `src/ui/tabs/CatalogTab.tsx` - shopping UI surface and best insertion point for collection context
- `src/game/model/state.ts` - `getTotalItemCount`, `getCollectionValueCents`
- `src/App.tsx` - `TAB_DEFINITIONS` label “Vault” and hero copy
- `src/ui/help/helpContent.ts` - many “Vault” references in player-facing help

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` - VLT-01/VLT-02/VLT-04 requirements framing (capacity/value/naming)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - existing repo stack and patterns
- Architecture: HIGH - direct code inspection of CatalogTab/App/state selectors
- Capacity definition: MEDIUM - “max” is not currently encoded; requires a planning decision
- Copy scope: MEDIUM - many occurrences; must decide whether to include milestone/achievement strings

**Research date:** 2026-02-02
**Valid until:** 2026-03-03
