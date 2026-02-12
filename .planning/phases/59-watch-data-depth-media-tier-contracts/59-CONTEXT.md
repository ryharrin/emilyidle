# Phase 59: Watch Data Depth + Media/Tier Contracts Context

## Objective

Close v5.0 data-depth and contract reliability scope by improving high-value catalog decision
information while hardening tier-semantics and media/base-path contracts.

## Scope

- `CATALOG-12`: richer watch detail information without first-viewport clutter regression.
- `DATA-01`: explicit movement/tier alignment contract checks.
- `MEDIA-01`: deterministic base-path and fallback media contract checks.

## Inputs

- `.planning/milestones/v5.0-REQUIREMENTS.md`
- `.planning/milestones/v5.0-ROADMAP.md`
- `.planning/research/V5.0-GAP-AUDIT-2026-02-11.md`
- Existing catalog/media surfaces:
  - `src/ui/tabs/CatalogTab.tsx`
  - `src/game/catalog.ts`
  - `src/game/data/watchModels.ts`

## Guardrails

- Preserve stable `data-testid` anchors used by Playwright/Vitest.
- Keep details enrichment out of first-viewport card density.
- Preserve deployment base-path safety (`/emilyidle/`) for catalog media URLs.
