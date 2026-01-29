---
phase: 27-career-first-economy-and-upgrades-surface
plan: 05
subsystem: testing
tags: [playwright, vitest, e2e, unit, career, upgrades]

# Dependency graph
requires:
  - phase: 27-04
    provides: "Career/Upgrades surfaces in primary nav"
provides:
  - "Unit coverage for career-only cash + session rules"
  - "Playwright coverage for Career/Upgrades navigation and preview UI"
affects:
  - "phase 27-06 human verify"
  - "e2e regression suite"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Playwright tab navigation via role=tab and data-testid selectors"

key-files:
  created:
    - tests/career-upgrades.spec.ts
  modified:
    - tests/career-first-economy.unit.test.ts
    - tests/collection-loop.spec.ts
    - tests/explanations.spec.ts
    - tests/help.spec.ts
    - tests/nostalgia-unlocks.spec.ts
    - tests/unlock-clarity.spec.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "E2E catalog interactions target catalog panel testids (catalog-buy/catalog-gate)"

# Metrics
duration: 0 min
completed: 2026-01-29
---

# Phase 27 Plan 05: Career-First Economy & Upgrades Surface Summary

**Career-first economy unit coverage plus Playwright navigation checks for Career/Upgrades with catalog-in-vault regression fixes**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-29T20:09:39Z
- **Completed:** 2026-01-29T20:10:04Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Added unit coverage for cash-only career income and therapist session policy invariants.
- Implemented Playwright coverage for Career and Upgrades navigation plus preview presence.
- Re-aligned catalog-centric E2E expectations with the Vault-embedded catalog UI.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add unit coverage for career-first cash + session rules** - `f983daf` (test)
2. **Task 2: Add Playwright coverage for Career visibility + Upgrades surface** - `9966338` (test)

**Plan metadata:** `TBD` (docs: complete plan)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `tests/career-first-economy.unit.test.ts` - Verifies cash rate and therapist session policy invariants.
- `tests/career-upgrades.spec.ts` - E2E coverage for Career and Upgrades navigation + preview UI.
- `tests/collection-loop.spec.ts` - Updated catalog-in-vault selectors for buy/gate flows and interactions.
- `tests/explanations.spec.ts` - Aligns help section expectations with catalog shopping guidance.
- `tests/help.spec.ts` - Checks lock icon presence in Nostalgia unlock cards.
- `tests/nostalgia-unlocks.spec.ts` - Uses catalog buy selectors for unlock flow validation.
- `tests/unlock-clarity.spec.ts` - Validates lock hints in Vault and Upgrades surfaces.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated stale e2e selectors after catalog tab removal**
- **Found during:** Task 2 (Playwright coverage)
- **Issue:** Existing E2E specs referenced the removed Catalog tab and legacy purchase-gate selectors, causing timeouts.
- **Fix:** Repointed tests to the Vault-embedded catalog panel, updated gate/help assertions, and adjusted lock icon coverage.
- **Files modified:** tests/collection-loop.spec.ts, tests/explanations.spec.ts, tests/help.spec.ts, tests/nostalgia-unlocks.spec.ts, tests/unlock-clarity.spec.ts
- **Verification:** pnpm run test:e2e
- **Committed in:** 9966338

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** All auto-fixes were required for the existing E2E suite to reflect the current UI. No scope creep.

## Issues Encountered
- Full Playwright run failed initially due to stale catalog tab selectors; updated specs resolved the failures.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 27-06 human verification with E2E and unit suites green.

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
