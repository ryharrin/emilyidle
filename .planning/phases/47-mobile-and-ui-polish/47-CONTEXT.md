# Phase 47: Mobile & UI Polish - Context

**Gathered:** 2026-02-02  
**Status:** Ready for planning (after Phase 46)

<domain>
## Phase Boundary

This phase is a mobile-first polish pass across core navigation and high-traffic surfaces:

- MOBILE-01: Tab navigation uses horizontal scroll with snap behavior
- MOBILE-02: Tab bar remains sticky during scroll
- MOBILE-03: Settings panel has restyled fieldsets and checkbox groups
- MOBILE-04: Collection/Catalog uses section grouping with in-page subnav
- MOBILE-05: Help modal includes search functionality
- MOBILE-06: Help modal has sticky header and improved chip layout
- MOBILE-07: Interaction modals have larger touch targets
- MOBILE-08: Stats breakdown groups modifiers and shows subtotals
- MOBILE-09: All touch targets meet minimum 44px accessibility standard

This phase should avoid large IA rewrites; focus on polish, responsiveness, and accessibility.
</domain>

<decisions>
## Implementation Decisions (Proposed)

### D1: CSS-first approach

Prefer CSS + minimal markup tweaks over significant component rewrites.
Reason: stable selectors + lower regression risk.

### D2: Touch target standard

Adopt a consistent minimum:
- 44px min-height for primary buttons, tab pills, and modal actions.

### D3: Sticky = deliberate and scoped

Sticky elements should:
- avoid covering content (use padding/margins)
- remain readable in both themes
- respect reduced motion
</decisions>

---

*Phase: 47-mobile-and-ui-polish*

