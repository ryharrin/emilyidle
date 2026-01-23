---
phase: 14-therapist-career-economy
plan: 02
subsystem: ui
tags: [career, therapist, ui, tabs, gating, milestones, vitest]

requires:
  - phase: 14-therapist-career-economy
    plan: 01
    provides: therapist career economy selectors + actions
provides:
  - Career tab and therapist panel UI with stable test anchors and progress gating
  - Cash/sec stats display aligned to the sim's total cash rate selector
affects: [15-dual-currency]

tech-stack:
  added: []
  patterns:
    - Tab visibility gated by milestone unlocks and optional user-hidden tabs
    - Additive test selectors via data-testid while keeping existing ids stable

key-files:
  created: []
  modified:
    - src/App.tsx
    - tests/catalog.unit.test.tsx

key-decisions:
  - "Gate Career tab via unlocked milestone (collector-shelf) so fresh saves remain Vault + Save only"

patterns-established:
  - "Expose new progression systems via a dedicated tabpanel with stable data-testid anchors"

duration: 15min
completed: 2026-01-23
---

# Phase 14 Plan 02: Therapist Career UI Summary

**Added a progress-gated Career tab with a therapist panel (status, level/XP, cost/payout/cooldown, action button), plus unit coverage for tab visibility and UI anchors.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-23T03:21:02Z
- **Completed:** 2026-01-23T03:36:41Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added a new primary navigation tab (`Career`) and tabpanel UI for therapist progression
- Kept fresh-save tab list unchanged by gating Career visibility behind the `collector-shelf` milestone
- Updated cash/sec display to use the same total cash rate selector as the sim tick
- Added unit coverage for Career gating and new `data-testid` anchors (`career-panel`, `career-status`, `career-action`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Career tab + therapist panel UI** - `3a3063e` (feat)
2. **Task 2: Update unit tests for tab visibility + career UI anchors** - `3d50b5c` (test)

## Files Created/Modified

- `src/App.tsx` - Add Career tab definition, gated visibility, therapist panel UI, and cash/sec alignment
- `tests/catalog.unit.test.tsx` - Assert Career is hidden on fresh save; add unlocked-state coverage + anchor assertions

## Decisions Made

- Gated the Career tab via the `collector-shelf` milestone to preserve the fresh-save navigation contract.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Phase 14 complete; ready to plan and implement Phase 15 (dual-currency acquisition).

---
*Phase: 14-therapist-career-economy*
*Completed: 2026-01-23*
