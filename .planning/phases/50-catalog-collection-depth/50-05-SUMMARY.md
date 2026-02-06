---
phase: 50-catalog-collection-depth
plan: 5
subsystem: ui
tags: [react, vitest, playwright, search, accessibility]

# Dependency graph
requires:
  - phase: 50-02
    provides: "Tiered Collection sections plus explain-button wiring that surfaces the Tier badges help ID."
provides:
  - "Metadata-aware help search ranking plus related chips that link Tier badge education to catalog guidance."
  - "Unit and Playwright coverage guarding the keyword search + related chip flow."
affects:
  - phase: 51
    provides: "Quality-of-life phases can reuse metadata-driven help search and contextual chip patterns."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Normalize keywords + titles before scoring so exact matches outrank body matches without flakiness."
    - "Treat related chips as metadata-driven quick links so the UI can surface contextual guidance without hardcoding routes."

key-files:
  created:
    - src/ui/help/helpSearch.ts
    - tests/help-search.unit.test.ts
  modified:
    - src/ui/help/helpContent.ts
    - src/ui/help/HelpModal.tsx
    - src/style.css
    - tests/help.spec.ts
    - tests/explanations.spec.ts

key-decisions:
  - "Keep help section IDs untouched but add keyword/related metadata so navigation selectors and automation stay stable."
  - "Render related chips from section metadata so Tier badge education links to catalog-first and catalog-shopping guidance without new routes."

patterns-established:
  - "Normalized keyword scoring lets keywords drive the ranking position before spilling into body text matches."
  - "Metadata-driven related chips keep quick-link copy and routing tied to section definitions instead of hardcoding IDs."

# Metrics
duration: 15m
completed: 2026-02-06
---

# Phase 50: Catalog & Collection Depth Summary

**Tier badge education now surfaces via keyword-ranked help search plus contextual chips so players land on catalog guidance in one click.**

## Performance

- **Duration:** 15m
- **Started:** 2026-02-06T12:59:40Z
- **Completed:** 2026-02-06T13:14:34Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added keyword metadata to help sections (tier badges, catalog-first, catalog shopping) and shipped `searchHelpSections` so title/keyword matches always win before body matches.
- HelpModal now uses the ranking helper, reorders filtered sections, and renders related chips linking Tier badges to catalog-first/catalog-shopping without touching IDs or focus traps.
- Tests cover the ranking/flow: `tests/help-search.unit.test.ts` asserts the keyword scoring and Playwright `tests/help.spec.ts` confirms Tier keyword search surfaces the right section and related chips.

## Task Commits

1. **Task 1: Add help keyword metadata and ranking helper** – `a0f38de` (feat)
2. **Task 2: Integrate keyword-aware search and related chips** – `e8bc299` (feat)
3. **Task 3: Add unit and e2e coverage for help discoverability** – `35afd20` (test)

**Plan metadata:** b21ef60 (docs: plan complete)

## Files Created/Modified

- `src/ui/help/helpSearch.ts` – deterministic ranking helper that normalizes keywords/titles before filtering.
- `src/ui/help/helpContent.ts` – keyword metadata for Tier badges + catalog-first/shopping and related section IDs for contextual chips.
- `src/ui/help/HelpModal.tsx` – consumes the ranking helper, reorders filtered sections, and renders related chips that navigate to related sections.
- `src/style.css` – styles for the related chips and their focus/hover states.
- `tests/help-search.unit.test.ts` – verifies Tier/catalog keywords rank the expected sections before falling back to body matches.
- `tests/help.spec.ts` – ensures Tier keyword search lands on the Tier badges section and the related chips link to catalog guidance; mobile-safe click handling now guards the Prestige section selection.
- `tests/explanations.spec.ts` – uses mobile-safe explain-button clicks for career flows and validates current stats rate line items without relying on removed `<summary>` disclosures.

## Decisions Made

- Keep section IDs stable; add keyword/related metadata so help search can evolve without breaking automation selectors.
- Show related chips derived from metadata so Tier badge education can link to catalog-first/catalog-shopping references without new anchors.

## Deviations from Plan

None – plan executed exactly as written.

## Issues Encountered

Follow-up verification fix applied on 2026-02-06: hardened mobile help/explain click actions and aligned stats breakdown assertions with current card markup. Re-running `pnpm test:e2e -- tests/help.spec.ts tests/explanations.spec.ts` now passes on all projects (36 passed: chromium, chromium-mobile-pixel5, webkit-mobile-iphone12).

## User Setup Required

None – no external configuration needed.

## Next Phase Readiness

Help search metadata and Tier chip guidance are stable with automated coverage, so future phases can reuse the structured keywords and related-chip pattern when introducing more contextual help or catalog guidance surfaces.

---
*Phase: 50-catalog-collection-depth*
*Completed: 2026-02-06*
