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

## Last Shipped Milestone: v3.1 Career Depth & Landing (Shipped: 2026-02-01)

**Delivered:** Career becomes the default landing and grows into a staged progression with permanent choices, clear previews, and stronger next-action guidance.

**Highlights:**
- Fresh saves land on Career by default without breaking deep links or existing-save last-tab behavior.
- Career has 5+ stages with persisted permanent choices and clear before/after previews.
- Career shows progress (next unlock + progress bar) and a single next-action cue.
- Sessions work immediately after entering the program (pre-track window) so the salary window refresh loop is achievable before level 3.
- Quartz set-time mini-game alignment is fixed on desktop + mobile (with regression coverage).

## Next Milestone (Proposed): v3.2 Catalog/Vault Consolidation (Planning)

**Goal:** Make Catalog/Vault feel like one coherent surface: unified purchase flow, clearer vault information, and fewer places to "learn the same thing twice".

**Target features:**
- Merge/clarify Vault info directly into the Catalog shopping surface.
- Ensure Catalog cards remain the sole purchase flow for watches.
- Audit upgrade copy + previews to avoid implying watch-driven cash multipliers.

## Current State

Shipped v3.1 on 2026-02-01:

- Career-first landing behavior (fresh saves default to Career; deep links + last-tab persistence remain predictable)
- Career stages with permanent choices + preview deltas + persistence
- Progress feedback and next-action cue on Career
- Salary window + sessions loop is usable immediately after career start (pre-track sessions supported)
- Quartz set-time alignment regression fixed

## Known Gaps / Tech Debt

- Planning process: `.planning/REQUIREMENTS.md` was not present during v2.0 (requirement-level traceability is reconstructed).
- Verification process: missing phase verification reports for phases 13 and 18.
- Test gap: no dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.

---

*Last updated: 2026-02-01 after v3.1 milestone completion*
