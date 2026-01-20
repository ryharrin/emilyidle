# Phase 07 — Packaging & Polish

Purpose: Make the game pleasant to run locally and robust: stable saves/migrations, good performance, and clear run instructions.

## Source context

- `.sisyphus/plans/06-balance-content.md`
- `.sisyphus/plans/07-packaging-polish.md`
- `.sisyphus/plans/10-theme-enjoyment.md`

## Tasks

### 07-01 — Build output, local run instructions, perf + accessibility polish

- [x] Add clear local run instructions (dev/build/preview)
- [x] Improve save robustness (migrations, schema evolution)
- [x] Performance polish (avoid unnecessary DOM writes; keep sim stable)
- [x] Accessibility + UX polish (keyboard focus, readable formatting)

## Plan-wide verification

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`
