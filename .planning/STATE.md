# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** A satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.
**Current focus:** v4.0 Phase 47 (Mobile & UI Polish)

## Current Position

Phase: 47 of 6 (v4.0 Phases 42-47)
Plan: 47-01 complete
Status: Phase 47 (Mobile & UI Polish) underway — TierBadge plan shipped
Last activity: 2026-02-04 — Completed 47-01 (TierBadge component, metadata, catalog wiring)
Progress: Phase 46 complete (3/3), Phase 47 plans started (1/3)
Next Phase: Phase 47-mobile-ui-polish (Plan 47-02 pending)

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

### Decisions Made

| Phase | Decision | Rationale |
| ----- | -------- | --------- |
| 42 | Keep telemetry math inside `useWindingRun` and feed CSS via variables | Prevents recomputing identical math in the modal and keeps animation state centralized |
| 42 | Announce the legend with visually hidden copy and add a hidden focus sentinel | Enriching the legend shifted tab order, so the sentinel keeps focus trapped without exposing extra text nodes |
| 42 | Normalize hook telemetry output so CSS variables and tests consume the same progress/tension/velocity numbers | Keeps animation math centralized and avoids divergence between UI and tests |
| 42 | Target the stop control via `data-testid`/aria label instead of role-based queries | Prevents selector collisions with the track (also a button) when locking down automation |
| 42 | Raise the soft penalty margin and treat 98.5% as the strict over-wind cutoff | Gives players more room before the penalty while keeping the warning bound to the new threshold |
| 42 | Tie the red glow hint to a data attribute driven by the penalty flag | Keeps CSS and copy aligned without re-running the math twice |
| 43 | Widened the Good window while keeping Perfect reserved for the tightest hits to reduce starter misses | Broadens the forgiving sweet spot without diluting the prestige of perfect timing |
| 43 | Exported the quartz outcome helpers so regression tests consume the same deterministic math as the modal | Prevents divergent thresholds between UI and tests and lets future plans reuse the helpers |
| 44 | Align outcome visibility + reward feedback across winding, quartz, and automatic mini-games | Ensures every interaction mini-game emits clear tiered messaging tied to precision while keeping reduced-motion/touch contracts intact |
| 44 | Centralized helper functions now own live-region + reward copy for each modal | Keeps UI and regression tests synchronized with a single source of truth |
| 44 | Exposed `data-live-state` / `data-outcome-state` attributes across the modals | Lets automation/tests detect running vs resolved states without relying on copy text |
| 44 | Added tier badges, glows, and multiplier-aware reward copy for Miss/Good/Perfect | Keeps styling, messaging, and econometric math aligned across UI and regressions |
| 44 | Miss/Good/Perfect tiers explicitly mention their 1×/2× reward math while `data-tier` styling mirrors the earned tier | Reinforces precision and keeps styling consistent across modals |
| 45 | Rendered per-watch enjoyment/cash summaries with `formatRateFromCentsPerSec` | Keeps UI strings deterministic for the new regression test while preserving the career cash label semantics |
| 45 | Kept per-watch sort/filter toggles in-memory instead of persisting them | Avoids touching guardrail localStorage keys so existing schema contracts stay valid |
| 45 | Keep cash rows tied to the therapist career salary and document the explanation string for UI/test consumers | Prevents inventing per-watch cash allocations while the view model honors the career salary anchor |
| 45 | Derive the equipped watch contribution by comparing `getEnjoymentRateCentsPerSec` with and without the worn watch | Reuses the existing enjoyment math instead of duplicating multipliers so the call-out stays low-friction |
| 45 | Sticky filter controls stay visible over long stats lists and the Collection call-out reuses selector math for the enjoyment delta | Keeps the new surface navigable on mobile while the call-out simply explains the delta produced by the selectors |
| 46 | Used CSS Scroll Snap for tab strip (native browser feature, no JS snapping) | Avoids JS snap bugs and keeps implementation lightweight |
| 46 | Kept sticky tab bar in separate DOM layer above horizontally-transformed carousel | Preserves `position: sticky` semantics and prevents CSS transform conflicts |
| 46 | Reused existing modal patterns (scroll lock, focus trap, reduced-motion) from WindingMiniGameModal | Standardizes mobile interaction patterns without introducing new modal framework |
| 47 | Tier badges use CSS variables for color theming to enable easy customization | Allows theme adjustments without touching component code |
| 47 | TierBadge metadata plus CSS variable theming drive catalog and per-watch badges | Synchronizes tier copy and colors across data + UI so the catalog and stats surfaces share the same cues while remaining configurable |

### Blockers / Concerns Carried Forward

- None.

## Session Continuity

Last session: 2026-02-04T02:51:04Z
Stopped at: Completed Phase 47-01 (TierBadge component, metadata, and catalog wiring)
Resume file: None
