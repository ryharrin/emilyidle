# Phase 46: Catalog Expansion (Tiered Variety) - Research

**Researched:** 2026-02-03
**Domain:** Data-driven catalog expansion (assets + tiered unlocks + UI card grid)
**Confidence:** HIGH

## Summary

This repo already has a complete “catalog as data” pipeline: `src/game/catalog.ts` defines `CATALOG_ENTRIES` with per-entry licensing metadata, and the UI renders a grid of cards from those entries. Each catalog entry is also a watch model (`WATCH_MODELS` is derived from `CATALOG_ENTRIES`), and images are served locally under `public/catalog/` via `getCatalogImageUrl()` (base-path safe) with Playwright tests enforcing the contract.

Phase 46 is primarily about (1) adding more catalog entries across progression tiers and (2) changing how the player experiences that variety: tier-appropriate stats in the card overlay, achievement-based tier unlocks, and “individual drops” (drip-fed availability) with clear progress messaging. The safest way to implement this is to keep the existing internal tier IDs (`starter | classic | chronograph | tourbillon`) and build the new tiered variety/unlock flow on top of existing primitives: achievements (`state.achievementUnlocks`), existing gating UI (`CatalogPurchaseGate` + `CatalogDisabledExplanation` + `UnlockHint`), and deterministic drop ordering (no RNG).

**Primary recommendation:** Treat the catalog as a data pipeline: extend `CATALOG_ENTRIES` + assets under `public/catalog/`, keep tiering driven by tags + `getCatalogEntryTags()`, and implement “individual drops + achievement tier unlocks + header progress indicator” as pure state/selectors/actions that preserve existing test contracts (base path, images existence, `data-testid` anchors).

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|---|---:|---|---|
| React | 18.3.x | UI rendering | Existing app stack (`package.json`) |
| Vite | 6.x | Build + base-path assets | Existing app stack; base path `/emilyidle/` (`vite.config.ts`) |
| TypeScript | 5.8.x | Types + safety | Repo standard (`strict: true`) |
| Playwright | 1.49.x | E2E contracts for catalog | Existing guardrails for `/catalog/` asset paths and selectors |
| Vitest + Testing Library | Vitest 1.6.x | Unit/UI contracts | Existing catalog tests in `tests/catalog.unit.test.tsx` |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|---|---:|---|---|
| `scripts/catalog/sync-catalog-images.js` | (repo script) | Ensure all Wikimedia images exist in `public/catalog/` | Always after adding new `CATALOG_ENTRIES` with Wikimedia URLs |
| `import.meta.env.BASE_URL` | Vite runtime var | Make `/catalog/` paths work under `/emilyidle/` | Always when building URLs to `public/` assets |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Adding an animation library (Framer Motion, etc.) | CSS transitions + media queries | Repo currently has no animation libs; CSS-only keeps bundle small and consistent |
| Random drops | Deterministic “release order” list | Determinism is much easier to test/seed and avoids save-consistency bugs |

**Installation:**
```bash
pnpm install
```

## Architecture Patterns

### Recommended Project Structure
This phase should stay within existing layering:

```
src/
├── game/
│   ├── catalog.ts              # catalog entries + image mapping + tag inference
│   ├── data/watchModels.ts     # derived watch models from catalog
│   ├── data/items.ts           # tier definitions + unlock milestone ids
│   ├── model/state.ts          # state constructors + catalog discovery + tier bonus unlocks
│   ├── actions/index.ts        # state transitions incl. buyWatchModel() and discoverCatalogEntries()
│   └── selectors/*             # pure derivations (gates, pricing, unlock labels)
└── ui/
    ├── tabs/CatalogTab.tsx     # catalog shop/grid rendering
    ├── components/catalog/*    # gate + disabled explanation UI
    └── components/UnlockHint.tsx
```

