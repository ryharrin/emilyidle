---
phase: 27-career-first-economy-and-upgrades-surface
plan: 06
subsystem: ui
tags: [uat, career, upgrades, progression]

# Dependency graph
requires:
  - phase: 27-05
    provides: Career/Upgrades regression coverage and green test suite
provides:
  - Visual UAT evidence for Career + Upgrades surfaces
  - Early-career progression is actionable on a fresh save
affects: [28-wear-one-bonus, 29-interactions-and-mini-games]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Passive therapist career XP during sim ticks (unblocks early progression)

key-files:
  created:
    - .planning/phases/27-career-first-economy-and-upgrades-surface/27-UAT.md
    - .planning/uat-artifacts/27/capture.mjs
  modified:
    - src/game/actions/index.ts
    - src/game/model/state.ts
    - src/game/sim.ts
    - src/ui/tabs/CareerTab.tsx
    - tests/therapist.unit.test.tsx
    - tests/career-progression.unit.test.ts

key-decisions:
  - "Start fresh saves with 1 career point and add passive career XP so the progression tree is actionable before track selection unlocks."

# Metrics
duration: 67 min
completed: 2026-01-29
---

# Phase 27 Plan 06: Human verification Summary

**UAT-backed validation of the Career/Upgrades surfaces, with a gap fix to make early career progression actionable on a fresh save.**

## Performance

- **Duration:** 67 min
- **Started:** 2026-01-29T21:00:02Z
- **Completed:** 2026-01-29T22:07:35Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Confirmed Career and Upgrades surfaces render correctly on desktop + mobile with stable tab navigation.
- Captured UAT screenshots for key flows and recorded outcomes in `.planning/phases/27-career-first-economy-and-upgrades-surface/27-UAT.md`.
- Fixed early-career progression deadlock by ensuring fresh saves have a spendable point and earn passive career XP over time.

## Task Commits

Verification + UAT plan; commits are not tracked per-task here.

## Files Created/Modified
- `.planning/phases/27-career-first-economy-and-upgrades-surface/27-UAT.md` - Phase 27 UAT session results (pass/fail + evidence).
- `.planning/uat-artifacts/27/*` - Screenshot evidence and capture script.
- `src/game/actions/index.ts` - Applies passive therapist career XP and awards points on level-up.
- `src/game/sim.ts` - Wires passive career progress into the sim tick.
- `src/game/model/state.ts` - Starts/reset career with 1 point; defaults points to 1 when missing.
- `src/ui/tabs/CareerTab.tsx` - Improves pre-track messaging to match the locked state.
- `tests/therapist.unit.test.tsx` - Aligns expectations for default career point.
- `tests/career-progression.unit.test.ts` - Guards passive leveling + point gain.

## Decisions Made
- Start fresh saves with 1 career point and add passive career XP so the progression tree is usable immediately, even before track selection unlocks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Unblocked early progression on fresh saves**
- **Found during:** Visual UAT (Career progression usability)
- **Issue:** Fresh saves had 0 points and no way to gain XP/levels before track unlock at level 3.
- **Fix:** Start with 1 point and apply passive career XP during sim ticks; award points on level-up.
- **Verification:** `pnpm run typecheck && pnpm run test:unit`; UAT re-run shows spendable node on fresh save.

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Required to satisfy CAREER-01 early usability and avoid a progression deadlock. No scope creep.

## Issues Encountered
- Initial UAT found a major mismatch (no actionable progression on fresh save); resolved with passive XP + starter point and re-verified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 27 UAT complete; ready to plan/execute Phase 28 (Wear-One Bonus).

---
*Phase: 27-career-first-economy-and-upgrades-surface*
*Completed: 2026-01-29*
