---
phase: 46-catalog-expansion-tiered-variety
plan: 1
subsystem: data
tags: [catalog, watch-models, assets, vitest]
requires:
  - phase: 45-03
    provides: per-watch stats selectors and tier badge metadata
provides:
  - Third-wave low/mid/lux catalog model definitions with complete metadata wiring
  - Placeholder/local catalog assets and deterministic per-watch guardrails
affects:
  - phase: 46-02
    provides: lane-ready data for tiered catalog UI rendering
tech-stack:
  added: []
  patterns:
    - Keep watch model IDs and catalogEntryIds 1:1 so selectors/UI can resolve metadata without adapter logic.
key-files:
  created:
    - public/catalog/placeholders/starter-tier.svg
    - public/catalog/placeholders/mid-tier.svg
    - public/catalog/placeholders/lux-tier.svg
  modified:
    - src/game/data/watchModels.ts
    - src/game/catalog.ts
    - tests/per-watch-stats.unit.test.ts
key-decisions:
  - Additive model/catalog entries reuse existing tier badge + selector contracts instead of introducing a new tier schema.
patterns-established:
  - Third-wave IDs are guarded by unit tests so future catalog edits cannot silently drop tier coverage.
metrics:
  completed: 2026-02-06
---

# Phase 46-01 Summary

**Catalog data now includes the low/mid/lux expansion wave with complete metadata and per-watch guardrails.**

## Accomplishments

- Added the third-wave references across starter/mid/lux progression, including:
  - `omega-aurora-frost`, `omega-seashore-drift`
  - `jaeger-lecoultre-atmos-vsp`, `cartier-ballon-de-lumiere-chrono`
  - `audemars-piguet-luminous-tourbillon`, `rolex-celestial-tourbillon`
- Wired full catalog metadata and local placeholder asset coverage so the entries resolve cleanly through existing catalog rendering paths.
- Added deterministic unit coverage in `tests/per-watch-stats.unit.test.ts` to ensure the third-wave IDs remain present and selector-safe.

## Task Commits

1. `bd63d35` — add tiered watch definitions and placeholder assets.
2. `95765d4` — document catalog metadata wave details.
3. `ec2715e` — document tier sequencing context.

## Verification

- `pnpm test:unit -- tests/per-watch-stats.unit.test.ts`

## Next Phase Readiness

Phase 46-02 can consume the expanded data directly to render lane-grouped catalog UI and discovery cues.
