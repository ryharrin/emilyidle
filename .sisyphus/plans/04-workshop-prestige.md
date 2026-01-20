# Phase 04 — Workshop Prestige

Purpose: Add the first prestige layer (“Workshop”) that resets Collection progress to grant a persistent meta-currency and meaningful speed-ups on the next run.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/04-workshop-prestige.md`
- `.sisyphus/plans/06-balance-content.md`
- `src/game/persistence.ts`

## Tasks

### 04-01 — Prestige 1 reset rules

- [x] Define reset/persist rules for Workshop prestige
- [x] Add prestige trigger thresholds + confirmation UI
- [x] Introduce Workshop meta-currency (e.g., Blueprints/Parts)
- [x] Add permanent upgrades unlocked by meta-currency
- [x] Add simple automation (auto-buy / bulk buy) gated by Workshop progress
- [x] Add QoL: milestones, better formatting, basic UI navigation

## Plan-wide verification

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`
