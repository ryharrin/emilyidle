# Phase 47: Mobile & UI Polish - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the mobile UI feel polished by improving the primary navigation (sticky horizontal tabs), refining settings/modals, and tightening collection/help flows so touch interactions stay friendly. Focus is on presentation and navigation polish; adding new feature capabilities belongs in another phase.

</domain>

<decisions>
## Implementation Decisions

### Tab navigation polish
- Keep the sticky tab row minimal: horizontal scroll with snap points so the active tab centers under the underline, and avoid stuffing filters/help icons into the header.
- Animate tab switches by sliding the content horizontally like a carousel to reinforce the mobile feel while keeping the tabs sticky.
- Highlight the active tab with a bold pill and a colored underline that resizes with the tab width.

### Claude's Discretion
- Exact easing/duration of the slide animation can be chosen later, provided it feels smooth and does not interfere with the sticky tabs.

</decisions>

<specifics>
## Specific Ideas

- The colored underline should adapt to the active tab width so it feels connected, and the slide animation should mirror the direction of the tab change (left/right).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within this phase’s polish boundaries.

</deferred>

---

*Phase: 47-mobile-ui-polish*
*Context gathered: 2026-02-03*
