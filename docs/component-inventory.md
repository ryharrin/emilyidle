# Emily Idle - Component Inventory

## Overview

This document catalogs all UI components in the Emily Idle project, organized by category and function.

## Component Categories

### 1. Tab Components

Main application tabs displayed in the navigation rail.

| Component     | File                        | Purpose                | Props                                     |
| ------------- | --------------------------- | ---------------------- | ----------------------------------------- |
| CareerTab     | `ui/tabs/CareerTab.tsx`     | Career progression UI  | `state`, `nowMs`, `onRunSession`, etc.    |
| CatalogTab    | `ui/tabs/CatalogTab.tsx`    | Watch catalog browsing | `state`, `nowMs`, `filters`, `onPurchase` |
| CollectionTab | `ui/tabs/CollectionTab.tsx` | Collection management  | `state`, `nowMs`, `onInteract`, `onWear`  |
| WorkshopTab   | `ui/tabs/WorkshopTab.tsx`   | Workshop prestige      | `state`, `nowMs`, `onPrestige`            |
| MaisonTab     | `ui/tabs/MaisonTab.tsx`     | Maison prestige        | `state`, `nowMs`, `onPrestige`            |
| NostalgiaTab  | `ui/tabs/NostalgiaTab.tsx`  | Nostalgia prestige     | `state`, `nowMs`, `onPrestige`            |
| StatsTab      | `ui/tabs/StatsTab.tsx`      | Statistics display     | `state`, `nowMs`                          |
| UpgradesTab   | `ui/tabs/UpgradesTab.tsx`   | Upgrades management    | `state`, `nowMs`, `onUpgrade`             |
| SaveTab       | `ui/tabs/SaveTab.tsx`       | Save/load operations   | `onExport`, `onImport`, `onClear`         |

**Career Sub-components**:
| Component | File | Purpose |
|-----------|------|---------|
| CareerPanel | `ui/tabs/career/CareerPanel.tsx` | Main career panel |
| CareerMap | `ui/tabs/career/CareerMap.tsx` | Career skill tree |
| CareerUpgradesView | `ui/tabs/career/CareerUpgradesView.tsx` | Upgrade selection |
| CareerUpgradesCanvas | `ui/tabs/career/CareerUpgradesCanvas.tsx` | Canvas for upgrades |
| CareerUpgradeModal | `ui/tabs/career/CareerUpgradeModal.tsx` | Upgrade detail modal |

**Catalog Sub-components**:
| Component | File | Purpose |
|-----------|------|---------|
| CatalogDetailsContent | `ui/tabs/catalog/CatalogDetailsContent.tsx` | Catalog item details |

---

### 2. Modal Components

Overlay dialogs for interactions and information.

#### Mini-game Modals

| Component              | File                                       | Purpose                      | Game Mode                   |
| ---------------------- | ------------------------------------------ | ---------------------------- | --------------------------- |
| WindingMiniGameModal   | `ui/components/WindingMiniGameModal.tsx`   | Manual winding mini-game     | Winding crown interaction   |
| AutomaticMiniGameModal | `ui/components/AutomaticMiniGameModal.tsx` | Automatic movement mini-game | Automatic watch interaction |
| QuartzMiniGameModal    | `ui/components/QuartzMiniGameModal.tsx`    | Quartz alignment mini-game   | Quartz watch interaction    |

**Winding Sub-components**:
| Component | File | Purpose |
|-----------|------|---------|
| WindingCrown | `ui/components/winding/WindingCrown.tsx` | Crown visualization |

#### Other Modals

| Component               | File                                        | Purpose                |
| ----------------------- | ------------------------------------------- | ---------------------- |
| PrestigeOnboardingModal | `ui/components/PrestigeOnboardingModal.tsx` | Prestige tutorial      |
| ConfirmModal            | `ui/components/ConfirmModal.tsx`            | Confirmation dialogs   |
| HelpModal               | `ui/help/HelpModal.tsx`                     | Help system modal      |
| CareerUpgradeModal      | `ui/tabs/career/CareerUpgradeModal.tsx`     | Career upgrade details |

---

### 3. Navigation Components

Tab navigation and routing.

| Component         | File                                  | Purpose                         |
| ----------------- | ------------------------------------- | ------------------------------- |
| PageTabRail       | `ui/navigation/PageTabRail.tsx`       | Main tab navigation rail        |
| TabSwitchSkeleton | `ui/navigation/TabSwitchSkeleton.tsx` | Loading skeleton for tab switch |

**Navigation Logic**:
| File | Purpose |
|------|---------|
| landing.ts | Landing page resolution |
| tabReadiness.ts | Tab visibility logic |
| tabMeta.ts | Tab metadata definitions |

---

### 4. Layout Components

Structural and layout components.

| Component     | File                              | Purpose                     |
| ------------- | --------------------------------- | --------------------------- |
| StatsHeader   | `ui/components/StatsHeader.tsx`   | Top stats display bar       |
| MissionRail   | `ui/components/MissionRail.tsx`   | Mission/challenge sidebar   |
| TabDisclosure | `ui/components/TabDisclosure.tsx` | Section disclosure/collapse |

