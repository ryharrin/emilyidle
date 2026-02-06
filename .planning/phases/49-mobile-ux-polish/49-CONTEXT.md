# Phase 49: Mobile & UX Polish - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the v4.1 mobile and UX polish scope mapped in `.planning/REQUIREMENTS.md` from `TAB-01` through `CAREER-01`: stronger tab navigation, mobile-first filtering/details, clearer stats structure, improved modal/help experiences, onboarding polish, and a career timeline view.

This phase is UX and interaction polish only. Do not change the core economy model, unlock math, or save schema semantics.

</domain>

<decisions>
## Implementation Decisions

### Contract guardrails (locked)
- Keep selectors/actions as the source of truth for derived behavior; UI should render selector output rather than re-implementing math.
- Preserve persistence contracts (`emily-idle:save`, `emily-idle:settings`, `emily-idle:help`, navigation/audio keys). No new storage keys unless unavoidable; if added, update key/schema guardrail tests.
- Preserve existing `id` and `data-testid` anchors used by Playwright/Vitest. New anchors must be additive, not replacements.

### Accessibility + interaction quality
- Maintain keyboard-safe tab semantics (`tablist`, roving focus behavior, Enter/Space activation) while adding shortcuts and badges.
- Enforce visible focus states and 44px minimum touch targets for actionable controls.
- Every new motion affordance (skeletons, count-up, floating deltas, modal animation) must include reduced-motion behavior.

### Performance + implementation strategy
- Use native platform primitives first (scroll snap, sticky positioning, `aria-*`, focus management).
- For `VIRTUAL-01`, prefer a proven virtualization library over hand-rolled windowing logic.
- Keep CSS changes modular by introducing component-scoped style files where practical, rather than expanding monolithic styling further.

### Claude's discretion
- Exact visual copy tone, easing curves, and animation durations can be tuned during execution as long as accessibility and test stability stay intact.

</decisions>

<specifics>
## Specific Ideas to Preserve

- Tabs should feel "at-a-glance": grouped, horizontally scannable, badge-enabled, and keyboard reachable.
- Catalog should feel calmer on mobile: compact filters, clear affordability signals, and detail access without overwhelming the card grid.
- Stats should read like a dashboard, not a wall of metrics: grouped headline numbers, optional details, and softcap context moved into breakdowns.
- Career progression should be narratively legible via a timeline that links milestones and permanent choices.

</specifics>

<deferred>
## Deferred (Out of This Phase)

- Requirements from `TAB-04` onward (Phase 50+ roadmap scope) remain deferred.
- Any persistence schema version bump or key migration is deferred unless execution proves it is strictly necessary.

</deferred>

---

*Phase: 49-mobile-ux-polish*
*Context gathered: 2026-02-06*
