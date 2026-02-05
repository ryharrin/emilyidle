---
phase: 48-session-atelier
plan: 9
subsystem: ui
tags: [react, selectors, tooltip, career]

# Dependency graph
requires:
  - phase: 48-02
    provides: existing salary window math + career UI skeleton
provides:
  - Deterministic salary expiration alert helpers and Career panel banner
affects:
  - 48-10
  - 48-11

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Alert thresholds live inside selectors so the UI always matches the underlying timers
    - Inline career banners call out soon/urgent levels with subtle severity variants

key-files:
  created: []
  modified:
    - src/game/selectors/therapistSalary.ts
    - tests/career-salary-window.unit.test.ts
    - src/ui/tabs/career/CareerPanel.tsx
    - src/style.css

key-decisions:
  - Keep the salary expiration thresholds inside selectors so an alert’s severity stays deterministic
  - Surface the alert as a small banner in the Career sessions card so it explains remaining time without overwhelming the header

patterns-established:
  - Selectors deliver alert objects (`level`, `remainingMs`) that UIs can format however they need
  - Alerts can be rendered with severity-based styling when the level is soon/urgent

# Metrics
duration: 8 min
completed: 2026-02-05
---

# Phase 48: Session & Atelier Rework Summary

**Salary alerts now show deterministic soon/urgent banners supplied by selector helpers**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-05T21:37:00Z
- **Completed:** 2026-02-05T21:44:58Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added selector helpers that report remaining milliseconds and alert levels (`none/soon/urgent`) with deterministic thresholds
- Covered the helper with career salary window tests to guard each state (inactive, soon, urgent)
- Rendered a subtle alert banner inside the Career sessions card with severity styling and the remaining time

## Task Commits

Each task was committed atomically:

1. **Task 1: Add selector helper for salary readout + alert level** - `c8179f0` (feat)
2. **Task 2: Render salary expiration alert in Career panel** - `a776175` (feat)

**Plan metadata:** pending

## Files Created/Modified
- `src/game/selectors/therapistSalary.ts` - Reports remaining ms and alert level (soon/urgent) for salary expiration
- `tests/career-salary-window.unit.test.ts` - Verifies alert levels and remaining ms for inactive/soon/urgent states
- `src/ui/tabs/career/CareerPanel.tsx` - Displays a salary alert banner with severity text and remaining duration
- `src/style.css` - Styles the alert banner with soon vs urgent treatment

## Decisions Made
- Keep alert thresholds inside selectors so every surface consumes the same level/remaining data
- Render the alert banner inside the Career sessions card to keep the warning contextually close to its effect

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Salary expiration clarity is complete, letting the remaining plans (unlock + upgrade previews) focus on their own alerts without re-teaching the timer thresholds.
