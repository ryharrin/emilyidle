# Roadmap: Emily Idle

## Completed Milestones

- ✅ **v4.0 Watch Interactions & Catalog Polish** — Phases 42-47 (shipped 2026-02-05)  
  [Milestone archive](milestones/v4.0-ROADMAP.md)
- ✅ **v4.1 Next Wave** — Phases 48-51 (shipped 2026-02-06)
- ✅ **Post-v4.1 Reliability + Career Clarity** — Phase 53 (completed 2026-02-06)
- ✅ **Post-v4.1 Test Reliability + CI Stability** — Phase 54 (completed 2026-02-10)
- ✅ **v4.4 UX Flow + Gameplay Clarity** — Phase 55 (completed 2026-02-06)
- ✅ **v4.5 Full UI Audit Remediation** — Phase 56 (completed 2026-02-07)

## Planned Milestones

- 🟡 **v5.0 Unfinished Work Closure + Progression Depth** — phases 57-60 (planned)
  - `.planning/milestones/v5.0-REQUIREMENTS.md`
  - `.planning/milestones/v5.0-ROADMAP.md`

## Milestone v5.0 Unfinished Work Closure + Progression Depth (Planned)

**Goal:** Convert unfinished/partial planned items from `NOTES-02-07-26.yaml` into a closed execution
package covering session cooldown policy completion, catalog clarity, richer watch info, and
reliability guardrails.

### Phase 57: Session Policy Completion + Guidance Cleanup

**Goal:** Finish therapist-session cooldown redesign and replace broad next-unlock preview patterns
with contextual next-step guidance.

### Phase 58: Catalog Control Density + Affordability Signals

**Goal:** Use collapsed filters-by-default and affordable-card highlighting to improve first-glance
catalog actionability and reduce clutter.

### Phase 59: Watch Data Depth + Media/Tier Contracts

**Goal:** Improve watch information depth while aligning tier semantics and hardening image/base-path
contracts.

### Phase 60: Regression Guardrails + Maintainability Closure

**Goal:** Close v5.0 with deterministic tests and targeted refactors of touched high-risk modules.

## Milestone v4.1 Next Wave (Shipped)

**Goal:** Redesign session/atelier systems, polish mobile/tab UX, and deepen catalog/quality-of-life features.

## Phases

### Phase 48: Session & Atelier Rework

**Goal:** Make session cooldowns strategic, reshape winding control, and clarify atelier bonuses.

**Plans:**
- SESSION-01 — Progressive session cost + cooldown urgency indicator
- SESSION-02 — Visual circular cooldown timer
- WIND-01/WIND-02/WIND-03 — Drag-based winding interaction, movement-aware gating, and richer animation
- ATELIER-01/ATELIER-02 — Scaled atelier bonuses + blueprint cost display
- POWER-01/SALARY-01/UNLOCK-01/UPGRADE-01 — Power reserve clarity, salary alert, next unlock preview, upgrade-effect preview

**Success criteria:**
1. Sessions charge more enjoyment when repeated without hitting a hard lock.
2. Cooldown UI shows a circular progress ring next to the action button.
3. Winding is driven by crown drag with live animation and only available on applicable watches.
4. Atelier bonuses meaningfully improve the second run, and blueprints show exact costs.
5. Power reserve/payout explanations are clear, and users can preview the next unlock/upgrade effect.

### Phase 49: Mobile & UX Polish

**Goal:** Ship a responsive horizontal tab bar, keyboard shortcuts, refreshed help/modal polish, and mobile-friendly touch targets.

**Plans:**
- TAB-01/TAB-02/TAB-03 — Mobile-ready horizontal tabs with badges, snap, and grouping
- KEY-01 — Keyboard shortcuts (1-8) for tab switching
- SETTINGS-01 — Dark UI settings restyle
- TOUCH-01 — 44px tap targets everywhere
- STATS-01/SKELETON-01/etc — Stats header grouping, skeleton loaders, compact filters, hover stats, iconography cleanup, virtualization, header collapse, help modal layout, improved nostalgia toast, etc.

**Success criteria:**
1. Tab bar scrolls horizontally, snaps to labels, and remains sticky on mobile with focus states and badges.
2. Keyboard shortcuts activate tabs without interfering with other shortcuts.
3. Settings, help, and modal experience feel cohesive across desktop/mobile.
4. Mobile touch targets and onboarding cues meet accessibility guidelines.
5. Filters, hover stats, and theme polish keep the UI calm under load.

### Phase 50: Catalog & Collection Depth

**Goal:** Add richer catalog analytics, watch comparison, help signals, and Collection segmentation.

**Plans:**
- SETBONUS-01/PRESTIGE-01/TIMELINE-01 — Show set bonus progress, prestige previews, and career timeline enhancements
- COMPARE-01/COLLECT-01 — Side-by-side watch comparisons plus analytics panels
- HELP-02/VAULT-02 — Tiered help references + sticky Collection subnavs

