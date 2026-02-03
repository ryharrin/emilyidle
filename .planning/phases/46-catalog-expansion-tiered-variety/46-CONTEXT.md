# Phase 46: Catalog Expansion (Tiered Variety) - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the catalog with new low/mid/lux watches so players can browse tiered variety, compare rates, and understand the value of the equipped watch. This phase stays within the catalog expansion scope—adding entirely new interaction mechanics (shop updates beyond presentation/unlocks) belongs to another phase.

</domain>

<decisions>
## Implementation Decisions

### Catalog assortment criteria
- Allocate fixed counts per tier (e.g., 10 low, 8 mid, 6 lux) and release them as individual drops to keep discovery steady.
- Treat each new watch as a real-world model depicted with open-source imagery, giving every entry a distinct personality/trait narrative.
- Reference cultural/historical cues via those real names while crediting the open-source asset once as a tiny footnote per grid (no per-card clutter).

### Asset & metadata presentation
- Render the catalog as a card grid with overlay stats so each watch image takes center stage while enjoyment/cash numbers sit prominently on top.
- Include story blurbs, material notes, and brand tier metadata on each card to enrich the context beyond the rates.
- Provide a tap-to-flip interaction on mobile so the back of the card reveals the stats and metadata without sacrificing legibility.

### Discovery and unlocking flow
- Unlock tiers via achievements and let players purchase the individual watches inside a newly unlocked tier.
- Release watches one at a time with short cooldowns so players continually discover new entries.
- Show a countdown/indicator in the catalog header once the unlocking achievement nears completion, and include a tooltip on each locked card explaining the exact prerequisite.

### Reward/collection messaging
- Signal each watch’s value through numeric callouts (e.g., "Enjoyment +$1") with color-coded backgrounds that imply its tier—no explicit tier labels.
- Show a delta (positive/negative) versus the equipped watch on each card so players can quickly compare.
- Keep the tone positive; omit downgrade warnings so messaging stays upbeat.

### Claude's Discretion
- Claude can choose how the countdown indicator animates (pulse vs progress) as long as it clearly ties to the achievement.

</decisions>

<specifics>
## Specific Ideas

- Use the same pill styling for equipped-watch call-outs that we already use in the catalog header so the delta messaging feels consistent.
- The tap-to-flip mobile interaction should reveal the stats/back copy with smooth micro-interactions to keep the premium feel.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within the catalog expansion scope.

</deferred>

---

*Phase: 46-catalog-expansion-tiered-variety*
*Context gathered: 2026-02-03*
