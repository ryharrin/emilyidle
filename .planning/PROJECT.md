# Project Overview

## What This Is
Emily Idle is a browser-based watch-collecting idle/incremental game that blends tactile mini-games, catalog discovery, and portfolio management across Career → Collection → Atelier loops.

## Core Value
Deliver a satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.

## Last Shipped Milestone: v4.1 Next Wave (Shipped: 2026-02-06)
**Goal:** Redesign sessions and atelier systems, finish the mobile/UX polish, and deepen catalog depth and quality-of-life features.
**Delivered features:**
- Sessions reward strategic choice through progressive costs, visual cooldown cues, and richer winding interactions.
- Mobile UX receives sticky horizontal tabs, keyboard shortcuts, focus-safe help modals, and accessibility-friendly touch targets.
- The catalog and Collection gain analytics, comparison tools, and notifications tied to achievements/events.
- Quality-of-life updates (offline gains, save import/export, undo, favorites, notifications, mini-game practice) and new achievements/events round out the experience.

## Current Milestones
Immediate execution focus remains Post-v4.1 Phase 54 test reliability + CI stability hardening; Phase 56 full UI audit remediation is now fully executed with indexed desktop/mobile evidence.

### Current planning package (execution now)
- Phase 54 test reliability + CI stability package is authored in `.planning/phases/54-test-reliability-ci-stability/`:
  - `54-CONTEXT.md`
  - `54-01-PLAN.md` .. `54-07-PLAN.md`
  - `54-TASKLIST.md`

### Recently completed package (v4.5 closeout)
- Phase 56 full UI audit remediation package is fully executed in `.planning/phases/56-full-ui-audit-remediation/`:
  - `56-CONTEXT.md`
  - `56-01-PLAN.md` .. `56-09-PLAN.md`
  - `56-TASKLIST.md`
  - `56-01-SUMMARY.md` .. `56-09-SUMMARY.md`
- Full indexed audit artifacts now live under `output/playwright/full-ui-coverage-audit-20260207/`:
  - `index.md` / `index.json`
  - project indexes for `chromium` and `chromium-mobile-pixel5`
  - rubric-tagged `review-sheets/*-checklist.md` and per-tab contact sheets

### Recently completed package (from UX/gameplay audit)
- Phase 55 UX flow + gameplay clarity package is fully executed in `.planning/phases/55-ux-flow-gameplay-clarity/`:
  - `55-CONTEXT.md`
  - `55-01-PLAN.md` .. `55-08-PLAN.md`
  - `55-TASKLIST.md`
  - `55-01-SUMMARY.md`
  - `55-08-SUMMARY.md`

### Recently completed planning package
- Phase 53 reliability + career clarity package is fully executed in `.planning/phases/53-reliability-career-clarity/`:
  - `53-CONTEXT.md`
  - `53-01-PLAN.md` .. `53-06-PLAN.md`
  - `53-TASKLIST.md`
  - `53-06-SUMMARY.md`
- Phase 52 UX redesign spec is fully executed in `.planning/phases/52-ux-redesign-spec/`:
  - `52-CONTEXT.md`
  - `52-RESEARCH.md`
  - `52-01-DESIGN.md`
  - `52-01-PLAN.md`
  - `52-02-PLAN.md`
  - `52-03-PLAN.md`
  - `52-01-SUMMARY.md`
  - `52-02-SUMMARY.md`
  - `52-03-SUMMARY.md`
  - `52-TASKLIST.md`
- Evidence artifacts live in `.planning/uat-artifacts/52/` (`README.md`, `capture.mjs`, `raw/*.jpg`, metrics snapshots).

## Requirements
### Validated
- ✓ STATS-01 — Catalog now surfaces each watch’s enjoyment rate per row so comparisons are visible without purchase (v4.0)
- ✓ STATS-02 — Per-watch cash rate stays anchored to the therapist career salary and is documented in the row explanation (v4.0)
- ✓ STATS-03 — Enjoyment/cash rates vary by watch, with tier-aware totals (v4.0)
- ✓ STATS-04 — Collection call-out explains the equipped watch contribution delta (v4.0)
- ✓ STATS-05 — Stats visible before owning the watch and the UI surfaces them directly in Catalog (v4.0)

### Completed in v4.1
The v4.1 requirement clusters are fully implemented and documented:
- **Sessions & Atelier systems** (SESSION-01 through UPGRADE-01)
- **Mobile & UX polish** (TAB-01 through CAREER-01)
- **Catalog & Collection depth** (SETBONUS-01 through VAULT-02)
- **Quality of Life & Events** (OFFLINE-01 through STREAK-01)
See `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` for updated completion states.

### Out of Scope
- Multiplayer, social sharing, watch trading, augmented reality, custom watch design, virtual exhibitions, mentorship, watch clubs, seasonal events, and any feature that depends on multiplayer infrastructure remain explicitly rejected (per NOTES-02-02-26).

