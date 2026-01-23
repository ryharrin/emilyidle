# Phase 16: Nostalgia Prestige Reset - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement a new prestige reset that resets enjoyment + dollars and awards nostalgia points.

In-scope:
- A player-triggered "Nostalgia Prestige" action
- Reset behavior for currencies and progression
- Nostalgia point award + persistence
- UI flow to preview eligibility/reward, confirm, and show results

Out-of-scope (explicitly later phases):
- Spending nostalgia or defining nostalgia unlock trees (Phase 17)
- New content systems unrelated to prestige reset

</domain>

<decisions>
## Implementation Decisions

### Reset Mechanics
- Add a new top-level tab/section for Nostalgia/Prestige.
- Nostalgia Prestige is gated behind a threshold (not always immediately available).
- The action can be used anytime (no "idle-safe" or "bank first" restriction).
- Use a single confirmation modal for the reset.

### Reset Effects
- Reset enjoyment + all dollar balances.
- Keep owned watches across the reset.
- Reset Workshop + Maison + Career progression back to baseline.
- Persist nostalgia points and lifetime stats (for display + calculation).

### Nostalgia Rewards
- Nostalgia is awarded based on lifetime enjoyment earned since the last nostalgia reset.
- Use a diminishing-returns conversion (not linear).
- Nostalgia points are integer-only.
- When eligible to prestige, award at least 1 nostalgia point.

### User Interface
- Emphasize eligibility + reward preview.
- Show progress toward eligibility (progress bar to the threshold).
- After reset, show a results screen summarizing the nostalgia gained and the reset outcome.

### Claude's Discretion
- Exact eligibility threshold definition, as long as it is representable as a progress bar and aligns with the "min 1 when eligible" rule.
- Exact diminishing-returns function/constant (e.g., sqrt/log style), as long as it is predictable, monotonic, and previewable.
- Exact copy/labels (e.g., naming of the action/button), layout details, and micro-interactions.

</decisions>

<specifics>
## Specific Ideas

- The Nostalgia/Prestige tab should clearly communicate (1) what resets, (2) what persists, and (3) the projected nostalgia gain before confirmation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-nostalgia-prestige-reset*
*Context gathered: 2026-01-23*
