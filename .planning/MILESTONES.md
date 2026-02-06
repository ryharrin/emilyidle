# Milestones: Emily Idle

## v4.1 Next Wave (Shipped: 2026-02-06)

**Delivered:** Completed the full post-v4.0 expansion cycle across sessions/atelier systems, mobile UX polish, catalog/collection depth, and quality-of-life + event systems.

**Phases completed:** 48-51 (31 plans)

**Key accomplishments:**
- Added progressive session cost policy, drag-based winding refresh, atelier pacing clarity, power reserve explanations, salary alerts, and unlock/upgrade previews.
- Shipped full mobile/tab UX polish (grouped horizontal tab rail, keyboard shortcuts, compact filters, modal/help improvements, focus-safe interactions).
- Added catalog/collection depth features: set bonus progress, prestige previews, compare panel, collection analytics, help keyword routing, and segmented collection navigation.
- Completed quality-of-life/event loop: capped offline progress, import/export resiliency, undo purchase, favorites, notification preferences, achievement toasts, event calendar, practice mode, tier difficulty scaling, and streak bonuses.

**Summary anchors:**
- `.planning/phases/51-quality-of-life-events/51-05-SUMMARY.md`
- `.planning/phases/50-catalog-collection-depth/50-05-SUMMARY.md`
- `.planning/phases/48-session-atelier/48-11-SUMMARY.md`

---

## v4.0 Watch Interactions & Catalog Polish (Shipped: 2026-02-05)

**Delivered:** Expanded interaction suite, per-watch stats surfaces, catalog variety, and a mobile-first UI polish sealed by Playwright regression guards and WebKit-friendly focus treatments.

**Phases completed:** 42-47 (16 plans)

**Key accomplishments:**
- Wrapped the help modal in an `#app-shell` that can be inerted while keeping keyboard focus inside the dialog
- Added manual Tab/Shift+Tab handling to close/search controls so WebKit mobile stays trapped
- Introduced sticky mobile tab navigation with responsive scroll snap + sticky positioning safeguards
- Polished tier badges across catalog, per-watch stats, and help content with shared metadata
- Expanded catalog watch variety and regression coverage across low/mid/lux tiers

**Summary:**
- Files created/modified: 120+ (CSS, Help modal, Playwright suites, TierBadge metadata)
- Lines touched: ~6,500 TypeScript/TSX + ~900 CSS
- Timeline: 2026-02-03 → 2026-02-05
- Git range: feature/v4.0-mobile-polish → feature/v4.0-help-modal

[Milestone archive](milestones/v4.0-ROADMAP.md)

---

## v3.2 Catalog/Vault Consolidation (Shipped: 2026-02-02)

**Delivered:** Unified the catalog purchase flow, renamed Vault to Collection, and embedded collection stats into the catalog with guardrail tests.

## v3.1 Career Depth & Landing (Shipped: 2026-02-01)

**Delivered:** Deeper career interactions and UX refinements.

## v3.0 Catalog-First Economy & Interactions (Shipped: 2026-01-30)

**Delivered:** Catalog/collection orientation, core gameplay pacing, and story integrations.

## v2.1 Onboarding & UX (Shipped: 2026-01-27)

**Delivered:** Onboarding flows and UX polish for early game.

## v2.0 Upcoming Major Changes to Game Design (Shipped: 2026-01-25)

**Delivered:** Reworked game economy, new watch progression, polished UI foundations.

---

## What's next

- `/gsd-new-milestone` — Define the post-v4.1 milestone scope and phase map.
- `/gsd-requirements` — Capture new requirement IDs and acceptance criteria.
- `/gsd-plan-phase 52` — Continue Phase 52 UX redesign rollout (`52-02` and `52-03` in `.planning/phases/52-ux-redesign-spec/`).
