---
phase: 48-session-atelier
plan: 1
subsystem: gameplay
tags: [sessions, therapist, premium, selectors, ui]

# Dependency graph
requires:
  - phase: 47-mobile-ui-polish
    provides: base therapist session scaffolding + career layout
provides:
  - progressive session premium state, policy metadata, and UI indicator
affects:
  - 48-02-cooldown-ring
  - 48-09-salary-expiration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - normalize nowMs across selectors/actions so premium math stays deterministic
    - keep policy label/note data flowing through selectors into the Career UI row

key-files:
  created: []
  modified:
    - src/game/model/state.ts
    - src/game/model/types.ts
    - src/game/persistence.ts
    - src/game/actions/index.ts
    - src/game/selectors/therapistSessions.ts
    - src/game/selectors/careerNextAction.ts
    - src/ui/tabs/career/CareerPanel.tsx
    - src/style.css
    - tests/therapist.unit.test.tsx
    - tests/career-first-economy.unit.test.ts

key-decisions:
  - "Premium resets after 2× cooldown and is driven by normalized nowMs + stored counters to avoid stale spikes."
  - "Premium increments clamp at 3 and expose label/note text so the UI can explain why costs rose."

patterns-established:
  - "nowMs normalization is a gating pattern for any time-dependent selector or action."
  - "UI rows can surface selector-provided label/note with a data-testid hook to keep copy centralized."

# Metrics
completed: 2026-02-05
---

# Phase 48: session-atelier Summary

**Bounded therapist session premium math + Career UI indicator so the pacing feels intentional without locking players out.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-02-05T11:15:00Z
- **Completed:** 2026-02-05T11:55:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added persistent premium counters and policy metadata to keep consecutive session costs bounded and explainable.
- Wired premium multiplier, label, and note through the Career UI into a new `data-testid="career-session-premium"` row.
- Locked in the new path with therapist/career unit tests plus localStorage schema coverage.

## Task Commits

1. **Task 1: Track and apply progressive session premium in domain** - `af50016` (feat)
2. **Task 2: Show premium indicator + explanation in Career UI** - `0c45f09` (feat)

**Plan metadata:** pending (docs/STATE update to follow)

## Files Created/Modified

- `src/game/model/state.ts` - adds premium counters to therapist career and wires them through history.
- `src/game/model/types.ts` - makes the new counters part of the public GameState contracts.
- `src/game/persistence.ts` - sanitizes saves that omit the new fields so legacy saves stay compatible.
- `src/game/actions/index.ts` - updates the session action to charge the premium cost and bump the counter.
- `src/game/selectors/therapistSessions.ts` - calculates premium windows, multipliers, labels, and notes.
- `src/game/selectors/careerNextAction.ts` - now requests the policy with a `nowMs` to keep cues accurate.
- `src/ui/tabs/career/CareerPanel.tsx` - renders a premium percent row with the selector-provided copy.
- `src/style.css` - styles the premium row with muted label/note and layout spacing.
- `tests/therapist.unit.test.tsx` - covers repeated sessions, decay, and persistence defaults for the premium state.
- `tests/career-first-economy.unit.test.ts` - updates the policy call so the cooldown check uses the new signature.

## Decisions Made

- Premium costs rely on normalized `nowMs` and reset after a 2× cooldown window so the feeling stays fair.
- The UI reuses selector-provided label/note to keep the explanation consistent with the policy math.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Progressive premium policy + UI indicator are live, so cooldown ring (48-02), salary alert (48-09), and later session UX can build on them.
- No blockers; subsequent plans can rely on the same policy/state selectors and UI hooks.
