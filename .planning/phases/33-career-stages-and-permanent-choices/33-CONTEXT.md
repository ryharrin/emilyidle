# Phase 33: Career Stages & Permanent Choices - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase extends the existing therapist career system into explicit stages with lasting, permanent choices.

In scope:
- Define 5 career stages (grad student -> private practice owner) keyed primarily by therapist career level.
- Add permanent choices (stage 2+) that meaningfully change cash earning potential and/or cadence.
- Persist all choices in saves; existing saves must migrate safely.
- Provide clear before/after previews for each permanent choice.

Out of scope:
- Any new non-career cash sources (no watch cash faucets, no new currencies).
- Reworking node spending beyond ensuring it does not violate permanence.
- Progress bar / next unlock callout / next action cues (Phase 34).

</domain>

<decisions>
## Locked Design Decisions (Do Not Re-litigate)

### Stages (MUST)
Define 5 stages keyed by career level thresholds:
1) Grad student (default)
2) Licensed associate (unlocks choosing a primary track)
3) Specialist certification (choice: modality)
4) Practice builder (choice: operating style)
5) Private practice owner (choice: expansion focus)

Default unlock levels (chosen to align with existing track unlock and keep pace reachable):
- Stage 1: level 1+
- Stage 2: level 3+ (matches existing TRACK_CHOICE_UNLOCK_LEVEL)
- Stage 3: level 6+
- Stage 4: level 10+
- Stage 5: level 15+

### Permanence rules (MUST)
- Primary track selection is permanent once chosen (no switching).
- For existing saves: if `therapistCareer.activeTrackId` is already set, treat it as already chosen and locked.
- Stage choices (modality / operating style / expansion focus) are permanent once chosen.

### Economy constraints (MUST)
- Cash remains career-driven (salary + sessions). Permanent choices may modify salary/session parameters, but must not introduce new cash sources.

### Node tree (Explicit)
- Node spending stays a separate system.
- Respec behavior may remain (it resets spent nodes only) as long as it does not reset or bypass permanent stage choices.

</decisions>

<specifics>
## Implementation Notes

- Store permanence as explicit fields on `TherapistCareerState` (and persist them):
  - `primaryTrackId` (locked once set)
  - `modalityId`, `operatingStyleId`, `expansionFocusId` (locked once set)
- Stages are derived (do not store stage id in saves): compute current stage from `therapistCareer.level`.
- Provide previews as "before" vs "after" values for salary rate and session policy (payout/cooldown/cost), using pure selectors.
- UI must use stable selectors (`data-testid`) for all new stage/choice surfaces.

</specifics>

<deferred>
## Deferred Ideas

- Detailed pacing/balance tuning belongs in Phase 35.
- Any cross-tab surfacing of stage progress belongs in Phase 34.

</deferred>

---

*Phase: 33-career-stages-and-permanent-choices*
*Context gathered: 2026-01-30*
