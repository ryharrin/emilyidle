# Phase 45: Per-Watch Stats Surfaces - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface per-watch enjoyment/cash rates and equipped watch contribution so players can compare watches, understand what the equipped watch adds, and act on those insights. This phase sticks to presenting those stats—adding new interaction capabilities (e.g., editing stats) would belong in a future phase.

</domain>

<decisions>
## Implementation Decisions

### Stats layout & navigation
- Present the stats as a detail list/table (rows for each watch, columns for keyed rates) with expandable rows that show modifiers when needed, rather than cards or tabs.
- Highlight the equipped watch’s contribution via a call-out in the stats header (text summary of total enjoyment/cash added) instead of embedding another panel or tooltip on the card.
- Allow users to sort or filter the rows by enjoyment/cash rates so they can focus on high-performing or understaffed watches.
- Mobile keeps a sticky header with tabs for logical sections and persistent filter controls so navigation & filtering remain accessible while scrolling.

### Claude's Discretion
- Claude can decide how many filter controls to expose in the sticky header (e.g., tier dropdown + primary sorting) as long as sorting/filtering remains accessible on both desktop and mobile.

</decisions>

<specifics>
## Specific Ideas

- Sorting buttons should mirror the primary rates (enjoyment first, cash second) and keep their state visible in the sticky header.
- The equipped watch call-out can reuse the same typography/pill styles from the catalog header for visual consistency.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 45’s scope.

</deferred>

---

*Phase: 45-per-watch-stats-surfaces*
*Context gathered: 2026-02-03*
