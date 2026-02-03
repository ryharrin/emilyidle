# Phase 44: Interaction Feedback & Rewards - Context

**Gathered:** 2026-02-02  
**Status:** Ready for planning (after Phase 43)

<domain>
## Phase Boundary

This phase is a consistency + tuning pass over all interaction mini-games:
- Ensure every interaction ends in a clear success/failure state (WATCH-05)
- Ensure rewards scale with watch tier and precision/performance (WATCH-06)

No new mini-game types should be introduced here (Phase 43 owns adding new interactions).
</domain>

<decisions>
## Implementation Decisions (Proposed)

### D1: Centralize Reward Rules

Move reward rules out of per-modal hardcoded constants and into a single, testable resolver in the domain layer.

Why:
- Prevent drift (UI copy vs actual rewards).
- Makes tier-scaling and performance-scaling easy to reason about.

### D2: Use Performance Scalar for Scaling

All mini-games already compute a `performance` scalar (0..1). Use that value to scale rewards within each tier:
- Miss < Good < Perfect always true.
- Higher performance within the same tier yields better rewards.

### D3: Unify Result UI Vocabulary

Standardize on:
- Tier labels: Miss / Good / Perfect
- Result sections: Outcome + Reward + Cooldown/Next steps

Why:
- Reduces cognitive load on mobile.
- Makes interactions feel like one coherent system.
</decisions>

<open_questions>
## Open Questions

1. Should any interaction have a “failure penalty” beyond “lower reward” (e.g., over-wind reduces reserve)? Proposed default: no.
2. Should strap-change reward enjoyment, cash, or a short-lived multiplier? Proposed default: enjoyment burst.
3. Should we add SFX for interactions in this phase, using existing audio toggles, or defer to a later polish phase?
</open_questions>

---

*Phase: 44-interaction-feedback-and-rewards*

