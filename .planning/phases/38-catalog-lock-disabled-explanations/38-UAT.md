---
phase: 38-catalog-lock-disabled-explanations
type: uat
status: complete
completed: 2026-02-02
runner: uat-tester
severity: cosmetic
---

# Phase 38: Visual UAT (Catalog Lock + Disabled Explanations)

## Scenarios Verified

1) Dark theme
- Lock overlay is visible and legible on undiscovered cards.
- "Why can't I buy?" affordance is discoverable and expanded content is readable.

2) Light theme
- Lock overlay remains visible and legible.
- Explainer affordance remains discoverable and expanded content is readable.

3) Mobile viewport (375x667)
- No horizontal overflow; content remains readable.

## Evidence

- `.planning/uat-artifacts/38/scaled/catalog-dark-1200.jpg`
- `.planning/uat-artifacts/38/scaled/catalog-light-1200.jpg`
- `.planning/uat-artifacts/38/scaled/catalog-light-mobile-1200.jpg`

## Result

- Status: pass
- Severity: cosmetic
- Needs human: false
