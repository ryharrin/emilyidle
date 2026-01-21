# Phase 08 — Collection Integration (Local Images + Gameplay)

Purpose: Make the catalog/collection feel like part of the core progression loop, and remove network/image dependencies by storing all referenced watch images locally.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/03-catalog-images.md`
- `.sisyphus/plans/06-balance-content.md`
- `src/game/catalog.ts`
- `src/game/state.ts`
- `src/App.tsx`

## Tasks

### 08-01 — Local asset pipeline for catalog images

- [x] Move catalog images from remote URLs to local assets
  - **Files**: `public/*` (or `src/assets/*`), `src/game/catalog.ts`
  - **Verification**: `pnpm run build`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [x] Keep attribution + license metadata intact (even when images are local)
  - **Files**: `src/game/catalog.ts`, UI surface in `src/App.tsx`
  - **Verification**: `pnpm run test:e2e` (Sources & Licenses section still lists correct entries)
  - **Parallelizable**: YES

### 08-02 — Integrate catalog/collection into progression

- [x] Add gameplay meaning to catalog entries (beyond being a gallery)
  - Suggested approach: tie specific catalog entries to unlockables (milestones, achievements, events, or set bonuses)
  - **Files**: `src/game/state.ts`, `src/game/catalog.ts`, `src/App.tsx`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [x] Add an in-game “collection book” / “owned references” view
  - Suggested approach: unlock-by-ownership markers, and show which catalog entries you’ve “discovered” via gameplay
  - **Files**: `src/App.tsx`, `src/style.css`, persistence in `src/game/persistence.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 08-03 — Persistence and migration for new collection data

- [x] Persist newly introduced collection/catalog progression state
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [x] Add save migration for existing saves
  - **Files**: `src/game/persistence.ts`
  - **Verification**: add/update a unit test for decoding legacy saves
  - **Parallelizable**: NO

## Plan-wide verification

- [x] `pnpm run lint`
- [x] `pnpm run typecheck`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`

## Notes / assumptions

- Images should be stored locally so the game is fully offline-friendly.
- Attribution remains part of the UI even for local assets.
