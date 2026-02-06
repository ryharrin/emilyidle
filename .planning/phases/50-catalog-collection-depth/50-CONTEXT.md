# Phase 50: Catalog & Collection Depth - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the v4.1 catalog/collection depth scope from `.planning/REQUIREMENTS.md`:
`TAB-04`, `SETBONUS-01`, `PRESTIGE-01`, `TIMELINE-01`, `COMPARE-01`, `COLLECT-01`, `HELP-02`, and `VAULT-02`.

This phase deepens decision support and discoverability for catalog + collection systems.
Do not change save schema versions, localStorage key contracts, or core economy formulas.

</domain>

<decisions>
## Implementation Decisions

### Data and contract guardrails (locked)
- Keep new progress/analytics math in selectors, then render selector output in UI.
- Preserve existing IDs and `data-testid` anchors; new anchors must be additive.
- Keep persistence contracts untouched (`emily-idle:save`, `emily-idle:settings`, help/navigation keys).

### Collection depth direction
- Set bonus progress should show explicit completion counts and remaining requirements.
- Prestige previews should highlight the nearest next threshold with concrete reward context.
- Collection segmentation should use Starter/Mid/Lux anchored sections reachable from sticky subnav.

### Catalog decision support direction
- Catalog compare should be side-by-side and deterministic (tier, movement, price, enjoyment/cash rates).
- Catalog ownership tabs should surface quick-action readiness indicators without replacing existing tab semantics.

### Help education direction
- Tier-badge education should be easier to discover via keyword-aware help search and curated related links.
- Existing help section IDs remain stable; add metadata rather than renaming sections.

### Claude's discretion
- Exact copy tone and visual hierarchy can be tuned during execution if requirements and test contracts stay intact.

</decisions>

<specifics>
## Specific Ideas to Preserve

- "Set bonus cards should answer: how close am I, what unlocks, and what should I buy next?"
- "Compare should feel like a bench card: two watches, one glance, clear trade-offs."
- "Collection navigation should make Starter/Mid/Lux feel like explicit chapters, not one long scroll."
- "Tier badge help should appear quickly even when users search broad terms like tier, luxury, or starter."

</specifics>

<deferred>
## Deferred (Out of This Phase)

- Offline gains, save import/export upgrades, undo/favorites/notifications, and event expansion stay in Phase 51 scope.
- Any architectural rewrite of tabs/help shell outside requirement scope is deferred.

</deferred>

---

*Phase: 50-catalog-collection-depth*
*Context gathered: 2026-02-06*
