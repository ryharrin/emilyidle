# Phase 45: Per-Watch Stats Surfaces - Research

**Researched:** 2026-02-03
**Domain:** React + TypeScript UI surface for derived per-watch rates and equipped-watch contribution
**Confidence:** HIGH

## Summary

This phase is primarily a UI + selector plumbing effort: compute per-watch enjoyment/cash rates (and the worn/equipped watch delta) using pure domain selectors, then render them as a table-like list with expandable per-row modifier details, plus sorting/filtering controls that remain accessible on mobile via a sticky header.

The repo already has the key building blocks: rate computation and breakdown patterns (`getEnjoymentRateBreakdown`, `getCashRateBreakdown`), formatting helpers (`formatRateFromCentsPerSec`), filter/sort UI patterns from the catalog (`CatalogTab.tsx`), and expandable disclosure UI using `<details>/<summary>` (`StatsTab.tsx`, `CatalogTab.tsx`). Planning should focus on: (1) creating a single “view model” selector that returns per-watch rows + breakdown terms, (2) wiring a dedicated stats surface (likely in `CatalogTab` and/or `CollectionTab` per requirements), and (3) CSS for a sticky filter header that behaves correctly across scroll containers.

**Primary recommendation:** Build per-watch stats as pure selectors returning a `PerWatchStatsRow[]` + equipped-watch delta, then render via semantic HTML (`<table>` or list with grid) with `<details>` rows and Catalog-style filter/sort controls anchored by a `position: sticky` header.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI rendering | Existing app foundation |
| react-dom | ^18.3.1 | DOM renderer | Existing app foundation |
| typescript | ^5.8.0 | Static typing | Repo is strict TS |
| vite | ^6.0.0 | Build/dev server | Repo standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons | Sort indicators / disclosure affordances |
| vitest | ^1.6.0 | Unit tests | Selector and formatting contracts |
| @playwright/test | ^1.49.1 | E2E tests | Sticky header + sort/filter UX contracts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled table libs | TanStack Table / virtualization libs | Not in repo; adds dependency + complexity; likely unnecessary given expected row count |

**Installation:**
```bash
# No new dependencies required for this phase.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── game/
│   ├── selectors/
│   │   ├── perWatchStats.ts      # NEW: pure selectors for per-watch rows + equipped delta
│   │   └── index.ts              # re-export (via src/game/state.ts facade)
│   └── format.ts                 # existing money/rate formatting
├── ui/
│   ├── tabs/
│   │   ├── CatalogTab.tsx        # likely: show STATS-01/02/05 alongside catalog rows
│   │   └── CollectionTab.tsx     # likely: show STATS-04 equipped contribution breakdown
│   └── components/
│       └── (optional) PerWatchStatsTable.tsx  # NEW: extracted table/list component
└── style.css                      # add minimal new classes for sticky header + table
```

### Pattern 1: Selector-Backed “View Model” for UI Rows
**What:** Build a selector that returns a UI-ready list of rows containing identifiers, display strings/labels, and raw numeric rates (cents/sec) + breakdown terms.

**When to use:** Any time UI needs to sort/filter/expand on computed state without duplicating domain logic in React.

**Example:**
```ts
// Source: src/game/selectors/index.ts (existing pattern)
export type RateBreakdownMultiplierTerm = {
  id: string;
  label: string;
  multiplier: number;
};

export type EnjoymentRateBreakdown = {
  baseCentsPerSec: number;
  multiplierTerms: RateBreakdownMultiplierTerm[];
  eventMultiplier: number;
  effectiveCentsPerSec: number;
};

// New selector should follow the same "return data, not JSX" style.
```

### Pattern 2: Sort/Filter State Lives in UI, Computation Lives in useMemo
**What:** Keep filter/sort controls as local UI state; derive the displayed list with `useMemo` based on (rows + controls).

**When to use:** Table-like lists where sort/filter is purely presentation.

**Example:**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx (filter form + controlled inputs)
<form className="catalog-filters" onSubmit={(event) => event.preventDefault()}>
  <div className="filter-field">
    <label className="filter-label" htmlFor="catalog-sort">Sort</label>
    <select id="catalog-sort" value={catalogSort} onChange={(e) => onCatalogSortChange(e.target.value as typeof catalogSort)}>
      <option value="default">Default</option>
      <option value="brand">Brand (A→Z)</option>
    </select>
  </div>
