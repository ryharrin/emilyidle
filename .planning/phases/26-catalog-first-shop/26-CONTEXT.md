# Phase 26: Catalog-First Shop - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the Catalog tab the primary landing and purchase surface: fresh saves land on Catalog, each catalog entry shows price/owned/CTA or lock reason, the user can buy directly from the entry with immediate ownership feedback, and catalog-relevant help is accessible while browsing/buying.

</domain>

<decisions>
## Implementation Decisions

### Landing behavior
- Default landing tab: always open Catalog for existing saves (Catalog is the home screen).
- Fresh save handling: any special "fresh save" forcing is first-session-only (not a long-lived rule).
- After first purchase: stay on Catalog; ownership updates inline.
- Deep links: explicit deep link navigation overrides the default Catalog landing.

### Catalog entry layout
- Overall: card grid as primary presentation.
- Density: medium (desktop ~2-3 columns, mobile 1 column).
- Card anatomy: bottom action bar contains price/owned/CTA.
- More detail: expandable card section (inline expand/collapse), not a modal.

### Buy + lock UX
- Confirmation: no confirm modal; single-click purchase.
- Lock/affordability messaging: inline reason under disabled CTA.
- Duplicate preview: show next multiplier only (keep rewards math elsewhere).
- Post-buy feedback: inline updates + small micro-feedback (owned increments, highlight, brief "Purchased").

### In-context help
- Entry point: single Help button at top of Catalog (not per-card explain triggers).
- Surface: open the global Help modal, focused/scrolled to the relevant section.
- Required topics for Phase 26: duplicates + lock reasons.
- Intrusiveness: on-demand only; no proactive tips/coachmarks.

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
