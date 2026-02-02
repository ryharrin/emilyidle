# Phase 42: Winding Refresh - Context

**Gathered:** 2026-02-02
**Updated:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the existing watch winding mini-game with richer visual feedback and a penalty mechanic. Keep the timing-based interaction (marker moves across track, click to stop) but add animation and feedback that makes it feel more like winding a watch.

This phase focuses ONLY on improving the existing winding interaction — new mini-game types (set-time, date, strap-change) are Phase 43.

</domain>

<decisions>
## Implementation Decisions

### Interaction Model: Enhanced Current
Keep the existing **timing-based mechanic** (marker moves across track, click to stop in sweet spot) but add richer visual feedback.

**Why this choice:**
- Preserves the skill element players already know
- Lower implementation risk than complete rewrite
- Adds "winding feel" through enhanced animation and feedback

### Core Loop (Enhanced)
1. **Start:** Modal opens, crown static, marker at start of track
2. **Wind Phase:** Marker moves across track for ~5-6 seconds total
   - Crown rotates continuously while marker moves
   - Crown rotation speed increases as marker approaches sweet spot
   - Visual "tension" indicator (subtle pulse/glow)
3. **Stop:** Player clicks to stop marker
   - Crown slows to stop with "mechanical" easing
   - Show result with visual flourish

### Sweet Spot & Penalty Zones

| Zone | Position | Outcome |
|------|----------|---------|
| Under-wind | 0-30% | Miss (25¢) |
| Good wind | 30-69% | Good (75¢) |
| Perfect | 70-95% | Perfect (150¢) |
| Over-wind | >95% | Miss (25¢) — "Over-wound!" |

**Track Layout:**
```
[0%]====[30%----[70%========95%]====[100%]
 Miss    Good      Perfect    Penalty
```

### Timing Parameters
- **Total track time:** 5-6 seconds (deliberate pace)
- **Sweet spot window:** 70-95% (25% of track = 1.25-1.5s window)
- **Penalty zone:** 95-100% (5% of track = 0.25-0.3s danger zone)

### Visual Enhancements

**Crown Animation:**
- **Size:** 72px (larger, more prominent)
- **Rotation:** Continuous 360° while marker moving
- **Speed curve:** Slow start → Medium middle → Fast near sweet spot → Very fast in penalty zone
- **Easing:** Mechanical/spring-like on stop (not abrupt)

**Tension Feedback:**
- Crown glows/pulses subtly as it rotates faster
- Reduced motion: Disable rotation, use scale/opacity pulse instead

**Result States:**
- **Miss (under-wind):** Crown stops slowly, muted color, "Under-wound" message
- **Good:** Crown stops with slight bounce, good color, "Good wind" message  
- **Perfect:** Crown stops with satisfying click, bright color, "Perfect tension" message
- **Miss (over-wind):** Crown overshoots, red warning pulse, "Over-wound!" message

### Mobile Considerations
- Touch target: Entire modal area or large designated zone (min 200x200px)
- Prevent scroll/interference while game active
- Visual "tap here" hint on first play
- Crown animation remains visible on small screens

### Accessibility
- Reduced motion: Disable rotation, use static crown with fill indicator
- Screen reader: Announce "winding..." → "stopped at X%" → result message
- Focus: Keep focus within modal during game

### Claude's Discretion
- Exact color values for glow/pulse effects (match existing theme)
- Specific easing curve values for crown rotation
- Crown rotation speed multipliers (1x to 3x range)
- Glow effect intensity and color

</decisions>

<specifics>
## Specific Ideas

- Crown rotation should feel like the mainspring tightening
- Penalty zone adds tension/risk without being too punishing
- Keep it satisfying for idle game context — clear feedback, rewarding perfect timing
- The over-wind mechanic teaches players to release before 100%

</specifics>

<deferred>
## Deferred Ideas

- Full audio feedback (Phase 44: Interaction Feedback & Rewards)
- Haptic feedback (Phase 44)
- Different mechanics for different watch types (manual vs automatic)
- Complete interaction overhaul (hold-to-wind, drag-to-rotate)

(Set-time mini-game, date-setting, and strap-change interactions belong to Phase 43.)

</deferred>

---

*Phase: 42-winding-refresh*
*Context gathered: 2026-02-02*
*Decisions locked: Enhanced timing mechanic with penalty zone, 5-6s duration, visual crown animation*
