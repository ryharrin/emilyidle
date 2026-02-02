# Phase 41: Stability & Regression Guardrails - Research

**Researched:** 2026-02-02
**Domain:** Save persistence + UI selector contracts + catalog asset integrity (Vite + React)
**Confidence:** HIGH

## Summary

Phase 41 is primarily a “contract enforcement” phase: consolidate UI safely by freezing the external interfaces that existing players and tests depend on. In this repo, those interfaces are (1) the save payload + localStorage keys, (2) stable DOM selectors (`id`, `data-testid`, role/label patterns used by Playwright), and (3) catalog image resolution under Vite’s `base` (`/emilyidle/`) and local `/public/catalog` assets.

The codebase already contains most of the machinery needed (save v2 decoder/sanitizer with legacy key support, catalog image URL mapping to `import.meta.env.BASE_URL`, and Playwright tests that seed saves and validate catalog images). Planning this phase well means adding missing “guardrail” tests that fail loudly on unintended interface changes, and documenting the exact contracts to preserve.

**Primary recommendation:** Add explicit regression/contract tests for save key compatibility, localStorage key strings, and a curated selector contract list, and ensure the existing catalog image contract test remains green under `/emilyidle/`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 6.0.0 | Build/dev server; `base` path handling | `import.meta.env.BASE_URL` drives correct asset URLs under `/emilyidle/` (`vite.config.ts`) |
| React | 18.3.1 | UI runtime | Project baseline (`package.json`) |
| TypeScript | 5.8.0 | Type safety | `strict: true` conventions (repo config) |
| Vitest | 1.6.0 | Unit/contract tests | Fast deterministic checks for persistence and selector string contracts |
| Playwright | 1.49.1 | E2E regression | Best fit for localStorage seeding + real asset fetch (`page.request`) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.1.0 | UI unit tests | DOM assertions without browser automation |
| @testing-library/jest-dom | 6.6.4 | DOM matchers | Readable `toBeVisible`, etc |
| lucide-react | 0.563.0 | Icons | UI-only; irrelevant to contracts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright contract checks | Pure Vitest DOM tests | Vitest can’t validate real asset fetches + `base` URL behavior as confidently |

**Installation:**
```bash
pnpm install
```

## Architecture Patterns

### Recommended Project Structure
Keep guardrails in tests, not production code:
```
tests/
├── persistence-compat.spec.ts      # Playwright: legacy key + load/save behavior
├── localstorage-keys.unit.test.ts  # Vitest: key-string presence contract
├── selectors-contract.spec.ts      # Playwright: required selectors exist in DOM
└── catalog-images.spec.ts          # Existing: catalog image integrity under base URL
```

### Pattern 1: Save Compatibility Contract (decode + legacy key migration)
**What:** Ensure old saves still load and the legacy key migrates to the current key without format changes.
**When to use:** Any UI consolidation/refactor that risks touching persistence wiring.

**Repository contract (MUST stay true):**
- Save key: `emily-idle:save` (current)
- Legacy key: `watch-idle:save` (must remain readable + migrated)
- Save version: v2 payload shape `{ version: 2, savedAt, lastSimulatedAtMs, state }` (no format changes)

**Implementation anchor:** `src/game/persistence.ts`

**Example:**
```ts
// Source: src/game/persistence.ts
// - loadSaveFromLocalStorage reads SAVE_KEY then LEGACY_SAVE_KEY
// - if legacy found, it writes SAVE_KEY and removes LEGACY_SAVE_KEY
// - decode accepts version 1 and maps it to version 2 via sanitizeState/createStateFromSave
```

### Pattern 2: localStorage Key String Contract ("don’t rename")
**What:** Lock down key strings used by deployed clients.
**When to use:** Any cleanup that might rename constants or move UI tabs.

**Keys currently in use (MUST stay stable):**
- `emily-idle:save`, `watch-idle:save` (`src/game/persistence.ts`)
- `emily-idle:settings`, `emily-idle:audio`, `emily-idle:navigation` (`src/App.tsx`)
- `emily-idle:help` (`src/ui/help/HelpModal.tsx`)

