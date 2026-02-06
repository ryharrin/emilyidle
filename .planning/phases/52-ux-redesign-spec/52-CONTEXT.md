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

- `.planning/uat-artifacts/52/raw/fresh-collection-desktop.jpg`
- `.planning/uat-artifacts/52/raw/fresh-catalog-desktop.jpg`
- `.planning/uat-artifacts/52/raw/advanced-catalog-tiers-desktop.jpg`
- `.planning/uat-artifacts/52/raw/advanced-catalog-compare-desktop.jpg`
- `.planning/uat-artifacts/52/raw/advanced-catalog-details-sheet-desktop.jpg`
- `.planning/uat-artifacts/52/raw/advanced-career-desktop.jpg`
- `.planning/uat-artifacts/52/raw/advanced-stats-desktop.jpg`
- `.planning/uat-artifacts/52/raw/mobile-collection-iphone12.jpg`
- `.planning/uat-artifacts/52/raw/mobile-catalog-iphone12.jpg`
- `.planning/uat-artifacts/52/raw/mobile-catalog-filters-open-iphone12.jpg`
- `.planning/uat-artifacts/52/raw/mobile-help-modal-iphone12.jpg`
- `.planning/uat-artifacts/52/raw/mobile-settings-iphone12.jpg`

Supporting metrics from `.planning/uat-artifacts/52/metrics-baseline.json`:

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
