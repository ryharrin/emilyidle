# Phase 43: New Watch Mini-Games - Context

**Gathered:** 2026-02-02  
**Status:** Ready for planning (after Phase 42)

<domain>
## Phase Boundary

Add additional watch interaction mini-games beyond the existing winding/automatic/quartz set.

This phase focuses on **new interaction types** and their UI wiring:
- Set-date interaction (when appropriate for the watch tier)
- Strap-change interaction (visual feedback + “finished” state)

Notes:
- Reward scaling + cross-mini-game consistency is Phase 44.
- Per-watch stat surfaces (showing per-watch rates everywhere) is Phase 45.
</domain>

<decisions>
## Implementation Decisions (Proposed)

### D1: Interaction Selection UI = Menu Modal

Introduce an **Interaction Menu modal** that appears when the player clicks the existing interact button on a watch card. The menu lists all available interactions for that watch tier and lets the player choose one.

Why:
- Prevents “button explosion” on catalog cards as we add set-date + strap-change.
- Keeps interactions discoverable on mobile (large touch targets).
- Lets us reuse the existing modal patterns and test ids.

### D2: Cooldown Model = Shared per Watch Tier (Keep Existing)

Keep the current **per-watch-item cooldown** (`interactionNextAvailableAtMsByItem[WatchItemId]`) as the single cooldown for all interactions on that watch tier.

Why:
- Avoids save schema changes and migration complexity.
- Preserves the existing mental model: “this watch is cooling down”.

### D3: “Appropriate” Date-Setting Eligibility = Tier Flag (Not Per Model)

Add a simple `supportsDateSetting` (or `supportedInteractions`) flag on `WatchItemDefinition` (tier-level) to determine whether the “Set date” option appears.

Default eligibility proposal:
- `starter` (quartz): set-time only
- `classic` (automatic): set-date + strap-change
- `chronograph` (manual): set-date + strap-change
- `tourbillon` (manual): strap-change (date optional; decide when planning)

Rationale:
- Avoids per-model complication metadata in Phase 43.
- We can evolve to per-model capabilities later if needed.
</decisions>

<open_questions>
## Open Questions

1. Should `tourbillon` support set-date, or should it be strap-only for simplicity?
2. Should date-setting reward cash or enjoyment (until Phase 44 unifies reward scaling)?
3. Do we need a test-mode hook to make date/strap screenshot capture deterministic, or is unit-level coverage sufficient?
</open_questions>

<deferred>
## Deferred Ideas

- Phase 44: unify results UI + tier-scaled rewards across all mini-games.
- Phase 45: per-model interaction capabilities and per-model stat variance.
</deferred>

---

*Phase: 43-new-watch-mini-games*