**Pattern:** Vitest reads source files and asserts these exact strings still appear. This is intentionally strict.

### Pattern 3: Selector Contract Tests (curated required set)
**What:** Ensure critical `data-testid` and `id` anchors remain present so existing E2E and automation don’t break.
**When to use:** Consolidation phases that move UI around but should preserve anchors.

**Approach:**
- Choose a curated list of “must-not-change” selectors (primarily those used in Playwright tests today).
- Write a Playwright test that navigates to relevant tabs and asserts presence/visibility.

**Current high-value anchors (already used in tests):**
- Catalog surface: `data-testid="catalog-grid"`, `data-testid="catalog-card"`, `data-testid="catalog-collection-context"`, `data-testid="catalog-upgrade-context"`.
- Settings/Save tab: `data-testid="settings-clear-save"`, `settings-clear-save-confirm`, `settings-clear-save-cancel`.
- CTA: `data-testid="next-unlock-cta-career"`.

### Anti-Patterns to Avoid
- **Renaming keys or test IDs “to be consistent”:** this phase is explicitly about stability; rename only with an explicit migration plan (out of scope).
- **Testing only “happy path fresh save”:** must cover existing-save and legacy-key scenarios.
- **Asset checks that ignore Vite `base`:** images can work on `localhost/` but break on `/emilyidle/`; keep tests targeting the deployed base.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Save schema validation | New schema/validator layer | Existing `sanitizeState` + `createStateFromSave` | Already encodes migration and defaulting semantics (`src/game/persistence.ts`, `src/game/model/state.ts`) |
| Asset URL base handling | Manual string concatenation per component | `getCatalogImageUrl` | Centralized handling of `import.meta.env.BASE_URL` and overrides (`src/game/catalog.ts`) |
| Network image verification | Custom HTTP client | Playwright `page.request.get` | Built-in, stable, easy to run in CI (`tests/catalog-images.spec.ts`) |

**Key insight:** this phase should reduce accidental surface-area changes by asserting contracts, not by rewriting infrastructure.

## Common Pitfalls

### Pitfall 1: Breaking existing saves by changing `GameState` shape
**What goes wrong:** Save loads but silently drops fields (data loss) or fails decode.
**Why it happens:** `sanitizeState` reconstructs a persisted subset; any new required field not represented there can be lost.
**How to avoid:** Treat any `GameState` field addition/removal as a save format change; keep Phase 41 changes test-only.
**Warning signs:** Round-trip encode/decode changes meaningful fields; `loadSaveFromLocalStorage` starts clearing invalid saves.

### Pitfall 2: Removing legacy key migration
**What goes wrong:** Older installs with `watch-idle:save` start fresh (perceived wipe).
**Why it happens:** Cleanup removes legacy handling.
**How to avoid:** Add an explicit Playwright test that seeds only the legacy key and asserts migration.
**Warning signs:** `watch-idle:save` no longer referenced; migration path not executed.

### Pitfall 3: Selectors regress during UI rearrange
**What goes wrong:** Playwright tests (and any external automation) can’t find elements.
**Why it happens:** `data-testid`/`id` values are changed during refactor.
**How to avoid:** Add selector contract tests + avoid renaming anchors used in tests.
**Warning signs:** Tests start using brittle CSS selectors to “fix” failures.

### Pitfall 4: Catalog images work locally but fail on deploy
**What goes wrong:** `img` src resolves at `/catalog/...` on localhost but must be `/emilyidle/catalog/...` in production.
**Why it happens:** forgetting `import.meta.env.BASE_URL`.
**How to avoid:** Keep `LOCAL_CATALOG_ROOT = `${import.meta.env.BASE_URL}catalog/`` and verify via Playwright.
**Warning signs:** Images 404 in GitHub Pages; tests only use `page.goto("/")` without verifying base-derived URLs.

