# Phase 34: Progress Feedback & Next Actions - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds clear progress feedback and a next-action cue to the Career tab.

In scope:
- Show progress toward the next career unlock (progress bar + explicit next-unlock callout).
- Provide a deterministic "next action" recommendation to help the player progress faster.
- Keep selectors/actions pure and use stable UI selectors (`data-testid`).

Out of scope:
- Balance/pacing adjustments (Phase 35).
- Help copy overhaul (Phase 35).
- Quartz mini-game alignment fix (Phase 36).

</domain>

<constraints>
## Constraints (Must Hold)

- Cash remains career-driven (salary + sessions); this phase must not introduce new cash sources.
- Next-action logic is selector-driven and pure (no time reads inside selectors).
- Progress should be understandable at a glance and robust on both desktop and mobile.

</constraints>

<inputs>
## Key Inputs

- Stage thresholds (Phase 33):
  - stage 2 (track): level 3+
  - stage 3 (modality): level 6+
  - stage 4 (operating style): level 10+
  - stage 5 (expansion focus): level 15+
- Career leveling is XP-based with passive XP gain (`applyTherapistPassiveProgress`) and optional session XP (`performTherapistSession`).

</inputs>

<proposed-behavior>
## Proposed Behavior

- "Next unlock" callout prefers actionable unlocks:
  - If a permanent choice is available now (unlocked and not chosen), call it out.
  - Otherwise, show the next locked stage and its required level.
- Progress bar should represent progress toward the *next stage threshold* (not just next level), using a pure selector.
- "Next action" cue should be a single recommendation, prioritized:
  1) Take an available permanent stage choice.
  2) If sessions are supported and currently available: perform a therapist session.
  3) Otherwise: keep playing; passive XP will level you up.

</proposed-behavior>

---

*Phase: 34-progress-feedback-and-next-actions*
*Context gathered: 2026-01-30*
