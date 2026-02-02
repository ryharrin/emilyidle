# Phase 42: Winding Refresh - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the existing watch winding mini-game with richer player control and visible animation feedback. Players will drag to simulate turning the watch crown, with immediate visual response showing winding progress.

This phase focuses ONLY on improving the existing winding interaction — new mini-game types (set-time, date, strap-change) are Phase 43.

</domain>

<decisions>
## Implementation Decisions

### Interaction Controls
- **Primary input:** Drag gesture in circular motion (simulates turning crown)
- **Sensitivity:** Short drag distance — very responsive, casual-friendly
- **Interaction zone:** Dedicated winding zone around the crown image
- **Forgiveness:** Once winding starts, drag can leave zone without interrupting

### Animation Style
- **Primary visual:** Spring/gauge filling shows winding progress
- **Gauge style:** Arc/crescent meter (curved like a speedometer)
- **Animation response:** Slightly smoothed with subtle easing for fluid feel
- **Completion state:** Gauge maxes out with subtle glow effect

### Input Responsiveness
- Real-time response to drag with slight smoothing
- Animation velocity tied to drag speed
- No momentum/inertia — stops when drag stops

### Completion Feedback
- Visual: Gauge at 100% with gentle highlight/glow
- No automatic modal close — player dismisses when ready
- Rewards shown consistent with existing interaction flow

### Claude's Discretion
- Exact color scheme for gauge (match existing theme)
- Specific easing curve values
- Size and positioning of winding zone
- Glow effect intensity and color

</decisions>

<specifics>
## Specific Ideas

- Drag interaction should feel like actually turning a mechanical watch crown
- Gauge should feel like a power reserve indicator on a real automatic watch
- Keep it satisfying for idle game context — not too demanding, clear feedback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 42 scope.

(Set-time mini-game, date-setting, and strap-change interactions belong to Phase 43.)

</deferred>

---

*Phase: 42-winding-refresh*
*Context gathered: 2026-02-02*