## Context
- v4.0 delivered tier badge theming, per-watch stats, catalog variety, mobile navigation polish, and WebKit-friendly focus handling; we now build atop that foundation.
- Mobile regression coverage spans Pixel 5 (Chrome) and iPhone 12 (WebKit) viewports.
- Current blockers identified by Phase 54 intake: selector ambiguity in e2e, desktop/mobile scope mismatch, mobile interaction flow flake, and timing-sensitive assertion brittleness.
- Phase 55 audit findings are now implemented (toast interruption safety, mobile density, catalog action hierarchy, and first-session guidance clarity), with follow-up reliability work tracked in Phase 54.
- Full screenshot audit artifacts and indexes now exist under `output/playwright/full-ui-coverage-audit-20260207/`, including per-tab manifests and rubric-tagged review sheets for desktop and mobile projects.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cash rows stay tied to the therapist career rate with explicit explanation strings | Prevents inventing per-watch cash allocations while preserving determinism | ✓ Good |
| Equipped watch contribution is derived via delta comparisons inside `getEnjoymentRateCentsPerSec` | Centralizes the math instead of duplicating multipliers | ✓ Good |
| Sticky mobile tabs keep `position: sticky` plus `align-self: start` inside the hero grid | Avoids focus loss while scrolling | ✓ Good |
| The HelpModal sits inside `#app-shell` so the shell can be inerted and focus restored cleanly | Enables WebKit focus trap fix | ✓ Good |
| Tab/Shift+Tab between the help search input and Close button is intercepted manually | Keeps iOS Safari keyboard navigation inside the modal | ✓ Good |

## Next Steps
- `/gsd-plan-phase` — Execute `54-01` selector disambiguation.
- `/gsd-plan-phase` — Execute `54-02` desktop/mobile project scoping cleanup.
- `/gsd-plan-phase` — Execute `54-03` mobile-flow helper stabilization.
- `/gsd-plan-phase` — Continue `54-04` through `54-07` reliability hardening after initial selector/scope/mobile fixes.
- `/prompts:project.progress` — Reconfirm post-v4.5 state before opening the next feature package.

<details>
<summary>Archived context (pre-v4.1 milestone)</summary>

```markdown
# Project Overview

## Current State

- v4.0 Watch Interactions & Catalog Polish is shipped: tier badges and catalog metadata share a single source of truth, per-watch stats are visible with sticky filters, catalog variety spans low/mid/lux tiers, and mobile navigation and help modal flows are regression guarded (WebKit focus trap + sticky tab bar + tier badge CSS).
- Mobile regression coverage now includes both Pixel 5 (Chrome) and iPhone 12 (WebKit) viewports, ensuring touch targets, modal focus, and keyboard flows remain reliable.
- Project focus now shifts to planning v4.1: define new goals, gather requirements, and sequence the next set of phases.

## Next Milestone Goals

- Start v4.1 planning: identify the next wave of interactions/catalyst features and their success criteria.
- Document new requirements (WATCH-07+, CAT-11+, MOBILE-10+) and map them to phases before writing plans.
- Keep the mobile polish baseline stable while the new milestone ramps up (touch targets, help content, and scheduler tests remain high priority).

<details>
<summary>Archived project context (pre-v4.1 milestone)</summary>

```markdown
# Project Overview

Emily Idle is a browser-based idle/incremental game themed around luxury watch collecting. It is built with Vite + React + TypeScript and uses Vitest for unit tests and Playwright for E2E coverage.

## Goals
- Grow a watch collection through Collection → Workshop → Maison loops.
- Keep UI selectors stable (`id`, `data-testid`) to protect tests.
- Preserve existing save compatibility and localStorage keys.

## Stack
- React 18 + Vite
- TypeScript (strict)
- Vitest (jsdom) + Playwright
- pnpm

## Structure
- `src/App.tsx`: main UI + game loop wiring
- `src/game/state.ts`: game rules, constants, selectors
- `src/game/sim.ts`: simulation tick loop
- `src/game/persistence.ts`: save/load + localStorage
- `src/game/catalog.ts`: catalog data + assets mapping
- `src/style.css`: global styles
- `tests/**/*.unit.test.tsx`: unit tests
- `tests/**/*.spec.ts`: Playwright tests

## Conventions
- Keep `id` and `data-testid` values stable; update tests when changes are unavoidable.
- Avoid editing generated output in `dist/`, `target/`, `test-results/`, or `tmp/`.
- Catalog assets are served from `/public/catalog` and mapped in `src/game/catalog.ts`.

