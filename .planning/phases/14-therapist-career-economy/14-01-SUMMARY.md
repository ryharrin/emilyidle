---
phase: 14-therapist-career-economy
plan: 01
subsystem: economy
tags: [therapist, sessions, enjoyment, cash, persistence, vitest]

requires:
  - phase: 13-enjoyment-economy-foundation
    provides: enjoyment currency + deterministic sim tick
provides:
  - Therapist career state with session-based cash + XP progression
  - Separate total cash rate selector for UI/sim integration
  - Save/load support and unit coverage for therapist progression
affects: [14-02-ui, 15-dual-currency]

tech-stack:
  added: []
  patterns:
    - Discrete action loop (session) spending enjoyment for payouts
    - Therapist earnings tracked separately from vault softcap/multipliers

key-files:
  created:
    - tests/therapist.unit.test.tsx
  modified:
    - src/game/state.ts
    - src/game/sim.ts
    - src/game/persistence.ts

key-decisions:
  - "Therapist earning model = active sessions (cooldown gated), not passive salary"
  - "Therapist payouts stay separate from vault softcap/upgrade multipliers"

patterns-established:
  - "Introduce new faucets via explicit state + selectors, keeping existing rate selectors stable"

duration: 7min
completed: 2026-01-23
---

# Phase 14 Plan 01: Therapist Career Economy Summary

**Cooldown-gated therapist sessions that spend enjoyment to award cash + XP, persisted in v2 saves and integrated via a total cash rate selector.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-23T03:07:05Z
- **Completed:** 2026-01-23T03:13:29Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added therapist career state + session action (enjoyment cost → cash + XP payout, cooldown gated)
- Added `getTotalCashRateCentsPerSec` and updated the sim tick to use it (vault income unchanged)
- Persisted therapist progress through save decode and added unit coverage + backward-compat defaults

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement therapist career state + cash generation hooks** - `1bd609a` (feat)
2. **Task 2: Add unit + save/load coverage for therapist career** - `7a032bc` (feat)

## Files Created/Modified

- `src/game/state.ts` - Therapist career state, selectors, and session action
- `src/game/sim.ts` - Use total cash rate selector for currency tick
- `src/game/persistence.ts` - Sanitize therapist fields during save decode
- `tests/therapist.unit.test.tsx` - Session, leveling, and persistence coverage

## Decisions Made

- Selected **sessions** model: therapist earnings happen via explicit, cooldown-gated sessions that spend enjoyment for payouts.
- Kept therapist payouts separate from vault softcap and vault multipliers (sessions are discrete payouts; vault income math unchanged).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Ready for `14-02-PLAN.md` (UI + interaction).

---
*Phase: 14-therapist-career-economy*
*Completed: 2026-01-23*