### Pattern 1: Data-Driven Catalog Entries (with local image mirroring)
**What:** `CATALOG_ENTRIES` is the source of truth. Images use Wikimedia URLs, but the UI serves them from `public/catalog/` by rewriting the URL to `${import.meta.env.BASE_URL}catalog/<relative>`. Tests enforce both existence and base-path correctness.

**When to use:** Always for adding watches. Phase 46 should add entries here (and assets under `public/catalog/`).

**Example:**
```ts
// Source: src/game/catalog.ts
export type CatalogImage = {
  url: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  author: string;
  attribution: string;
};

export function getCatalogImageUrl(entry: CatalogEntry): string {
  if (entry.image.url.startsWith(WIKIMEDIA_BASE_URL)) {
    const relativePath = entry.image.url.slice(WIKIMEDIA_BASE_URL.length);
    const localPath = LOCAL_CATALOG_OVERRIDES[relativePath] ?? relativePath;
    return `${LOCAL_CATALOG_ROOT}${localPath}`;
  }
  return entry.image.url;
}
```

### Pattern 2: Tiering via Tags + Inference (do not hardcode in UI)
**What:** Tier IDs are inferred by `getCatalogEntryTags()` which normalizes tags and adds a tier tag (`starter|classic|chronograph|tourbillon`) based on heuristics.

**When to use:** Any time the UI needs tier information (sorting, color-coding, grouping).

**Example:**
```ts
// Source: src/game/catalog.ts
export function getCatalogEntryTags(entry: CatalogEntry): string[] {
  const normalized = entry.tags.map((tag) => tag.toLowerCase()).filter((tag) => tag.length > 0);
  const baseTags = normalized.filter((tag) => !TIER_TAGS.has(tag));
  const tierTag = inferCatalogTier(entry, baseTags);
  return Array.from(new Set([...baseTags, tierTag]));
}
```

### Pattern 3: Watch models are derived from catalog entries
**What:** `WATCH_MODELS` is computed from `CATALOG_ENTRIES`, and each model’s `tierId` is inferred from tags.

**When to use:** Add new models by adding new catalog entries; avoid separate model lists.

