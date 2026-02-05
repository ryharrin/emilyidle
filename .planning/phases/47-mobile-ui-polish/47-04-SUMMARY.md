---
phase: 47-mobile-ui-polish
plan: 4
subsystem: ui
tags: [react, accessibility, focus-trap, playwright]

# Dependency graph
requires:
  - phase: 47-mobile-ui-polish/47-03
    provides: Mobile navigation, touch targets, and modal regression coverage that set the baseline for keyboard flows.
provides:
  - A WebKit-compatible HelpModal focus trap that focuses the close button via useLayoutEffect and restores the prior focus target.
  - An isolated `#app-shell` container that can be inerted while the HelpModal stays interactive.
  - Phase 47 QA/Validation (mobile regression verification)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useLayoutEffect + previouslyFocusedRef + close-button focus for deterministic focus trapping on WebKit.
    - Inerting the dedicated `#app-shell` background while keeping the HelpModal outside of it so the dialog remains focusable.

key-files:
  created:
    - ".planning/phases/47-mobile-ui-polish/47-04-PLAN.md"
  modified:
    - "src/ui/help/HelpModal.tsx"
    - "src/App.tsx"

key-decisions:
  - "HelpModal needs a dedicated `#app-shell` wrapper so we can inert the background without disabling the dialog and still restore focus on close."

patterns-established:
  - "Hook-based focus management via useLayoutEffect, previouslyFocusedRef, and close-button focus before the modal paints on WebKit."
  - "Restoring the prior focus target after the modal closes so keyboard users do not lose context."

# Metrics
duration: 5 min 31 sec
completed: 2026-02-05
---

# Phase 47 Plan 4: Help modal WebKit focus trap Summary

**Help modal now traps focus on WebKit by staging focus on the close button, inerting the app shell, and restoring the prior focus target when it closes.**

## Performance

- **Duration:** 5 min 31 sec
- **Started:** 2026-02-04T23:56:17Z
- **Completed:** 2026-02-05T00:01:48Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Implemented a WebKit-friendly HelpModal focus trap that stores the previously focused element, focuses the close button inside useLayoutEffect, and inerted the background shell while open.
- Wrapped the main UI inside `#app-shell` and moved the HelpModal outside it so inerting does not disable the dialog.
- Verified the entire help flow with `pnpm test:e2e -- tests/help.spec.ts` (Playwright), confirming the fix on Chromium and WebKit mobile profiles.

## Task Commits

Each task was committed atomically:

1. **Task 1: Harden HelpModal focus trap for WebKit** - `5b5e995` (fix)

**Plan metadata:** pending (docs: complete plan)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified

- `.planning/phases/47-mobile-ui-polish/47-04-PLAN.md` - Documents the Work-in-progress plan for the HelpModal focus trap fix.
- `src/App.tsx` - Wraps the shell in `#app-shell` and renders HelpModal outside it so the shell can be inerted independently.
- `src/ui/help/HelpModal.tsx` - Tracks the previously focused element, focuses the close button via useLayoutEffect, inert/aria-hides the background, and restores focus on close.

## Decisions Made

- HelpModal needs a dedicated `#app-shell` wrapper so the background can be inerted while the dialog stays focusable and we can return focus to the prior element after closing.

## Deviations from Plan

- None - plan executed exactly as written.

## Issues Encountered

- None.

## User Setup Required

- None - no external service configuration required.

## Next Phase Readiness

- Help modal focus trap is WebKit-safe and ready for Phase 47 QA/Validation; no blockers remain.
