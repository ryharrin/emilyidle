# Phase 04 — Workshop Prestige

Purpose: Add the first prestige layer (“Workshop”) that resets Collection progress to grant a persistent meta-currency and meaningful speed-ups on the next run.

## Source context

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/codebase/ARCHITECTURE.md`
- `src/game/persistence.ts`

## Tasks

### 04-01 — Prestige 1 reset rules

- [ ] Define reset/persist rules for Workshop prestige
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add prestige trigger thresholds + confirmation UI
  - **Files**: `src/main.ts`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 04-02 — Workshop meta-currency + permanent upgrades/unlocks

- [ ] Introduce Workshop meta-currency (e.g., Blueprints/Parts)
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add permanent upgrades unlocked by meta-currency
  - **Files**: `src/game/state.ts`, `src/main.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 04-03 — Automation and QoL

- [ ] Add simple automation (auto-buy / bulk buy) gated by Workshop progress
  - **Files**: `src/game/state.ts`, `src/main.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add QoL: milestones, better formatting, basic UI navigation
  - **Files**: `src/main.ts`, `src/game/format.ts`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`
