# Phase 45: Per-Watch Stats Surfaces - Context

**Gathered:** 2026-02-02  
**Status:** Ready for planning (after Phase 44)

<domain>
## Phase Boundary

Make per-watch (model-level) stats visible and useful for decision-making:
- Catalog shows each watch’s enjoyment/sec and cash/sec (STATS-01, STATS-02, STATS-05)
- Stats vary meaningfully between watches (not uniform within a tier) (STATS-03)
- Collection view shows the equipped watch’s contribution/breakdown (STATS-04)

Notes:
- This phase is primarily “stats surface + model variance”. Catalog expansion is Phase 46.
</domain>

<decisions>
## Implementation Decisions (Proposed)

### D1: Deterministic per-model variance (No hand-curation)

Introduce per-model multipliers derived from a **stable hash of the model id** so:
- stats vary within tier,
- the variation is deterministic (no randomness),
- adding new catalog entries automatically gets reasonable stats without a giant manual table.

### D2: Define “cash/sec per watch” explicitly

Two viable interpretations:

1) **Market cash/sec (watch income)**: treat `WatchItemDefinition.incomeCentsPerSec` as the base cash contribution and add per-model multipliers. Optionally include it in total cash accrual (career cash + market cash).
2) **Career cash bonus**: watches influence therapist salary via per-watch multipliers (worn watch affects cash/sec).

Recommendation: pick one and make sure the UI surfaces are truthful (do not display a stat that does not actually affect the game).

### D3: Keep UI selectors stable

This phase will add new UI elements, but avoid renaming existing `id` / `data-testid` used by Playwright/Vitest.
</decisions>

<open_questions>
## Open Questions

1. Which cash model should v4.0 use (Market cash/sec vs Career cash bonus)?
2. What variance range is “meaningful but not chaotic” within a tier? (Proposal: ±10–15%).
3. Should locked/undiscovered watches show rates, or only discovered? (Requirement suggests “visible without purchase”, not necessarily “visible without discovery”.)
</open_questions>

---

*Phase: 45-per-watch-stats-surfaces*

