# Phase 58: Catalog Control Density + Affordability Signals Context

## Objective

Close v5.0 Phase 58 by validating the collapsed-filter control model, finishing affordable-card
visual targeting, and tightening tab readiness scanning so "New watch affordable" reflects real
buyable new-model conditions.

## Inputs

- `.planning/milestones/v5.0-REQUIREMENTS.md`
- `.planning/milestones/v5.0-ROADMAP.md`
- `.planning/research/V5.0-GAP-AUDIT-2026-02-11.md`
- Current catalog/nav implementation:
  - `src/ui/tabs/CatalogTab.tsx`
  - `src/ui/navigation/tabReadiness.ts`

## Key Findings Before Execution

- `FILTER-02` behavior was already present in production: catalog filters collapsed by default in
  non-test environments with an active-count badge.
- `CATALOG-11` was only partially complete: highlighting used generic actionable styling and was not
  explicitly tied to affordable unowned discovered cards.
- `NAV-01` was partially misleading: catalog readiness relied on tier-level affordability, not true
  unowned discovered model affordability.

## Scope Guardrails

- Preserve stable IDs/data-testids used by existing Playwright contracts.
- Do not change save schema/localStorage keys.
- Keep reduced-motion/accessibility-friendly styling behavior.
