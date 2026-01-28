# Phase 30: Workshop/Atelier + Docs - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 30 tightens Workshop/Atelier UX clarity, tunes pacing, and updates Help for v3.0:

- Workshop dismantle UI is hidden until the Atelier system is unlocked.
- Atelier view shows how much money is needed for the next blueprint.
- Atelier bonuses are tuned so the second vault run is meaningfully faster than the first.
- Help explains the dual-currency system and career progression mechanics in detail.
- Help is updated to reflect the v3.0 catalog-first economy and interaction mechanics.

</domain>

<decisions>
## Implementation Decisions

### Workshop/Atelier locked states + dismantle visibility
- When locked: show a teaser panel (explains Atelier + unlock condition + one CTA).
- Dismantle visibility: hide dismantle everywhere until Atelier is unlocked (including any Vault/Collection affordance).
- Locked placeholder: yes, show a locked placeholder explaining why dismantle isn’t available.

### Dismantle UX
- Once unlocked: dismantle UI is a visible section (not collapsed; not modal-only).
- Action safety: one-step dismantle is OK.
- Card info: show gain only (parts gained). (No separate confirm/undo.)
- Quantity: dismantle 1 per click.
- Eligibility: dismantle allowed for all watch types.
- Last-copy policy: block dismantling the last owned copy of a watch.
- If dismantling would drop the worn watch to 0 owned: auto-unequip to none.
- Feedback: inline updated counts (optional small "+N parts" hint).

### Atelier: "money needed for next blueprint"
- Primary readout: show both:
  - enjoyment remaining, and
  - a dollars-related hint (if derivable) to help the player understand what purchases might be needed.
- Meaning of "next blueprint": next +1 blueprint in the reset gain (not merely reaching threshold).
- Placement: in the reset section (near Reset threshold / Current gain).
- Include a rough ETA based on current enjoyment rate.

### Pacing/balance: "2nd run meaningfully faster"
- Target: second run is ~3x faster than the first.
- Yardstick: time to next Atelier reset.
- Source of speed: both Atelier upgrades + prestige/legacy-style multipliers.
- Curve: big 2nd-run jump, then continued small-but-noticeable gains later.
- No hard minimum time floor; late-game can become nearly instant.
- Time-to-reset refers to real-time (includes offline/idle).
- Communicate briefly in Atelier tab: a source list like "Faster run: Atelier upgrades + Prestige legacy" with ExplainButton.

### Help documentation updates
- Structure: expand existing HelpModal sections/IDs (avoid major restructure).
- Depth: very detailed (rules + edge cases + numbers where helpful).
- Priority topics to cover thoroughly:
  - Dual-currency + gates
  - Career progression
  - Interactions & mini-games
- Add/ensure ExplainButtons at:
  - Atelier reset panel
  - Upgrades tab
  - Career tab
  - Interaction buttons/modals

### Claude's Discretion
- Exact formatting/rounding of the "dollars-related hint" (as long as it is useful and not misleading).
- Exact wording for dismantle (since we’re showing gain-only but still want it to feel safe).
- Exact Help copy structure within the chosen sections.

</decisions>

<specifics>
## Specific Ideas

Existing code/UI anchors to reuse:
- `src/ui/tabs/WorkshopTab.tsx` already shows:
  - Reset threshold + Current gain
  - Teaser progress to first reset
  - Dismantle cards with parts-per-watch and owned counts
- Help system is already wired via `ExplainButton` + `HelpModal`.

</specifics>

<deferred>
## Deferred Ideas

- Renaming/adding watch tiers (Quartz/Manual/Automatic as purchasable levels) is out of scope here.

</deferred>

---

*Phase: 30-workshop-atelier-and-docs*
*Context gathered: 2026-01-27*
