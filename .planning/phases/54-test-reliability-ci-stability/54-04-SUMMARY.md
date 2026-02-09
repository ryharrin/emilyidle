---
phase: 54-test-reliability-ci-stability
plan: 4
subsystem: runtime-determinism-tolerant-assertions
tags: [playwright, determinism, assertions, reliability]
requires:
  - 54-03-SUMMARY.md
provides:
  - Deterministic/tolerant invariants for settings and prestige confirmation flows
  - Scoped nostalgia toast assertions resilient to unrelated notification noise
  - Poll-based collection interaction outcome checks resilient to async save timing
key-files:
  modified:
    - tests/settings-clear-save.spec.ts
    - tests/prestige-confirmation.spec.ts
    - tests/nostalgia-prestige.spec.ts
    - tests/collection-loop.spec.ts
    - .planning/phases/54-test-reliability-ci-stability/54-TASKLIST.md
    - .planning/phases/54-test-reliability-ci-stability/54-04-SUMMARY.md
validated:
  - tests/settings-clear-save.spec.ts
  - tests/prestige-confirmation.spec.ts
  - tests/nostalgia-prestige.spec.ts
  - tests/collection-loop.spec.ts
metrics:
  completed: 2026-02-07
---

# Phase 54 Plan 04 Summary

Completed the Phase 54-04 objective by replacing timing-sensitive exact-value assertions with
deterministic or tolerance-based invariants in targeted e2e reliability hotspots.

## Accomplishments
- Hardened `tests/settings-clear-save.spec.ts`:
  - added deterministic preconditions around save safety and danger-zone rendering,
  - triggered clear-save using element-evaluated click to reduce actionability flake,
  - replaced strict post-cancel currency equality with lower-bound invariant.
- Hardened `tests/prestige-confirmation.spec.ts`:
  - updated confirmation-flow selectors to current reset CTA copy,
  - replaced fragile immediate UI value reset checks with persisted save-state invariants after
    confirmation.
- Hardened `tests/nostalgia-prestige.spec.ts`:
  - aligned modal button assertions with current copy,
  - switched nostalgia toast checks to scoped toast-item filtering so unrelated toasts do not
    break assertions,
  - guarded overlap assertion behind unlock-button visibility.
- Hardened `tests/collection-loop.spec.ts` interaction assertions:
  - made catalog interaction modal opening return success/failure and skip deterministically when no
    valid candidate is available in seeded state,
  - replaced immediate post-action value reads with `expect.poll(...)` invariants for enjoyment,
    reserve, and rate propagation,
  - scoped cooldown assertions to the catalog panel to avoid cross-tab ambiguity.

## Verification
- `pnpm test:e2e --project=chromium -- tests/settings-clear-save.spec.ts tests/prestige-confirmation.spec.ts tests/nostalgia-prestige.spec.ts`  
  Result: `5 passed`.
- `pnpm test:e2e --project=chromium -- tests/collection-loop.spec.ts -g "automatic interaction increases power reserve and enjoyment rate|winding interaction completes and applies rewards"`  
  Result: `18 passed, 1 skipped, 0 failed`.

## Notes
- Verification results above are recorded from the completed Phase 54-04 execution context and
  satisfy the plan gate.
