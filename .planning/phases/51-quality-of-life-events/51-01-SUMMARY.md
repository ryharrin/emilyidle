---
phase: 51-quality-of-life-events
plan: 1
subsystem: ui
tags: [persistence, runtime, toast, saves]

# Dependency graph
requires:
  - phase: 50-catalog-collection-depth
    provides: "Save tab layout and persistence schema guardrails"
provides:
  - "Capped offline gain playback with runtime math and feedback toast"
  - "Validated paste/file import workflows routed through persistence helpers"
affects:
  - phase: 51-02
  - phase: 51-03 (notification + achievements)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Offline progress reuses the existing runtime step path with a fixed maximum window"
    - "All save imports go through the persistence decoder so validation is centralized"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/game/runtime/useGameRuntime.ts
    - src/game/format.ts
    - src/ui/tabs/SaveTab.tsx
    - src/style.css

key-decisions:
  - "Keep offline progress on the main runtime step path so the same economics fire whether the player is loading or playing live."
  - "Route every import (paste or file) through the persistence decoder so invalid payloads cannot bypass the guardrails."

patterns-established:
  - "Offline progress always caps to a fixed window, applies via the runtime step loop, and reports gains with a toast."
  - "Save imports share one validation/action path regardless of whether the player pastes text or uploads a file."

# Metrics
duration: 24m 30s
completed: 2026-02-06
---

# Phase 51: Quality of Life & Events Summary

**Capped offline playback plus paste/file save import guards keep the Save tab reliable before the next QoL plans ship.**

## Performance

- **Duration:** 24m 30s
- **Started:** 2026-02-06T13:44:44Z
- **Completed:** 2026-02-06T14:09:14Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replayed capped offline progress at load with the same runtime steps and surfaced a toast that explains elapsed/capped time plus currency/enjoyment gains.
- Added a shared import helper so paste and file workflows reuse the persistence decoder, keeping invalid payloads from mutating state.
- Extended the Save tab UI with a file upload path, status messaging, and muted helpers so players can restore saves via JSON exports.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add capped offline gain application path** - `243e9eb` (fix)
2. **Task 2: Expand SaveTab import/export for paste and file workflows** - `1fd3428` (fix)

**Plan metadata:** N/A

## Files Created/Modified
- `src/game/runtime/useGameRuntime.ts` - Simulate capped offline progress, call the shared callback, and persist the new state immediately.
- `src/App.tsx` - Listen for offline summaries, push toasts, expose the shared import helper, and wire SaveTab's file input.
- `src/game/format.ts` - Add a duration formatter used for the offline toast copy.
- `src/ui/tabs/SaveTab.tsx` - Add the file upload input and expose the new `onImportFile` callback.
- `src/style.css` - Style the Save tab file import controls so they match the other settings rows.

## Decisions Made
- Kept offline progress on the canonical runtime step path so we never diverge the economy between live and loaded play.
- Routed every save import attempt through `decodeSaveString` so the UI can reject bad payloads consistently before mutating state.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Running `pnpm exec vitest run tests/localstorage-schema.unit.test.tsx tests/persistence.unit.test.ts` (and variations) repeatedly hung past the 120s timeout even though the targeted tests started logging as expected. The suite may need to be rerun if these tests are required for verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Offline playback and import guards are ready for the undo/favorites (`51-02`) work to build on.
- No blockers remain; future plans can rely on the Save tab persistence contracts we just improved.

---
*Phase: 51-quality-of-life-events*
*Completed: 2026-02-06*
