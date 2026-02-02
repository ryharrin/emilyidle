---
phase: 39-collection-info-embedded-in-catalog
plan: 04
subsystem: testing
tags: [vitest, playwright, react, testing]

# Dependency graph
requires:
  - phase: 39-01
    provides: catalog header collection context
  - phase: 39-02
    provides: Collection tab naming and copy updates
  - phase: 39-03
    provides: domain display strings renamed to Collection
provides:
  - updated unit and e2e tests for Collection tab naming and copy
affects:
  - 39-05
  - catalog regression coverage

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tests locate Collection tab by accessible name while preserving selectors"

key-files:
  created:
    - tests/ui-screenshots.spec.ts
  modified:
    - tests/catalog.unit.test.tsx
    - tests/collection-loop.spec.ts
    - tests/unlock-clarity.spec.ts
    - tests/wear-one-bonus.spec.ts
    - tests/phase32-uat-landing-navigation.spec.ts
    - tests/phase35-uat.spec.ts
    - tests/tabs.spec.ts
    - tests/uat-screenshots.spec.ts
    - tests/career-landing.unit.test.ts
    - tests/prestige-summary.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Update visible copy assertions to match Collection naming without changing selectors"

# Metrics
duration: 4m3s
completed: 2026-02-02
---

# Phase 39 Plan 04: Collection Naming Tests Summary

**Unit and Playwright coverage now targets the Collection tab label and updated copy without altering selectors.**

## Performance

- **Duration:** 4m 3s
- **Started:** 2026-02-02T07:27:04Z
- **Completed:** 2026-02-02T07:31:07Z
- **Tasks:** 1
- **Files modified:** 11

## Accomplishments
- Updated unit + e2e tab navigation to use the Collection accessible name.
- Aligned catalog stats and coachmark assertions with Collection copy.
- Kept screenshot and UAT coverage passing under the new naming.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update tests that click/assert the “Vault” tab to use “Collection”** - `1ea093a` (test)

**Plan metadata:** _pending_

## Files Created/Modified
- `tests/ui-screenshots.spec.ts` - Screenshot harness uses Collection tab label.
- `tests/catalog.unit.test.tsx` - Unit coverage updated for Collection tab and copy.
- `tests/collection-loop.spec.ts` - E2E flow uses Collection tab name.
- `tests/phase32-uat-landing-navigation.spec.ts` - UAT navigation targets Collection.
- `tests/phase35-uat.spec.ts` - UAT tab name and panel assertions updated.
- `tests/prestige-summary.unit.test.tsx` - Prestige summary copy aligned with Collection naming.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated prestige summary test copy for Collection rename**
- **Found during:** Task 1 (Update tests that click/assert the “Vault” tab to use “Collection”)
- **Issue:** Unit test still expected "Vault cash" after Collection copy updates, blocking `pnpm run test:unit`.
- **Fix:** Updated expectation to match new "Cash and enjoyment totals" copy.
- **Files modified:** tests/prestige-summary.unit.test.tsx
- **Verification:** `pnpm run test:unit`
- **Committed in:** 1ea093a (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix was required to keep unit tests passing; no scope creep.

## Issues Encountered
- Unit test failures surfaced outdated copy expectations; updated assertions to match current UI text.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Collection naming coverage updated and passing.
- Ready to add catalog context pill regression coverage in Plan 39-05.

---
*Phase: 39-collection-info-embedded-in-catalog*
*Completed: 2026-02-02*
