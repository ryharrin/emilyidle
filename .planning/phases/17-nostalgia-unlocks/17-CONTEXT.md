# Phase 17: Nostalgia Unlocks - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a nostalgia unlock system: spend nostalgia points to permanently unlock watch types across runs.

In-scope:
- A list of unlockable watch types
- Spending rules (costs, affordability, refunds)
- Persistence (unlock state stored in save and preserved through resets)
- Integrating unlock state so the watches become purchasable even without their usual milestone gate
- UI inside the existing Nostalgia tab to buy/refund unlocks

Out-of-scope (separate phases/backlog):
- New watch items or new tiers
- Major rebalance of the broader economy beyond setting unlock costs
- New prestige layers (Phase 16 already defined nostalgia prestige; Phase 17 consumes its currency)

</domain>

<decisions>
## Implementation Decisions

### Unlockable Watches
- Eligible to unlock with nostalgia: `classic`, `chronograph`, `tourbillon` (not `starter`).
- Unlocks become available after the player completes their first nostalgia prestige.
- Unlock order is enforced: `classic` -> `chronograph` -> `tourbillon`.
- Refunds/respec are allowed for unlock purchases (see refund rules below).

### Costs & Economy
- Costs are per-watch (unique cost per unlockable watch), paid using nostalgia points only.
- Player can spend nostalgia down to 0 (no minimum retained balance).
- Refunds return a full nostalgia refund (100% of the cost).

### What "Unlocked" Means
- A nostalgia unlock bypasses the milestone unlock gate only.
- It does NOT grant free ownership; it only makes the watch type purchasable.
- It does NOT remove other purchase rules (enjoyment requirements and cash price rules still apply).
- Unlock takes effect immediately upon purchase.
- Unlocks are permanent meta-progression and survive all prestiges/resets.

### Unlocks UI
- Unlock store lives inside the existing Nostalgia tab as an additional section/panel.
- Unlock options display as a card grid (watch per card).
- Purchase confirmation is optional via a settings toggle; default behavior is confirmation ON.
- Unlock UI is always visible in the Nostalgia tab (even when player cannot afford/unlock yet), using disabled states and clear messaging.

### Claude's Discretion
- Exact nostalgia costs per watch (must fit the per-watch unique pricing decision and feel reasonable relative to Phase 16 earn rate).
- Exact refund UX details (where the refund action lives, whether it has its own confirmation).
- Exact placement and copy for the "confirmation" settings toggle.
- Exact UI copy, visuals, and test ids, as long as existing Phase 16 selectors remain stable and new selectors are consistent.

</decisions>

<specifics>
## Specific Ideas

- Unlock cards should clearly communicate: what becomes available, the nostalgia cost, and whether it is currently unlocked.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-nostalgia-unlocks*
*Context gathered: 2026-01-23*
