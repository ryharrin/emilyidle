---
phase: 25-watch-models-and-duplicates
plan: 04
subsystem: testing
tags: [playwright, e2e, watch-models, selectors]

# Dependency graph
requires:
  - phase: 25-03
    provides: Vault model purchase UI and selectors
provides:
  - Playwright coverage aligned to model-based purchase selectors
  - E2E seeds that expose catalog tab and model-level gates
affects: [25-05, 26-catalog-first-shop]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "E2E selectors use model ids for vault buy/purchase-gate/locked-item hints"
    - "Seed watchModels in e2e saves to unlock catalog visibility"

key-files:
  created: []
  modified:
    - tests/collection-loop.spec.ts
    - tests/explanations.spec.ts
    - tests/help.spec.ts
    - tests/nostalgia-unlocks.spec.ts
    - tests/unlock-clarity.spec.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Target model-specific selectors in Playwright coverage"

# Metrics
duration: 49 min
completed: 2026-01-28
---

# Phase 25 Plan 04: Watch Models & Duplicates Summary

**Playwright coverage now targets model-level selectors and seeded saves include watchModels to keep catalog and gate checks stable.**

## Performance

- **Duration:** 49 min
- **Started:** 2026-01-28T15:05:00Z
- **Completed:** 2026-01-28T15:53:57Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Updated Playwright tests to use model-level selectors for purchase gates and vault buys.
- Seeded watchModels in E2E saves so catalog visibility and model gates remain deterministic.
- Aligned collection-loop E2E flow with model-based purchasing and interactions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update unit tests to use model-level purchase gating** - n/a (no changes required; verified via `pnpm run test:unit`)
2. **Task 2: Update Playwright nostalgia unlock flow for model-based Vault buy selectors** - `426b835` (test)

**Plan metadata:** (docs commit pending)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `tests/collection-loop.spec.ts` - Model-specific selectors, seeded watchModels for catalog visibility, and targeted Interact buttons.
- `tests/explanations.spec.ts` - Purchase gate explain test updated to model-level selector.
- `tests/help.spec.ts` - Lock icon test updated to model-level gate selector.
- `tests/nostalgia-unlocks.spec.ts` - Vault buy selector updated to model id for nostalgia unlock flow.
- `tests/unlock-clarity.spec.ts` - Locked item hint uses model id; seeded model ownership for catalog tab visibility.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Update additional Playwright coverage for model selectors and catalog visibility**
- **Found during:** Task 2 (Playwright verification)
- **Issue:** Multiple E2E specs still referenced tier-only selectors or seeded saves without watchModels, causing timeouts.
- **Fix:** Updated explanations/help/unlock-clarity/collection-loop specs to target model ids and seed watchModels where needed.
- **Files modified:** tests/collection-loop.spec.ts, tests/explanations.spec.ts, tests/help.spec.ts, tests/unlock-clarity.spec.ts
- **Verification:** `pnpm run test:e2e`
- **Committed in:** 426b835 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to restore E2E coverage after model-based UI changes. No scope creep.

## Issues Encountered
- Playwright suite timed out on tier-based selectors and catalog tab visibility; resolved by switching to model IDs and seeding watchModels.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- E2E coverage is aligned with model purchasing and ready for 25-05 human verification.
- No blockers.

---
*Phase: 25-watch-models-and-duplicates*
*Completed: 2026-01-28*
