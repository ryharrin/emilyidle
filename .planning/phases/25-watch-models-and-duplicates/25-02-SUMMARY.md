---
phase: 25-watch-models-and-duplicates
plan: 02
subsystem: gameplay
tags: [watch-models, selectors, actions, enjoyment, memories]

# Dependency graph
requires:
  - phase: 25-01
    provides: duplicate reward helpers exposed via state
provides:
  - model-level watch selectors for pricing, gates, and duplicate multipliers
  - model-level buy/dismantle actions that keep tier totals in sync
  - enjoyment and collection value derived from model ownership with diminishing returns
affects: [25-03, 25-04, 25-05, 26-catalog-first-shop]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Model-level selectors built on WATCH_MODELS", "Tier totals mirrored for legacy systems"]

key-files:
  created: [src/game/selectors/watchModels.ts]
  modified:
    - src/game/actions/index.ts
    - src/game/selectors/enjoyment.ts
    - src/game/model/state.ts
    - src/game/selectors/index.ts
    - src/game/persistence.ts
    - tests/enjoyment.unit.test.tsx
    - tests/purchase-gates.unit.test.tsx
    - tests/maison.unit.test.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Use model ownership for enjoyment/memories with duplicate reward sums"
  - "Keep tier totals in sync when mutating model ownership"

# Metrics
duration: 1m 27s
completed: 2026-01-28
---

# Phase 25 Plan 02: Watch Models & Duplicates Summary

**Model-level watch ownership now drives pricing, purchase gates, enjoyment, and memories with duplicate diminishing returns while preserving tier totals for existing systems.**

## Performance

- **Duration:** 1m 27s
- **Started:** 2026-01-28T14:46:16Z
- **Completed:** 2026-01-28T14:47:43Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Added model-level selectors for pricing, purchase gates, and duplicate reward multipliers.
- Implemented model buy/dismantle actions that keep tier totals and catalog discovery in sync.
- Reworked enjoyment and memories to use model ownership with diminishing returns, updating tests.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add model-level selectors for pricing and purchase gates** - `a9d0a01` (feat)
2. **Task 2: Implement model-level buy/dismantle actions and keep tier totals in sync** - `5341403` (feat)
3. **Task 3: Apply duplicate diminishing returns to enjoyment and memories** - `24d1236` (feat)

**Plan metadata:** (docs commit pending)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/game/selectors/watchModels.ts` - Model-level pricing, gating, and duplicate multiplier selectors.
- `src/game/selectors/index.ts` - Re-exports for model-level selectors and rate breakdown updates.
- `src/game/actions/index.ts` - Model-level buy/dismantle actions with tier total sync.
- `src/game/selectors/enjoyment.ts` - Enjoyment rate derived from model ownership with diminishing returns.
- `src/game/model/state.ts` - Collection value derived from model ownership with diminishing returns.
- `src/game/persistence.ts` - Save sanitization parses watchModels data.
- `tests/enjoyment.unit.test.tsx` - Duplicate enjoyment diminishing returns assertions.
- `tests/purchase-gates.unit.test.tsx` - Model-level purchase gate coverage.
- `tests/maison.unit.test.tsx` - Model ownership in maison reset expectations.
- `tests/catalog.unit.test.tsx` - Model ownership in catalog value expectations.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Restore model ownership from saves**
- **Found during:** Task 3 (duplicate diminishing returns tests)
- **Issue:** Save sanitization ignored `watchModels`, causing model ownership to be lost between saves.
- **Fix:** Added `watchModels` parsing to save sanitization.
- **Files modified:** src/game/persistence.ts
- **Verification:** `pnpm run test:unit`
- **Committed in:** 24d1236 (part of Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Auto-fix required for correctness and persistence. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Model ownership foundation and duplicate curve are ready for phase 25-03 UI integration.
- No blockers.

---
*Phase: 25-watch-models-and-duplicates*
*Completed: 2026-01-28*
