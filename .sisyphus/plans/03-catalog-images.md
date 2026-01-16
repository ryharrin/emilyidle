# Phase 03 — Catalog & Images

Purpose: Add a real-image catalog (Rolex / Jaeger‑LeCoultre / Audemars Piguet) with explicit licensing and attribution, without creating IP risk.

## Source context

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/CONCERNS.md`

## Tasks

### 03-00 — UI framework migration

- [ ] Migrate UI to React (or similar) with Vite integration
  - **Files**: `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/components/*`, `src/style.css`
  - **Verification**: `pnpm run dev`; `pnpm run build`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

### 03-01 — Catalog data model (brand/model/metadata) + filtering/search

- [ ] Define catalog schema for brands/models/metadata
  - **Files**: `src/game/catalog.ts` (new), `src/game/state.ts` (integration)
  - **Verification**: `pnpm run typecheck`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Implement filtering/search UI for catalog
  - **Files**: `src/main.ts`, `src/style.css`
  - **Verification**: `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

### 03-02 — Image pipeline (curate list, store sources, render)

- [ ] Decide image storage approach (local assets vs remote URLs)
  - **Files**: `.planning/codebase/CONCERNS.md` (reference), `src/game/catalog.ts` (metadata fields)
  - **Verification**: document decision in plan notes; `pnpm run test:e2e`
  - **Parallelizable**: NO

- [ ] Add image metadata fields (source URL, license, author, attribution text)
  - **Files**: `src/game/catalog.ts`
  - **Verification**: `pnpm run typecheck`; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Render images in catalog UI (with graceful fallback)
  - **Files**: `src/main.ts`, `src/style.css`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

### 03-03 — Attribution UI + “sources” view

- [ ] Add per-item attribution display
  - **Files**: `src/main.ts`
  - **Verification**: `pnpm run test:e2e`
  - **Parallelizable**: YES

- [ ] Add a “Sources / Licenses” view (list all images + licenses)
  - **Files**: `src/main.ts`
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
