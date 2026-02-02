# Phase 40: Upgrade Status + Copy Alignment - Research

**Researched:** 2026-02-02
**Domain:** React UI surfacing upgrade status + copy/preview correctness for enjoyment-only upgrade economy
**Confidence:** HIGH

## Summary

Phase 40 is primarily a UI/copy alignment pass on top of the already-shipped catalog consolidation work (Phases 37-39). The codebase already models upgrades as affecting *enjoyment/sec* (not dollars/sec), and the simulation step uses a career-salary-driven cash rate (`getEffectiveCashRateCentsPerSec`) plus an enjoyment rate (`getEnjoymentRateCentsPerSec`). However, several UI surfaces still label upgrade effects as “cash” and the upgrade preview UI shows cash lines that can imply upgrades affect cash.

Upgrade status is not currently surfaced in the Catalog header; the Catalog header already has a stable “collection context” pill (`data-testid="catalog-collection-context"`) that shows Collection capacity/value, and it is the natural place to add an adjacent “upgrade status” context element without introducing a separate upgrades surface.

**Primary recommendation:** Add a Catalog header “upgrade status” summary derived from existing selectors (counts + enjoyment multipliers), and scrub all upgrade-related UI copy/preview rendering so nothing implies cash multipliers.

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|---|---:|---|---|
| React | 18.x | UI | Existing app stack (`src/ui/tabs/*`) |
| TypeScript | strict | Types + safety | Existing repo conventions |
| Vite | - | Dev/build | Existing app scaffold |

### Testing
| Library/Tool | Purpose | Where |
|---|---|---|
| Vitest + Testing Library | Unit tests | `tests/**/*.unit.test.tsx` |
| Playwright | E2E tests | `tests/**/*.spec.ts` |

## Architecture Patterns

### Recommended Project Structure
Follow existing separation:

```
src/
├── ui/
│   ├── tabs/                # tab panels (selectors stable)
│   └── catalog/             # catalog-only UI helpers (derived context)
└── game/
    ├── data/                # upgrade definitions + copy strings
    ├── selectors/           # pure computations (multipliers, rates)
    └── actions/             # state transitions (buyUpgrade, etc.)
```

### Pattern 1: “Catalog context” helper modules
**What:** Compute small UI-ready summaries from `GameState` in `src/ui/catalog/*`.
**Where it exists:** `src/ui/catalog/collectionContext.ts`.
**Use for Phase 40:** Add a sibling helper (e.g. `src/ui/catalog/upgradeContext.ts`) that computes:
- counts (levels/owned/active)
- effective enjoyment multipliers for upgrade-related sources

**Example:**
```ts
// Source: src/ui/catalog/collectionContext.ts
export function getCatalogCollectionContext(state: GameState) {
  const ownedCount = getTotalItemCount(state);
  const collectionValueCents = getCollectionValueCents(state);
  // ...derive nextThreshold...
  return { ownedCount, maxCapacity, collectionValueCents };
}
```

### Pattern 2: Preview “before/after” by applying actions, then reading selectors
**What:** Build previews by computing `nextState` with an action (e.g. `buyUpgrade`) and then calling selectors for the derived values.
**Where it exists:** `src/ui/tabs/UpgradesTab.tsx` uses `buyUpgrade(...)` + rate selectors.
**Use for Phase 40:** Keep the pattern, but ensure the preview only shows enjoyment changes (cash lines only when affected).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Enjoyment accrual math | Duplicate formulas in UI | `getEnjoymentRateCentsPerSec`, `getEnjoymentRateBreakdown` | Keeps previews aligned with simulation |
| Upgrade multipliers | Recompute from raw state in components | `getUpgradeIncomeMultiplier`, `getWorkshopIncomeMultiplier`, `getMaisonIncomeMultiplier` | Single source of truth |
| Upgrade availability/unlocks | New gating logic | `isUpgradeUnlocked`, `canBuy*Upgrade` | Prevents copy drift and mismatches |

**Key insight:** UI should present upgrade status by composing existing selectors; the “truth” is already centralized in `src/game/selectors/*` and `src/game/actions/*`.

## Common Pitfalls

### Pitfall 1: “incomeMultiplier” mislabeled as cash
**What goes wrong:** Several UI surfaces display `incomeMultiplier` effects as “% cash”, but in the current economy those multipliers apply to *enjoyment/sec*.
**Evidence:**
- `src/ui/tabs/WorkshopTab.tsx` renders `incomeMultiplier` as `"% cash"`.
- `src/ui/tabs/MaisonTab.tsx` renders `incomeMultiplier` as `"% cash"`.
- `src/ui/tabs/CollectionTab.tsx` renders Maison line `incomeMultiplier` as `"% cash"`.
**How to avoid:** Treat all upgrade `incomeMultiplier` labels in UI as enjoyment-related unless a selector explicitly ties them to cash.

### Pitfall 2: Upgrade previews imply cash changes
**What goes wrong:** The upgrade preview UI includes Cash “Before/After” lines even when upgrades never affect cash rate.
**Evidence:** `src/ui/tabs/UpgradesTab.tsx` renders cash preview lines unconditionally; existing unit test only asserts the *delta chip* “Cash +” does not appear (`tests/upgrades-preview.unit.test.tsx`).
**How to avoid:** Show cash lines only when `beforeCash !== afterCash`, or explicitly label cash as “Unaffected”.

