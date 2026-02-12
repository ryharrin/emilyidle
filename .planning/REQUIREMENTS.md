# Requirements: Emily Idle v4.1 Next Wave

**Defined:** 2026-02-05
**Core Value:** Deliver a polished watch-collecting idle loop that feels satisfying and reliable.

## Validated

- ✓ STATS-01 — Catalog now surfaces each watch’s enjoyment rate per row so comparisons are visible without purchase (shipped v4.0)
- ✓ STATS-02 — Per-watch cash rate stays anchored to the therapist career salary and is documented in the row explanation (shipped v4.0)
- ✓ STATS-03 — Enjoyment/cash rates vary by watch, keeping tier-aware totals (shipped v4.0)
- ✓ STATS-04 — Collection call-out explains the equipped watch contribution delta (shipped v4.0)
- ✓ STATS-05 — Stats visible before owning the watch and the UI surfaces them directly in Catalog (shipped v4.0)

## Completed (v4.1)

### Sessions & Atelier
- [x] SESSION-01: Session cost increases per consecutive run instead of a hard cooldown, letting players choose between breaks and speed.
- [x] SESSION-02: Make the session cooldown timer visually prominent with a circular progress indicator next to the action button.
- [x] WIND-01: Replace the timing-based winding mini-game with direct drag control, letting players turn the crown with continuous animation.
- [x] WIND-02: Restrict the winding interaction to non-automatic (quartz/hand-wind) watches to honor movement type distinctions.
- [x] WIND-03: Enrich the winding animation with layered gauges, spring tension glow, and subtle responsive motion.
- [x] ATELIER-01: Increase atelier bonuses so the second run feels meaningfully faster and more rewarding than the first.
- [x] ATELIER-02: Show how much money is needed for the next blueprint inside the atelier UI for clearer planning.
- [x] POWER-01: Document and modulate the power reserve so the automatic mini-game’s rewards feed into clear game impact.
- [x] SALARY-01: Surface a visual alert when the career session salary window expires to prevent silent grind stalls.
- [x] UNLOCK-01: Highlight what unlocks next (new watches, tiers, or bonuses) so players know the next goal.
- [x] UPGRADE-01: Show each upgrade’s impact on enjoyment/cash (preview effect) before purchasing so players understand value.

### Mobile & UX Polish
- [x] TAB-01: Add ready-indicator badges on tabs when actions are available (sessions, upgrades, prestige, etc.).
- [x] TAB-02: Replace multi-row tab pills with a single-row horizontal scroll bar with snap points and swipe gestures.
- [x] KEY-01: Add keyboard shortcuts (1-8) for tab switching so power users jump instantly between tabs.
- [x] SETTINGS-01: Restyle Settings fieldsets/legends to match the dark UI polish.
- [x] TOUCH-01: Ensure every mobile tap target (buttons/CTAs) meets the 44px height minimum.
- [x] TAB-03: Visually group tabs into primary/progression/system buckets for faster scanning.
- [x] STATS-01: Break the stats header into logical subgroups so information is easier to scan.
- [x] SKELETON-01: Add skeleton loading states for tab switches to keep the UI from popping.
- [x] FILTER-01: Collapse filters behind a single button with the active filter count for compact mobile layouts.
- [x] HOVER-01: Show watch stats on hover to preview before clicking (desktop enhancement).
- [x] GLOW-01: Highlight affordable watches with a subtle glow/border.
- [x] ANIM-01: Animate currency values (count-up) when they change for polish.
- [x] FLOAT-01: Show floating +X text near actions to confirm results.
- [x] ONBOARD-01: Add progressive onboarding tooltips when players first encounter new sections.
- [x] FOCUS-01: Ensure visible keyboard focus states across key UI components.
- [x] ICON-01: Standardize iconography for currencies, locks, upgrades.
- [x] VIRTUAL-01: Virtualize long catalog lists for performance on low-end devices.
- [x] SORT-01: Default the catalog sort order by price ascending for better discovery.
- [x] HEADER-01: Collapse the stats header details behind an expand affordance to reduce noise.
- [x] HELP-01: Enhance the help modal’s mobile layout and search experience.
- [x] VAULT-01: Break the Collection view into sticky sections with in-page navigation.
- [x] BOTTOM-01: Present catalog details in a bottom sheet on mobile for quicker access.
- [x] MODAL-01: Increase interaction modal touch targets and add richer animations.
- [x] NOSTALGIA-01: Make nostalgia resets show as dismissible toast notifications instead of modal-only copies.
- [x] BREAK-01: Group stat modifiers with subtotals to explain their impact.
- [x] LIGHT-01: Polish the light theme’s contrast and accessibility.
- [x] SOFTCAP-01: Remove confusing softcap badges from the primary stats header and relegate details to breakdowns.
- [x] DISMANTLE-01: Hide the dismantle button until the workshop is unlocked.
- [x] CAREER-01: Add a career timeline visualization showing progression, milestones, and choice impact.

