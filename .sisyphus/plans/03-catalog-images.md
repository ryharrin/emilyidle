# Phase 03 — Catalog & Images

Purpose: Add a real-image catalog (Rolex / Jaeger‑LeCoultre / Audemars Piguet) with explicit licensing and attribution, without creating IP risk.

## Source context

- `.sisyphus/plans/02-collection-loop.md`
- `.sisyphus/plans/03-catalog-images.md`
- `.sisyphus/plans/08-collection-integration.md`
- `.sisyphus/plans/10-theme-enjoyment.md`

## Tasks

### 03-00 — UI framework migration

- [x] Migrate UI to React (or similar) with Vite integration
- [x] Define catalog schema for brands/models/metadata
- [x] Implement filtering/search UI for catalog
- [x] Decide image storage approach (local assets vs remote URLs)
- [x] Add image metadata fields (source URL, license, author, attribution text)
- [x] Render images in catalog UI (with graceful fallback)
- [x] Add per-item attribution display
- [x] Add a “Sources / Licenses” view (list all images + licenses)
- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`

## Notes / assumptions

- This phase intentionally avoids logos/endorsement language; images must be explicitly reusable.
