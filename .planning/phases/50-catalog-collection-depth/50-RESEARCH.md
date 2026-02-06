# Phase 50: Catalog & Collection Depth - Research

**Researched:** 2026-02-06
**Domain:** Catalog/Collection decision support, comparison UX, timeline extension, help discoverability
**Confidence:** HIGH (existing repo patterns cover all required surfaces)

## Summary

Phase 50 is an internal extension phase. The repo already has the primitives needed for all eight
requirements:
- set bonuses and prestige threshold selectors,
- collection tier badges and sticky section nav,
- per-watch stat rows and catalog lane organization,
- career timeline baseline,
- help modal search and section linking.

The fastest safe path is to add selector-backed view models, then wire modular UI components with
additive test anchors. No external service integration or new architecture is required.

## Discovery Level

- **Level:** 0 (skip external discovery)
- **Why:** Work follows established internal patterns, adds no external APIs, and requires no new
  dependency decisions.

## Standard Stack

Use the existing stack only:
- React + TypeScript for UI modules
- Existing selector/action architecture for derived math
- Vitest + Playwright for regression coverage

No new libraries are required for this phase.

## Architecture Patterns to Reuse

### Pattern 1: Selector-backed UI panels
- Keep progress/analytics math in selectors under `src/game/selectors/*`.
- Export through `src/game/selectors/index.ts` and `src/game/state.ts` so UI imports from state facade.
- Mirror existing patterns used by:
  - `getPrestigeUnlockProgressDetail(...)`
  - `getPerWatchStatsRows(...)`
  - `getMilestoneUnlockProgressDetail(...)`

### Pattern 2: Anchored section navigation
- Reuse `CollectionSectionNav` for smooth jumps and active-section tracking.
- Add section IDs for Starter/Mid/Lux segments; keep existing IDs stable.

### Pattern 3: Compare via existing row/gate data
- Build compare UI from existing data sources:
  - per-watch stats rows,
  - purchase gate info,
  - tier + movement metadata.
- Avoid duplicate computation branches in component state.

### Pattern 4: Help discoverability by metadata
- Keep existing section IDs/titles.
- Add keyword metadata and ranking helper instead of hard-coding one-off string checks in modal logic.

## Don't Hand-Roll

| Problem | Avoid | Use Instead |
|---|---|---|
| Progress math in components | ad-hoc `map/reduce` per panel | selector helpers with typed outputs |
| Collection segmentation state | custom scroll listeners in tab | existing `CollectionSectionNav` behavior |
| Comparison formulas | duplicated formatting + gate logic | reuse existing selectors/gates + formatting helpers |
| Help ranking logic in JSX | inline conditional spaghetti | dedicated help search helper module |

## Common Pitfalls

1. **Selector drift:** UI recomputes prices/progress differently than domain helpers.
2. **Anchor regressions:** Renaming IDs/testids breaks Playwright flows.
3. **File overlap in parallel plans:** Multiple plans touching `CollectionTab.tsx` without dependencies.
4. **Over-scoping timeline:** Rebuilding career map logic instead of extending timeline readouts.
5. **Help discoverability regressions:** New keywords added without preserving previous search behavior.

## Recommendation

Plan Phase 50 as five execute plans:
- one selector foundation plan,
- one Collection depth integration plan,
- one Catalog compare/readiness plan,
- one Career timeline expansion plan,
- one Help discoverability plan.

This keeps each plan within context budget and allows parallel execution for non-overlapping surfaces.

---

*Phase: 50-catalog-collection-depth*
*Research completed: 2026-02-06*
