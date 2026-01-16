# Phase 07 — Packaging & Polish

Purpose: Make the game pleasant to run locally and robust: stable saves/migrations, good performance, and clear run instructions.

## Source context

- `.sisyphus/plans/06-balance-content.md`
- `.sisyphus/plans/07-packaging-polish.md`
- `.sisyphus/plans/10-theme-enjoyment.md`

## Tasks

### 07-01 — Build output, local run instructions, perf + accessibility polish

- [ ] Add clear local run instructions (dev/build/preview)
  - **Files**: `README.md` (if desired), or `.sisyphus/plans/07-packaging-polish.md` update
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Improve save robustness (migrations, schema evolution)
  - **Files**: `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Performance polish (avoid unnecessary DOM writes; keep sim stable)
  - **Files**: `src/App.tsx`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Accessibility + UX polish (keyboard focus, readable formatting)
  - **Files**: `index.html`, `src/style.css`, `src/App.tsx`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
