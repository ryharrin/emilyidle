# Phase 21: Explanations & Rate Transparency - Research

**Researched:** 2026-01-26
**Domain:** React UI contextual explanations + derived-rate breakdowns (cash/enjoyment)
**Confidence:** HIGH

## Summary

Phase 21 is primarily about surfacing existing game rules (currencies, gates, and rate math) at point-of-use without changing gameplay. The core implementation work is (1) building a small, canonical “explanations registry” that UI can open from anywhere (tap/click, not hover-only) and (2) adding pure selector helpers that return a structured cash/enjoyment rate breakdown (base + modifiers) so the UI can show transparent math.

The repo already has tap/click-friendly disclosure patterns that should be reused instead of introducing a tooltip library: overlay modals with `role="dialog" aria-modal="true"` (Nostalgia confirmations; wind session modal) and inline `<details>/<summary>` accordions (Catalog “Collector notes”). Purchase gating and rate formulas already exist in `src/game/selectors/index.ts`; the phase should expose those internals in a “breakdown” shape rather than re-deriving formulas in the UI.

**Primary recommendation:** Implement selector-level `getCashRateBreakdown(...)` + `getEnjoymentRateBreakdown(...)` and a single UI explanation entrypoint component (reusing the existing modal or `<details>` patterns) that can be invoked contextually from Stats and from purchase-lock states.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI framework | Existing app stack (`package.json`) |
| typescript | ^5.8.0 | Type safety | Existing app stack (`package.json`) |
| vite | ^6.0.0 | Build/dev | Existing app stack (`package.json`) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (built-in) `<details>/<summary>` | n/a | Tap/click disclosure | Use for lightweight “show breakdown” sections (already used in Catalog) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<details>/<summary>` + existing modal pattern | Tooltip/popover library | Tooltip libs are often hover-first and add a11y + mobile complexity; out of scope and unnecessary for this phase |

**Installation:**
```bash
# No new deps required for Phase 21.
```

## Architecture Patterns

### Recommended Project Structure
This phase will be easiest to plan and verify if explanation content and breakdown computations are each centralized.

```
src/
├── game/
│   └── selectors/
│       ├── index.ts                 # add breakdown selector exports
│       └── rateBreakdowns.ts        # new: cash/enjoyment breakdown helpers (pure)
└── ui/
    ├── help/
    │   ├── explanations.ts          # new: canonical explanation registry (title/body/links)
    │   └── ExplainButton.tsx        # new: small button that opens explanation by id
    └── tabs/
        ├── StatsTab.tsx             # add rate breakdown + explain affordances
        └── CollectionTab.tsx        # add gate explanations for both enjoyment/cash
