# Phase 52: UX Redesign Specification - Context

**Gathered:** 2026-02-06
**Status:** Ready for design execution planning

<domain>
## Phase Boundary

Translate the post-v4.1 visual/interaction review into an implementable UX redesign plan that improves:

- action hierarchy and scan speed,
- mobile ergonomics,
- catalog density and tap confidence,
- navigation discoverability,
- progressive disclosure in Career/Stats.

This phase is design + planning only. It does **not** ship gameplay logic changes.
</domain>

<evidence>
## Validation Inputs

Hands-on browser walkthrough with desktop + mobile captures:

- `output/playwright/ux-review-20260206/fresh-collection-desktop.png`
- `output/playwright/ux-review-20260206/fresh-catalog-desktop.png`
- `output/playwright/ux-review-20260206/advanced-catalog-tiers-desktop.png`
- `output/playwright/ux-review-20260206/advanced-catalog-compare-desktop.png`
- `output/playwright/ux-review-20260206/advanced-catalog-details-sheet-desktop.png`
- `output/playwright/ux-review-20260206/advanced-career-desktop.png`
- `output/playwright/ux-review-20260206/advanced-stats-desktop.png`
- `output/playwright/ux-review-20260206/mobile-collection-iphone12.png`
- `output/playwright/ux-review-20260206/mobile-catalog-iphone12.png`
- `output/playwright/ux-review-20260206/mobile-catalog-filters-open-iphone12.png`
- `output/playwright/ux-review-20260206/mobile-help-modal-iphone12.png`
- `output/playwright/ux-review-20260206/mobile-settings-iphone12.png`

Supporting metrics from `output/playwright/ux-review-20260206/metrics.json`:

- Fresh desktop catalog: `372` visible interactives, `82` below 44px.
- Advanced desktop catalog tiers: `429` visible interactives, `81` below 44px.
- Mobile catalog: `429` visible interactives, `81` below 44px.
- Mobile collection: `40` visible interactives, `25` below 44px.
</evidence>

<decisions>
## Design Decisions (Locked for this spec)

- Keep current game mechanics and economy unchanged; this scope is UX structure/presentation.
- Preserve existing persisted keys/contracts and existing `data-testid` anchors unless additive.
- Prioritize one-thumb mobile flows for high-frequency actions.
- Move from "everything visible" to staged disclosure for dense panels.
- Introduce compact vs expanded catalog presentation patterns rather than a single heavy card mode.
</decisions>

<risks>
## Key UX Risks to Reduce

- Catalog cognitive overload from too many same-weight controls per card.
- Insufficient visual dominance of primary progression actions.
- Mobile fatigue from long vertical scans and top-weighted control clusters.
- Weak overflow discoverability in horizontal tab rails.
</risks>

<deferred>
## Deferred (Out of This Phase)

- New gameplay systems, currencies, or progression loops.
- New persistence schema/versioning.
- Asset-heavy art direction overhauls (brand new illustration packs, animation engines).
</deferred>

---

*Phase: 52-ux-redesign-spec*
*Context gathered: 2026-02-06*
