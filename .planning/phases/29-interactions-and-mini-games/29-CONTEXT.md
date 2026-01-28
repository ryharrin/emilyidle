# Phase 29: Interactions & Mini-Games - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 29 delivers watch-type interactions with clear feedback and communicated rewards:

- Winding is available only for non-automatic watches; automatic watches do not show winding.
- Winding includes a visible winding animation.
- Winding provides clear success/failure cues and communicates rewards.
- Winding is skill/timing-based (player input matters beyond a single button).
- Automatic watches have at least one distinct interaction mini-game and its rewards are communicated.

Out of scope for this phase: wear-one bonus details (Phase 28), Workshop/Atelier UX overhaul + Help refresh (Phase 30).

</domain>

<decisions>
## Implementation Decisions

### Interaction surfacing & gating
- Surface: interactions appear in Vault/Collection only.
- Eligible target: any owned eligible watch can be interacted with (not restricted to the worn watch).
- Cooldown feel: per-watch cooldown.
- Unavailable state: keep the button visible but disabled + show a clear reason (e.g., "Cooldown 12s").
- Button labels: use explicit action labels per interaction type (avoid a generic "Interact").

### Watch-type model (for gating)

Current codebase has only 4 watch ids and no explicit manual/automatic attribute, but Phase 29 requires a movement-type gate. Use movement categories conceptually:

- Quartz: uses a time-setting mini-game (see below).
- Manual/non-automatic: uses the winding mini-game.
- Automatic: uses an automatic-only mini-game.

Note: renaming/adding watch tiers ("starter"→Quartz, making "classic" manual, adding a new automatic level) is likely a Phase 25/Watch Models concern. Phase 29 cares about interaction gating by movement type.

### Manual winding mini-game
- Input: timing bar (tap when indicator hits a sweet spot).
- Duration: short (3-5 seconds).
- Failure: partial success (still get something, but less).
- Skill effect: reward scales with performance.
- Reward: enjoyment burst (immediate enjoyment gain).
- Preview: show reward range inline on the button before starting.
- Cost/cooldown: cooldown only (no resource cost).
- Outcome tiers: Miss / Good / Perfect.

### Automatic-only mini-game
- Theme: should relate to a watch getting wound by wearing it (automatic/rotor motion).
- Duration: medium (8-15 seconds).
- Failure: partial success.
- Reward: a "power reserve" meter reward (distinct from winding’s enjoyment burst).

### Quartz mini-game
- Concept: a time-setting mini-game.
- Purpose: gives Quartz watches a distinct interaction that is not winding.

### Claude's Discretion
- Exact automatic interaction mechanic, as long as it clearly matches the "wound by wearing" theme and is distinct from winding.
- Quartz mini-game reward type and whether it uses Miss/Good/Perfect tiers (default: keep feedback consistent across interactions).
- Exact behavior of the power reserve meter (duration vs drain, display).
- Whether the winding replaces the existing 5-round Steady/Push interaction entirely (winding must meet the new skill/timing-based requirement).

</decisions>

<specifics>
## Specific Ideas

Existing codebase anchors to reuse:
- Current interaction entry point: per-watch "Interact" button on Vault/Collection watch cards (`src/ui/tabs/CollectionTab.tsx`).
- Existing manual mini-game: Wind session modal in `src/App.tsx` and reward wiring through `applyWindSessionRewards`.
- Reward/event scaffolding: manual event activation via `activateManualEvent` and `wind-up` event id.
- Motion: stick to the existing CSS transition toolkit and the global reduced-motion rule (`src/style.css`).

External references (optional):
- Timing mini-game feedback patterns: `bd-minigames` (explicit pass/fail transport + status messaging), `betteraim` (goal bar progress + clear CTAs), `bemuse` (post-run summary breakdown).

</specifics>

<deferred>
## Deferred Ideas

- Renaming/adding watch tiers (Quartz vs Manual vs Automatic as purchasable levels) — belongs with watch model/tier work (likely Phase 25).

</deferred>

---

*Phase: 29-interactions-and-mini-games*
*Context gathered: 2026-01-27*
