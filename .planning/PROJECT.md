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

## Last Shipped Milestone: v3.0 Catalog-First Economy & Interactions (Shipped: 2026-01-30)

**Delivered:** Catalog-first purchase flow with a career-first cash economy, model-based watches, and movement-gated interactions.

**Highlights:**
- Catalog-first shop embedded into the Vault as the primary purchase flow (with in-context help).
- Career-driven cash economy (salary + sessions) and dedicated Upgrades surface with truthful previews.
- Watch models replace generic tiers; duplicates have diminishing returns.
- Wear exactly one watch for a visible bonus (persisted; reflected in rate breakdown).
- Interactions mini-games for manual/automatic/quartz watches with distinct modals, rewards, and cooldowns.
- Workshop/Atelier clarity + pacing improvements; Help deep-links for v3.0 systems.

## Next Milestone (Proposed): v3.1 Career Depth & Landing (Planning)

**Goal:** Make Career the default landing and deepen career progression into clear stages with lasting choices.

**Target features:**
- Default landing on Career for fresh saves.
- Career stages from grad student to private practice, with branching specializations and meaningful, permanent choices.
- Clear progress feedback toward next career unlocks (progress + next-action cues).

## Current State

Shipped v3.0 on 2026-01-30:

- Catalog-first purchase flow (Vault embeds catalog shopping + help)
- Career-first cash economy and dedicated Upgrades surface
- Model-based watch ownership with duplicates diminishing returns
- Wear-one bonus + movement-gated interactions mini-games
- Workshop/Atelier clarity + updated Help deep-links

## Known Gaps / Tech Debt

- Planning process: `.planning/REQUIREMENTS.md` was not present during v2.0 (requirement-level traceability is reconstructed).
- Verification process: missing phase verification reports for phases 13 and 18.
- Test gap: no dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.

---

*Last updated: 2026-01-30 after v3.0 milestone completion*
