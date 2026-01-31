---
phase: 35-balance-and-help-clarity
plan: 02
subsystem: ui
tags: [help, copy, career, shop, catalog, playwright]

# Dependency graph
requires:
  - phase: 35-balance-and-help-clarity
    provides: Early-career salary window and explicit career start gate
provides:
  - Help sections for career start, stages, and shop/catalog clarity
  - ExplainButtons for career start and stage choices
  - Playwright coverage for new help anchors
affects: [career, help, ui, testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ExplainButton links to HELP_SECTION_IDS for help anchors"

key-files:
  created: []
  modified:
    - src/ui/help/helpContent.ts
    - src/ui/components/CareerNextActionCard.tsx
    - src/ui/components/CareerStageChoices.tsx
    - src/ui/tabs/CollectionTab.tsx
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/SaveTab.tsx
    - tests/explanations.spec.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Help anchors use section-specific ExplainButton test IDs"

# Metrics
duration: 6m 46s
completed: 2026-01-31
---

# Phase 35 Plan 02: Balance & Help Clarity Summary

**Career onboarding help now explains the PhD start gate, salary window loop, and stage choices with in-context ExplainButtons and verified help anchors.**

## Performance

- **Duration:** 6m 46s
- **Started:** 2026-01-31T05:38:38Z
- **Completed:** 2026-01-31T05:45:25Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Added dedicated help sections for starting your career and stage choices, plus updated progression copy.
- Clarified Shop vs Catalog language in Help and UI surfaces without selector churn.
- Added Playwright coverage for the new ExplainButtons and help anchors.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Help content to match current Career + Shop/Catalog reality** - `d370fda` (docs)
2. **Task 2: Add in-context ExplainButtons and tighten on-screen copy (no selector churn)** - `6b58a05` (feat)
3. **Task 3: Update/add minimal tests for Help anchors + key copy** - `6433a38` (test)

**Plan metadata:** _pending_

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/ui/help/helpContent.ts` - adds career start/stages sections and refreshes career/shop copy.
- `src/ui/components/CareerNextActionCard.tsx` - adds explain button for the start-career CTA.
- `src/ui/components/CareerStageChoices.tsx` - adds explain button for stage choices.
- `src/ui/tabs/CollectionTab.tsx` - clarifies Shop vs Catalog near the Shop panel.
- `src/ui/tabs/CatalogTab.tsx` - aligns Catalog header copy with archive-only intent.
- `src/ui/tabs/SaveTab.tsx` - aligns clear-save confirmation text with help guidance.
- `tests/explanations.spec.ts` - verifies new explain buttons open the correct help sections.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Help and copy updates are in place; ready to proceed to Phase 36 carry-forward UX fixes.

---
*Phase: 35-balance-and-help-clarity*
*Completed: 2026-01-31*
