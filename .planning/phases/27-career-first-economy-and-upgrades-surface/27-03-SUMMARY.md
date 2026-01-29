---
phase: 27-career-first-economy-and-upgrades-surface
plan: 03
subsystem: ui
tags: [react, career, progression-tree, vitest, css]

# Dependency graph
requires:
  - phase: 27-02
    provides: Career tracks, session rules, and persistence
provides:
  - Career tab visible on fresh saves
  - Track selection and progression tree UI with respec
  - Pre-commit session cost messaging with free-first rule
affects:
  - upgrades surface
  - career verification

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Career progression nodes rendered as sectioned tree cards

key-files:
  created:
    - src/ui/components/CareerTree.tsx
  modified:
    - src/App.tsx
    - src/ui/tabs/CareerTab.tsx
    - src/style.css
    - tests/catalog.unit.test.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "CareerTree uses status-based node styling with respec controls"

# Metrics
duration: 0 min
completed: 2026-01-29
---

# Phase 27 Plan 03: Career Surface Summary

**Career tab is now visible from fresh saves with track selection, a progression tree, and explicit free-first session cost messaging.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-29T19:02:52Z
- **Completed:** 2026-01-29T19:03:18Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Made the Career tab visible on fresh saves and aligned coachmark copy with the career-first economy.
- Built track selection with level gating plus a reusable progression tree with spend/respec controls.
- Clarified session cost messaging, including the free-first rule, alongside accurate run-session gating.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make Career visible from the beginning** - `afe02d4` (feat)
2. **Task 2: Implement track + progression tree UI and session cost messaging** - `eef7019` (feat)

**Plan metadata:** TBD

## Files Created/Modified
- `src/App.tsx` - always-visible Career tab and updated coachmark copy.
- `src/ui/tabs/CareerTab.tsx` - track selection, progression tree wiring, and session messaging.
- `src/ui/components/CareerTree.tsx` - reusable tree renderer for career nodes.
- `src/style.css` - career track/tree/session styling and responsive tweaks.
- `tests/catalog.unit.test.tsx` - navigation expectations updated for Career tab visibility.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated navigation tests for the always-visible Career tab**
- **Found during:** Task 2 (unit test run)
- **Issue:** Fresh-save navigation tests expected Career to be hidden
- **Fix:** Adjusted tab visibility and focus order expectations in catalog unit tests
- **Files modified:** tests/catalog.unit.test.tsx
- **Verification:** pnpm run typecheck && pnpm run test:unit
- **Committed in:** eef7019 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Test updates required to reflect intended Career visibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 27-04-PLAN.md (Upgrades tab surface and previews).

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
