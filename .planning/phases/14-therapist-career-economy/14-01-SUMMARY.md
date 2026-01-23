---
phase: 14-therapist-career-economy
plan: 01
subsystem: economy
tags: [therapist, hybrid, sessions, salary, enjoyment, cash, persistence, vitest]

requires:
  - phase: 13-enjoyment-economy-foundation
    provides: enjoyment currency + deterministic sim tick
provides:
  - Therapist career state with passive salary + session-based cash + XP progression
  - Separate total cash rate selector for UI/sim integration
  - Save/load support and unit coverage for therapist progression
affects: [14-02-ui, 15-dual-currency]

tech-stack:
  added: []
  patterns:
    - Hybrid faucet (salary + session) spending enjoyment for discrete payouts
    - Therapist salary computed separately from vault softcap, composed via total cash rate selector

key-files:
  created:
    - tests/therapist.unit.test.tsx
  modified:
    - src/game/state.ts
    - src/game/sim.ts
    - src/game/persistence.ts

key-decisions:
  - "Therapist earning model = hybrid: passive salary + cooldown-gated sessions"
  - "Therapist salary is affected by event multiplier, but not by the vault softcap"
  - "Session payouts stay separate from vault softcap/upgrade multipliers"

patterns-established:
  - "Introduce new faucets via explicit state + selectors, keeping existing rate selectors stable"

duration: 65min
completed: 2026-01-23
---

# Phase 14 Plan 01: Therapist Career Economy Summary

**Hybrid therapist career: passive salary (cash/sec) plus cooldown-gated sessions that spend enjoyment for cash + XP, composed via a total cash rate selector.**

## Performance

- **Duration:** 65 min
- **Started:** 2026-01-23T02:25:19Z
- **Completed:** 2026-01-23T03:29:55Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added therapist career state + session action (enjoyment cost → cash + XP payout, cooldown gated)
- Added passive therapist salary (`getTherapistCashRateCentsPerSec`) and composed it into `getTotalCashRateCentsPerSec`
- Updated the sim tick to use the total cash rate selector (vault income unchanged)
- Persisted therapist progress through save decode and added unit coverage + backward-compat defaults

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement therapist career state + cash generation hooks** - `948b78a` (feat)
2. **Task 2: Add unit + save/load coverage for therapist career** - `1c90d51` (test)

## Files Created/Modified

- `src/game/state.ts` - Therapist career state, selectors, and session action
- `src/game/sim.ts` - Use total cash rate selector for currency tick
- `src/game/persistence.ts` - Sanitize therapist fields during save decode
- `tests/therapist.unit.test.tsx` - Session, salary, leveling, and persistence coverage

## Decisions Made

- Selected **hybrid** model: therapist contributes a passive salary (cash/sec) and also offers cooldown-gated sessions that spend enjoyment for cash + XP.
- Salary is affected by the active event multiplier, but is not run through the vault softcap.
- Sessions remain discrete payouts (not affected by vault softcap/upgrade multipliers; vault income math unchanged).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Ready for `14-02-PLAN.md` (UI + interaction).

---
*Phase: 14-therapist-career-economy*
*Completed: 2026-01-23*