### Pitfall 5: Percent-encoded filenames vs local overrides
**What goes wrong:** Wikimedia URL includes `%C3%A0` etc; local file name differs; images 404.
**Why it happens:** filesystem-friendly names diverge from URL encoding.
**How to avoid:** Maintain `LOCAL_CATALOG_OVERRIDES` in both `src/game/catalog.ts` and `tests/catalog-images.spec.ts`.
**Warning signs:** Only a small subset of images fail; failures cluster around accented characters.

## Code Examples

### Seed a save in Playwright (stable pattern)
```ts
// Source: tests/settings-clear-save.spec.ts
await page.addInitScript(({ state, lastTabId }) => {
  window.localStorage.clear();
  window.localStorage.setItem(
    "emily-idle:save",
    JSON.stringify({ version: 2, savedAt: new Date(0).toISOString(), lastSimulatedAtMs: Date.now(), state }),
  );
  window.localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId }));
}, { state: seededState, lastTabId: "save" });
```

### Verify catalog assets exist under Vite base
```ts
// Source: tests/catalog-images.spec.ts
await page.goto("http://127.0.0.1:5177/emilyidle/");
// derive catalogRoot from a rendered img src and request each asset via page.request.get
```

### Catalog image URL mapping (must preserve)
```ts
// Source: src/game/catalog.ts
const LOCAL_CATALOG_ROOT = `${import.meta.env.BASE_URL}catalog/`;
export function getCatalogImageUrl(entry: CatalogEntry): string {
  if (entry.image.url.startsWith("https://upload.wikimedia.org/wikipedia/commons/")) {
    const relativePath = entry.image.url.slice(WIKIMEDIA_BASE_URL.length);
    const localPath = LOCAL_CATALOG_OVERRIDES[relativePath] ?? relativePath;
    return `${LOCAL_CATALOG_ROOT}${localPath}`;
  }
  return entry.image.url;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Remote Wikimedia images directly | Local `/public/catalog` served under `import.meta.env.BASE_URL` | Prior to v3.2 (present in repo) | Avoids external fetch failures; requires base-aware URL mapping |
| `watch-idle:save` only | `emily-idle:save` + legacy migration | Present in `src/game/persistence.ts` | Prevents upgrade wipes for older installs |

**Deprecated/outdated (MUST NOT remove without migration):**
- Legacy key read/migrate: `watch-idle:save` (`src/game/persistence.ts`).

## Open Questions

1. **Selector contract scope: which selectors are “public API”?**
   - What we know: Current Playwright tests rely on a non-trivial set of `data-testid` values (Catalog, Collection CTAs, Save/Settings clear-save).
   - What's unclear: Whether to freeze only those selectors used by tests today, or a broader set to protect future automation.
   - Recommendation: Start with the selectors referenced by `tests/**/*.spec.ts` (grep-based list), then explicitly add any new ones introduced in phases 37-40 that are now part of the consolidated flow.

2. **Do we need additional legacy storage keys beyond `watch-idle:save`?**
   - What we know: Code search only finds `watch-idle:save` as legacy (`src/game/persistence.ts`).
   - What's unclear: Whether older deployments ever used legacy keys for settings/navigation.
   - Recommendation: Assume no; add a single test to ensure the known legacy key still migrates.

## Sources

### Primary (HIGH confidence)
- `src/game/persistence.ts` - save keys, versioning, decode/sanitize, legacy key migration
- `src/game/model/state.ts` - `createStateFromSave` shape normalization
- `src/App.tsx` - settings/audio/navigation keys; export/import wiring
- `src/game/catalog.ts` - `getCatalogImageUrl`, local overrides, base URL usage
- `vite.config.ts` - `base: "/emilyidle/"`
- `tests/catalog-images.spec.ts` - catalog asset contract + base URL verification
- `tests/settings-clear-save.spec.ts` - seeded save patterns + clear-save selectors
- `tests/catalog-buy-buttons.spec.ts` - consolidated catalog context selectors

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pinned versions in `package.json`
- Architecture: HIGH - patterns already used in `tests/*.spec.ts` and persistence modules
- Pitfalls: HIGH - directly implied by current contract points (keys/selectors/base URL)

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (contracts stable; re-check after any persistence/catalog refactor)
