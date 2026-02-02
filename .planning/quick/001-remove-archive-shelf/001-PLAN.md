---
wave: 1
depends_on: []
autonomous: true
---

# Quick Task 001: Remove Collection Book/Archive Shelf

## Goal
Remove the Collection Book/Archive Shelf section from the Catalog tab and ensure interaction buttons are only shown for owned watches.

## Changes Required

### 1. Remove Collection Book/Archive Shelf Section
**File:** `src/ui/tabs/CatalogTab.tsx`

Remove the entire section (lines ~454-527) that displays discovered catalog entries as "Collection book / Archive shelf". This includes:
- The `<section className="catalog-collection">` block
- The discovered entries grid
- The "discovered count" header
- Empty state for discovered references

**Rationale:** The catalog shopping interface is the primary way to browse and purchase watches. The separate "Collection book" view is redundant since the main catalog already shows owned watches and their details.

### 2. Fix Ownership Check for Interactions
**File:** `src/ui/tabs/CatalogTab.tsx`

Currently, the interaction availability is checked against `tierOwned` (any watch in the tier), but it should check against `modelOwned` (that specific watch model).

**Current behavior (line ~584):**
```tsx
const interactionHint =
  tierOwned <= 0
    ? "Own one to interact"
    : cooldownSeconds > 0
      ? `Cooldown ${cooldownSeconds}s`
      : null;
```

**Desired behavior:**
```tsx
const interactionHint =
  modelOwned <= 0
    ? "Own one to interact"
    : cooldownSeconds > 0
      ? `Cooldown ${cooldownSeconds}s`
      : null;
```

**Additional change:** Hide the interaction button completely when the specific watch isn't owned:
- Around lines 710-727, change the condition from `{canShowInteract && (` to `{canShowInteract && modelOwned > 0 && (`
- Remove the interaction hint display (lines 748-750) since button won't be shown for unowned watches

## Verification

1. Catalog tab should no longer show the "Collection book / Archive shelf" section
2. Catalog tab should only show the shop interface with purchasable watches
3. Interaction buttons ("Wind crown", "Charge rotor", "Set time") should only appear on watches the player owns
4. No console errors or TypeScript errors after changes

## Must-Haves for Completion

- [ ] Collection book section removed from CatalogTab.tsx
- [ ] Interaction button condition updated to require ownership
- [ ] Code builds without TypeScript errors
- [ ] UI renders correctly with no visual regressions
