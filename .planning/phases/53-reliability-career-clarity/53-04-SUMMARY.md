---
phase: 53-reliability-career-clarity
plan: 4
subsystem: career
tags: [selectors, ui, messaging]

requires:
  - "53-01"
  - "53-02"
provides:
  - "Near-term unlock summary text plus UI wiring for the Date wheel complication"
  - "Career economy card surfaces the title, summary, and detail with stable test hooks"
affects:
  - "53-05"
  - "53-06"

tech-stack:
  added: []
  patterns:
    - "Selector output now includes summaryText for unlock cues so UI copy can be deterministic."
    - "Career panel renders both title/detail and summary text for near-term unlocks with new test IDs and responsive markup."

key-files:
  created: []
  modified:
    - src/game/selectors/therapistEconomySummary.ts
    - src/ui/tabs/career/CareerPanel.tsx
    - tests/career-economy-summary.unit.test.ts

key-decisions:
  - "None - followed plan as specified"
patterns-established:
  - "Therapist near-term unlock selector now labels each branch with summaryText plus title/detail for UI reuse."
  - "Career economy card hosts a structured note that highlights the summary text before the detail narrative."

duration: 6m 2s
completed: 2026-02-10
---

# Phase 53: Plan 4 Summary

**Career clarity messaging now surfaces refined summary text plus title/detail cues for the near-term unlock timeline.**

## Performance

- **Duration:** 6m 2s
- **Started:** 2026-02-10T21:44:15Z
- **Completed:** 2026-02-10T21:51:17Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Extended `getTherapistNearTermUnlockImpact` with `summaryText` so each branch describes the imminent unlock without manual formatting.
- Rendered the new summary text in the Date wheel complication and expanded the economy card note to show title, summary, and detail with stable hooks.
- Added unit coverage for the near-term summary text in both the choice and stage branches so UI copy evolves deterministically.

## Task Commits

1. **Task 1: Add explicit near-term unlock summary text.** - `b4a4605` (feat)
2. **Task 2: Surface the title/detail guidance in the career summary card.** - `115c2ed` (feat)

**Plan metadata:** Pending docs commit for this plan.

## Files Created/Modified

- `src/game/selectors/therapistEconomySummary.ts` - Added `summaryText` plus test coverage for choice/stage branches.
- `src/ui/tabs/career/CareerPanel.tsx` - Showed summaryText in the Date wheel complication and expanded the economy summary note structure.
- `tests/career-economy-summary.unit.test.ts` - Asserted the new summary text output for choice-ready and stage unlock states.

## Decisions Made

- None - followed plan as specified

## Deviations from Plan

- None - plan executed exactly as written

## Issues Encountered

- None; all new summary text flows and tests landed cleanly.

## User Setup Required

- None - no external service configuration required.

## Next Phase Readiness

- Career clarity messaging now includes explicit summary text that the therapist session delta e2e and future reports can rely on.

---
*Phase: 53-reliability-career-clarity*  
*Completed: 2026-02-10*
