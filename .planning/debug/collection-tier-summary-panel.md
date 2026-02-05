---
status: investigating
trigger: "Investigate why the Collection tier summary panel is missing from the Collection tab.\n\n**Issue:** Test 2 failed - the tier summary panel with Starter, Mid-tier, and Luxury badge cards is not present or visible in the Collection tab.\n\n**Expected behavior:** Visit the Collection tab. You should see a panel showing Starter, Mid-tier, and Luxury badge cards with counts of how many watches you own and have discovered. This panel should include a help button that links to tier badge documentation.\n\n**Files to examine:**\n1. `src/ui/tabs/CollectionTab.tsx` - Check if tier summary is rendered\n2. `src/ui/components/` - Look for tier summary components\n3. `src/game/tierBadges.ts` - Check tier badge data/helpers\n4. Check if the component exists but isn't being imported/used\n\n**Your task:**\n1. Read CollectionTab.tsx to see what's currently rendered\n2. Look for any tier summary related components\n3. Check if there's a tier summary component that exists but isn't being used\n4. Determine what needs to be added/fixed\n\n**Return:**\n```yaml\nroot_cause: \"Detailed explanation of why tier summary is missing\"\nartifacts:\n  - path: \"file path\"\n    issue: \"specific issue\"\nmissing:\n  - \"What needs to be added/changed\"\n```")
created: 2026-02-04T19:54:21Z
updated: 2026-02-04T19:54:21Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: tier summary panel exists in CollectionTab and only goes missing if the tab content is not active/visible
test: confirm render in CollectionTab and check styling/conditional gates
expecting: find section rendered unconditionally when isActive is true
next_action: document evidence and identify any gating or visibility issues

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Collection tab shows a tier summary panel with Starter, Mid-tier, and Luxury badge cards and a help button linking to tier badge docs.
actual: Tier summary panel with the three badge cards is missing or not visible in Collection tab.
errors: None reported.
reproduction: Open Collection tab and observe missing tier summary panel.
started: Unknown.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-02-04T19:54:21Z
  checked: src/ui/tabs/CollectionTab.tsx
  found: CollectionTab renders a collection-tier-summary panel with TierBadge cards and ExplainButton when isActive is true.
  implication: The tier summary panel is already present in the Collection tab markup; missing UI likely comes from the tab not being active or a visibility/CSS issue outside the render.

- timestamp: 2026-02-04T19:54:21Z
  checked: src/game/tierBadges.ts and src/game/data/watchModels.ts
  found: Tier badge categories and definitions are present; watch models always include tierBadge.
  implication: The tier summary data should populate even on empty collections, so absence is not due to missing tier badge data.

- timestamp: 2026-02-04T19:54:21Z
  checked: src/style.css
  found: No CSS rules hide .collection-tier-summary; styles define layout only.
  implication: There is no intentional CSS hiding of the panel.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: The tier summary panel is already rendered in CollectionTab when isActive is true; missing visibility points to the Collection tab content not being active/visible in the running UI rather than a missing component/import.
fix:
verification:
files_changed: []