### Catalog & Collection Depth
- [x] TAB-04: Show tab-ready indicators on the catalog tabs for available quick actions.
- [x] SETBONUS-01: Display progress toward each set bonus (e.g., “X/Y watches collected”).
- [x] PRESTIGE-01: Preview what unlocks at the next prestige threshold to motivate players.
- [x] TIMELINE-01: Expand the career timeline view with current position and upcoming choices.
- [x] COMPARE-01: Let players compare two watches side-by-side (stats, price, tier, movement).
- [x] COLLECT-01: Add collection analytics panels (most valuable watch, brand/era breakdowns).
- [x] HELP-02: Surfacing help modal keywords/sections specifically for tier badge education.
- [x] VAULT-02: Segment the Collection into subnav sections (e.g., Starter/Mid/Lux). 

### Quality of Life & Events
- [x] OFFLINE-01: Calculate and present offline gains capped at a reasonable duration.
- [x] SAVE-01: Let players export/import save data via file or paste string.
- [x] UNDO-01: Offer an undo action for the most recent purchase within a short window.
- [x] FAVE-01: Favorite watches for quick reference and filter by favorites.
- [x] NOTIF-01: Provide notification preferences for events like achievements, prestige readiness, and sessions.
- [x] ACHIEVE-01: Add toast notifications when achievements unlock.
- [x] ACHIEVE-02: Expand the achievement roster with new categories (career, mini-games, prestige, collection).
- [x] EVENT-01: Surface an event calendar with countdowns and bonus explanations.
- [x] PRACTICE-01: Add practice mode for mini-games with no rewards.
- [x] DIFF-01: Implement tier-based difficulty scaling in mini-games.
- [x] STREAK-01: Award streak bonuses for consecutive perfect mini-game plays.

## Completed (v4.2 Reliability + Career Clarity)

- [x] PERSIST-01: Move canonical save encoding to `version: 3` with explicit migration semantics.
- [x] PERSIST-02: Accept and sanitize legacy `version: 1`/`version: 2` payloads while canonicalizing writes to v3.
- [x] VERIFY-01: Add dedicated Playwright coverage for therapist session cash/enjoyment deltas and cooldown transitions.
- [x] VERIFY-02: Backfill missing verification reports for phases 13 and 18.
- [x] CAREER-CLARITY-01: Add a short-horizon career summary for session payout/cost/cooldown context.
- [x] CAREER-CLARITY-02: Surface near-term unlock impact messaging from selectors.
- [x] PACE-01: Expose salary window timing summary in career first view.

## Completed (v4.3 Test Reliability + CI Stability)

- [x] TEST-SELECT-01: Remove strict-mode locator ambiguity by using unique, intent-specific anchors in e2e tests.
- [x] TEST-SCOPE-01: Ensure desktop-only assertions are scoped to desktop projects and excluded from mobile project runs.
- [x] TEST-MOBILE-01: Stabilize mobile catalog/owned/interactions flows with shared helper-driven navigation and click handling.
- [x] TEST-DETERMINISM-01: Replace timing-sensitive exact-value assertions with deterministic runtime controls or tolerant invariants.
- [x] TEST-MEDIA-01: Harden catalog image rendering verification so base-path/media validity checks avoid decode-timing flake.
- [x] TEST-UNIT-ASYNC-01: Remove sleep-based waits and reduce `act(...)` warning noise in unit tests.
- [x] CI-STABILITY-01: Document and enforce stable local/CI execution order to avoid unit/e2e contention and improve reproducibility.

Readiness note:
- Milestone readiness is currently blocked by failing verification gates; see `.planning/milestones/v4.3-MILESTONE-AUDIT.md`.

## Completed (v4.4 UX Flow + Gameplay Clarity)

