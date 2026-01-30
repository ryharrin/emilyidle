---
status: complete
phase: 27-career-first-economy-and-upgrades-surface
source:
  - 27-01-SUMMARY.md
  - 27-02-SUMMARY.md
  - 27-03-SUMMARY.md
  - 27-04-SUMMARY.md
  - 27-05-SUMMARY.md
started: 2026-01-29T21:00:02Z
updated: 2026-01-29T22:07:35Z
---

## Current Test

[testing complete]

## Tests

### 1. Primary navigation exposes Career + Upgrades
expected: Career and Upgrades tabs appear in the primary navigation on fresh load.
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/01-home.png
  - .planning/uat-artifacts/27/mobile/01-home.png

### 2. Career panel loads and explains session status/cost
expected: Career tab shows the career panel with a clear status badge plus a Sessions section that explains availability and the session cost rule before committing.
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/02-career.png

### 3. Career progression is usable early (earn/spend points + respec)
expected: The Progression tree shows points and at least one spendable node early on; spending updates the node state and points; Respec refunds spent points.
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/02-career.png

### 4. Session cost rule is visible when sessions are supported
expected: When sessions are supported, UI indicates the next session is free first, then shows the non-zero enjoyment cost that will apply afterward.
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/05-career-seeded.png

### 5. Upgrades tab groups upgrades and previews deltas
expected: Upgrades tab shows grouped upgrade cards; each card includes a before/after (or delta) preview for cash/enjoyment rate impact.
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/03-upgrades.png
  - .planning/uat-artifacts/27/mobile/02-upgrades.png

### 6. Collection/Vault routes upgrade browsing to Upgrades surface
expected: Collection/Vault surface includes an upgrades callout/CTA that navigates to the Upgrades tab (instead of browsing upgrades inline).
result: pass
evidence:
  - .planning/uat-artifacts/27/desktop/08-upgrades-callout.png

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps
