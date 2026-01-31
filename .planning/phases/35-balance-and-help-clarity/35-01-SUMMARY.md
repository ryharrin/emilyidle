---
phase: 35-balance-and-help-clarity
plan: 01
subsystem: gameplay
tags: [career, pacing, onboarding, economy]

# Dependency graph
requires:
  - phase: 34-progress-feedback-and-next-actions
    provides: Career progress + next-action cues
provides:
  - Explicit career start gate (PhD program) with stipend
  - Salary window (time-limited passive income) refreshed by sessions and extended by career upgrades
  - Sessions-first Career layout and only-next-choice stage selection UI
  - Slower early leveling curve + retirement stage
affects: [career, ui, balance, persistence]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Salary is derived from state + nowMs (pure selectors, time passed in)"
    - "Legacy saves migrate to always-on salary window"

key-files:
  created:
    - src/game/selectors/therapistSalary.ts
    - tests/career-salary-window.unit.test.ts
  modified:
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/persistence.ts
    - src/game/sim.ts
    - src/game/actions/index.ts
    - src/game/actions/therapistCareer.ts
    - src/game/data/career.ts
    - src/game/selectors/index.ts
    - src/game/selectors/careerNextAction.ts
    - src/ui/tabs/career/CareerPanel.tsx
    - src/ui/components/CareerStartCard.tsx
    - src/ui/help/helpContent.ts
    - tests/**/*.unit.test.ts*

key-decisions:
  - "Implement salaried-position behavior as a time-limited salary window refreshed by sessions"

# Metrics
completed: 2026-01-31
---

# Phase 35 Plan 01: Balance & Early Career Onboarding Summary

Early career now starts with an explicit PhD enrollment action, uses a small stipend + time-limited salary window, and refreshes salary via sessions. Career UI prioritizes Sessions and hides future stage choice grids until they unlock.

## Accomplishments

- Added `careerStartId` gating so fresh saves earn 0 cash/sec until the player starts the career.
- Implemented a small PhD stipend and a salary window (`salaryActiveUntilMs`) that expires after a few minutes and refreshes when the player runs a session.
- Extended the salary window based on spent career points (career upgrades), keeping the selector/action flow pure by passing `nowMs`.
- Updated track naming to avoid "private practice" duplication (id preserved, label now "Outpatient clinic").
- Added retirement stage (level 20) with steady moderate income and sessions disabled.
- Updated Help copy to match the new early-career loop and salary window behavior.

## Verification

- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`

## Notes on Compatibility

- Existing saves that predate the salary window field migrate to an always-active salary window (`Number.MAX_SAFE_INTEGER`) to avoid unexpected income loss.

---
*Phase: 35-balance-and-help-clarity*
*Plan: 35-01*
