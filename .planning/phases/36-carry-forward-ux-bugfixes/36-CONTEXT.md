---
phase: 36-carry-forward-ux-bugfixes
focus: quartz-set-time-alignment
created: 2026-01-31
---

# Phase 36 Context: Carry-Forward UX Bugfixes

## Primary Issue

Quartz set-time mini-game watch/dial display is misaligned on some viewports (especially mobile).

## Success Criteria

- Quartz modal dial remains centered in the modal card.
- Quartz hand pivot is anchored at the dial center across desktop + mobile.
- Existing quartz interaction flow remains unchanged (open -> set time -> outcome -> done).
- Add a small Playwright regression that asserts alignment on both desktop + mobile viewports.
