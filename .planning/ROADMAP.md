# Milestone v3.1: Career Depth & Landing

**Status:** 🟡 PLANNING
**Defined:** 2026-01-30

## Overview

Make Career the default landing surface for fresh saves and deepen the career progression into clear stages with lasting, meaningful choices and strong progress feedback.

## Guiding Constraints

- Cash remains career-driven (salary + sessions); watch ownership is not a cash faucet.
- Selectors/actions stay pure (no time reads inside selectors/actions).
- Keep UI selectors stable (`id`, `data-testid`).

## Phases

### Phase 32: Career Landing & Defaults

**Goal**: Fresh saves land on Career (while preserving deep links and predictable existing-save behavior).
**Depends on**: Phase 31

Plans:
- [x] 32-01-PLAN.md — Define landing rules (fresh save vs existing, deep links, last-tab) + tests
- [x] 32-02-PLAN.md — Implement landing behavior + UI smoke coverage (unit/e2e as appropriate)
- [x] 32-03-PLAN.md — Human verify landing + navigation (desktop + mobile)

### Phase 33: Career Stages & Permanent Choices

**Goal**: Career has 5+ stages with persisted permanent choices and clear previews.
**Depends on**: Phase 32

Plans:
- [x] 33-01-PLAN.md — Model career stages + choice persistence (schema + migration if needed)
- [x] 33-02-PLAN.md — Implement stage unlock rules + choice effects (no non-career cash faucets)
- [x] 33-03-PLAN.md — Add unit coverage for stage unlocks + choice persistence and previews

### Phase 34: Progress Feedback & Next Actions

**Goal**: Career page shows progress bar, next unlock callout, and a clear next-action cue.
**Depends on**: Phase 33

Plans:
- [x] 34-01-PLAN.md — Add progress + next-unlock UI and stable selectors
- [x] 34-02-PLAN.md — Add next-action recommendation logic (pure selectors) + tests
- [x] 34-03-PLAN.md — Human verify clarity + progression feel (desktop + mobile)

### Phase 35: Balance & Help Clarity

**Goal**: Pacing is smooth; help/copy explains the loop and choices.
**Depends on**: Phase 34

Plans:
- [x] 35-01-PLAN.md — Tune pacing parameters and validate via unit assertions / quick sim checks
- [x] 35-02-PLAN.md — Update Help content + ExplainButtons where needed

### Phase 36: Carry-Forward UX Bugfixes

**Goal**: Fix small but visible issues that hurt moment-to-moment play.
**Depends on**: Phase 35

Plans:
- [x] 36-01-PLAN.md — Fix quartz set-time mini-game alignment + add regression coverage

---

_For current project status, see .planning/STATE.md_
