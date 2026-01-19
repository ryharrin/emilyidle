# Phase 03 — Catalog & Images

Purpose: Add a real-image catalog (Rolex / Jaeger‑LeCoultre / Audemars Piguet) with explicit licensing and attribution, without creating IP risk.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/03-catalog-images.md`
- `.sisyphus/plans/08-collection-integration.md`
- `.sisyphus/plans/10-theme-enjoyment.md`

## Tasks

### 03-00 — UI framework migration

- [ ] Migrate UI to React (or similar) with Vite integration
  - **Files**: `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/*`, `src/style.css`
  - **Verification**: `pnpm run dev`; `pnpm run build`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

### 03-01 — Catalog data model (brand/model/metadata) + filtering/search

- [ ] Define catalog schema for brands/models/metadata
  - **Files**: `src/game/catalog.ts` (new), `src/game/state.ts` (integration)
  - **Verification**: `pnpm run typecheck`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Implement filtering/search UI for catalog
  - **Files**: `src/App.tsx`, `src/style.css`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 03-02 — Image pipeline (curate list, store sources, render)

- [ ] Decide image storage approach (local assets vs remote URLs)
  - **Files**: `.sisyphus/plans/08-collection-integration.md` (reference), `src/game/catalog.ts` (metadata fields)
  - **Verification**: document decision in plan notes; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add image metadata fields (source URL, license, author, attribution text)
  - **Files**: `src/game/catalog.ts`
  - **Verification**: `pnpm run typecheck`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Render images in catalog UI (with graceful fallback)
  - **Files**: `src/App.tsx`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 03-03 — Attribution UI + “sources” view

- [ ] Add per-item attribution display
  - **Files**: `src/App.tsx`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Add a “Sources / Licenses” view (list all images + licenses)
  - **Files**: `src/App.tsx`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: NO

## Plan-wide verification

- [ ] `pnpm run typecheck`
- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:e2e`

## Notes / assumptions

- This phase intentionally avoids logos/endorsement language; images must be explicitly reusable.
