# Phase 44: Interaction Feedback & Rewards - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Align the winding, quartz, and automatic mini-games so every interaction communicates success/failure clearly, ties Miss/Good/Perfect to precision, and keeps reduced-motion/44px-touch contracts untouched. No new capabilities beyond consistent outcomes and reward messaging are introduced here.

</domain>

<decisions>
## Implementation Decisions

### Testing & verification scope
- Cover all three unit suites (winding, quartz, automatic) so their regression tests assert the outcome remains hidden during animation and only reveals after the player stops.
- Assert the numeric enjoyment/cash values alongside tier labels so the helper math stays deterministic when the outcomes appear.
- Rely on the existing logic path for reduced-motion; we don’t need additional dedicated reduced-motion tests.
- Add a Playwright/visual scenario that steps through each modal, confirms the outcome stay-hidden rule, and validates the tier messaging before the human verification checkpoint is considered satisfied.

### Claude's Discretion
- The tester can decide whether to run the Playwright scenario serially or in parallel with other suites provided it explicitly touches all three modals in one flow.

</decisions>

<specifics>
## Specific Ideas

- Record the exact reward strings (e.g., "Enjoyment +$0.75" for good, etc.) so the regression snapshots remain stable.
- The Playwright run should open quartz first, then winding, then automatic to illustrate how the consistent tier messaging flows across modals.

</specifics>

<deferred>
## Deferred Ideas

- None — the discussion stayed within Phase 44’s scope.

</deferred>

---

*Phase: 44-interaction-feedback-rewards*
*Context gathered: 2026-02-03*
