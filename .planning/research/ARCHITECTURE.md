# Architecture Research

**Domain:** Idle game UI consolidation (React tabs + pure game state)
**Researched:** 2026-02-01
**Confidence:** HIGH

## Standard Architecture

### System Overview

This codebase already follows a clean, “thin UI / pure domain” split. Catalog/Vault consolidation should stay entirely in the UI layer (tab composition + components), reusing existing pure actions/selectors.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ UI Layer (React)                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌──────────────────────────┐   ┌───────────────────────┐  │
│  │ App.tsx     │ → │ Tabs (ui/tabs/*)          │ → │ Shared panels         │  │
│  │ (wiring)    │   │ Collection/Catalog/etc.   │   │ CatalogPurchasePanel  │  │
│  └──────┬──────┘   └──────────────┬───────────┘   └───────────┬───────────┘  │
│         │                          │                           │              │
├─────────┴──────────────────────────┴───────────────────────────┴──────────────┤
│ Runtime Layer (game/runtime/*)                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  useGameRuntime: RAF tick + autosave + persistence integration                │
├──────────────────────────────────────────────────────────────────────────────┤
│ Domain Layer (pure TS)                                                        │
│  game/actions/* + game/selectors/* + game/model/* + game/data/*               │
│  (exposed via game/state.ts facade)                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/App.tsx` | Owns active tab state, wires selectors/actions into tab props, persists saves | React state + `useGameRuntime`, passes derived data and callbacks |
| `src/ui/tabs/CollectionTab.tsx` | “Vault” surface: owned items, interactions, progression panels (currently embeds Shop) | Tab panel receiving `state` and view-model props |
| `src/ui/tabs/CatalogTab.tsx` | Catalog surface (currently not mounted in nav); hosts `CatalogPurchasePanel` | Tab panel wrapper around shared panel |
| `src/ui/tabs/CatalogTab.tsx#CatalogPurchasePanel` | Purchase list + discovered/owned catalog views; calls `buyWatchModel` and delegates to `onPurchase` | Shared component used in multiple surfaces |
| `src/game/state.ts` | Facade re-export of domain actions/selectors/types | “Public API” for UI |
| `src/game/persistence.ts` | Save encode/decode; localStorage I/O | Pure-ish validation + browser storage |

## Recommended Project Structure

Keep the existing conventions: tabs remain in `src/ui/tabs/`, shared UI extracted into `src/ui/components/`.

Proposed additions for consolidation:

```
src/
├── ui/
│   ├── tabs/
│   │   ├── CatalogTab.tsx              # Becomes the sole purchase surface
│   │   └── CollectionTab.tsx           # Vault inventory + interactions (no purchases)
│   ├── components/
│   │   ├── VaultSummaryPanel.tsx       # NEW: compact vault state shown inside Catalog
│   │   └── VaultCapacityMeter.tsx      # NEW (optional): capacity/slots visualization
│   └── navigation/
│       └── landing.ts                  # Update tab alias/deep-link behavior if needed
└── game/
    └── state.ts                        # No structural change; UI keeps calling actions/selectors
```

### Structure Rationale

- **`src/ui/tabs/`:** tabs stay as “screen-level” composition; consolidation is a screen-level routing decision.
- **`src/ui/components/`:** vault info embedded into catalog should be small, reusable components (summary, meters), not more props stuffed into `CatalogPurchasePanel`.

## Architectural Patterns

### Pattern 1: “App As Composition Root” (Derived Props + Callbacks)

**What:** `App.tsx` computes derived data from `state` (selectors) and passes view-model props + callbacks to tabs.
**When to use:** Cross-tab shared state (search filters, selected tab, navigation) or behavior that triggers persistence.
**Trade-offs:** Lots of props, but keeps tabs “dumb” and keeps domain pure.

**Example:**
```typescript
// UI component calls a pure action; App owns persistence side-effects.
onPurchase(buyWatchModel(state, entryId));
```

### Pattern 2: Shared Panel With Mode Flags (Current Approach)

**What:** A reusable panel (`CatalogPurchasePanel`) can be embedded in different tabs with flags like `showBalance` and extra callbacks.
**When to use:** Same purchase list UI needs to appear in multiple contexts (e.g., Vault + Catalog during transition).
**Trade-offs:** Mode flags can accrete and become confusing; prefer composing a wrapper tab (Catalog) that adds/removes surrounding UI.

**Example:**
```typescript
<CatalogPurchasePanel
  state={state}
  onPurchase={onPurchase}
  showBalance
  nowMs={nowMs}
  onInteract={onInteract}
/>
```

### Pattern 3: “UI-Only Consolidation” (No Domain Changes)

**What:** Move purchase entry points between tabs without touching `game/*`.
**When to use:** The underlying state transitions and persistence format remain valid.
**Trade-offs:** Requires careful navigation + CTA updates so the player flow remains coherent.

## Data Flow

### Request Flow (Purchase)

```
[User clicks Buy in Catalog]
    ↓
CatalogPurchasePanel → buyWatchModel(state, modelId) → onPurchase(nextState)
    ↓
App.tsx handlePurchase → setState(nextState) + markSaveDirty() + persistNow("purchase")
```

### State Management

```
GameState (useGameRuntime)
    ↓ (props)
Tabs (CollectionTab, CatalogTab)
    ↓ (callbacks)
App.tsx handlers → pure actions/selectors → new GameState
```

### Key Data Flows Impacted By Consolidation

1. **Navigation to purchase list:** `App.tsx#navigateTo()` currently has special-case scrolling for `scrollTargetId === "catalog-shop"` and expects an element with `id="catalog-shop"` (currently in `CollectionTab.tsx`). Moving purchases to the Catalog tab requires updating this deep-link contract.
2. **Unlock/CTA routing:** CTAs in `CatalogPurchasePanel` and `CollectionTab` currently point to Vault for purchases or discovery. With Catalog as sole purchase surface, these CTAs should route to `tabId: "catalog"` and appropriate anchors (`#catalog-unowned`, etc.).
3. **Vault context inside Catalog:** Catalog already has access to owned counts via `state` and `getWatchModelOwnedCount`. Embedding “vault info” should read from the same state and selectors rather than duplicating tracking.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | No changes needed; keep client-only state and localStorage persistence |
| 1k-100k users | Focus on UI performance (virtualize long lists if catalog grows), keep selectors memoized in `App.tsx` |
| 100k+ users | Only relevant if moving to server sync/cloud saves; outside this milestone |

### Scaling Priorities

1. **First bottleneck:** large catalog rendering; mitigate via memoization + list virtualization.
2. **Second bottleneck:** prop drilling in `App.tsx`; mitigate via per-tab view-model helpers or context for UI-only state.

## Anti-Patterns

### Anti-Pattern 1: Moving Purchase Side Effects Into UI Components

**What people do:** Let `CatalogPurchasePanel` write to localStorage or call `persistNow`.
**Why it's wrong:** Breaks the current boundary (pure domain actions + centralized persistence), makes reuse harder.
**Do this instead:** Keep purchase as `buyWatchModel(...)` + `onPurchase(nextState)` and let `App.tsx` own persistence.

### Anti-Pattern 2: Breaking Deep-Link/Test Selectors During Consolidation

**What people do:** Rename/remove `id`/`data-testid` anchors like `catalog-shop` without updating `navigateTo` and Playwright selectors.
**Why it's wrong:** Silent UX regressions (CTAs scroll to nowhere) and test flakiness.
**Do this instead:** Introduce new anchors in Catalog (e.g. `id="catalog-shop"` on the Catalog tab) or update the navigation contract in one sweep.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `src/App.tsx` ↔ `src/ui/tabs/CatalogTab.tsx` | props + callbacks | Add Catalog to `TAB_DEFINITIONS` and visibility gating; ensure anchor ids line up with `navigateTo` |
| `src/App.tsx` ↔ `src/ui/tabs/CollectionTab.tsx` | props + callbacks | Remove embedded shop section; keep inventory/interactions and route purchases to Catalog |
| `src/ui/tabs/*` ↔ `src/game/state.ts` | direct imports of actions/selectors | No change expected; purchases remain `buyWatchModel` |
| `src/ui/navigation/landing.ts` ↔ tab ids | string ids / alias resolution | Ensure deep links/aliases recognize `catalog` once it becomes visible |

### Components To Modify vs Add

| Component | Change Type | Why |
|----------|-------------|-----|
| `src/App.tsx` | Modify | Mount `CatalogTab`, make it visible, update navigation/scroll targets from `catalog-shop` in Vault to the Catalog tab |
| `src/ui/tabs/CollectionTab.tsx` | Modify | Remove/replace the embedded `CatalogPurchasePanel` section; keep vault ownership + interactions; add CTA to Catalog |
| `src/ui/tabs/CatalogTab.tsx` | Modify | Make it the “sole purchase surface”; wrap `CatalogPurchasePanel` with embedded vault summary UI |
| `src/ui/components/VaultSummaryPanel.tsx` | Add | Provide the “vault info embedded” requirement without bloating purchase panel props |
| `src/ui/navigation/landing.ts` | Possibly modify | Ensure tab aliasing and landing resolution can navigate to Catalog |

## Suggested Build Order

1. **Expose the Catalog tab (routing only):** Add `catalog` to `TAB_DEFINITIONS`, implement visibility gating, and mount `CatalogTab` in `App.tsx`.
2. **Redirect purchase entry points:** Update CTAs and `navigateTo` scroll targets so “Buy watches” always routes to Catalog.
3. **Remove embedded shop from Vault:** Delete/replace `CollectionTab`’s `#catalog-shop` section; leave vault inventory + interactions intact.
4. **Embed vault context into Catalog:** Add `VaultSummaryPanel` (capacity/owned/worn watch summaries) and render it above `CatalogPurchasePanel`.
5. **Stabilize selectors/tests:** Keep or migrate `data-testid` and anchor ids in one pass (especially `catalog-shop` / `catalog-unowned`).

## Sources

- Local codebase inspection (HIGH confidence): `src/App.tsx`, `src/ui/tabs/CollectionTab.tsx`, `src/ui/tabs/CatalogTab.tsx`, `src/game/state.ts`

---
*Architecture research for: Catalog/Vault consolidation*
*Researched: 2026-02-01*