</form>
```

### Pattern 3: Expandable Rows via Native <details>/<summary>
**What:** Use `<details>/<summary>` for per-row expansion (modifier breakdown), optionally controlling `open` via React state when expansion state must persist across re-renders.

**When to use:** Compact lists with occasional deep drill-down.

**Example:**
```tsx
// Source: src/ui/tabs/StatsTab.tsx
<details data-testid="enjoyment-rate-breakdown" className="card">
  <summary>Enjoyment / sec · {formatRateFromCentsPerSec(effective)}</summary>
  <p className="muted">Base: {formatRateFromCentsPerSec(base)}</p>
  <ul>
    {multiplierTerms.map((term) => (
      <li key={term.id}>
        {term.label} x{term.multiplier.toFixed(2)}
      </li>
    ))}
  </ul>
</details>
```

### Anti-Patterns to Avoid
- **UI recomputes domain math:** Don’t replicate multiplier chains in React; always consume selectors.
- **Sorting mutates selector output:** Don’t call `.sort()` on arrays returned by selectors; copy first (`slice()`) to keep purity.
- **Sticky inside the wrong scroll container:** Sticky headers attach to the nearest ancestor with an overflow “scrolling mechanism”. Keep the sticky header inside the intended scroll container and avoid accidental `overflow` on ancestors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency/rate formatting | New formatters per surface | `formatMoneyFromCents`, `formatRateFromCentsPerSec` (`src/game/format.ts`) | Keeps labels consistent; avoids rounding/locale drift |
| Disclosure/accordion behavior | Custom JS accordion | Native `<details>/<summary>` | Keyboard + accessibility defaults; simpler state |
| Complex table framework | Ad-hoc data grid framework | Plain HTML table/list + existing filter patterns | Avoids dependency overhead; row count likely manageable |
| Equipped delta math in UI | “before/after” recomputation in React | Selector that computes delta once | Avoids subtle mismatches in multipliers and edge cases |

**Key insight:** Most “unknown unknowns” here are correctness drift: if per-watch rates are computed in multiple places, they will diverge from the global rate breakdown and tests will become brittle.

## Common Pitfalls

### Pitfall 1: Misstating “equipped watch contribution” when it’s multiplicative
**What goes wrong:** The UI shows the equipped watch as adding a flat rate, but the worn watch currently applies a multiplier (`worn-watch`) to enjoyment rather than adding an independent addend.
**Why it happens:** Multipliers are easy to summarize incorrectly (“+X/s”) if computed as a difference without explaining it’s a multiplier effect.
**How to avoid:** Compute a clear delta: `effectiveWithWorn - effectiveWithoutWorn` (for enjoyment), and label it explicitly (e.g., “Worn watch bonus: +$Y/s enjoyment (from x1.05)”).
**Warning signs:** Numbers don’t reconcile with `getEnjoymentRateBreakdown` multiplier chain.

### Pitfall 2: Per-watch cash rate doesn’t exist yet (domain mismatch)
**What goes wrong:** You try to attribute cash/sec to watch models, but cash rate is currently driven by therapist salary + event multiplier (`getCashRateBreakdown`) and has no per-watch addends.
**Why it happens:** Requirements (STATS-02) assume a per-watch cash rate surface; the domain may not provide per-model cash contributions yet.
**How to avoid:** During planning, verify whether watch models or tiers contribute to cash/sec beyond career salary; if they don’t, the phase must either (a) surface per-watch cash as “0”/“n/a” (not recommended) or (b) extend domain economics so watches affect cash/sec (likely out-of-scope). Treat this as an explicit planning gate.
**Warning signs:** All watches show identical cash/sec values or the UI invents allocations.

### Pitfall 3: Sticky header breaks due to overflow ancestors
**What goes wrong:** `position: sticky` fails to stick or sticks within an unexpected container.
**Why it happens:** Sticky positions relative to the nearest ancestor with an overflow scrolling mechanism (`overflow: hidden|scroll|auto|overlay`) and requires a non-auto inset (e.g. `top`).
**How to avoid:** Ensure the stats list scroll container is the intended one; avoid wrapping it in extra `overflow: auto` elements; set `top` and a background to prevent bleed-through.
**Warning signs:** Header scrolls away on mobile or overlays content unpredictably.

### Pitfall 4: <details> state becomes flaky when rows reorder
**What goes wrong:** Expanded rows collapse or the wrong row appears expanded after sorting/filtering.
**Why it happens:** Uncontrolled `<details>` relies on DOM position; sorting changes ordering.
**How to avoid:** Control expansion state in React keyed by stable watch id (see `expandedCards` pattern in `CatalogTab.tsx`).
**Warning signs:** Expand a row, change sort, and the expansion jumps.

## Code Examples

### Enjoyment rate breakdown terms (existing pattern)
```ts
// Source: src/game/selectors/index.ts
const wornMultiplier = getWornWatchEnjoymentMultiplier(state);
if (state.wornWatchId !== null && wornMultiplier !== 1) {
  multiplierTerms.push({ id: "worn-watch", label: "Worn watch", multiplier: wornMultiplier });
}
```

### Controlled <details> expansion state (stable across re-renders)
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});

<details
  className="catalog-details"
  open={expandedCards[entry.id] ?? false}
  onToggle={(event) => {
    const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
    setExpandedCards((prev) => ({ ...prev, [entry.id]: nextOpen }));
  }}
>
  <summary>Details</summary>
  <div className="catalog-details-body">...</div>
</details>
```

