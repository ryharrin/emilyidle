---
phase: 21-explanations-and-rate-transparency
plan: 02
subsystem: ui
tags: [help, explanations, react, ui]

# Dependency graph
requires:
  - phase: 20-02
    provides: Help modal entry point + persistence
provides:
  - Stable help section ids for currencies/gates/rates/nostalgia unlocks
  - Help context + ExplainButton for point-of-use explanations
  - Header enjoyment/sec display aligned with event-multiplied simulation behavior
affects:
  - 21-03
  - 21-04
  - 21-05
  - 21-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Use ExplainButton + HelpProvider (no tooltip/hover dependencies) for mobile-friendly explanations

key-files:
  created:
    - src/ui/help/helpContext.tsx
    - src/ui/help/ExplainButton.tsx
  modified:
    - src/App.tsx
    - src/style.css
    - src/ui/help/helpContent.ts
    - src/ui/help/HelpModal.tsx

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Help can be opened programmatically to a section id via HelpContext openHelpTo()"

# Metrics
duration: 0 min
completed: 2026-01-27
---

# Phase 21 Plan 02: Help Deep-Linking + ExplainButton Summary

**Expanded the Help surface with stable section ids and added an inline ExplainButton pattern so UI can open Help at the right explanation.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-01-27T04:53:16Z
- **Completed:** 2026-01-27T04:53:16Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added `HELP_SECTION_IDS` and new Help sections for gates, rates/modifiers, and nostalgia unlock ordering.
- Added `HelpProvider` + `useHelp()` context and a reusable `ExplainButton` (tap/click friendly, test-id stable).
- Wired `openHelpTo(sectionId)` into `src/App.tsx` and added a currencies ExplainButton near the header currency stats.
- Updated header enjoyment/sec display to include the current event multiplier (matching `step()` behavior).
- Added `data-testid="help-active-section"` to the Help modal for Playwright assertions.

## Verification

- `pnpm -s run typecheck` (pass)
- `pnpm -s run test:unit` (pass)
- `pnpm -s run lint` (pass)

## Decisions Made

None - followed plan as specified.

## Next Phase Readiness

Ready for 21-03 (purchase gate explanations) and 21-04 (Stats breakdown disclosures).

---
*Phase: 21-explanations-and-rate-transparency*
*Completed: 2026-01-27*
