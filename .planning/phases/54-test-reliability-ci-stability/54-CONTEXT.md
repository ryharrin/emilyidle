# Phase 54: Test Reliability + CI Stability Context

**Gathered:** 2026-02-06
**Status:** Ready for execution

## Boundary

Close the current regression debt in automated test suites by stabilizing selector strategy,
viewport/project scoping, mobile interaction flows, and deterministic timing assumptions.

This phase is test-quality and CI-reliability work. It does not introduce new gameplay mechanics.

## Validation Inputs

Latest audit runs:

- `pnpm test:unit` (isolated): pass (`273/273`)
- `pnpm test:e2e`: fail (`285 passed`, `54 failed`, `3 skipped`)

Representative deterministic failures reproduced in isolation:

- strict selector collisions (`Import`, `Filters`, repeated text anchors)
- desktop-only assertions executed in mobile projects
- mobile flow timeouts for catalog owned-tab and interaction buttons
- pointer interception on career choice interactions in mobile layouts
- brittle exact-value timing assertions under live simulation ticks
- image render assertions failing on decode timing assumptions

## Locked Decisions

- Prefer explicit `data-testid` anchors over ambiguous role/text selectors in e2e flows.
- Scope desktop-only UI tests to desktop projects.
- Replace brittle sleep/exact-value assertions with state-driven waits and tolerant checks.
- Treat CI stability as first-class product quality; avoid concurrent unit+e2e contention on one runner.

## Out of Scope

- New gameplay systems/currencies/progression loops.
- Persistence schema changes beyond what was already shipped in Phase 53.

---
*Phase: 54-test-reliability-ci-stability*
*Context gathered: 2026-02-06*
