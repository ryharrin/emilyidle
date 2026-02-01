# Stack Research

**Domain:** Browser-based idle game UI consolidation (catalog + vault)
**Researched:** 2026-02-01
**Confidence:** HIGH

## Recommended Stack

This milestone is a UI/UX consolidation. No new runtime libraries are required; the existing React/Vite/TypeScript stack already supports a single “catalog-first” purchase surface, and the repo already has a reusable purchase panel (`src/ui/tabs/CatalogTab.tsx` exports `CatalogPurchasePanel`) consumed by the vault tab (`src/ui/tabs/CollectionTab.tsx`).

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3.1 | UI rendering + component model | Already the app foundation; consolidation is a component composition/refactor problem, not a platform change.
| Vite | 6.0.0 | Dev server + build | Already configured; supports fast iteration while reshaping tab composition and CSS.
| TypeScript | 5.8.0 | Type-safe domain/UI refactors | Consolidation touches shared props and selectors; strict typing reduces regressions.
| Plain CSS (global + component classes) | (repo CSS) | Styling unified cards + surface layout | Existing styling approach matches the codebase; avoids introducing a second styling system for a single milestone.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons for unified catalog cards (status, gates, actions) | Use for lightweight visual encoding (owned, equipped, locked, cooldown) without adding a component library.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Playwright | E2E regression coverage for “purchase only via Catalog” | Update selectors/copy carefully; keep `data-testid` stable when moving UI.
| Vitest + Testing Library | Unit-level safety for selectors/actions used by unified cards | Prefer unit tests around purchase gating/owned counts if UI behavior changes.
| ESLint + Prettier | Keep refactor diffs readable | Consolidation tends to touch large components; formatting prevents noise.

## Installation

```bash
# No new dependencies required for this milestone.

# (Optional) if you later need list virtualization for thousands of catalog entries:
# pnpm add @tanstack/react-virtual
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Reuse existing `CatalogPurchasePanel` as the canonical purchase surface and mount it in Catalog | Add a new “Shop” feature tab / router-based flow | Only if you need deep-linking, multiple shopping funnels, or large-scale navigation beyond the current tab model.
| Keep state in existing `GameState` + selectors/actions (pure functions) | Add a client state library (Redux/Zustand/MobX) for UI consolidation | Only if cross-tab UI state becomes complex (e.g., multi-step checkout, undo stack, background sync). Not justified for “move purchase UI” work.

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Component libraries (MUI/Chakra/Ant/etc.) | High surface-area + styling conflicts for a small consolidation; harder to keep the game’s bespoke vibe | Keep bespoke markup + CSS; factor internal UI primitives if needed (`src/ui/components/*`).
| Global state libraries for this milestone | Consolidation is largely presentational/structural; new state layers add risk | Keep `GameState` as source of truth; add selectors to expose “vault info” needed by catalog cards.
| Client-side routing | Tabs already cover navigation; routing adds URL/state complexity and test churn | Keep the tab system and add CTA navigation hooks (`onNavigate`).

## Stack Patterns by Variant

**If Catalog becomes the sole purchase flow (milestone goal):**
- Treat `CatalogPurchasePanel` as the canonical buy UI and mount it in the Catalog tab (not in Vault/Collection).
- Add/extend selectors for “vault info” shown on cards (owned count, equipped state, interact cooldown, dismantle availability) and keep them pure under `src/game/selectors/*`.
- Keep Vault/Collection as management/progression (automation toggles, set bonuses, worn watch picker, etc.) and make all “Buy” CTAs route to Catalog.

**If the catalog list becomes very large (future-proofing):**
- Add list virtualization (e.g., `@tanstack/react-virtual`) specifically for the card grid.
- Keep filtering/sorting pure and memoized; avoid rendering thousands of `<article>` nodes.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react@18.3.1 | react-dom@18.3.1 | Keep React/ReactDOM aligned to avoid subtle runtime mismatches.
| react@18.3.1 | @types/react@18.3.3 | Types should track React 18 APIs used by components and hooks.
| vite@6.0.0 | @vitejs/plugin-react@4.3.4 | Plugin must support the Vite major version used by the repo.

## Sources

- `package.json` (repo) — current pinned versions for React/Vite/TypeScript/tooling
- https://react.dev/ — React reference (HIGH)
- https://vite.dev/ — Vite reference (HIGH)
- https://playwright.dev/ — Playwright reference (HIGH)

---
*Stack research for: catalog/vault consolidation*
*Researched: 2026-02-01*
