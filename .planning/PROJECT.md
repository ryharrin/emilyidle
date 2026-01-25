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

## Current State

Shipped v2.0 on 2026-01-25:

- Enjoyment-first collection economy (tier-based per-watch enjoyment rates)
- Therapist career cash generation (salary + sessions) and dual-currency watch acquisition (cash spent, enjoyment gate)
- Nostalgia prestige + permanent unlock store
- Codebase refactor into model/data/selectors/actions/runtime with tab extraction to `src/ui/tabs/*`

## Known Gaps / Tech Debt

- Planning process: `.planning/REQUIREMENTS.md` was not present during v2.0 (requirement-level traceability is reconstructed).
- Verification process: missing phase verification reports for phases 13 and 18.
- Test gap: no dedicated Playwright E2E asserting therapist session deltas (cash/enjoyment) and cooldown UX.

## Next Milestone Goals

- Define a fresh requirements spec for the next milestone.
- Plan and execute Phase 19 (Phase 13 refactor + unit coverage).

---

*Last updated: 2026-01-25 after v2.0 milestone completion*