```

### Pattern 1: Canonical Explanation Registry (Point-Of-Use)
**What:** A single map of `explanationId -> { title, body, bullets, relatedIds }` used by UI everywhere.
**When to use:** Any time the UI shows jargon/currency/gate/rate labels (GUIDE-02).
**How:** `ExplainButton` takes an `explanationId` and triggers a consistent, tap-friendly surface (existing overlay modal pattern, or inline `<details>` where appropriate).

### Pattern 2: Selector-Level Rate Breakdowns (Not UI Math)
**What:** Pure selectors that return a structured breakdown used to render “base + modifiers” transparently.
**When to use:** Stats rate transparency (CLAR-03).
**How:** Implement breakdown functions next to existing formulas in `src/game/selectors/index.ts` (or a sibling module) and keep UI formatting in `src/game/format.ts`.

### Pattern 3: Gate Explanation at Point Of Failure
**What:** When a purchase is blocked, show (a) what is missing and (b) why the gate exists (enjoyment gate vs cash spend).
**When to use:** Collection purchase buttons and Nostalgia unlock cards (GUIDE-03).
**How:** Reuse existing gate data returned by `getWatchPurchaseGate` (deficits and `blocksBy`) and add a consistent “Explain” affordance.

### Anti-Patterns to Avoid
- **Hover-only tooltips:** violates explicit mobile/touch constraint and the project’s “Out of Scope” requirement.
- **Recomputing formulas in UI:** will drift from simulation; keep formulas in selectors and return a breakdown shape.
- **Sprinkling explanation strings inline in many tabs:** use one registry so wording stays consistent and updates are atomic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| “Tooltip system” | Custom hover/click tooltip/popover implementation | Existing overlay modal (`role="dialog"`) or native `<details>` disclosure | Avoids mobile/a11y pitfalls and keeps UI consistent |
| Rate math duplication | Copying the cash/enjoyment formulas into React components | Selector helpers that return a breakdown object | Prevents UI/sim mismatches and keeps tests focused |
| Gate condition reconstruction | Re-deriving requirements from item data in UI | `getWatchPurchaseGate` + its returned deficits | Centralized logic; already used for disabling buttons |

**Key insight:** The game already has authoritative “truth” in `src/game/selectors/index.ts` and `src/game/sim.ts`; Phase 21 should expose that truth in user-facing wording and breakdown structures, not introduce new computation paths.

## Common Pitfalls

### Pitfall 1: Displayed Enjoyment Rate Doesn’t Match Earned Enjoyment Under Events
**What goes wrong:** `src/ui/tabs/StatsTab.tsx` shows enjoyment/sec without applying the active `eventMultiplier`, but `src/game/sim.ts` multiplies enjoyment earnings by the event multiplier.
**Why it happens:** `src/App.tsx` computes `enjoymentRate` with `getEnjoymentRateCentsPerSec(state)` and doesn’t include `currentEventMultiplier`.
**How to avoid:** Breakdowns should explicitly include event multiplier and show both base and effective rates (or update the displayed enjoyment rate to reflect simulation).
**Warning signs:** Event is “Live” and cash/sec visibly increases, but enjoyment/sec does not.

### Pitfall 2: Only Enjoyment Gates Have Visible Messaging
**What goes wrong:** Collection shows a pill for enjoyment blocks but shows no equivalent “missing cash” explanation (the buy button is just disabled).
**Why it happens:** `CollectionTab.tsx` conditionally renders `.purchase-locked` only when `blocksBy === "enjoyment"`.
**How to avoid:** Always surface a short blocked reason for both `blocksBy: "enjoyment"` and `blocksBy: "cash"`, and include an “Explain” link/button to describe the difference.
**Warning signs:** Players cannot tell whether they need more cash vs needing to grow enjoyment.

### Pitfall 3: Softcap & Therapist Income Confusion
**What goes wrong:** Users see “Dollars / sec” but don’t understand why upgrades don’t linearly increase it, or why it differs from the base vault income.
**Why it happens:** Cash/sec includes therapist salary and an income softcap (`applySoftcap`) plus many multipliers.
**How to avoid:** Breakdown should show (1) vault income raw vs effective after softcap and (2) therapist cash as a separate addend.
**Warning signs:** Players think income is “bugged” when softcap efficiency < 100%.

## Code Examples

### Purchase Gate Data Model (Existing)
```ts
// Source: src/game/selectors/index.ts
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
```

### Cash Rate Modifier Inventory (Authoritative)
```ts
// Source: src/game/selectors/index.ts (getRawIncomeRateCentsPerSec)
return (
  (BASE_INCOME_CENTS_PER_SEC + itemIncome) *
  upgradeMultiplier *
  setBonusMultiplier *
  collectionMultiplier *
  workshopMultiplier *
  maisonMultiplier *
  catalogTierMultiplier *
  abilityMultiplier *
  craftedMultiplier *
  getPrestigeLegacyMultiplier(state)
);
```

### Tap-Friendly Disclosure Pattern (Existing)
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
<details className="catalog-facts" data-testid="catalog-facts">
  <summary>Collector notes</summary>
  <ul>...</ul>
</details>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rates shown only as single numbers | Rates shown as totals plus a basic breakdown (base + modifiers) | Phase 21 | Users can reason about progress and why a rate changed |
| Enjoyment gates shown only as “Requires X enjoyment” | Gates show missing resource + why the gate exists (enjoyment vs cash) | Phase 21 | Users understand progression constraints instead of guessing |

**Notable existing behavior to preserve:**
- All rate and gate logic lives in pure selectors; simulation (`src/game/sim.ts`) applies event multiplier and softcaps.

## Open Questions

1. **Where should contextual explanations render (inline vs modal)?**
   - What we know: no hover-only; must be tap/click friendly.
   - What’s unclear: whether to open a global Help modal at a section (Phase 20 pattern) or use inline `<details>` near the label.
   - Recommendation: use inline `<details>` for short “show breakdown” content (Stats), and use the Help modal for longer glossary/explanations (currencies, gates).

## Sources

### Primary (HIGH confidence)
- `src/game/selectors/index.ts` - cash/enjoyment formulas, softcap, event multiplier, purchase gating
- `src/game/sim.ts` - authoritative application of event multiplier + accumulation of earnings
- `src/App.tsx` - current stats aggregation and current event multiplier wiring
- `src/ui/tabs/StatsTab.tsx` - stats display surface
- `src/ui/tabs/CollectionTab.tsx` - purchase gate messaging surface
- `src/ui/tabs/NostalgiaTab.tsx` - nostalgia unlock order messaging surface
- `src/ui/tabs/CatalogTab.tsx` - `<details>/<summary>` disclosure pattern
- `src/style.css` - modal overlay and disclosure styling primitives

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - from `package.json` + local code
- Architecture: HIGH - derived from existing UI patterns and selector boundaries
- Pitfalls: HIGH - directly observed mismatch (event multiplier on enjoyment) and existing UI omissions

**Research date:** 2026-01-26
**Valid until:** 2026-02-25