### Pitfall 3: Using the wrong cash-rate selector
**What goes wrong:** The codebase contains a legacy-ish “income” system (`getRawIncomeRateCentsPerSec` / softcap) that is not used for currency accrual in the simulation.
**Evidence:** `src/game/sim.ts` uses `getEffectiveCashRateCentsPerSec` (career salary) for `currencyCents` and uses `getEnjoymentRateCentsPerSec` for `enjoymentCents`.
**How to avoid:** For any player-visible “cash/sec” claims, anchor to `getEffectiveCashRateCentsPerSec` / `getCashRateBreakdown`.

### Pitfall 4: Breaking stable selectors while adding catalog status
**What goes wrong:** Tests rely on stable IDs/testids.
**Evidence:**
- Unit test checks `data-testid="catalog-collection-context"` content (`tests/catalog.unit.test.tsx`).
- E2E checks `data-testid="upgrades-callout"` (`tests/collection-loop.spec.ts`).
**How to avoid:** Add new elements (new testids) rather than renaming existing ones; keep `catalog-collection-context` semantics intact.

## Code Examples

### Catalog upgrade status (counts + multipliers)
```ts
// Source: src/game/selectors/index.ts, src/game/selectors/incomeMultipliers.ts
import {
  getUpgrades,
  getWorkshopUpgrades,
  getMaisonUpgrades,
  getMaisonLines,
  getUpgradeIncomeMultiplier,
  getWorkshopIncomeMultiplier,
  getMaisonUpgradeIncomeMultiplier,
  getMaisonLineIncomeMultiplier,
  type GameState,
} from "../../game/state";

export function getCatalogUpgradeContext(state: GameState) {
  const upgrades = getUpgrades();
  const workshopUpgrades = getWorkshopUpgrades();
  const maisonUpgrades = getMaisonUpgrades();
  const maisonLines = getMaisonLines();

  const totalUpgradeLevels = upgrades.reduce((sum, def) => sum + (state.upgrades[def.id] ?? 0), 0);
  const workshopOwned = workshopUpgrades.filter((u) => state.workshopUpgrades[u.id]).length;
  const maisonOwned = maisonUpgrades.filter((u) => state.maisonUpgrades[u.id]).length;
  const maisonLinesActive = maisonLines.filter((l) => state.maisonLines[l.id]).length;

  return {
    totalUpgradeLevels,
    workshopOwned,
    workshopTotal: workshopUpgrades.length,
    maisonOwned,
    maisonTotal: maisonUpgrades.length,
    maisonLinesActive,
    maisonLinesTotal: maisonLines.length,
    multipliers: {
      upgradeLevels: getUpgradeIncomeMultiplier(state),
      workshop: getWorkshopIncomeMultiplier(state),
      maisonUpgrades: getMaisonUpgradeIncomeMultiplier(state),
      maisonLines: getMaisonLineIncomeMultiplier(state),
    },
  };
}
```

### Upgrade preview: show only the stats that can change
```tsx
// Source: src/ui/tabs/UpgradesTab.tsx
const preview = buildRatePreview(state, nextState, currentEventMultiplier);

// Render enjoyment always.
// Render cash only when it changes (prevents implying cash multipliers).
```

## State of the Art

| Legacy naming in code | Current player truth | Evidence | Impact |
|---|---|---|---|
| `incomeMultiplier` fields | Enjoyment/sec multiplier | `src/game/selectors/enjoyment.ts` applies workshop/maison multipliers to enjoyment | UI copy must say “enjoyment”, not “cash” |
| “Upgrades live in their own tab” | Status should be visible while shopping | Phase 40 success criteria + `src/ui/tabs/CatalogTab.tsx` header is the shopping surface | Add catalog status summary without removing the tab |

**Outdated (for player-facing copy):**
- Any UI string that implies upgrades multiply dollars/sec.

## Open Questions

1. **Should Phase 40 only surface status, or also allow purchasing upgrades from Catalog?**
   - What we know: Success criteria requires status visibility “without requiring a separate upgrades surface.”
   - What's unclear: Whether buying upgrades from Catalog is desired.
   - Recommendation: Plan to surface status + provide a navigation link to Upgrades; do not add a new purchase flow unless explicitly required.

2. **How should “softcap” be described in upgrade previews?**
   - What we know: Softcap is calculated from `getEffectiveIncomeRateCentsPerSec` vs raw income (`getSoftcapEfficiency`) and is displayed in UI, while cash accrual uses career salary.
   - What's unclear: Whether players interpret softcap as affecting cash or enjoyment.
   - Recommendation: Treat softcap copy as “collection efficiency” (not dollars/sec) and ensure no upgrade copy implies it affects career salary.

## Sources

### Primary (HIGH confidence)
- `src/game/sim.ts` (currency + enjoyment accrual)
- `src/game/selectors/enjoyment.ts` (enjoyment rate formula)
- `src/game/selectors/index.ts` (cash rate, breakdowns, softcap)
- `src/ui/tabs/CatalogTab.tsx` (catalog header + collection context pill)
- `src/ui/tabs/UpgradesTab.tsx` (current upgrade preview + copy)
- `src/ui/tabs/WorkshopTab.tsx`, `src/ui/tabs/MaisonTab.tsx`, `src/ui/tabs/CollectionTab.tsx` (mislabelled “% cash” strings)
- `src/ui/help/helpContent.ts` (upgrade help copy)
- `tests/catalog.unit.test.tsx`, `tests/upgrades-preview.unit.test.tsx`, `tests/collection-loop.spec.ts` (selector stability expectations)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - established by repo structure and existing tests.
- Architecture: HIGH - patterns already present (catalog context helpers + selector-driven previews).
- Pitfalls: HIGH - directly evidenced by current UI strings and selector usage.

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days; codebase-specific)
