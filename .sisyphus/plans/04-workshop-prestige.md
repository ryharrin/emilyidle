# Phase 04 — Workshop Prestige

Purpose: Add the first prestige layer (“Workshop”) that resets Collection progress to grant a persistent meta-currency and meaningful speed-ups on the next run.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/04-workshop-prestige.md`
- `.sisyphus/plans/06-balance-content.md`
- `src/game/persistence.ts`

## Tasks

### 04-01 — Prestige 1 reset rules

- [ ] Define reset/persist rules for Workshop prestige
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add prestige trigger thresholds + confirmation UI
  - **Files**: `src/App.tsx`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 04-02 — Workshop meta-currency + permanent upgrades/unlocks

- [ ] Introduce Workshop meta-currency (e.g., Blueprints/Parts)
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add permanent upgrades unlocked by meta-currency
  - **Files**: `src/game/state.ts`, `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 04-03 — Automation and QoL

- [ ] Add simple automation (auto-buy / bulk buy) gated by Workshop progress
  - **Files**: `src/game/state.ts`, `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add QoL: milestones, better formatting, basic UI navigation
  - **Files**: `src/App.tsx`, `src/game/format.ts`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
