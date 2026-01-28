---
phase: 26-catalog-first-shop
plan: 03
subsystem: ui
tags: [react, catalog, purchases, typescript, vitest]

# Dependency graph
requires:
  - phase: 25-watch-models-and-duplicates
    provides: Model-level purchase actions and gates for catalog model ids
  - phase: 26-catalog-first-shop (26-01)
    provides: Catalog default landing behavior
  - phase: 26-catalog-first-shop (26-02)
    provides: Catalog help content for duplicates and gate reasons
provides:
  - Catalog cards render owned/price/next-multiplier action bars with buy or gate CTA
  - Catalog purchases dispatch model buys without leaving the Catalog
  - Catalog owned/unowned filtering uses model ownership counts
affects: [26-04, 26-05, catalog-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [Catalog card action bars wired to model purchase selectors and onPurchase handler]

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/ui/tabs/CatalogTab.tsx
    - src/style.css
    - tests/unlock-components.unit.test.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Catalog cards surface owned/price/next multiplier meta with gated CTAs"

# Metrics
duration: 8 min
completed: 2026-01-28
---

# Phase 26 Plan 03: Catalog-First Shop Summary

**Catalog cards now surface owned/price/next-multiplier purchase bars and dispatch model buys in-place.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-28T19:42:08Z
- **Completed:** 2026-01-28T19:50:35Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Wired CatalogTab with game state and purchase handler for inline buys.
- Added per-card action bars showing owned, price, next multiplier, and buy/gate CTA.
- Shifted owned/unowned filtering to model ownership, keeping the catalog shelf intact.

## Task Commits

Each task was committed atomically:

1. **Task 1: Pass GameState + purchase handler into CatalogTab** - `db35eab` (feat)
2. **Task 2: Add per-card buy/action bar (price, owned, CTA, lock reason)** - `01a509e` (feat)
3. **Task 3: Update owned/unowned filtering semantics to use model ownership** - `0e7cb7f` (feat)
4. **Deviation fix: Align catalog facts test with model ownership** - `28ca347` (fix)

**Plan metadata:** (docs commit pending)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/App.tsx` - Passes state and purchase handler into CatalogTab; owned filtering uses model ownership.
- `src/ui/tabs/CatalogTab.tsx` - Adds per-card purchase bars wired to model purchase selectors and actions.
- `src/style.css` - Styles catalog action bar meta and gate badges.
- `tests/unlock-components.unit.test.tsx` - Updates CatalogTab test props for new required inputs.
- `tests/catalog.unit.test.tsx` - Seeds owned model with facts for owned-view catalog facts coverage.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated unlock-components unit tests for new CatalogTab props**
- **Found during:** Task 1 (Pass GameState + purchase handler into CatalogTab)
- **Issue:** Typecheck failed because CatalogTab tests lacked required `state` and `onPurchase` props.
- **Fix:** Added `createInitialState()` and `onPurchase` mocks in test renders.
- **Files modified:** tests/unlock-components.unit.test.tsx
- **Verification:** pnpm run typecheck
- **Committed in:** db35eab (Task 1 commit)

**2. [Rule 3 - Blocking] Seeded owned catalog facts entry in unit tests**
- **Found during:** Task 3 verification (catalog owned filtering switch)
- **Issue:** Owned-view catalog facts test searched an entry without owned model data, leaving the grid empty.
- **Fix:** Seeded an owned model with facts and updated the search query.
- **Files modified:** tests/catalog.unit.test.tsx
- **Verification:** pnpm run test:unit
- **Committed in:** 28ca347 (post-task fix)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Adjustments were required to keep tests aligned with new ownership semantics; no scope creep.

## Issues Encountered
- Catalog facts unit test failed after ownership filtering switched to model ids; updated seed data to include a facts entry and reran tests.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Catalog purchase surface is in place; ready for 26-04-PLAN.md (help button + card details + feedback + unit coverage).

---
*Phase: 26-catalog-first-shop*
*Completed: 2026-01-28*
