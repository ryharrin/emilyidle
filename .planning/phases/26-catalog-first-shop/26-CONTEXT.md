# Phase 26: Catalog-First Shop - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Consolidate watch shopping into a single surface: there should not be separate Catalog and Vault tabs. Catalog cards are the purchase surface for watches, and Vault information relevant to buying is merged into that same experience.

</domain>

<decisions>
## Implementation Decisions

### Landing behavior
- Default landing tab for existing saves: restore the last visited tab.
- Fresh save handling: force the combined shopping surface on the very first session only.
- After first purchase: remain on the combined shopping surface; ownership updates inline.
- Deep links: explicit deep link navigation overrides the default initial landing tab.
- Invalid or hidden deep links: fall back to the combined shopping surface.
- Deep links do not update the persisted last-tab preference.

### Catalog/Vault consolidation
- Primary navigation: remove separate Catalog tab; keep a single tab/surface for watch shopping.
- Buying watches: catalog cards are the way watches are bought.
- Information: buying-relevant Vault information is presented alongside catalog cards (no split surface).

### Catalog entry layout
- Overall: card grid as primary presentation.
- Density: medium (desktop ~2-3 columns, mobile 1 column).
- Card anatomy: bottom action bar contains price/owned/CTA.
- More detail: expandable card section (inline expand/collapse), not a modal.

### Buy + lock UX
- Confirmation: no confirm modal; single-click purchase.
- Lock/affordability messaging: replace the CTA with the lock reason when gated.
- Duplicate preview: show next multiplier only (keep rewards math elsewhere).
- Post-buy feedback: inline updates + small micro-feedback (owned increments, highlight, brief "Purchased").

### Action bar hierarchy
- Layout: Owned + Price on the left, CTA on the right.
- Owned label: "N owned".
- Price label: show value only ("$X", no label).

### In-context help
- Entry point: single Help button at top of Catalog (not per-card explain triggers).
- Surface: open the global Help modal, focused/scrolled to the relevant section.
- Required topics for Phase 26: duplicates + lock reasons.
- Intrusiveness: on-demand only; no proactive tips/coachmarks.

### Expandable details
- Content: short description + compact specs list.
- Spec count: 4-5 items.
- Scope: descriptive only (no purchase/gate info).
- State: remember open/closed per card during the session.

### Claude's Discretion
- Exact card styling, spacing, and micro-interactions (as long as it remains readable on desktop + mobile).
- Exact content of the expandable details section (within phase scope).

</decisions>

<specifics>
## Specific Ideas

No specific external references; open to standard catalog card patterns.

</specifics>

<deferred>
## Deferred Ideas

- Per-card "Explain" triggers could be added later if the single Help button proves insufficient.

</deferred>

---

*Phase: 26-catalog-first-shop*
*Context gathered: 2026-01-27*
