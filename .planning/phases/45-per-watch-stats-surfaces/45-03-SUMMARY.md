---
phase: 45-per-watch-stats-surfaces
plan: 3
subsystem: testing
tags: [vitest,playwright,ui]

# Dependency graph
requires:
  - phase: 45-per-watch-stats-surfaces plan 2
    provides: foundational per-watch stats surface selectors and UI anchors
provides:
  - regression coverage for per-watch expansion stability and rate formatting
  - mobile sticky control verification for the catalog stats surface
affects: [catalog UI QA, mobile navigation tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - data-testid anchoring for per-watch rows so sorting keeps expansion targets stable
    - mobile sticky header visibility checks driven by Playwright scrolls instead of brittle offsets

key-files:
  created:
    - tests/per-watch-stats-ui.unit.test.tsx
    - tests/per-watch-stats.spec.ts
  modified:
    - src/ui/components/PerWatchStatsTable.tsx

key-decisions:
  - Render per-watch enjoyment and cash summaries with formatRateFromCentsPerSec so the new regression test can assert deterministic rate strings.
  - Keep per-watch sort/filter preferences in-memory so no new localStorage keys are introduced.

patterns-established:
  - Anchor regression queries to stable `data-testid` rows rather than relying on positions.
  - Confirm mobile sticky headers stay visible by re-checking Playwright visibility after scrolling the stats list.

# Metrics
completed: 2026-02-04
---

# Phase 45-per-watch-stats-surfaces Plan 3 Summary

**Regression coverage for per-watch expansion and mobile sticky controls with deterministic rate labels**

## Performance

- **Duration:** 9 min 20 sec
- **Started:** 2026-02-04T01:08:24Z
- **Completed:** 2026-02-04T01:17:44Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Displayed per-watch enjoyment/cash via `formatRateFromCentsPerSec` and added a Vitest regression that keeps the expanded row tied to its `data-testid` across sorts while checking the career cash label.
- Seeded the catalog save in Playwright, reached the per-watch stats surface on a mobile viewport, and asserted the surface plus enjoyment/cash columns remain visible.
- Scrolled the stats list inside the test to ensure the sticky control header stays visible and reran the localStorage guardrails to confirm no new persisted keys were needed.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a Vitest UI test for sort + controlled expansion stability** - `413290a` (fix)
2. **Task 2: Add a Playwright test for mobile sticky controls and surface presence** - `7bdff83` (test)

**Plan metadata:** HEAD (docs: complete plan)

## Files Created/Modified

- `tests/per-watch-stats-ui.unit.test.tsx` - Vitest regression anchoring expansion/sort behavior to model IDs and verifying rate text plus the career cash label.
- `tests/per-watch-stats.spec.ts` - Playwright mobile test seeding the catalog and keeping the sticky controls visible while scrolling.
- `src/ui/components/PerWatchStatsTable.tsx` - Rendered per-watch enjoyment/cash summaries with formatRateFromCentsPerSec for deterministic UI strings.

## Decisions Made

- Use `formatRateFromCentsPerSec` for enjoyment/cash summaries so the new regression test can rely on a single string per column.
- Leave per-watch sorting temporary so guardrail tests don't need updates.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Align per-watch summary formatting with regression expectations**
- **Found during:** Task 1 (Vitest regression)
- **Issue:** The plan demanded `formatRateFromCentsPerSec` strings, but the component rendered raw money values, so the test would not surface regressions.
- **Fix:** Updated `PerWatchStatsTable` to render enjoyment and cash summaries with `formatRateFromCentsPerSec`, keeping the career cash label intact.
- **Files modified:** `src/ui/components/PerWatchStatsTable.tsx`
- **Verification:** `pnpm test:unit -- tests/per-watch-stats-ui.unit.test.tsx`
- **Committed in:** `413290a`

**Total deviations:** 1 auto-fixed (Rule 1)**
**Impact on plan:** Essential to make the regression tests meaningful without scope creep.

## Issues Encountered

- None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Per-watch stats regression coverage now guards against sort/expansion and sticky-header regressions, so future work can extend coverage without revalidating this surface.
- Mobile navigation tests can now rely on the existing `data-testid` anchors instead of re-scoping selectors.

---
*Phase: 45-per-watch-stats-surfaces*
*Completed: 2026-02-04*
