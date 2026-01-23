# Phase 18: Codebase Refactor - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor game files for clearer separation of logic, UI, and data models.

In-scope:
- Reorganize code for maintainability (smaller modules, clearer responsibilities)
- Touch both UI (`src/App.tsx`-adjacent) and game modules (`src/game/*`)
- Remove dead/unused code discovered during the refactor
- Update internal docs to reflect the new structure

Out-of-scope (explicitly):
- Gameplay behavior changes (except small bug fixes discovered during refactor)
- Visual redesign (only incidental/minimal UI changes if required)
- Save format / localStorage key / major version changes

</domain>

<decisions>
## Implementation Decisions

### Refactor Scope
- Primary goal: maintainability (make code easier to navigate/change with fewer side effects).
- Phase 18 should refactor both UI and game modules.
- Import path churn is acceptable (updating imports across the app is ok).
- Save format changes are out-of-scope for this phase.

### Stability Guarantees
- Test selectors (`id`, `data-testid`) may change if needed; update tests accordingly.
- Export surfaces may change; update call sites accordingly.
- If a small behavior/correctness bug is found during the refactor, it should be fixed as part of Phase 18.

### Refactor Strategy
- Execute incrementally (small steps, keep the app runnable throughout).
- Prefer many small commits for mechanical moves/renames.
- Run `pnpm run typecheck` and `pnpm run test:unit` frequently; run e2e at milestones.

### Done Criteria
- Required automated gates: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:unit`, `pnpm run test:e2e`, `pnpm run build`.
- Include updating internal docs/comments about the new structure.
- Remove dead/unused code as part of the refactor.
- Perform a quick manual smoke check (open app; load/save; click core tabs; basic loop sanity).

### Claude's Discretion
- Exact module layout and file naming for the refactor (as long as Phase 18 boundary and done criteria are met).
- Exact sequencing between UI and game refactors (no preference locked).
- Which small bug fixes are safe/appropriate to include vs defer.

</decisions>

<specifics>
## Specific Ideas

- Keep changes readable: favor mechanical moves + small follow-up cleanups over large rewrites.

</specifics>

<deferred>
## Deferred Ideas

- Considering a save version bump and/or changing localStorage keys came up, but is out-of-scope for Phase 18. If desired, do it as a dedicated follow-up phase with an explicit migration plan.

</deferred>

---

*Phase: 18-codebase-refactor*
*Context gathered: 2026-01-23*
