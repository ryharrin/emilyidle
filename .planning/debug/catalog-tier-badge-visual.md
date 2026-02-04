---
status: investigating
trigger: "Investigate the root cause of catalog tier badge visual issues in Phase 47."
created: 2026-02-04T18:38:52Z
updated: 2026-02-04T18:43:11Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: Catalog title flex layout and badge nowrap force overflow on narrow cards.
test: correlate catalog title layout rules with TierBadge sizing/nowrap.
expecting: no flex wrap/min-width handling plus nowrap badge -> overlap/cramped layout.
next_action: report root cause and missing layout fixes

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Tier badges align cleanly within catalog cards without overlap; text and dots aligned; spacing consistent; layout breathable.
actual: Badges overlap with card content, text alignment is off, spacing is inconsistent, layout looks cramped.
errors: none reported
reproduction: Open Catalog tab and view tier badges on catalog cards
started: Phase 47

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-02-04T18:42:29Z
  checked: src/ui/components/TierBadge.tsx + src/style.css (tier-badge)
  found: Tier badge renders inline-flex with dot + label and CSS sets white-space: nowrap, line-height: 1, fixed padding.
  implication: badge content will not wrap and keeps its width even in narrow card headers.
- timestamp: 2026-02-04T18:42:29Z
  checked: src/style.css (catalog title/layout)
  found: .catalog-title is a single-row flex container (no wrap), .catalog-title-primary is also flex row with no min-width or wrap.
  implication: badge + title block cannot wrap/shrink, so it can overflow into the year block or compress spacing on narrow cards.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: "Catalog header layout uses a non-wrapping flex row while TierBadge forces nowrap; the badge + title block cannot shrink/wrap, so on narrower cards it overflows into the year/content area and compresses spacing."
fix: ""
verification: ""
files_changed: []