- [x] UXFLOW-01: Make notification/toast layout interruption-safe so primary gameplay CTAs are never obscured.
- [x] UXFLOW-02: Consolidate Career first-view action guidance into one canonical primary-action module.
- [x] UXFLOW-03: Apply mobile progressive disclosure and sticky now-action affordances to reduce long-session scroll/tap fatigue.
- [x] UXFLOW-04: Simplify catalog card action hierarchy to one dominant CTA with demoted secondary actions.
- [x] UXFLOW-05: Normalize catalog gating explanations into concise taxonomy-driven reasons with clear next steps.
- [x] UXFLOW-06: Improve catalog fallback media treatment and verify missing-asset states remain intentional and trustworthy.
- [x] UXFLOW-07: Harden mobile tab rail label legibility and active-tab discoverability on narrow viewports.
- [x] UXFLOW-08: Surface first-session cause/effect feedback (recent gains + next threshold) and guard with end-to-end flow checks.

## Completed (v4.5 Full UI Audit Remediation)

- [x] UXAUDIT-01: Keep primary tab order `Career -> Catalog -> Collection` and ensure tab labels remain fully discoverable on narrow mobile viewports.
- [x] UXAUDIT-02: Enforce one dominant first-viewport CTA per tab and standardize secondary/tertiary action demotion.
- [x] UXAUDIT-03: Prevent toast/modal/help overlays from occluding primary-action zones during active play loops.
- [x] UXAUDIT-04: Simplify Catalog card controls and blocked-state guidance to reduce repetitive interaction overhead.
- [x] UXAUDIT-05: Improve Collection first-viewport objective clarity and reduce low-signal empty/blank panel presentation.
- [x] UXAUDIT-06: Reframe Upgrades around recommendation + ROI/payback context for faster decisions.
- [x] UXAUDIT-07: Standardize Workshop/Maison/Nostalgia reset/unlock messaging with explicit before/after/delta and persistence rules.
- [x] UXAUDIT-08: Improve Stats/Settings scanability and isolate destructive controls for safer flows.
- [x] UXAUDIT-09: Maintain full UI screenshot coverage harness with per-tab manifests and review-index artifacts.

## Planned (v5.0 Unfinished Work Closure + Progression Depth)

Derived from unfinished/partial/planned entries in `NOTES-02-07-26.yaml`.

- [x] SESSION-03: Remove hard therapist-session cooldown lockout and rely on escalating enjoyment premiums plus anti-abuse scaling. (Phase 57)
- [x] SESSION-04: Keep escalating session cost feedback explicit so repeat-run risk/reward remains clear. (Phase 57)
- [x] GUIDE-01: Replace broad next-unlock preview surfaces with concise, contextual next-step guidance in the active gameplay view. (Phase 57)
- [x] FILTER-02: Use collapsed filter controls with active-count badge as default catalog behavior. (Phase 58)
- [x] CATALOG-11: Add affordable-watch highlighting treatment for actionable catalog cards. (Phase 58)
- [x] NAV-01: Improve navigation/readiness scanning cues across tabs without changing persistence contracts. (Phase 58)
- [x] CATALOG-12: Expand high-value watch information depth in catalog/detail surfaces without first-viewport clutter regression. (Phase 59)
- [x] DATA-01: Align tier semantics toward movement-informed mapping where applicable and keep metadata/tests consistent. (Phase 59)
- [x] MEDIA-01: Enforce catalog image/base-path contract checks for deployment path safety. (Phase 59)
- [x] TEST-01: Add/refresh deterministic unit/e2e guardrails for v5.0 changes. (Phase 60)
- [x] DEBT-01: Split oversized touched modules to reduce regression risk and improve maintainability. (Phase 60)

## Out of Scope

