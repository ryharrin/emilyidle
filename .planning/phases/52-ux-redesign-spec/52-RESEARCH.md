# Phase 52: UX Redesign Spec - Research

**Researched:** 2026-02-06  
**Domain:** Visual hierarchy, mobile ergonomics, dense decision surfaces (Catalog/Career/Stats/Help)  
**Confidence:** HIGH (direct in-browser walkthrough + capture metrics)

## Summary

The current v4.1 UI is feature-rich but visually over-saturated in high-frequency flows, especially Catalog.
The strongest issue is control density and equal visual weight across primary/secondary actions. This increases
scan time, decision hesitation, and mobile thumb travel.

The redesign should not change game mechanics. It should rebalance hierarchy:
- one dominant action per surface,
- compact default rows on mobile,
- progressive disclosure for low-frequency details,
- stronger tab/state wayfinding.

## Method

- Runtime walkthrough via Playwright on:
  - Desktop (`1440x920`, Chromium)
  - Mobile (`iPhone 12`, WebKit)
- Seeded states:
  - Fresh profile
  - Advanced profile (catalog + career + event activity)
- Evidence captured to `.planning/uat-artifacts/52/raw/`
- Baseline metrics captured in `.planning/uat-artifacts/52/metrics-baseline.json`

## Measured Signals

| Surface | Visible Interactives | Below 44px Targets |
|---|---:|---:|
| Fresh Catalog (desktop) | 372 | 82 |
| Advanced Catalog (desktop) | 429 | 81 |
| Catalog (mobile) | 429 | 81 |
| Collection (mobile) | 40 | 25 |

Interpretation:
- Catalog has severe interaction crowding in both desktop and mobile.
- Small controls are overrepresented in list-heavy views.
- Mobile suffers from density plus long-scroll fatigue.

## Findings (Priority Order)

### 1) Catalog action hierarchy is ambiguous (P0)
Evidence: `fresh-catalog-desktop.jpg`, `advanced-catalog-tiers-desktop.jpg`, `mobile-catalog-iphone12.jpg`.

Observation:
- Buy/Interact, Compare, Favorite, Details, and tertiary actions appear with near-equal visual weight.
- High card density and repetitive metadata rows make it harder to identify the one "best next action".

Recommendation:
- Force one primary CTA per row/card.
- Move secondary/rare actions into a details sheet (`More`) in compact mode.
- Keep compare/favorite accessible but visually demoted.

### 2) Mobile catalog is too tall and scan-heavy by default (P0)
Evidence: `mobile-catalog-iphone12.jpg`, `mobile-catalog-scrolled-iphone12.jpg`.

Observation:
- Full metadata and controls repeat for every item.
- Long vertical travel is required before meaningful comparisons are complete.

Recommendation:
- Default mobile catalog to compact rows.
- Add sticky quick actions: Filters, Sort, Density.
- Use bottom-sheet detail expansion for deep metadata/actions.

### 3) Tap-target reliability is inconsistent in dense surfaces (P0)
Evidence: baseline metrics and `mobile-settings-iphone12.jpg`.

Observation:
- Significant number of visible interactive controls fall under practical 44px guidance.
- Inputs/toggles are tightly packed in settings and dense list rows.

Recommendation:
- Increase hit area with control wrappers, not font inflation.
- Normalize minimum interactive height for high-frequency controls.

### 4) Navigation overflow state is under-signaled (P1)
Evidence: desktop/mobile header captures.

Observation:
- Horizontal tab rails can hide off-screen options with weak edge affordances.
- Active state is visible but does not dominate enough when surfaces are visually busy.

Recommendation:
- Add edge fade/overflow cues and strengthen active indicator contrast.
- Keep existing tab IDs/semantics intact.

### 5) Career first viewport lacks immediate decision framing (P1)
Evidence: `advanced-career-desktop.jpg`.

Observation:
- Multiple panels compete equally: session controls, track matrix, planning timeline.
- The UI does not instantly answer "what should I do now?" for returning players.

Recommendation:
- Split into `Now`, `Next`, and collapsible `Deep details` blocks.
- Keep full planning surface but defer by default.

### 6) Stats is informative but not glance-efficient (P1)
Evidence: `advanced-stats-desktop.jpg`.

Observation:
- Rate breakdown, event calendar, and journal compete for equal prominence.
- Top-line decision signals are not concentrated into one strip.

Recommendation:
- Add top summary strip (`$/s`, `E/s`, active event multiplier).
- Move lower-frequency diagnostics into disclosure groups.

### 7) Help modal has good search but weak visual rhythm in long results (P2)
Evidence: `fresh-help-modal-desktop.jpg`, `mobile-help-modal-iphone12.jpg`.

Observation:
- Result cards are functionally correct but scannability degrades in long result sets.
- Visual separation between result tiers is subtle in mobile contexts.

Recommendation:
- Sharpen card contrast tiers and spacing rhythm.
- Keep search and close controls sticky in compact viewports.

## Plan Mapping

- `52-01-PLAN.md`: action hierarchy + tab rail discoverability + metric readability.
- `52-02-PLAN.md`: compact mobile catalog + sticky quick actions + tap target pass.
- `52-03-PLAN.md`: progressive disclosure (Career/Stats/Help) + metric re-capture.

## Exit Criteria for Implementation Phase

1. Catalog compact mode materially lowers above-the-fold control count on mobile.
2. Controls under practical 44px targets are cut at least by half on targeted surfaces.
3. Career and Stats first viewport present clear immediate actions before deep detail.
4. Existing selector/test IDs remain stable and test suites remain green.

---

*Phase: 52-ux-redesign-spec*  
*Research completed: 2026-02-06*
