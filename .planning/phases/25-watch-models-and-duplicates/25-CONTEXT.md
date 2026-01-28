# Phase 25: Watch Models & Duplicates - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Introduce a model-level purchasable watch system (stable IDs mapped to catalog references) and apply a transparent diminishing-returns curve for duplicate copies.

</domain>

<decisions>
## Implementation Decisions

### Duplicate diminishing returns
- Drop-off feel: medium (2nd copy still meaningful, clearly worse than 1st).
- Floor: 10% minimum multiplier.
- Applies to: enjoyment + memories gains.
- Point-of-purchase UI: show exact multiplier (e.g., "Duplicate: 0.70x rewards").

### Model roster + IDs
- Initial roster: all catalog entries become purchasable as specific models.
- Stable ID scheme: slug derived from brand/model (and reference #), stable across saves.
- Default display name: include reference #.
- Catalog mapping: 1 model may map to multiple catalog entries (variants/media).

### Purchase / ownership display (pre-Phase 26)
- Presentation: group purchasable models by brand (avoid one flat list).
- Row/card content: show owned count + next duplicate multiplier.
- Buy CTA copy: dynamic ("Buy" for 0 owned; "Buy another" for 1+ owned).
- Feedback: inline highlight/animation on the purchased row and owned count increments visibly.

### Save migration
- No migration required; backward compatibility for existing saves is not a requirement (game not released yet).

### Claude's Discretion
- Exact diminishing-returns formula/parameters, as long as it matches "medium" feel and respects the 10% floor.
- Slug generation details (formatting rules, collision handling) so long as IDs are stable.
- Exact brand grouping UI (collapsible vs static), and the specific highlight animation.

</decisions>

<specifics>
## Specific Ideas

- Inline copy examples:
  - "Owned 2 | Next: 0.55x"
  - "Duplicate: 0.70x rewards"

</specifics>

<deferred>
## Deferred Ideas

- Deeper catalog-first purchase UX (catalog as landing page, in-context help, full card layout) belongs to Phase 26.
- Equip slot / wear-one bonuses belong to Phase 28.

</deferred>

---

*Phase: 25-watch-models-and-duplicates*
*Context gathered: 2026-01-27*
