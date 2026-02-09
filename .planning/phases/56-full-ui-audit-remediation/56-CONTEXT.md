# Phase 56: Full UI Audit Remediation Context

**Gathered:** 2026-02-07
**Status:** Ready for execution

## Boundary

Address UX and gameplay-loop friction surfaced by the full UI coverage screenshot audit across
Chromium desktop and Chromium mobile (Pixel 5), with follow-up verification hooks in the e2e suite.

This phase is interaction clarity, information architecture, and flow quality work. It includes limited
pacing/copy tuning where needed to improve comprehension, but does not add new currencies,
new prestige layers, or save-schema changes.

## Validation Inputs

Audit evidence generated from the full-coverage run and review sheets:

- `pnpm exec playwright test tests/full-ui-coverage-audit.spec.ts --project=chromium --project=chromium-mobile-pixel5 --reporter=line`
- `output/playwright/full-ui-coverage-audit-20260206/chromium/manifest.json`
- `output/playwright/full-ui-coverage-audit-20260206/chromium-mobile-pixel5/manifest.json`
- `output/playwright/full-ui-coverage-audit-20260206/review-sheets/chromium-all.jpg`
- `output/playwright/full-ui-coverage-audit-20260206/review-sheets/chromium-mobile-pixel5-all.jpg`
- Per-tab review sheets for Career, Catalog, Collection, Upgrades, Workshop, Maison, Nostalgia,
  Stats, and Settings (`review-sheets/*.jpg`).

## Locked Decisions

- Catalog must appear to the left of Collection in the primary tab rail.
- Each tab's first viewport must present one dominant primary action.
- Toasts/modals/help overlays must not occlude the active primary action zone.
- Mobile navigation must keep tab labels legible and fully discoverable.
- Meta/reset actions (Atelier, Maison, Nostalgia) must show explicit before/after/delta outcomes.
- Existing save keys and schema contracts remain unchanged.

## Out of Scope

- New watch interaction mini-games or new progression currencies.
- Replacing the visual art direction/theme system.
- Backend, deployment, or telemetry infrastructure migrations.

---
*Phase: 56-full-ui-audit-remediation*
*Context gathered: 2026-02-07*
