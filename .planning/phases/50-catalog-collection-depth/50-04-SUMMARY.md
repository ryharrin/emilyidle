---
phase: 50-catalog-collection-depth
plan: 4
subsystem: ui
tags: [react, css, playwright, vitest]

# Dependency graph
requires:
  - phase: 49-mobile-ux-polish
    provides: "Staged career panel layout, coachmarks, and map interactions that this timeline plugs into"
provides:
  - "Career timeline now surfaces a current-position summary, XP progress, and upcoming choice context cards"
  - "Career stages view keeps the timeline responsive, preserves Career map interactions, and collapses the meta on narrow viewports"
affects:
  - 50-catalog-collection-depth (future plans can lean on the timeline for narrative hooks)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pointer-events gating keeps the timeline meta from stealing Career map interactions"
    - "Forced Playwright interactions document the resolved pointer overlays on narrow devices"

key-files:
  created:
    - src/ui/components/careerTimelineDepth.css
  modified:
    - src/ui/components/CareerTimeline.tsx
    - src/ui/tabs/career/CareerPanel.tsx
    - tests/career-progression.unit.test.tsx
    - tests/career-landing.spec.ts
    - tests/career-map.spec.ts

key-decisions:
  - "Reuse the authority of existing career selectors so the timeline summary and upcoming cards stay accurate as progression shifts."
  - "Hide the timeline meta on viewports narrower than 620px so the Career map remains touch-friendly."
  - "Force the Playwright hover/click actions when the sidebar still overlaps the map on Pixel 5 so the regression can continue verifying scale persistence."

patterns-established:
  - "Treat timeline callouts as informative overlays with pointer-events disabled unless explicitly interactive."
  - "Use domain selectors (progress + choice status) as single sources for both UI copy and tests."

# Metrics
duration: 28 min
completed: 2026-02-06
---

# Phase 50: Plan 04 Summary

**Career timeline now has a current-position cockpit, upcoming choice cards, and responsive pointer gating so the map stays functional across breakpoints**

## Performance

- **Duration:** 28 min
- **Started:** 2026-02-06T11:33:18Z
- **Completed:** 2026-02-06T12:01:22Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added `CareerTimeline` with gradient summary cards, upcoming choice previews, and a responsive layout that collapses on mobile.
- Wired the new timeline into `CareerPanel`, wrapped the stages view in a stack, and tuned pointer-event layers so the Career map stays clickable.
- Expanded Vitest/Playwright coverage so desktop builds assert the new meta and forced actions keep the map regression passing on Pixel 5.

## Task Commits

1. **Task 1: Enrich CareerTimeline with summaries** - `45cb6d3` (feat)
2. **Task 2: Integrate timeline into Career panel** - `be06e4d` (fix)
3. **Task 3: Update career timeline tests** - `56f24c1` (test)

## Files Created/Modified

- `src/ui/components/CareerTimeline.tsx` - renders current-position cards, XP progress, and upcoming-choice summaries fed by career selectors.
- `src/ui/components/careerTimelineDepth.css` - gradient styling, pointer-event gating, stage stack layout, and responsive collapses for the timeline meta.
- `src/ui/tabs/career/CareerPanel.tsx` - wraps the timeline in a stage stack and keeps the Career map accessible around it.
- `tests/career-progression.unit.test.tsx` - adds assertions for the new summary/upcoming sections.
- `tests/career-landing.spec.ts` - verifies the timeline meta shows on desktop and hides on narrow viewports.
- `tests/career-map.spec.ts` - forces hover/click when the sidebar overlaps the map on mobile so zoom changes still persist for regression coverage.

## Decisions Made

- Original career selectors drive both the copy for the meta cards and the expected test anchors so nothing diverges between UI and specs.
- The meta overlay hides on viewports narrower than 620px to keep the Career map entirely interactive on Pixel 5 and similar phones.
- Pixel 5 still had pointer-event overlaps, so the Playwright pan-and-zoom test now uses forced hover/click to keep the regression verifying scale persistence.

## Deviations from Plan

None — all planned timeline, integration, and test updates were delivered.

## Issues Encountered

- The newly exposed timeline meta overlayed the Career sidebar on Pixel 5, blocking Playwright’s hover/click actions; forcing those actions keeps the regression passing while the UI still renders the same copy.

## User Setup Required

None — no manual configuration beyond the existing environment.

## Next Phase Readiness

- The Career tab now has the narrative hooks (current position + upcoming choices) that downstream plans can reference when they surface deeper rewards or compare experiences.
- Timeline pointer-event gating and responsive collapse mean future work can lean on this panel without regressing the Career map interaction contract.