### Filter/sort controls form pattern
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
<form className="catalog-filters" onSubmit={(event) => event.preventDefault()}>
  <div className="filter-field">
    <label className="filter-label" htmlFor="catalog-search">Search</label>
    <input id="catalog-search" type="search" value={catalogSearch} onChange={(e) => onCatalogSearchChange(e.target.value)} />
  </div>
</form>
```

### Sticky behavior constraint (reference)
```css
/* Source: MDN position: sticky docs */
/* https://developer.mozilla.org/en-US/docs/Web/CSS/position */
/* Sticky attaches to nearest ancestor with overflow and needs a non-auto inset (e.g., top). */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom accordion JS | Native `<details name=...>` supports grouping without scripting | HTML living standard; documented by MDN (2025-10 update) | Less JS + better accessibility; optional grouping if needed |
| Heavy data-grid deps for small tables | Handful of rows rendered as semantic table/list | Typical React 18 apps | Simpler implementation; fewer deps |

**Deprecated/outdated:**
- “Animate `<details>` open/close natively”: MDN notes there is no built-in animation for the transition; style via `details[open]` if needed.

## Open Questions

1. **Does the domain actually have per-watch cash/sec?**
   - What we know: Cash rate breakdown currently includes only career salary + event multiplier (`getCashRateBreakdown`), and watch model data does not include cash contributions.
   - What's unclear: Whether another selector exists elsewhere to attribute cash/sec to watch models (not found in the quick scan).
   - Recommendation: Planner should add an explicit discovery task: confirm whether STATS-02 requires new economic model work or merely a surface for an existing per-watch cash stat.

2. **Where should the per-watch table live for best UX?**
   - What we know: Requirements mention Catalog (STATS-01/02/05) and Collection (STATS-04).
   - What's unclear: Whether a dedicated “Stats” section within Catalog/Collection is sufficient or if a new sub-section/tab is intended.
   - Recommendation: Implement within existing tabs first (Catalog + Collection) to avoid navigation churn; keep the component reusable.

## Sources

### Primary (HIGH confidence)
- Repo source: `src/game/selectors/index.ts` (rate breakdown shapes and worn-watch multiplier term)
- Repo source: `src/game/selectors/enjoyment.ts` (enjoyment rate composed from per-model base + multipliers)
- Repo source: `src/ui/tabs/CatalogTab.tsx` (filter form pattern; controlled `<details>` expansion)
- Repo source: `src/ui/tabs/StatsTab.tsx` (disclosure UI for rate breakdown)
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/position (sticky behavior + overflow ancestor note; updated 2025-12-05)
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details (open attribute semantics; grouping via `name`; updated 2025-10-13)

### Secondary (MEDIUM confidence)
- None (no external ecosystem claims needed beyond official docs + repo code)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from `package.json`
- Architecture: HIGH - based on existing repo patterns (selectors + tab UI + `<details>` usage)
- Pitfalls: HIGH - based on current selector behavior and MDN sticky/details semantics

**Research date:** 2026-02-03
**Valid until:** 2026-03-03
