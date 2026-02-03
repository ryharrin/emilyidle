# Phase 46: Catalog Expansion (Tiered Variety) - Context

**Gathered:** 2026-02-02  
**Status:** Ready for planning (after Phase 45)

<domain>
## Phase Boundary

Expand the catalog with new watches that meaningfully broaden variety across progression tiers:
- Low-end / early game variety (CAT-05)
- Mid-tier variety (CAT-06)
- Luxury / late-game goals (CAT-07)
- Variety spans affordable → luxury price points (CAT-08)
- New watches have tier-appropriate enjoyment/cash stats (CAT-09)
- All new watches have correct images + metadata + licensing attribution (CAT-10)

This phase is primarily: catalog data + assets + validation.
</domain>

<decisions>
## Implementation Decisions (Proposed)

### D1: Source of truth remains `src/game/catalog.ts`

Continue adding entries to `CATALOG_ENTRIES` with complete license metadata, and rely on the existing local asset mapping (`getCatalogImageUrl`).

### D2: Use `scripts/catalog/sync-catalog-images.js` for asset syncing

The repo already has a script that detects missing Wikimedia-referenced images and can download them to `public/catalog/…`.

Plan to:
- add entries first,
- run the sync script to fetch missing images,
- then verify via unit/e2e image checks.

### D3: Keep tier inference predictable

Prefer explicitly tagging entries so `getCatalogEntryTags()` returns a stable tier tag:
- include one of: `starter`, `classic`, `chronograph`, `tourbillon` as a tag, OR
- ensure tags/brand triggers tier inference in `inferCatalogTier`.
</decisions>

<open_questions>
## Open Questions

1. How many new entries per tier is “enough” for this phase? (Proposal: +10 starter, +8 classic, +6 chronograph/tourbillon combined.)
2. Which new brands are desired for early/mid tiers (Casio/Seiko/Hamilton/Tissot/etc.) vs luxury tiers?
3. If Phase 45 introduces per-model stat variance, do we need manual tuning for a few “headline” watches, or is deterministic variance sufficient?
</open_questions>

---

*Phase: 46-catalog-expansion-tiered-variety*