**Success criteria:**
1. Every set bonus shows progress and unlock conditions.
2. Prestige/next-unlock previews highlight upcoming rewards.
3. Watch comparison surfaces stats, price, and movement side-by-side.
4. Collection navigation is segmented by Starter/Mid/Lux with clear help linking.

### Phase 51: Quality of Life & Events

**Goal:** Deliver offline progress, save export, undo actions, favorites, notifications, event/achievement polish, and mini-game enhancements.

**Plans:**
- [x] 51-01-PLAN.md — Offline gains cap + save import/export resilience (`OFFLINE-01`, `SAVE-01`)
- [x] 51-02-PLAN.md — Latest-purchase undo + favorites filtering (`UNDO-01`, `FAVE-01`)
- [x] 51-03-PLAN.md — Notification preferences + achievement toast gating (`NOTIF-01`, `ACHIEVE-01`)
- [x] 51-04-PLAN.md — Achievement category expansion + event calendar (`ACHIEVE-02`, `EVENT-01`)
- [x] 51-05-PLAN.md — Mini-game practice, difficulty scaling, and streak bonuses (`PRACTICE-01`, `DIFF-01`, `STREAK-01`)

**Success criteria:**
1. Returning players see capped offline gains and can import/export saves.
2. Purchases can be undone quickly, and favorites simplify catalog browsing.
3. Notification preferences cover sessions, prestige, achievements, and events.
4. Achievements send toasts and cover a broader set of behaviors.
5. Mini-games include practice, tiered difficulty, and streak bonuses.

### Phase 52: UX Redesign Spec (Complete)

**Goal:** Implement a high-clarity presentation pass that reduces interaction density, improves mobile ergonomics, and strengthens action hierarchy across Catalog/Career/Stats.

**Plans:**
- [x] 52-01-PLAN.md — Hierarchy foundations (primary CTA emphasis, tab rail discoverability, metric readability)
- [x] 52-02-PLAN.md — Mobile density pass (compact catalog mode, sticky quick actions, tap-target upgrades)
- [x] 52-03-PLAN.md — Progressive disclosure pass (Career/Stats/Help) + measurable UX delta capture

**Success criteria:**
1. Catalog default views are faster to scan, with clearer primary actions.
2. Mobile high-frequency flows reduce practical tap errors and long-scroll fatigue.
3. Career and Stats first viewport surfaces \"Now/Next\" guidance before deep diagnostics.
4. Existing gameplay mechanics and persistence contracts remain unchanged.

### Phase 53: Reliability + Career Clarity (Complete)

**Goal:** Deliver persistence reliability upgrades and close verification debt while improving short-horizon career/economy clarity.

**Plans:**
- [x] 53-01-PLAN.md — Persistence v3 migration pipeline + canonical writes
- [x] 53-02-PLAN.md — Career session value summary surface
- [x] 53-03-PLAN.md — Therapist session delta/cooldown e2e coverage
- [x] 53-04-PLAN.md — Near-term progression messaging pass
- [x] 53-05-PLAN.md — Backfill verification reports for phases 13 and 18
- [x] 53-06-PLAN.md — Integration verification + planning sync

**Success criteria:**
1. Save encoding writes canonical v3 payloads while v1/v2 inputs remain loadable.
2. Dedicated therapist session e2e verifies cash/enjoyment deltas and cooldown behavior.
3. Career first view surfaces short-horizon payout/cost/unlock guidance.
4. Previously tracked verification-report debt for phases 13/18 is closed.

### Phase 54: Test Reliability + CI Stability (Complete, readiness blocked)

**Goal:** Restore reliable, repeatable test execution across unit + e2e by removing deterministic selector/scope/timing failures and codifying CI run policy.

**Plans:**
- [x] 54-01-PLAN.md — Selector disambiguation + strict-mode hardening
- [x] 54-02-PLAN.md — Desktop/mobile project scoping cleanup
- [x] 54-03-PLAN.md — Mobile catalog/interaction helper stabilization
- [x] 54-04-PLAN.md — Runtime determinism + tolerant assertions
- [x] 54-05-PLAN.md — Catalog media verification hardening
- [x] 54-06-PLAN.md — Unit async/act warning cleanup
- [x] 54-07-PLAN.md — CI sequencing policy + full regression closeout

**Success criteria:**
1. No strict-mode selector collisions remain in active e2e suites.
2. Desktop-only expectations are not executed in mobile projects.
3. Mobile catalog/interaction tests are deterministic across Chromium + WebKit mobile projects.
4. Time-sensitive tests rely on deterministic/tolerant invariants rather than brittle exact values.
5. Unit suite runs without timing-related failures and significantly reduced async warning noise.
6. CI guidance enforces stable run order and avoids known contention modes.

**Closeout artifact:**
- `.planning/phases/54-test-reliability-ci-stability/54-07-SUMMARY.md`
- `.planning/milestones/v4.3-MILESTONE-AUDIT.md`

### Phase 55: UX Flow + Gameplay Clarity (Complete)

