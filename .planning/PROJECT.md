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
- Verification process: missing phase verification reports for phases 13 and 18.
- Test gap: no dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.

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
