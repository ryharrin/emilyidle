# Quick Task 001 Summary: Remove Collection Book/Archive Shelf

**Completed:** 2026-02-02

## Changes Made

### 1. Removed Collection Book/Archive Shelf Sections
**File:** `src/ui/tabs/CatalogTab.tsx`

Removed two instances of the "Collection book / Archive shelf" section:
- Lines 454-527 (main catalog view, wrapped in `{!embeddedInVault && (...)}`)
- Lines 1254-1325 (embedded view section)

These sections displayed discovered catalog entries in a separate grid, which was redundant since the main catalog shopping interface already provides this functionality.

### 2. Fixed Ownership Check for Interactions
**File:** `src/ui/tabs/CatalogTab.tsx`

Changed the interaction availability check from `tierOwned` (any watch in tier) to `modelOwned` (specific watch model):

**Line 584 (first location):**
```diff
- const interactionHint =
-   tierOwned <= 0
-     ? "Own one to interact"
-     : cooldownSeconds > 0
-       ? `Cooldown ${cooldownSeconds}s`
-       : null;
+ const interactionHint =
+   modelOwned <= 0
+     ? "Own one to interact"
+     : cooldownSeconds > 0
+       ? `Cooldown ${cooldownSeconds}s`
+       : null;
```

**Line ~832 (second location):**
Applied the same fix to the embedded view's interaction logic.

### 3. Hide Interaction Button for Unowned Watches
**File:** `src/ui/tabs/CatalogTab.tsx`

Changed the interaction button to only show when the specific watch model is owned:

**Lines 710-720:**
```diff
- {canShowInteract && (
+ {canShowInteract && modelOwned > 0 && (
```

**Lines ~965-975:**
Applied the same fix to the embedded view.

### 4. Removed Interaction Hints
**File:** `src/ui/tabs/CatalogTab.tsx`

Removed the interaction hint display since the button is now hidden rather than disabled:

**Lines 748-750:**
```diff
- {canShowInteract && interactionHint && (
-   <p className="muted interaction-hint">{interactionHint}</p>
- )}
```

**Lines ~1003-1005:**
Applied the same removal to the embedded view.

## Verification

- ✅ TypeScript compiles without errors (`pnpm run typecheck`)
- ✅ No visual regressions expected
- ✅ Interaction buttons only appear for owned watches
- ✅ Collection book sections removed from both views

## Result

The Catalog tab now focuses solely on the shopping interface. Players can browse, purchase, and interact with watches they own, without the redundant "Collection book" view. The interaction buttons correctly require ownership of the specific watch model before appearing.
