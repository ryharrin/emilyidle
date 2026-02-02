---
phase: 37-catalog-purchase-surface
plan: 01
subsystem: ui
tags: [react, catalog, navigation, vitest, playwright]

# Dependency graph
requires:
  - phase: 36-01
    provides: Carry-forward UX fixes and baseline navigation state
provides:
  - Catalog tab as the sole watch purchase surface
  - Vault callouts that route to Catalog shop anchors
  - Updated help + test coverage for catalog shop navigation
affects: [37-02, catalog purchase surface, navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Catalog tab owns purchase grid and catalog-shop anchor
    - CTAs navigate via onNavigate("catalog", "catalog-shop")
    - Tests assert purchase buttons are scoped to Catalog tabpanel

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/ui/navigation/landing.ts
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/help/helpContent.ts
    - tests/catalog.unit.test.tsx
    - tests/phase35-uat.spec.ts
    - tests/collection-loop.spec.ts
    - tests/explanations.spec.ts
    - tests/phase32-uat-landing-navigation.spec.ts
    - tests/career-landing.spec.ts
    - tests/nostalgia-unlocks.spec.ts
    - tests/quartz-alignment.spec.ts
    - tests/unlock-clarity.spec.ts
    - tests/wear-one-bonus.spec.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Catalog purchase surface: catalog-shop anchor lives in Catalog tabpanel"

# Metrics
duration: 1h 50m
completed: 2026-02-02
---

# Phase 37: Catalog Purchase Surface Summary

**Catalog tab now owns all watch purchases with Vault callouts, updated help copy, and expanded unit/e2e coverage for catalog-shop navigation.**

## Performance

- **Duration:** 1h 50m
- **Started:** 2026-02-02T03:20:00Z
- **Completed:** 2026-02-02T05:09:25Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments
- Promoted the Catalog tab to the sole purchase surface and removed Vault purchase panel.
- Preserved CTA scroll behavior with a single catalog-shop anchor and updated help messaging.
- Aligned unit and Playwright coverage with Catalog-as-shop navigation and ownership flows.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire a visible Catalog tab and enable catalog deep links** - `6d3c8bb` (feat)
2. **Task 2: Remove the embedded Vault shop purchase surface and move the catalog-shop anchor to Catalog** - `96b95db` (feat)
3. **Task 3: Align help copy and tests with Catalog-as-shop purchase surface** - `e4db468` (fix)

## Files Created/Modified
- `src/App.tsx` - Catalog tab visibility, tab hiding behavior, catalog props wiring.
- `src/ui/navigation/landing.ts` - Catalog deep-link alias resolves to Catalog tab.
- `src/ui/tabs/CollectionTab.tsx` - Vault callout routes to Catalog, no purchase grid.
- `src/ui/tabs/CatalogTab.tsx` - Catalog shop anchor and purchase surface.
- `src/ui/help/helpContent.ts` - Help copy aligned to catalog-as-shop.
- `tests/catalog.unit.test.tsx` - CTA scroll + CAT-01 regression coverage.
- `tests/collection-loop.spec.ts` - E2E navigation and interaction updates for catalog shop.
- `tests/phase35-uat.spec.ts` - UAT assertions for catalog shop location and copy.
- `tests/phase32-uat-landing-navigation.spec.ts` - Deep link alias now targets Catalog.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated Playwright coverage affected by catalog shop relocation**
- **Found during:** Task 3 (verification)
- **Issue:** Multiple e2e tests still navigated Vault for catalog shop, causing timeouts after the move.
- **Fix:** Updated navigation to Catalog/Owned tabs and CTA expectations across Playwright suites.
- **Files modified:** `tests/collection-loop.spec.ts`, `tests/explanations.spec.ts`, `tests/nostalgia-unlocks.spec.ts`, `tests/quartz-alignment.spec.ts`, `tests/unlock-clarity.spec.ts`, `tests/wear-one-bonus.spec.ts`, `tests/career-landing.spec.ts`, `tests/phase32-uat-landing-navigation.spec.ts`, `tests/phase35-uat.spec.ts`
- **Verification:** `pnpm run test:e2e`
- **Committed in:** `e4db468`

**2. [Rule 2 - Missing Critical] Catalog tab now respects hidden tab preferences**
- **Found during:** Task 3 (verification)
- **Issue:** Catalog could not be hidden via Settings, breaking hidden tab expectations.
- **Fix:** Added catalog to hideable tab list and combined visibility gating.
- **Files modified:** `src/App.tsx`
- **Verification:** `pnpm run test:e2e`
- **Committed in:** `e4db468`

---

**Total deviations:** 2 auto-fixed (1 Rule 3, 1 Rule 2)
**Impact on plan:** Required to keep verification green; no scope creep beyond catalog shop alignment.

## Issues Encountered
- `pnpm run lint` fails due to pre-existing unused vars/`any` warnings in unrelated files (career map selectors/components and some tests).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Catalog shop consolidation is complete and tests are green.
- Lint remains failing due to pre-existing issues; address separately if required.

---
*Phase: 37-catalog-purchase-surface*
*Completed: 2026-02-02*
