# Codebase Concerns

**Analysis Date:** 2026-01-21

## Tech Debt

**Monolithic UI module:**
- Issue: Main UI, game loop, and handlers live in one file
- Why: Single-file iteration and rapid changes
- Impact: Harder navigation and higher merge conflict risk
- Fix approach: Extract sections into `src/components/` and keep `src/App.tsx` as composition root
- Files: `src/App.tsx`

**Large game state module:**
- Issue: All definitions/selectors/actions are centralized in one file
- Why: Simplicity and shared data model
- Impact: Dense edits and reduced modularity
- Fix approach: Split into `src/game/` submodules (items, upgrades, milestones, selectors)
- Files: `src/game/state.ts`

## Known Bugs

- Not detected (no bug notes or TODO/FIXME comments in `src/` or `tests/`)

## Security Considerations

**Client-side save data:**
- Risk: localStorage data is user-editable (cheating possible)
- Current mitigation: None needed for a single-player idle game
- Recommendations: If competitive features are added, validate on a server
- Files: `src/game/persistence.ts`

## Performance Bottlenecks

- Not detected (no profiling data or reported slow paths in repo)

## Fragile Areas

**Test selectors and IDs:**
- Why fragile: E2E and unit tests rely on `id` and `data-testid` values
- Common failures: UI refactors can break tests if identifiers change
- Safe modification: Update tests in `tests/` when adjusting selectors
- Test coverage: E2E and unit tests depend on these selectors
- Files: `src/App.tsx`, `tests/*.spec.ts`, `tests/*.unit.test.tsx`

## Scaling Limits

- Not applicable (static browser app, no backend services)

## Dependencies at Risk

- Not detected (no deprecated deps noted in repo)

## Missing Critical Features

- Not detected (no explicit feature gaps documented)

## Test Coverage Gaps

**Coverage reporting not configured:**
- What's not tested: No coverage targets or enforcement configured
- Risk: Regression detection relies on existing tests only
- Priority: Low
- Difficulty to test: Low (add coverage config and script)
- Files: `package.json`, `vitest.config.ts`

---

*Concerns audit: 2026-01-21*
*Update as issues are fixed or new ones discovered*
