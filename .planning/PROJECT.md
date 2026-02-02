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
- Made upgrade status visible in catalog header and aligned all upgrade copy/previews to reflect enjoyment-only multipliers.
- Protected existing saves with localStorage key contract tests, save payload guardrails, and selector stability coverage.
- Verified catalog image loading under /emilyidle base URL with regression tests.

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

## Known Gaps / Tech Debt

- Planning process: `.planning/REQUIREMENTS.md` was not present during v2.0 (requirement-level traceability is reconstructed).
- Verification process: missing phase verification reports for phases 13 and 18.
- Test gap: no dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.

---

*Last updated: 2026-02-02 — completed milestone v3.2, starting v4.0*
