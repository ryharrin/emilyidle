# Draft: Phase 30 (Workshop/Atelier + Docs)

## Phase Boundary (from ROADMAP.md)

- Workshop dismantle UI is hidden until the workshop system is unlocked.
- Atelier view shows how much money is needed for the next blueprint.
- Atelier bonuses are tuned so the second vault run is meaningfully faster than the first.
- Help documentation explains the dual-currency system and career progression mechanics in detail.
- Help is updated to reflect the v3.0 catalog-first economy and interaction mechanics.

## Research Findings (pending)

- (Collecting via explore agents)

## Open Questions

- Workshop/Atelier locked states and where dismantle UI appears.
- How to present "money needed for next blueprint" (copy/progress details).
- What "meaningfully faster" means (target pacing) and how to communicate it.
- Help docs structure, depth, and tone for v3.0 systems.

## Decisions (to be captured)

### Workshop/Atelier gating + dismantle visibility

- When locked: show a teaser panel (explains Atelier + unlock condition + one CTA).
- Dismantle section placeholder: yes, show a locked placeholder explaining why it’s unavailable.
- When unlocked: dismantle UI is a visible section (not collapsed / not modal-only).
- Dismantle safety: one-step action is OK, but copy must be very clear about what you lose/gain.

### Dismantle UX specifics

- Card info: show gain only.
- Quantity: dismantle 1 per click.
- Eligibility: dismantle allowed for all watch types (once unlocked).
- Feedback: inline updated counts (optional small "+N parts" hint).

Additional decisions:

- Dismantle visibility: hide everywhere until Atelier is unlocked (including any Vault/Collection affordance).
- Last-copy policy: block dismantling the last owned copy of a watch.
- If dismantling would drop the worn watch to 0 owned: auto-unequip to none.
- Undo: no undo.

### "Next blueprint" clarity

- Primary readout: show both (enjoyment remaining + a dollars-related hint if derivable).
- Meaning of "next blueprint": next +1 blueprint in the reset gain (not merely reaching threshold).
- Placement: in the reset section (near Reset threshold / Current gain).
- Include a rough ETA based on current enjoyment rate.

### Pacing/balance target (2nd run faster)

- Target: second vault run ~3x faster than the first.
- Yardstick: time to next Atelier reset.
- Main sources: both Atelier upgrades + prestige/legacy-style multiplier(s).
- Communication: yes, brief UI note telling the player their run is faster and why.

Clarifications:

- The 3x target applies to the full run from reset to next Atelier reset.
- Curve: plateau after the big 2nd-run jump (diminishing returns later).
- No hard minimum floor time; near-instant outcomes are acceptable if tuning lands there.
- Surface the brief explanation in the Atelier tab (near reset/current gain), not elsewhere.

Additional pacing calls:

- Late-game can become nearly instant; that's acceptable.
- After 2nd run, later gains should be small but noticeable.
- Time-to-reset is real-time (includes offline/idle).
- Brief explanation format: source list ("Faster run: Atelier upgrades + Prestige legacy") with ExplainButton.

### Help documentation updates

- Structure: expand existing HelpModal sections/IDs (no major restructure).
- Depth: very detailed (include rules, edge cases, and numbers where helpful).
- Priority topics: dual-currency + gates; career progression; interactions & mini-games.
- Add/ensure ExplainButtons at: Atelier reset panel; Upgrades tab; Career tab; interaction buttons/modals.
