# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** A satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.
**Current focus:** v4.1 planning (watch interaction + catalog polish follow-up)

## Current Position

Phase: 48 of 6 (next milestone planning)
Plan: 48-11 (UNLOCK-02 next unlock reveal)
Status: Phase 48 underway (10/11 plans complete)
Last activity: 2026-02-06 — Completed 48-03 (drag-based winding interaction)
Progress: Phase 48 in progress (10/11 plans complete)
Next Phase: Phase 48 (v4.1 planning)

## Accumulated Context

### v4.0 Focus

- Deepen watch interactions (winding + set time/date + strap change)
- Make per-watch enjoyment/cash rates visible for better decisions
- Expand catalog variety across low/mid/lux tiers with complete assets
- Improve mobile navigation, touch targets, and UI readability

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Remove Collection Book/Archive Shelf and fix interaction ownership checks | 2026-02-02 | c40c2aa | [001-remove-archive-shelf](./quick/001-remove-archive-shelf/) |

### Carried Gaps / Tech Debt

- Missing phase verification reports for phases 13 and 18.
- No dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.
- Catalog image contract now validates the shared `BASE_URL` constant so `LOCAL_CATALOG_ROOT` stays aligned with `import.meta.env.BASE_URL` when `pnpm test:unit -- tests/mobile-responsive.unit.test.tsx` runs.

### Decisions Made

| Phase | Decision | Rationale |
| ----- | -------- | --------- |
| 42 | Keep telemetry math inside `useWindingRun` and feed CSS via variables | Prevents recomputing identical math in the modal and keeps animation state centralized |
| 42 | Announce the legend with visually hidden copy and add a hidden focus sentinel | Enriching the legend shifted tab order, so the sentinel keeps focus trapped without exposing extra text nodes |
| 42 | Normalize hook telemetry output so CSS variables and tests consume the same progress/tension/velocity numbers | Keeps animation math centralized and avoids divergence between UI and tests |
| 42 | Target the stop control via `data-testid`/aria label instead of role-based queries | Prevents selector collisions with the track (also a button) when locking down automation |
| 43 | Widened the Good window while keeping Perfect reserved for the tightest hits to reduce starter misses | Broadens the forgiving sweet spot without diluting the prestige of perfect timing |
| 43 | Exported the quartz outcome helpers so regression tests consume the same deterministic math as the modal | Prevents divergent thresholds between UI and tests and lets future plans reuse the helpers |
| 44 | Align outcome visibility + reward feedback across winding, quartz, and automatic mini-games | Ensures every interaction mini-game emits clear tiered messaging tied to precision while keeping reduced-motion/touch contracts intact |
| 44 | Centralized helper functions now own live-region + reward copy for each modal | Keeps UI and regression tests synchronized with a single source of truth |
| 44 | Exposed `data-live-state` / `data-outcome-state` attributes across the modals | Lets automation/tests detect running vs resolved states without relying on copy text |
| 44 | Added tier badges, glows, and multiplier-aware reward copy for Miss/Good/Perfect | Keeps styling, messaging, and econometric math aligned across UI and regressions |
| 45 | Rendered per-watch enjoyment/cash summaries with `formatRateFromCentsPerSec` | Keeps UI strings deterministic for the new regression test while preserving the career cash label semantics |
| 45 | Kept per-watch sort/filter toggles in-memory instead of persisting them | Avoids touching guardrail localStorage keys so existing schema contracts stay valid |
| 45 | Keep cash rows tied to the therapist career salary and document the explanation string for UI/test consumers | Prevents inventing per-watch cash allocations while the view model honors the career salary anchor |
| 46 | Used CSS Scroll Snap for tab strip (native browser feature, no JS snapping) | Avoids JS snap bugs and keeps implementation lightweight |
| 46 | Kept sticky tab bar in separate DOM layer above horizontally-transformed carousel | Preserves `position: sticky` semantics and prevents CSS transform conflicts |
| 46 | Reused existing modal patterns (scroll lock, focus trap, reduced-motion) from WindingMiniGameModal | Standardizes mobile interaction patterns without introducing new modal framework |
| 47 | Tier badges use CSS variables for color theming to enable easy customization | Allows theme adjustments without touching component code |
| 47 | TierBadge metadata plus CSS variable theming drive catalog and per-watch badges | Synchronizes tier copy and colors across data + UI so the catalog and stats surfaces share the same cues while remaining configurable |
| 47 | Catalog cards now source tier badge metadata directly from watch models | Keeps badge colors and tooltip copy consistent across unowned and owned catalog rows without repeating the inference logic |
| 47 | Collection summary links the tier badges to the help section so Starter, Mid-tier, and Luxury meanings stay explained | Aligns the Collection copy with catalog tooltips while surfacing counts for each variety |
| 47 | Reinforced mobile regression guardrails with helper-based Playwright assertions | Keeps scroll-snap, sticky tabs, and help modal flows uniform across both iPhone 12 and Pixel 5 viewport tests |
| 47 | Centralized Playwright mobile projects around Pixel 5 + iPhone 12 | Guarantees Chrome and WebKit mobile runs are both exercised every suite instead of being optional |
| 47 | Isolated `HelpModal` inside `#app-shell` so the background can be inerted and focus restored cleanly | Enables the WebKit focus trap fix without leaking focus to background elements |
| 47 | Intercepted Tab/Shift+Tab between the help search input and close button for WebKit accessibility | Keeps iOS Safari keyboard navigation inside the modal without relying on native `aria-modal`
| 48 | Normalize nowMs + premium window before charging session cost | Guarantees premium resets after 2× cooldown and keeps costs stable for the first session after a break
| 48 | Surface premium label/note from selectors into the Career UI row | Keeps UI copy/test hooks synchronized with policy math and explains the multiplier
| 48 | Keep the prestige multiplier breakdown inside selectors before exposing it to the UI | Ensures the workshop tooltip math always matches the authoritative domain value
| 48 | Anchor the Atelier bonus tooltip next to the blueprint cost instead of duplicating math elsewhere | Keeps the bonus narrative close to the reset call-to-action without cluttering the panel
| 48 | Keep power reserve labels and explanations inside selectors so every surface reuses the same writing | Stops every UI surface from rewording reserve math and keeps the explanation deterministic
| 48 | Inline the tooltip badge next to catalog metadata while keeping the selectors as the source of truth | Keeps the dynamic reserve explanation close to the card without re-implementing the helper
| 48 | Keep salary alert thresholds inside selectors so every alert is deterministic | Prevents UI from inventing its own soon/urgent cutoffs and stays in sync with the domain timer
| 48 | Render the salary alert as a muted banner inside the sessions card for context-sensitive warnings | Lets players see the remaining time where session information already lives without extra rows
| 48 | Smooth gauge display with a CSS spring-progress variable while leaving telemetry math untouched | Lets the arc feel responsive without jittering the crown’s real data
| 48 | Wrap the crown in a tier-aware glow shell so reduced-motion users still see resolved states | Keeps glow styling separate from the crown markup and preserves accessibility overrides
| 48 | Surface the next-unlock effect summary via selector math in the featured preview row | Prevents the UI from drifting from authoritative requirement values while still highlighting the effect.
| 48 | Keep the catalog lanes wrapped in the `catalog-grid` anchor before splitting into lanes | Preserves regression selectors while allowing visual lane groupings for Starter/Mid/Lux tiers.

## Session Continuity

Last session: 2026-02-06T04:02:31Z
Stopped at: Completed Phase 48-03 (drag-based winding interaction)
Resume file: .planning/phases/48-session-atelier/48-11-PLAN.md
