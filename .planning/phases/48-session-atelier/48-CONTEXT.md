# Phase 48: Session & Atelier Rework - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Make session cooldowns strategic, reshape the winding interaction, and clarify atelier bonuses (progressive costs, cooldown ring, drag-based winding, and clearer atelier reward info). This phase focuses on polishing the existing session/atelier experience—no new capabilities beyond what’s in the roadmap.
</domain>

<decisions>
## Implementation Decisions

### Session cost & pacing
- Progressive costs cap and then drop back after a break so players feel the pressure without permanently locking the session.
- Show a textual numeric indicator with a short explanation ("Second session premium") whenever costs rise.
- Offer soft prompts (warnings) when the multiplier grows, but let players continue; they can self-pace.
- The cooldown timer runs continuously even if the user leaves, so any UI resume is synced with the live backend timer.

### Cooldown UI
- Use a circular SVG progress ring tied to `remainingMs`, smoothed for animation so it feels responsive yet stable.
- When the user closes overlays or switches tabs, the ring keeps running (no pause) and catches up when the view returns.
- The cooldown display also shows a short reason/label ("Second session premium") so the player understands why the cost increased.

### Winding interaction feel
- Control the winding game with a direct drag/crown motion (pointer events with capture) rather than button timing.
- Enable the feature only for hand-wind/quartz watches; automatic models disable the control.
- Upon drag completion, show a glow effect plus reward summary that highlights the tier achieved.
- Animate a spring gauge filling arc during the drag to signal tension build-up.

### Atelier bonus clarity
- The second run delivers a noticeably stronger bonus, and blueprints display the current cost plus the next cost side by side.
- Tooltip copy includes multiplier math so players see how the bonus scales.
- The blueprint info also lists the specific rewards unlocked (enjoyment %, cash %, new tier). This detail resides in the tooltip to avoid UI clutter.

### Claude's Discretion
- Exact wording of the tooltip math explanation (tone/style is up to planner and writer).
- Specific colors/animation easings for the ring/gauge — fine for the implementation to choose.

</decisions>

<specifics>
## Specific Ideas

- "Feel the winding like turning an actual crown; the gauge should mirror the tension."  
- "The cooldown ring should look like a clock face that never stops ticking even when you switch tabs."  
- "Atelier tooltips should spell out multipliers (e.g., +8% enjoyment, +12% cash) so players value the second run."
</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within the phase boundary.
</deferred>

---

*Phase: 48-session-atelier*
*Context gathered: 2026-02-05*
