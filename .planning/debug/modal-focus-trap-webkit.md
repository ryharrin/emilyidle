---
status: diagnosed
trigger: |-
  Investigate why modal focus trapping fails on WebKit mobile (iOS Safari) for Test 7.

  Issue: Modal focus trapping works correctly on Chromium browsers but fails on WebKit mobile where focus escapes the modal and moves to elements behind it.

  Expected behavior: When a modal is open, pressing Tab should cycle focus within the modal only, not escape to background elements.

  Files to examine:
  1. Look for modal components (help modal, interaction modals)
  2. Check focus trap implementation
  3. Look for useFocusTrap hook or similar
  4. Check modal rendering in src/ui/components/

  Common WebKit focus issues:
  - iOS Safari doesn't support focus events the same way
  - Touch devices handle focus differently
  - May need specific iOS workarounds

  Your task:
  1. Find the focus trap implementation
  2. Identify why it fails on WebKit
  3. Research WebKit-specific fixes
  4. Determine what changes are needed

  Return:
  ```yaml
  root_cause: "Why focus trapping fails on WebKit"
  artifacts:
    - path: "file path"
      issue: "specific issue"
  missing:
    - "What needs to be added/changed for WebKit support"
  webkit_specific_issues:
    - "iOS Safari specific problems found"
  ```
created: 2026-02-04T23:00:58Z
updated: 2026-02-04T23:26:25Z
---

## Current Focus

hypothesis: Root cause confirmed; preparing diagnosis output.
test: n/a
expecting: n/a
next_action: Return root cause + required changes for WebKit focus trapping.

## Symptoms

expected: When a modal is open, Tab cycles focus within the modal only.
actual: On WebKit mobile (iOS Safari), focus escapes the modal to background elements.
errors: None reported.
reproduction: Open a modal on iOS Safari and press Tab; focus leaves the modal.
started: Unknown.

## Eliminated

## Evidence

- timestamp: 2026-02-04T23:25:45Z
  checked: src/ui/components/WindingMiniGameModal.tsx
  found: Focus trap implemented with focus sentinels and a hidden button redirecting focus.
  implication: Only this modal actively traps focus via onFocus handlers.

- timestamp: 2026-02-04T23:25:45Z
  checked: src/ui/help/HelpModal.tsx
  found: No focus trap logic; focusableSelector exists but is unused.
  implication: Help modal used by UAT-07 relies on browser default focus behavior.

- timestamp: 2026-02-04T23:25:45Z
  checked: src/ui/components/AutomaticMiniGameModal.tsx, src/ui/components/QuartzMiniGameModal.tsx, src/ui/components/ConfirmModal.tsx, src/ui/tabs/career/CareerUpgradeModal.tsx
  found: No focus trap logic or sentinels in these modals.
  implication: Most modals depend on implicit focus order and aria-modal only.

- timestamp: 2026-02-04T23:26:25Z
  checked: tests/phase47-uat-visual.spec.ts
  found: UAT-07 uses the Help modal and asserts focus stays within [data-testid="help-modal"].
  implication: The failing test targets HelpModal focus containment.

## Resolution

root_cause: Help modal lacks an explicit focus trap; iOS Safari does not enforce aria-modal/tab order, so focus can move to background elements.
fix:
verification:
files_changed: []