---

### 5. Feedback Components

User feedback and notifications.

| Component           | File                                    | Purpose                      |
| ------------------- | --------------------------------------- | ---------------------------- |
| ToastStack          | `ui/components/ToastStack.tsx`          | Notification toast container |
| FloatingDelta       | `ui/components/FloatingDelta.tsx`       | Animated number deltas       |
| EventBanner         | `ui/components/EventBanner.tsx`         | Active event notification    |
| NextActionChips     | `ui/components/NextActionChips.tsx`     | Suggested next actions       |
| OnboardingCoachmark | `ui/components/OnboardingCoachmark.tsx` | Tutorial tooltips            |

**Toast Types**:

```typescript
type ToastMessage = {
  id: string;
  title: string;
  message: string;
  detail?: string;
};
```

---

### 6. Career Components

Career progression UI.

| Component                | File                                         | Purpose                         |
| ------------------------ | -------------------------------------------- | ------------------------------- |
| CareerTree               | `ui/components/CareerTree.tsx`               | Career skill tree visualization |
| CareerTimeline           | `ui/components/CareerTimeline.tsx`           | Career progress timeline        |
| CareerProgressCard       | `ui/components/CareerProgressCard.tsx`       | Progress summary card           |
| CareerNextActionCard     | `ui/components/CareerNextActionCard.tsx`     | Next action suggestion          |
| CareerStageChoices       | `ui/components/CareerStageChoices.tsx`       | Career choice selection         |
| CareerStageChoiceSummary | `ui/components/CareerStageChoiceSummary.tsx` | Choice summary                  |
| CareerStageChoicePreview | `ui/components/CareerStageChoicePreview.tsx` | Choice preview                  |
| CareerStageChoiceBlocks  | `ui/components/CareerStageChoiceBlocks.tsx`  | Choice block UI                 |

**Career Choice Sub-components**:
| Component | File | Purpose |
|-----------|------|---------|
| ChoicePreview | `ui/components/careerStageChoices/ChoicePreview.tsx` | Choice preview detail |

---

### 7. Catalog Components

Watch catalog browsing and purchase.

| Component                  | File                                                   | Purpose             |
| -------------------------- | ------------------------------------------------------ | ------------------- |
| CatalogPurchaseGate        | `ui/components/catalog/CatalogPurchaseGate.tsx`        | Purchase modal      |
| CatalogCardDetailsSheet    | `ui/components/catalog/CatalogCardDetailsSheet.tsx`    | Card detail sheet   |
| WatchComparePanel          | `ui/components/catalog/WatchComparePanel.tsx`          | Watch comparison    |
| CatalogDisabledExplanation | `ui/components/catalog/CatalogDisabledExplanation.tsx` | Unlock requirements |

---

### 8. Collection Components

Collection management and display.

| Component               | File                                        | Purpose                     |
| ----------------------- | ------------------------------------------- | --------------------------- |
| CollectionSectionNav    | `ui/components/CollectionSectionNav.tsx`    | Section navigation          |
| CollectionInsightsPanel | `ui/components/CollectionInsightsPanel.tsx` | Analytics panel             |
| CollectionTierSegments  | `ui/components/CollectionTierSegments.tsx`  | Tier progress visualization |
| PerWatchStatsTable      | `ui/components/PerWatchStatsTable.tsx`      | Per-watch statistics        |
| EmptyStateCTA           | `ui/components/EmptyStateCTA.tsx`           | Empty state call-to-action  |

---

### 9. Prestige Components

Prestige system UI.

| Component              | File                                       | Purpose                 |
| ---------------------- | ------------------------------------------ | ----------------------- |
| PrestigeResetMatrix    | `ui/components/PrestigeResetMatrix.tsx`    | Reset comparison matrix |
| PrestigeComparisonCard | `ui/components/PrestigeComparisonCard.tsx` | Prestige comparison     |
| PrestigeSummary        | `ui/components/PrestigeSummary.tsx`        | Prestige summary        |
| BlueprintCostDetail    | `ui/components/BlueprintCostDetail.tsx`    | Blueprint cost display  |

---

### 10. Stats Components

Statistics and information display.

| Component        | File                                 | Purpose                 |
| ---------------- | ------------------------------------ | ----------------------- |
| StatsHeader      | `ui/components/StatsHeader.tsx`      | Top stats bar           |
| ValueTicker      | `ui/components/ValueTicker.tsx`      | Animated value display  |
| TierBadge        | `ui/components/TierBadge.tsx`        | Tier badge display      |
| PowerReserveHint | `ui/components/PowerReserveHint.tsx` | Power reserve indicator |
| CooldownRing     | `ui/components/CooldownRing.tsx`     | Cooldown visualization  |
| UnlockHint       | `ui/components/UnlockHint.tsx`       | Unlock requirement hint |

---

### 11. Help Components

Help system and documentation.

| Component     | File                        | Purpose                |
| ------------- | --------------------------- | ---------------------- |
| HelpModal     | `ui/help/HelpModal.tsx`     | Help system modal      |
| ExplainButton | `ui/help/ExplainButton.tsx` | Contextual help button |
| helpContext   | `ui/help/helpContext.tsx`   | Help context provider  |

