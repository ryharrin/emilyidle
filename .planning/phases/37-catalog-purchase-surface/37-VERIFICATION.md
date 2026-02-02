---
phase: 37-catalog-purchase-surface
verified: 2026-02-02T05:27:56Z
status: passed
score: 5/5 must-haves verified
---

# Phase 37: Catalog Purchase Surface Verification Report

**Phase Goal:** Players can buy watches exclusively from catalog cards with clear actionable affordances.
**Verified:** 2026-02-02T05:27:56Z
**Status:** passed

## Goal Achievement

### Observable Truths (Must-Haves)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Player can open the Catalog tab and buy a watch directly from a catalog card. |  VERIFIED | `src/ui/tabs/CatalogTab.tsx` wires `data-testid=\`catalog-buy-*\`` buttons to `buyWatchModel()`; `tests/catalog.unit.test.tsx` has `increments owned count after a catalog purchase` and it passes. |
| 2 | No non-Catalog UI renders watch purchase buttons; any `data-testid^="catalog-buy-"` exists only within the Catalog tabpanel. |  VERIFIED | `tests/catalog.unit.test.tsx` asserts every `catalog-buy-*` is contained by the Catalog tabpanel; code search shows `catalog-buy-*` rendered only in `src/ui/tabs/CatalogTab.tsx`. |
| 3 | Any "Buy watches" CTA navigates to Catalog and scrolls to the catalog purchase grid via the `catalog-shop` anchor. |  VERIFIED | `src/ui/tabs/CollectionTab.tsx` CTAs call `onNavigate("catalog", "catalog-shop")`; `src/App.tsx` `navigateTo()` special-cases `scrollTargetId === "catalog-shop"` to scroll the first buy button; `tests/catalog.unit.test.tsx` `scrolls buy watch CTAs to the catalog shop` passes. |
| 4 | Actionable (affordable + unlocked) catalog cards look distinct at a glance from non-actionable cards. |  VERIFIED | `src/style.css` sets `box-shadow` and `opacity` deltas for `.catalog-card.catalog-actionable` vs `.catalog-card.catalog-nonactionable`; `tests/catalog-actionable-visual.spec.ts` asserts computed style differences (dark + light) and it passes. |
| 5 | Actionable styling is driven by purchase gating (unlocked + gate.ok), not by discovery state. |  VERIFIED | `src/ui/tabs/CatalogTab.tsx` computes `isActionable = unlocked && gate.ok` and applies `catalog-actionable/catalog-nonactionable` independent of `catalog-discovered/catalog-locked`. |

## Must-Haves Coverage (Truths, Artifacts, Wiring)

| Must-have | Type | Location | Status | Notes |
|----------|------|----------|--------|-------|
| Catalog tab visible + renders Catalog panel | artifact | `src/App.tsx` |  VERIFIED | Primary navigation includes "Catalog" and renders `<CatalogTab isActive={activeTab === "catalog"} ... />`. |
| Deep link `/?tab=catalog` selects Catalog | artifact | `src/ui/navigation/landing.ts` |  VERIFIED | `resolveTabAlias("catalog")` returns `"catalog"`; unit test covers deep-link behavior in `tests/catalog.unit.test.tsx`. |
| Vault has CTAs that route to Catalog + `catalog-shop` | artifact | `src/ui/tabs/CollectionTab.tsx` |  VERIFIED | Vault includes callout (`data-testid="catalog-shop-callout"`) + NextUnlock CTAs using `onNavigate("catalog", "catalog-shop")`. |
| Catalog owns the single `#catalog-shop` anchor | artifact | `src/ui/tabs/CatalogTab.tsx` |  VERIFIED | Wrapper renders `<section id="catalog-shop" data-testid="catalog-shop">` inside the Catalog `role="tabpanel"`.
| Scroll wiring prefers first buy button under `#catalog-shop` | key link | `src/App.tsx`  `#catalog-shop` |  VERIFIED | `navigateTo()` scrolls the first `[data-testid^="catalog-buy-"]` within the anchor when present.
| Actionable/non-actionable classes applied | artifact | `src/ui/tabs/CatalogTab.tsx` |  VERIFIED | Cards include `catalog-actionable` when `unlocked && gate.ok`, else `catalog-nonactionable`.
| Actionable/non-actionable styling exists (both themes) | artifact | `src/style.css` |  VERIFIED | `.catalog-card.catalog-actionable` adds box-shadow; `.catalog-card.catalog-nonactionable` reduces opacity; light theme variants present.
| Unit coverage for purchase consolidation + CTA scroll + actionable class | artifact | `tests/catalog.unit.test.tsx` |  VERIFIED | Contains CAT-01 regression assertions and actionable-class regression.
| E2E computed-style coverage for actionable vs non-actionable | artifact | `tests/catalog-actionable-visual.spec.ts` |  VERIFIED | Asserts `opacity` and `box-shadow` deltas in dark + light.
| E2E coverage that Vault no longer owns purchase panel | artifact | `tests/phase35-uat.spec.ts` |  VERIFIED | Asserts Vault panel has no `[data-testid='catalog-shop']` and Catalog panel does.

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/ui/tabs/CollectionTab.tsx` | `src/App.tsx` | `onNavigate("catalog", "catalog-shop")` |  VERIFIED | Vault CTAs route to Catalog + shop anchor.
| `src/App.tsx` | `#catalog-shop` | `navigateTo()` scroll logic |  VERIFIED | Special-case `scrollTargetId === "catalog-shop"` scrolls the first buy button.
| `src/ui/navigation/landing.ts` | Catalog selection | `resolveTabAlias("catalog")` |  VERIFIED | Deep link `/?tab=catalog` resolves.
| `src/ui/tabs/CatalogTab.tsx` | `src/style.css` | `catalog-actionable/catalog-nonactionable` |  VERIFIED | Classes match CSS selectors; Playwright asserts computed styles.

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| CAT-01 (Catalog is sole purchase surface) |  SATISFIED | None found; buy buttons scoped to Catalog tabpanel and Vault has only navigation callouts. |
| CAT-04 (Actionable affordance clarity) |  SATISFIED | None found; class + CSS + computed-style Playwright coverage present. |

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | - |

## Verification Commands Executed

```bash
pnpm run test:unit -- tests/catalog.unit.test.tsx
pnpm run test:e2e -- tests/catalog-actionable-visual.spec.ts
```

## Notes

- Catalog watch purchasing is only exposed via Catalog cards (`catalog-buy-*` buttons). Automated "auto-buy" exists as an automation feature, but no other UI renders watch purchase buttons.

_Verified: 2026-02-02T05:27:56Z_
_Verifier: Claude (gsd-verifier)_