**Goal:** Resolve high-impact user-flow friction from the 2026-02-06 UX/gameplay audit by improving action clarity, mobile ergonomics, and interruption safety.

**Plans:**
- [x] 55-01-PLAN.md — Toast interruption-safe layout
- [x] 55-02-PLAN.md — Career primary action consolidation
- [x] 55-03-PLAN.md — Mobile density + sticky now-action rail
- [x] 55-04-PLAN.md — Catalog CTA hierarchy simplification
- [x] 55-05-PLAN.md — Catalog gating reason taxonomy
- [x] 55-06-PLAN.md — Catalog media fallback quality pass
- [x] 55-07-PLAN.md — Mobile tab rail clipping/accessibility hardening
- [x] 55-08-PLAN.md — First-session feedback strip + flow guardrails

**Success criteria:**
1. Toasts/notifications never obscure primary CTA areas in desktop or mobile layouts.
2. Career first viewport provides one canonical primary action without competing equivalent prompts.
3. Mobile high-frequency loops reduce scroll/tap fatigue through progressive disclosure and sticky action affordances.
4. Catalog cards present one dominant CTA and concise, actionable gated messaging.
5. Tab labels remain legible and discoverable across narrow viewports.
6. Early-game users can understand immediate gains and next threshold from first-session feedback.

### Phase 56: Full UI Audit Remediation (Complete)

**Goal:** Execute the full screenshot-audit remediation package to improve navigation discoverability, action hierarchy, and gameplay-loop clarity across every tab/system.

**Plans:**
- [x] 56-01-PLAN.md — Global nav discoverability + tab order (Catalog left of Collection)
- [x] 56-02-PLAN.md — Global CTA hierarchy + overlay orchestration
- [x] 56-03-PLAN.md — Career first-loop clarity
- [x] 56-04-PLAN.md — Catalog loop simplification
- [x] 56-05-PLAN.md — Collection objective clarity
- [x] 56-06-PLAN.md — Upgrades prioritization + ROI framing
- [x] 56-07-PLAN.md — Workshop/Maison/Nostalgia meta-loop messaging
- [x] 56-08-PLAN.md — Stats/Settings scanability + safety pass
- [x] 56-09-PLAN.md — Full audit regression harness + closeout sync

**Success criteria:**
1. Mobile and desktop navigation are fully discoverable, with stable tab ordering and no clipped primary labels.
2. First viewport of each tab exposes one dominant action and non-blocking overlay behavior.
3. Catalog/Collection/Upgrades loops provide concise next-step guidance with reduced repetitive interaction overhead.
4. Meta-loop reset/unlock flows show explicit before/after/delta outcomes and persistence rules.
5. Full UI coverage audit artifacts are reproducible and mapped to tab/system review sheets.

**Closeout artifacts:**
- `.planning/phases/56-full-ui-audit-remediation/56-09-SUMMARY.md`
- `output/playwright/full-ui-coverage-audit-20260207/index.md`
- `output/playwright/full-ui-coverage-audit-20260207/chromium/index.md`
- `output/playwright/full-ui-coverage-audit-20260207/chromium-mobile-pixel5/index.md`

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 42. Winding Refresh | v4.0 | 3/3 | Complete | 42-03-SUMMARY.md |
| 43. New Watch Mini-Games | v4.0 | 1/1 | Complete | 43-01-SUMMARY.md |
| 44. Interaction Feedback & Rewards | v4.0 | 1/1 | Complete | 44-01-SUMMARY.md |
| 45. Per-Watch Stats Surfaces | v4.0 | 3/3 | Complete | 45-03-SUMMARY.md |
| 46. Catalog Expansion (Tiered Variety) | v4.0 | 3/3 | Complete | 46-03-SUMMARY.md |
| 47. Mobile & UI Polish | v4.0 | 5/5 | Complete | 47-UAT.md |
| 48. Session & Atelier Rework | v4.1 | 11/11 | Complete | 48-11-SUMMARY.md |
| 49. Mobile & UX Polish | v4.1 | 10/10 | Complete | 49-10-SUMMARY.md |
| 50. Catalog & Collection Depth | v4.1 | 5/5 | Complete | 50-05-SUMMARY.md |
| 51. Quality of Life & Events | v4.1 | 5/5 | Complete | 51-05-SUMMARY.md |
| 52. UX Redesign Spec | next milestone | 3/3 | Complete | 52-03-SUMMARY.md |
| 53. Reliability + Career Clarity | post-v4.1 | 6/6 | Complete | 53-06-SUMMARY.md |
| 54. Test Reliability + CI Stability | post-v4.1 | 7/7 | Complete (readiness blocked) | 54-07-SUMMARY.md |
| 55. UX Flow + Gameplay Clarity | v4.4 | 8/8 | Complete | 55-08-SUMMARY.md |
| 56. Full UI Audit Remediation | v4.5 | 9/9 | Complete | 56-09-SUMMARY.md |
