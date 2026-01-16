# Phase 07 — Packaging & Polish

Purpose: Make the game pleasant to run locally and robust: stable saves/migrations, good performance, and clear run instructions.

## Source context

- `.planning/ROADMAP.md`
- `.planning/codebase/CONCERNS.md`
- `.planning/codebase/STRUCTURE.md`

## Tasks

### 07-01 — Build output, local run instructions, perf + accessibility polish

- [ ] Add clear local run instructions (dev/build/preview)
  - **Files**: `README.md` (if desired), or `.planning/PROJECT.md` update
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Improve save robustness (migrations, schema evolution)
  - **Files**: `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Performance polish (avoid unnecessary DOM writes; keep sim stable)
  - **Files**: `src/main.ts`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Accessibility + UX polish (keyboard focus, readable formatting)
  - **Files**: `index.html`, `src/style.css`, `src/main.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
