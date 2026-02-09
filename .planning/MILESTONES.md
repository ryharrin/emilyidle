# Milestones: Emily Idle

## v4.5 Full UI Audit Remediation (Completed: 2026-02-07)

**Delivered:** Completed the nine-plan remediation sequence derived from full desktop/mobile screenshot coverage, including tab/system UX fixes and a repeatable indexed audit harness.

**Phase completed:** 56 (9 plans)

**Summary anchors:**
- `.planning/phases/56-full-ui-audit-remediation/56-CONTEXT.md`
- `.planning/phases/56-full-ui-audit-remediation/56-TASKLIST.md`
- `.planning/phases/56-full-ui-audit-remediation/56-01-PLAN.md` .. `56-09-PLAN.md`
- `.planning/phases/56-full-ui-audit-remediation/56-01-SUMMARY.md` .. `56-09-SUMMARY.md`
- `output/playwright/full-ui-coverage-audit-20260207/index.md`

---

## v4.4 UX Flow + Gameplay Clarity (Completed: 2026-02-06)

**Delivered:** Completed the eight-plan UX/gameplay clarity package with Career action-lane consolidation, mobile disclosure/sticky-action ergonomics, catalog CTA/gating simplification, tab-rail hardening, and first-session feedback guardrails.

**Phase completed:** 55 (8 plans)

**Summary anchors:**
- `.planning/phases/55-ux-flow-gameplay-clarity/55-CONTEXT.md`
- `.planning/phases/55-ux-flow-gameplay-clarity/55-TASKLIST.md`
- `.planning/phases/55-ux-flow-gameplay-clarity/55-01-PLAN.md` .. `55-08-PLAN.md`
- `.planning/phases/55-ux-flow-gameplay-clarity/55-01-SUMMARY.md`
- `.planning/phases/55-ux-flow-gameplay-clarity/55-08-SUMMARY.md`

---

## Post-v4.1 Test Reliability + CI Stability (Planned: 2026-02-06)

**Goal:** Stabilize unit/e2e reliability by fixing selector ambiguity, project scoping mismatches, mobile-flow flake, and timing-sensitive assertions before the next feature milestone.

**Phase planned:** 54 (7 plans)

**Planning package:**
- `.planning/phases/54-test-reliability-ci-stability/54-CONTEXT.md`
- `.planning/phases/54-test-reliability-ci-stability/54-TASKLIST.md`
- `.planning/phases/54-test-reliability-ci-stability/54-01-PLAN.md` .. `54-07-PLAN.md`

---

## Post-v4.1 Reliability + Career Clarity (Completed: 2026-02-06)

**Delivered:** Completed a six-plan interleaved package covering persistence v3 migration, therapist session delta verification coverage, and career short-horizon guidance improvements.

**Phase completed:** 53 (6 plans)

**Summary anchors:**
- `.planning/phases/53-reliability-career-clarity/53-06-SUMMARY.md`
- `.planning/phases/13-enjoyment-economy-foundation/13-VERIFICATION.md`
- `.planning/phases/18-codebase-refactor/18-VERIFICATION.md`

---

## Post-v4.1 UX Redesign Package (Completed: 2026-02-06)

**Delivered:** Completed the three-plan Phase 52 UX redesign rollout focused on hierarchy clarity, mobile density reduction, and progressive disclosure across Career/Stats/Help.

**Phase completed:** 52 (3 plans)

**Summary anchors:**
- `.planning/phases/52-ux-redesign-spec/52-01-SUMMARY.md`
- `.planning/phases/52-ux-redesign-spec/52-02-SUMMARY.md`
- `.planning/phases/52-ux-redesign-spec/52-03-SUMMARY.md`

---

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

- `/gsd-plan-phase` — Execute `54-01` (selector disambiguation + strict-mode hardening).
- `/gsd-plan-phase` — Execute `54-02` (desktop/mobile project scoping cleanup).
- `/gsd-plan-phase` — Execute `54-03` (mobile helper stabilization for catalog/interactions).
- `/gsd-plan-phase` — Continue `54-04` .. `54-07` (runtime determinism, media verification hardening, unit async cleanup, CI sequencing policy).
