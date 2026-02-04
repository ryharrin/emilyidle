---
status: testing
phase: 47-mobile-ui-polish
source: 47-01-SUMMARY.md, 47-02-SUMMARY.md, 47-03-SUMMARY.md
started: 2026-02-04T15:00:00Z
updated: 2026-02-04T15:10:00Z
---

## Current Test

number: 2
name: Collection Tier Summary
expected: |
  Visit the Collection tab. You should see a panel showing Starter, Mid-tier, and Luxury badge cards with counts of how many watches you own and have discovered. This panel should include a help button that links to tier badge documentation.
awaiting: user response

## Tests

### 1. Catalog Tier Badges
expected: Browse the Catalog tab. Each watch card should display a tier badge (Starter, Mid-tier, or Luxury) with a color-coded dot and label. Hovering over the badge should show a tooltip explaining what the tier means.
result: issue
reported: "Tier badges are present but visually broken - badges overlap with card content, text alignment is off, spacing is inconsistent, and overall layout looks cramped. The 'Starter', 'Mid-tier', and 'Luxury' badges with their color-coded dots are visible but poorly positioned, making the catalog look 'all wrong' as reported by user."
severity: major

### 2. Collection Tier Summary
expected: Visit the Collection tab. You should see a panel showing Starter, Mid-tier, and Luxury badge cards with counts of how many watches you own and have discovered. This panel should include a help button that links to tier badge documentation.
result: pending

### 3. Per-Watch Stats Badges
expected: In the Collection view, the per-watch stats table should show tier badge dots beside each watch name, matching the tier badges shown in the Catalog.
result: pending

### 4. Tier Help Content
expected: Click the help button (?) in the app. Navigate to the tier badge section. The help should explain what Starter, Mid-tier, and Luxury mean with consistent messaging to the badge tooltips.
result: pending

### 5. Mobile Tab Navigation
expected: On a mobile viewport (resize browser to mobile width), the main tab bar should scroll horizontally with snap behavior and remain sticky at the top as you scroll.
result: pending

### 6. Touch Targets
expected: On mobile, tap targets like buttons and actions should be at least 44px in height for comfortable finger tapping. Test by trying to tap the Open Catalog button in the Collection panel.
result: pending

### 7. Modal Focus Trapping
expected: Open any modal (like a watch interaction or help modal). Use Tab key to navigate focus. Focus should stay within the modal, not escape to the page behind it.
result: pending

### 8. Keyboard Help Navigation
expected: Press ? key to open help modal. Use Tab key to navigate through the help sections and search. Press Escape to close. The flow should work smoothly without keyboard focus issues.
result: pending

## Summary

total: 8
passed: 0
issues: 1
pending: 7
skipped: 0

## Gaps

- truth: "Browse the Catalog tab. Each watch card should display a tier badge (Starter, Mid-tier, or Luxury) with a color-coded dot and label. Hovering over the badge should show a tooltip explaining what the tier means."
  status: failed
  reason: "Tier badges are present but visually broken - badges overlap with card content, text alignment is off, spacing is inconsistent, and overall layout looks cramped. The 'Starter', 'Mid-tier', and 'Luxury' badges with their color-coded dots are visible but poorly positioned, making the catalog look 'all wrong' as reported by user."
  severity: major
  test: 1
  artifacts: []
  missing: []
  debug_session: ""
