---
phase: 51-quality-of-life-events
plan: 2
subsystem: gameplay
tags: [undo, favorites, catalog, collection, vitest]
requires:
  - phase: 51-01
    provides: stable persistence/import baseline
provides:
  - Latest-purchase undo window with deterministic validation rules
  - Favorite toggles and favorites-only filtering across catalog and collection surfaces
affects:
  - phase: 51-03
    provides: QoL interaction hooks that coexist with toast/notification flows
tech-stack:
  added: []
  patterns:
    - Keep undo and favorite transitions pure in domain actions and wire through existing purchase callbacks.
key-files:
  created:
    - tests/purchase-undo-ui.unit.test.tsx
    - tests/catalog-favorites.unit.test.tsx
  modified:
    - src/game/actions/index.ts
    - src/game/model/types.ts
    - src/game/model/state.ts
    - src/game/persistence.ts
    - src/ui/tabs/CatalogTab.tsx
    - src/ui/tabs/CollectionTab.tsx
    - tests/purchase-undo.unit.test.ts
key-decisions:
  - Store a single `lastPurchase` snapshot with bounded undo semantics to avoid multi-step rollback complexity.
  - Favorite state persists in save payloads and is consumed directly by catalog/collection UI filters.
patterns-established:
  - QoL toggles/actions remain additive and keep existing localStorage key contracts intact.
metrics:
  completed: 2026-02-06
---

# Phase 51-02 Summary

**Undo-last-purchase and favorites filtering are implemented end-to-end, with action-level validation and UI guardrails across catalog/collection flows.**

## Accomplishments

- Implemented deterministic latest-purchase undo (`UNDO-01`) with a short window, resource/inventory safety checks, and single-use semantics.
- Added favorites support (`FAVE-01`) including save persistence, catalog favorite toggles, catalog favorites-only filtering, and a collection favorites panel.
- Added regression coverage for undo transitions and UI behavior (`tests/purchase-undo.unit.test.ts`, `tests/purchase-undo-ui.unit.test.tsx`, `tests/catalog-favorites.unit.test.tsx`).
- Follow-up hardening: updated catalog stabilization signature to include favorites state so favorites-only filtering updates immediately after toggles.

## Task Commits

- Consolidated implementation landed in follow-up checkpoint `613eff8` with additional stabilization fix in the current branch.

## Verification

- `pnpm test:unit -- tests/purchase-undo.unit.test.ts`
- `pnpm test:unit -- tests/catalog-favorites.unit.test.tsx`
- `pnpm test:unit` (full suite)

## Next Phase Readiness

Notification and achievement toast work (51-03) can proceed on top of stable favorites/undo behavior.