**Help System**:
| File | Purpose |
|------|---------|
| helpContent.ts | Help content definitions |
| helpSearch.ts | Help search functionality |

---

### 12. Tooltip & Overlay Components

Floating information displays.

| Component       | File                                | Purpose            |
| --------------- | ----------------------------------- | ------------------ |
| AnchoredTooltip | `ui/components/AnchoredTooltip.tsx` | Positioned tooltip |

---

### 13. Workshop Components

Workshop-specific components.

| Component               | File                                  | Purpose     |
| ----------------------- | ------------------------------------- | ----------- |
| WorkshopCraftingSection | `ui/tabs/WorkshopCraftingSection.tsx` | Crafting UI |

---

### 14. Utility Components

Helper components and hooks.

**Hooks**:
| Hook | File | Purpose |
|------|------|---------|
| useCatalogVirtualizer | `ui/hooks/useCatalogVirtualizer.ts` | Catalog list virtualization |
| useStableCatalogEntries | `ui/hooks/useStableCatalogEntries.ts` | Stable catalog data |
| usePanZoomSurface | `ui/components/panZoom/usePanZoomSurface.ts` | Pan/zoom surface |
| usePanZoomViewport | `ui/components/careerMap/usePanZoomViewport.ts` | Pan/zoom viewport |
| useWindingRun | `ui/components/winding/useWindingRun.ts` | Winding logic |
| useModalAccessibility | `ui/components/useModalAccessibility.ts` | Modal a11y |

**Icons**:
| File | Purpose |
|------|---------|
| coreIcons.tsx | Core icon components |

---

## Component Props Patterns

### Standard Tab Props

```typescript
interface TabComponentProps {
  state: GameState;
  nowMs: number;
  // Tab-specific props...
}
```

### Action Handler Pattern

```typescript
interface WithActions {
  onPurchase: (itemId: string) => void;
  onInteract: (itemId: string) => void;
  onUpgrade: (upgradeId: string) => void;
  onRunSession: () => void;
}
```

### Modal Props Pattern

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  nowMs: number;
}
```

## Component Size Guidelines

From AGENTS.md:

- **Target**: Keep components under 300 lines
- **Large components**: `App.tsx` is intentionally large (~2200 lines), don't expand it further
- **Splitting**: Extract sub-components when files grow large

## Component Testing

### Unit Tests

Test component logic with Vitest:

```typescript
// tests/MyComponent.unit.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "../src/ui/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent state={mockState} nowMs={Date.now()} />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

### E2E Tests

Test component interactions with Playwright:

```typescript
// tests/myFlow.spec.ts
test("component interaction", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="my-button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

## Reusable Component Patterns

### Button Pattern

```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}
```

### Card Pattern

```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

### List Pattern

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}
```

## Styling

Components use CSS modules and global styles:

- **Global**: `src/style.css`
- **Component-specific**: Inline styles or CSS-in-JS
- **Theme**: CSS custom properties (variables)

## Accessibility

### Required A11y Props

```typescript
interface AccessibleProps {
  "aria-label"?: string;
  "aria-describedby"?: string;
  role?: string;
  tabIndex?: number;
}
```

### Focus Management

- Use `useRef` for focus management
- Implement `focus-trap` for modals
- Support keyboard navigation

### Data Test IDs

All interactive elements should have `data-testid`:

```typescript
<button data-testid="buy-button-rolex-submariner">
  Buy
</button>
```

## Component Relationships

```
App (root)
├── StatsHeader
├── PageTabRail
│   └── TabSwitchSkeleton (loading)
├── Main Content (switch on activeTab)
│   ├── CareerTab
│   │   ├── CareerPanel
│   │   ├── CareerTree
│   │   ├── CareerTimeline
│   │   └── CareerProgressCard
│   ├── CatalogTab
│   │   ├── CatalogCardDetailsSheet
│   │   └── CatalogPurchaseGate
│   ├── CollectionTab
│   │   ├── CollectionSectionNav
│   │   └── CollectionInsightsPanel
│   ├── WorkshopTab
│   │   └── WorkshopCraftingSection
│   ├── MaisonTab
│   ├── NostalgiaTab
│   ├── StatsTab
│   ├── UpgradesTab
│   └── SaveTab
├── MissionRail
├── ToastStack
├── EventBanner
├── NextActionChips
└── Modals (conditional)
    ├── WindingMiniGameModal
    ├── AutomaticMiniGameModal
    ├── QuartzMiniGameModal
    ├── PrestigeOnboardingModal
    ├── ConfirmModal
    └── HelpModal
```

## Adding New Components

1. Create file in appropriate directory
2. Define props interface
3. Implement component
4. Export from index if needed
5. Add data-testid for testing
6. Write unit tests
7. Update this inventory

## Related Documentation

- [Architecture](./architecture.md) - Technical architecture
- [Source Tree Analysis](./source-tree-analysis.md) - File structure
- [Development Guide](./development-guide.md) - Development workflow
- [Data Models](./data-models.md) - Type definitions