**Example:**
```ts
// Source: src/game/data/watchModels.ts
export const WATCH_MODELS: ReadonlyArray<WatchModelDefinition> = (() => {
  const brandCounters = new Map<CatalogBrand, number>();

  return CATALOG_ENTRIES.map((entry) => {
    const nextReferenceNumber = (brandCounters.get(entry.brand) ?? 0) + 1;
    brandCounters.set(entry.brand, nextReferenceNumber);

    const tierId = getTierIdForCatalogEntry(entry);
    const displayName = `${entry.brand} ${entry.model} #${nextReferenceNumber}`;

    return {
      id: entry.id,
      brand: entry.brand,
      model: entry.model,
      tierId,
      referenceNumber: nextReferenceNumber,
      displayName,
      catalogEntryIds: [entry.id],
    };
  });
})();
```

### Pattern 4: Unlock/gating UI is already standardized
**What:** `CatalogPurchaseGate` consolidates “buy vs locked” logic and pipes details into `CatalogDisabledExplanation`. `UnlockHint` already renders a percent + progress bar.

**When to use:** Any new “tier locked / achievement locked / cooldown locked” reason should be added as a `CatalogDisabledReason`, not bespoke per-card copy.

**Example:**
```tsx
// Source: src/ui/components/catalog/CatalogPurchaseGate.tsx
<CatalogDisabledExplanation entryId={entryId} reasons={reasons} />
```

### Anti-Patterns to Avoid
- **Hardcoding tier labels in UI:** Tier IDs are internal; UI should imply tier via color/shape and derive tier from tags.
- **RNG-based drops without seeding:** Makes saves non-reproducible and breaks tests; prefer deterministic release order.
- **Bypassing `getCatalogImageUrl()`:** Breaks `/emilyidle/` base path and Playwright tests.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Local mirroring of Wikimedia images | Ad-hoc manual downloads | `scripts/catalog/sync-catalog-images.js --download` | Existing script handles encoded/decoded filenames + overrides |
| Base-path-safe asset URLs | String concatenation like `"/catalog/..."` | `import.meta.env.BASE_URL` via `getCatalogImageUrl()` | Required for `/emilyidle/` deployment; tests enforce it |
| “Why can’t I buy?” messaging | Custom tooltip per card | `CatalogDisabledExplanation` + `CatalogPurchaseGate` | Keeps tests and UX consistent |
| Progress indicator UI | New component | `UnlockHint` | Already provides percent + progress bar; fits the requirement |
| Drop scheduling randomness | `Math.random()` | Deterministic order (array order or explicit release list) | Testability and save determinism |

**Key insight:** Most risk in this phase is not UI rendering; it’s keeping the asset pipeline and base-path/test contracts intact while changing discovery/unlock semantics.

## Common Pitfalls

### Pitfall 1: Breaking `/emilyidle/` asset paths
**What goes wrong:** Images load in dev but fail in production base path; Playwright fails `catalog images render under the /emilyidle base path`.

**Why it happens:** Using absolute `/catalog/...` paths or bypassing `getCatalogImageUrl()`.

**How to avoid:** Always render images via `getCatalogImageUrl(entry)`; do not hardcode `/catalog/`.

**Warning signs:** `tests/catalog-image-rendering.spec.ts` or `tests/catalog-images.spec.ts` starts failing; first image `src` no longer contains `.../emilyidle/catalog/...`.

### Pitfall 2: Adding Wikimedia URLs without adding local assets
**What goes wrong:** The code still “works” (fallback to remote, or broken images), but tests fail because `tests/catalog-images.spec.ts` verifies every referenced Wikimedia relative exists under `public/catalog/`.

**How to avoid:** After updating `src/game/catalog.ts`, run:
```bash
node scripts/catalog/sync-catalog-images.js --download
```

### Pitfall 3: Override drift across source/script/tests
**What goes wrong:** A filename with encoding/normalization differences requires an override; if you update overrides in one place but not the others, tests and the sync script disagree.

**How to avoid:** When adding/changing `LOCAL_CATALOG_OVERRIDES`, update all three:
- `src/game/catalog.ts`
- `scripts/catalog/sync-catalog-images.js`
- `tests/catalog-images.spec.ts`

### Pitfall 4: Tier changes ripple through types + tests
**What goes wrong:** Renaming/adding tier IDs breaks `CatalogTierId`, `WatchItemId`, milestone unlock logic, and a large set of tests that reference tier IDs and UI text (e.g., sort label “Tier (starter→tourbillon)”).

**How to avoid:** Keep internal tier IDs stable; implement “low/mid/lux” as a presentation grouping over existing tiers unless a rewrite is explicitly planned.

### Pitfall 5: Card flip accessibility and motion sensitivity
**What goes wrong:** Tap-to-flip becomes unusable on desktop (hover devices), focus gets lost, or motion triggers discomfort.

**How to avoid:**
- Use CSS 3D transforms with `backface-visibility: hidden` and `transform-style: preserve-3d`.
- Gate flip interaction based on input capability (`@media (hover: none)`).
- Reduce/disable flip animations under `@media (prefers-reduced-motion: reduce)`.

## Code Examples

### Add a new catalog entry (data + license metadata)
```ts
// Source: src/game/catalog.ts
export const CATALOG_ENTRIES: CatalogEntry[] = [
  {
    id: "brand-model-unique-id",
    brand: "Rolex",
    model: "Example Model",
    description: "Short story blurb for the card.",
    year: "1998",
    tags: ["rolex", "watch", "gmt", "classic"],
    facts: ["Optional collector notes for owned view."],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/x/xx/Filename.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Filename.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Author Name",
      attribution: "File:Filename.jpg by Author Name (CC BY-SA 4.0)",
    },
  },
];
```

### Sync local catalog images for all Wikimedia URLs
```bash
# Source: scripts/catalog/sync-catalog-images.js
node scripts/catalog/sync-catalog-images.js
node scripts/catalog/sync-catalog-images.js --download
```

### Mobile-first tap-to-flip card (CSS-only)
```css
/* Source: MDN docs on transform-style/backface-visibility + media features */

