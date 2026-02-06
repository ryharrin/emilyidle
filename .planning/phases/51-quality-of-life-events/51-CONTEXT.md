# Phase 51: Quality of Life & Events - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the v4.1 quality-of-life and events scope from `.planning/REQUIREMENTS.md`:
`OFFLINE-01`, `SAVE-01`, `UNDO-01`, `FAVE-01`, `NOTIF-01`, `ACHIEVE-01`, `ACHIEVE-02`, `EVENT-01`, `PRACTICE-01`, `DIFF-01`, `STREAK-01`.

This phase must improve reliability, reduce friction, and increase short-session engagement without destabilizing existing save contracts.
</domain>

<decisions>
## Implementation Decisions

### Data and contract guardrails (locked)
- Keep `emily-idle:save` and legacy `watch-idle:save` compatibility intact.
- Keep existing settings keys (`emily-idle:settings`, `emily-idle:audio`, `emily-idle:navigation`, `emily-idle:help`) stable; only additive fields are allowed.
- Keep selector/action purity (no browser APIs or `Date.now()` in pure domain code).
- Keep existing IDs and `data-testid` anchors stable; any new anchors must be additive.

### Quality-of-life direction
- Offline progress should be capped, explicitly explained, and never silently produce unbounded gains.
- Save export/import should support both copy/paste and file-based workflows with clear validation feedback.
- Undo should target the most recent purchase action only and expire quickly.
- Favorites should support quick filtering without changing ownership semantics.

### Notification and progression direction
- Notification preferences should be user-controlled and centralized in Settings.
- Achievement unlock feedback should use the existing toast stack patterns, not blocking modals.
- Achievement coverage should expand into career, mini-game, prestige, and collection categories.
- Event calendar should show active/upcoming windows with countdowns and clear bonus explanations.

### Mini-game direction
- Practice mode must never grant rewards or alter progression economics.
- Difficulty scaling should be tier-aware and deterministic.
- Perfect streak bonuses should be explicit, capped, and testable.
</decisions>

<specifics>
## Specific Ideas to Preserve

- "Returning after a break should feel rewarding, but bounded and legible."
- "Undo is a safety net, not a rewind system."
- "Favorites should cut browsing noise in one tap."
- "Practice mode should train skill without inflating currency/enjoyment."
- "Event windows should explain why output changed right now."
</specifics>

<deferred>
## Deferred (Out of This Phase)

- Any multiplayer, social, or seasonal content remains out of scope.
- Any save schema version bump or breaking migration remains deferred.
- Any broad tab/nav redesign beyond requirement scope remains deferred.
</deferred>

---

*Phase: 51-quality-of-life-events*
*Context gathered: 2026-02-06*