## Commands
- `pnpm dev`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test:unit`
- `pnpm run test:e2e`
- `pnpm run build`

## Last Shipped Milestone: v3.2 Catalog/Vault Consolidation (Shipped: 2026-02-02)

**Delivered:** Unified catalog shopping experience with vault information merged into the catalog surface, making watch purchasing seamless and intuitive.

**Highlights:**
- Catalog cards became the sole purchase flow for watches (removed separate Vault purchase entry point).
- Added lock overlay with greyed-out styling for undiscovered watches plus "Why can't I buy?" contextual explanations.
- Merged collection capacity and value information directly into the catalog shopping header.
- Renamed "Vault" to "Collection" consistently across all UI labels, help text, and domain strings.
- Made upgrade status visible in catalog with enjoyment-only copy alignment.
- Protected existing saves with localStorage key contract tests, save payload guardrails, and selector stability coverage.
- Catalog images verified loading correctly under /emilyidle base URL.

## Current Milestone: v4.0 Watch Interactions & Catalog Polish (In Progress)

**Goal:** Deepen the watch interaction experience with improved mini-games and catalog polish.

**Target features (from NOTES.md):**
- Winding mini-game: More interactive control with visual winding animation
- Additional automatic watch mini-games: Setting time/date, changing strap
- Catalog expansion: More watch brands and models, from low end to luxury
- Individual watch stats: Show enjoyment/cash rates per watch in catalog and collection and make them more varied
- Improved mobile experience: Responsive design and touch-friendly interactions

**UI/UX improvements (from visual review 2026-02-02):**
- Mobile navigation: replace multi-row tab pills with a horizontal scroll tab bar (snap + swipe) and keep it sticky
- Settings polish: restyle fieldsets/legends and checkbox groups
- Collection/Catalog: split mega-scroll into sections with in-page subnav
- Help modal: add search + improve mobile chips layout
- Interaction modals: increase touch targets and clearer success/failure feedback
- Stats breakdown: group modifiers and show subtotals

**Status:** Requirements and roadmap to be defined

**Recent delivery:** Phase 45 shipped per-watch stats selectors, the Catalog table, and Collection’s equipped-watch call-out, all guarded by the new regression coverage for sticky controls and row expansion.

## Current State

Shipped v3.2 on 2026-02-02:

- Catalog cards are now the only purchase flow for watches
- Undiscovered watches display as greyed out with lock icon (not hidden)
- "Why can't I buy?" explanations shown on disabled purchase actions
- Collection capacity and value visible in catalog context
- "Vault" renamed to "Collection" consistently across UI and copy
- Upgrade status visible in catalog with enjoyment-only copy alignment
- All localStorage keys and UI selectors protected with regression guardrails
- Catalog images verified loading correctly under /emilyidle base URL
- Per-watch stats live in Catalog with sticky filters and the Collection call-out, and regression tests keep the sorting/expansion/tiered rate strings stable

## Known Gaps / Tech Debt

- Planning process: `.planning/REQUIREMENTS.md` was not present during v2.0 (requirement-level traceability is reconstructed).

## Requirements Status

### Validated
- ✓ STATS-01 — Catalog now surfaces each watch’s enjoyment rate per row so comparisons are visible without purchase (Phase 45)
- ✓ STATS-02 — Per-watch cash rate stays anchored to the therapist career salary and is documented in the row explanation (Phase 45)
- ✓ STATS-03 — Enjoyment/cash rates vary by watch, with reserve-aware totals and tier-aware entries (Phase 45)
- ✓ STATS-04 — Collection call-out explains the equipped watch contribution delta driven by selector math (Phase 45)
- ✓ STATS-05 — Stats are visible before owning the watch and the UI surfaces them directly in Catalog (Phase 45)

### Active
- [ ] CAT-05 — Ship new low-end watch brands/models (Phase 46)
- [ ] CAT-06 — Ship new mid-tier watch brands/models (Phase 46)
- [ ] CAT-07 — Ship luxury/high-end watch brands/models (Phase 46)
- [ ] CAT-08 — Ensure catalog variety spans affordable to luxury price ranges (Phase 46)
- [ ] CAT-09 — Tune enjoyment/cash rates for new watches so each tier feels distinct (Phase 46)
- [ ] CAT-10 — Provide correct catalog imagery and metadata for every new entry (Phase 46)

## Key Decisions

- Cash rows remain anchored to the therapist career rate and now carry an explicit explanation string so the UI/testers know no per-watch cash reallocation happened (Phase 45).
- The equipped watch contribution is derived by comparing `getEnjoymentRateCentsPerSec` with and without the worn watch to keep the math centralized (Phase 45).
- Sticky sort/filter controls stay visible while scrolling long per-watch lists, and Collection’s contribution call-out simply explains the selector-driven delta instead of redoing the math (Phase 45).

---

*Last updated: 2026-02-04 — Phase 45 complete, preparing Phase 46 planning*

```
</details>

```
</details>