- Multiplayer, social sharing, watch trading, AR, custom watch design, virtual exhibitions, mentorship systems, watch clubs, seasonal events, watch customization — remain explicitly rejected (see NOTES-02-02-26).
- Any feature requiring multiplayer infrastructure is deferred.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESSION-01 | Phase 48 | Complete |
| SESSION-02 | Phase 48 | Complete |
| WIND-01 | Phase 48 | Complete |
| WIND-02 | Phase 48 | Complete |
| WIND-03 | Phase 48 | Complete |
| ATELIER-01 | Phase 48 | Complete |
| ATELIER-02 | Phase 48 | Complete |
| POWER-01 | Phase 48 | Complete |
| SALARY-01 | Phase 48 | Complete |
| UNLOCK-01 | Phase 48 | Complete |
| UPGRADE-01 | Phase 48 | Complete |
| TAB-01 | Phase 49 | Complete |
| TAB-02 | Phase 49 | Complete |
| KEY-01 | Phase 49 | Complete |
| SETTINGS-01 | Phase 49 | Complete |
| TOUCH-01 | Phase 49 | Complete |
| TAB-03 | Phase 49 | Complete |
| STATS-01 | Phase 49 | Complete |
| SKELETON-01 | Phase 49 | Complete |
| FILTER-01 | Phase 49 | Complete |
| HOVER-01 | Phase 49 | Complete |
| GLOW-01 | Phase 49 | Complete |
| ANIM-01 | Phase 49 | Complete |
| FLOAT-01 | Phase 49 | Complete |
| ONBOARD-01 | Phase 49 | Complete |
| FOCUS-01 | Phase 49 | Complete |
| ICON-01 | Phase 49 | Complete |
| VIRTUAL-01 | Phase 49 | Complete |
| SORT-01 | Phase 49 | Complete |
| HEADER-01 | Phase 49 | Complete |
| HELP-01 | Phase 49 | Complete |
| VAULT-01 | Phase 49 | Complete |
| BOTTOM-01 | Phase 49 | Complete |
| MODAL-01 | Phase 49 | Complete |
| NOSTALGIA-01 | Phase 49 | Complete |
| BREAK-01 | Phase 49 | Complete |
| LIGHT-01 | Phase 49 | Complete |
| SOFTCAP-01 | Phase 49 | Complete |
| DISMANTLE-01 | Phase 49 | Complete |
| CAREER-01 | Phase 49 | Complete |
| SETBONUS-01 | Phase 50 | Complete |
| PRESTIGE-01 | Phase 50 | Complete |
| TIMELINE-01 | Phase 50 | Complete |
| COMPARE-01 | Phase 50 | Complete |
| COLLECT-01 | Phase 50 | Complete |
| HELP-02 | Phase 50 | Complete |
| VAULT-02 | Phase 50 | Complete |
| OFFLINE-01 | Phase 51 | Complete |
| SAVE-01 | Phase 51 | Complete |
| UNDO-01 | Phase 51 | Complete |
| FAVE-01 | Phase 51 | Complete |
| NOTIF-01 | Phase 51 | Complete |
| ACHIEVE-01 | Phase 51 | Complete |
| ACHIEVE-02 | Phase 51 | Complete |
| EVENT-01 | Phase 51 | Complete |
| PRACTICE-01 | Phase 51 | Complete |
| DIFF-01 | Phase 51 | Complete |
| STREAK-01 | Phase 51 | Complete |
| PERSIST-01 | Phase 53 | Complete |
| PERSIST-02 | Phase 53 | Complete |
| VERIFY-01 | Phase 53 | Complete |
| VERIFY-02 | Phase 53 | Complete |
| CAREER-CLARITY-01 | Phase 53 | Complete |
| CAREER-CLARITY-02 | Phase 53 | Complete |
| PACE-01 | Phase 53 | Complete |
| TEST-SELECT-01 | Phase 54 | Complete |
| TEST-SCOPE-01 | Phase 54 | Complete |
| TEST-MOBILE-01 | Phase 54 | Complete |
| TEST-DETERMINISM-01 | Phase 54 | Complete |
| TEST-MEDIA-01 | Phase 54 | Complete |
| TEST-UNIT-ASYNC-01 | Phase 54 | Complete |
| CI-STABILITY-01 | Phase 54 | Complete |
| UXFLOW-01 | Phase 55 | Complete |
| UXFLOW-02 | Phase 55 | Complete |
| UXFLOW-03 | Phase 55 | Complete |
| UXFLOW-04 | Phase 55 | Complete |
| UXFLOW-05 | Phase 55 | Complete |
| UXFLOW-06 | Phase 55 | Complete |
| UXFLOW-07 | Phase 55 | Complete |
| UXFLOW-08 | Phase 55 | Complete |
| UXAUDIT-01 | Phase 56 | Complete |
| UXAUDIT-02 | Phase 56 | Complete |
| UXAUDIT-03 | Phase 56 | Complete |
| UXAUDIT-04 | Phase 56 | Complete |
| UXAUDIT-05 | Phase 56 | Complete |
| UXAUDIT-06 | Phase 56 | Complete |
| UXAUDIT-07 | Phase 56 | Complete |
| UXAUDIT-08 | Phase 56 | Complete |
| UXAUDIT-09 | Phase 56 | Complete |

**Coverage:**
- v1 requirements: 74 total
- Mapped to phases: 74
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-10 after Phase 54 execution closeout and CI reliability policy sync*