.catalog-card-flip {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 260ms ease;
}

.catalog-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.catalog-card-back {
  transform: rotateY(180deg);
}

/* Only enable tap-to-flip on touch-first devices */
@media (hover: none) {
  .catalog-card[data-flipped="true"] .catalog-card-flip {
    transform: rotateY(180deg);
  }
}

/* Reduce motion for flip */
@media (prefers-reduced-motion: reduce) {
  .catalog-card-flip {
    transition: none;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Remote-link catalog images | Local mirroring under `public/catalog/` + base-aware URL rewriting | Already present | Faster loads and stable offline-ish asset behavior; tests enforce contract |
| Separate “catalog” vs “shop” | Catalog shop embedded inside `CatalogTab` panel (`#catalog-shop`) | Already present | E2E selector contracts depend on these anchors |

**Deprecated/outdated:**
- Treating `/catalog/...` as a root-absolute URL: deployment base path requires `${import.meta.env.BASE_URL}`.

## Open Questions

1. **Tier vocabulary: low/mid/lux vs existing `starter|classic|chronograph|tourbillon`**
   - What we know: Internal tier IDs are deeply integrated (`WatchItemId`, `CatalogTierId`, tests, sorting label).
   - What's unclear: Whether Phase 46 requires changing internal tiers to match “low/mid/lux” or just presenting them as implied tiers.
   - Recommendation: Keep internal tiers stable; implement “tier implied by color” as a UI mapping over existing tiers.

2. **“Individual drops” implementation detail**
   - What we know: Discovery today is “everything matching owned tiers/upgrades” via `getCatalogEntryIdsForItems()` + `discoverCatalogEntries()` on tick.
   - What's unclear: Whether “drop” means (a) reveal more entries over time regardless of ownership, (b) reveal within unlocked tiers only, or (c) reveal when certain achievements progress.
   - Recommendation: Implement drops as a deterministic unlock list per tier with a persisted next-drop timestamp; do not use RNG.

3. **Delta messaging vs equipped watch**
   - What we know: Equipped watch exists (`state.wornWatchId`) and the UI already shows “Equipped”. Tier stats exist in `WATCH_ITEMS`.
   - What's unclear: Whether deltas are computed at the tier level (current reality) or need per-model stat variation (not in current data model).
   - Recommendation: Start with tier-level deltas unless Phase 45 (individual watch stats) is pulled forward.

## Sources

### Primary (HIGH confidence)
- `src/game/catalog.ts` - Catalog entries, tag inference, base-aware local image mapping
- `src/game/data/watchModels.ts` - Model derivation from catalog entries
- `src/ui/tabs/CatalogTab.tsx` - Catalog grid UI, gating + unlock hint usage, selector/test IDs
- `scripts/catalog/sync-catalog-images.js` - Local image mirroring script
- `tests/catalog-images.spec.ts` / `tests/catalog-image-rendering.spec.ts` - Guardrails for catalog images + base path
- `vite.config.ts` - Base path `/emilyidle/`

### Secondary (MEDIUM confidence)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style - `transform-style: preserve-3d` behavior and constraints
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility - `backface-visibility: hidden` for 3D flips
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion - reduced-motion guidance
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover - input capability detection for hover vs touch

### Tertiary (LOW confidence)
- None (this phase is mostly repo-internal patterns already established)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified via `package.json`, `vite.config.ts`, existing scripts/tests
- Architecture: HIGH - verified via current repo layering and existing catalog implementation
- Pitfalls: HIGH - verified via existing Playwright/Vitest contracts and asset pipeline

**Research date:** 2026-02-03
**Valid until:** 2026-03-05
