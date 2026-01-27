# Architecture Research

**Domain:** Incremental idle game (onboarding + UX guidance layer)
**Researched:** 2026-01-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ UI (React)                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  App shell: src/App.tsx                                                       │
│   - tab nav + tab visibility gating                                           │
│   - orchestration: derives props from selectors                               │
│   - UI-only settings persistence (localStorage)                               │
│                                                                              │
│  Tabs: src/ui/tabs/*Tab.tsx                                                   │
│   - render panels, CTAs, empty/teaser states                                  │
│   - call onPurchase(nextState)                                                │
│                                                                              │
│  Guidance layer (recommended): src/ui/guidance/*                              │
│   - onboarding steps / coachmarks / callouts / tooltips                       │
│   - driven by GameState + persisted Settings                                  │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ Runtime + Persistence                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│  RAF + autosave: src/game/runtime/useGameRuntime.ts                           │
│  Save v2 (game state): src/game/persistence.ts (localStorage emily-idle:save) │
│  UI settings (not in save): src/App.tsx (localStorage emily-idle:settings)    │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ Domain (pure TS)                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  Facade: src/game/state.ts (re-exports model/data/selectors/actions)          │
│  Selectors: src/game/selectors/index.ts (derived math + gates)                │
│  Actions: src/game/actions/index.ts (state transitions: buy/reset/prestige)   │
│  Model: src/game/model/state.ts + src/game/model/types.ts                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/App.tsx` | Composition root: wires runtime + state → tabs; owns tab/nav UI state and UI-only settings | React state + `useMemo` for selector-derived props; localStorage settings key `emily-idle:settings` |
| `src/ui/tabs/*Tab.tsx` | Presentational + interaction surfaces (CTAs, modals, teasers) | Receives `state` and derived props; calls `onPurchase(nextState)` |
| `src/game/runtime/useGameRuntime.ts` | Simulation clock (RAF), autosave, save load/clear | Hook with `requestAnimationFrame` loop + dirty tracking |
| `src/game/persistence.ts` | Save encode/decode/sanitize and localStorage IO | Save v2 JSON + schema-ish sanitization |
| `src/game/state.ts` | Public API boundary for UI: `selectors` + `actions` | Barrel export |
| `src/game/selectors/index.ts` | Derived values + “can X?” gates + thresholds | Pure functions over `GameState` |
| `src/game/actions/index.ts` | Game transitions (buy, prestige, rewards) | Pure functions returning next `GameState` |

## Recommended Project Structure

Keep onboarding/UX logic out of domain `GameState` and out of the runtime tick loop itself.

```
src/
├── ui/
│   ├── tabs/                       # Existing tab panels
│   ├── guidance/                   # NEW: onboarding + UX clarity layer
│   │   ├── useGuidance.ts          # Computes “what to show now” from state+settings
│   │   ├── guidanceSignals.ts      # Pure helpers for thresholds / transitions
│   │   ├── CoachmarksPanel.tsx     # Renders coachmarks list (extends current pattern)
│   │   ├── Callout.tsx             # Inline callout component (progress + next action)
│   │   ├── Tooltip.tsx             # Optional lightweight tooltip/popover
│   │   └── prestigeCopy.ts         # Single-source copy for resets/keeps explanations
│   └── ...
├── game/
│   ├── selectors/                  # Add UX-friendly selectors only if truly general
│   ├── actions/
│   ├── runtime/
│   └── ...
└── App.tsx
```

### Structure Rationale

- **`src/ui/guidance/`:** onboarding is UI policy (what to teach, when, and how), so keep it next to UI. It may read `GameState`, but it should not mutate it.
- **`src/game/selectors/`:** only add onboarding-oriented selectors when they encode domain truth (threshold math, gating), not UI policy.

## Architectural Patterns

### Pattern 1: UI-Only Persistent Guidance State

**What:** Persist onboarding progress in UI settings (localStorage `emily-idle:settings`), not in the main save (`emily-idle:save`).
**When to use:** Coachmarks dismissed, tooltips dismissed, “saw prestige intro”, onboarding versioning.
**Trade-offs:** Not portable with save exports/imports (fine for onboarding); avoids save schema churn and preserves domain purity.

**Anchor in repo:** `src/App.tsx` already persists `Settings.coachmarksDismissed` and other prefs.

**Example:**
```ts
type Settings = {
  // existing
  coachmarksDismissed: Record<string, boolean>;

  // recommended new
  onboarding: {
    version: number;
    completed: Record<string, boolean>;
    dismissedTooltips: Record<string, boolean>;
  };
};
```

### Pattern 2: “Guidance Signals” Separate From Rendering

**What:** Compute a small, stable set of “signals” (facts) from `GameState` and current UI context; render callouts/tooltips based on signals + settings.
**When to use:** Progress callouts (near unlock thresholds), prestige clarity, empty-state nudges.
**Trade-offs:** Slight up-front structure, but avoids scattering threshold logic across tabs.

**Signals in this codebase (already exist):**
- Prestige readiness: `canWorkshopPrestige`, `canMaisonPrestige`, `canNostalgiaPrestige` (`src/game/selectors/index.ts`)
- “Near unlock” ratios: `isWorkshopRevealReady`, `isMaisonRevealReady`, `getUnlockVisibilityRatio`, `shouldShowUnlockTag` (`src/game/selectors/index.ts`)

### Pattern 3: Transition Detection Without Polluting the Tick Loop

**What:** In `useGuidance`, track a small previous snapshot (via `useRef`) to detect “first time” transitions (first workshop tease, first prestige available, first unlock store visible).
**When to use:** Triggering one-time onboarding steps.
**Trade-offs:** Must be careful: `state` changes frequently (RAF tick), so compute transitions cheaply and update settings only when a transition is observed.

**Key rule:** never do DOM measurement or expensive scanning on every tick.

### Pattern 4: Centralize Prestige Explanations

**What:** Put the “Resets / Keeps / Why prestige?” copy in one place so callouts, modals, and coachmarks stay consistent.
**When to use:** Prestige clarity improvements across `WorkshopTab`, `MaisonTab`, `NostalgiaTab`.
**Trade-offs:** Small indirection; big UX consistency win.

## Data Flow

### Request Flow (Gameplay)

```
[User click in tab]
  ↓
Tab component (src/ui/tabs/*Tab.tsx)
  ↓  calls action: buy/prestige/etc (src/game/actions/index.ts)
App.handlePurchase(nextState) (src/App.tsx)
  ↓
setState(nextState) + markSaveDirty() + persistNow("purchase")
  ↓
useGameRuntime RAF tick continues (src/game/runtime/useGameRuntime.ts)
```

### Guidance Flow (Onboarding + Callouts)

```
GameState update (tick or purchase)
  ↓
useGuidance(state, uiContext, settings)
  ↓
guidance model: { activeSteps, callouts, tooltips }
  ↓
render in App / tabs (CoachmarksPanel + inline Callout/Tooltip components)
  ↓  user dismisses/completes
persistSettings(updated settings) (src/App.tsx)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current monolith is fine; focus on responsiveness during RAF ticks |
| 1k-100k users | Still static frontend; main “scale” risk is perf on low-end devices (avoid heavy guidance computations per tick) |
| 100k+ users | No backend here; treat as performance/UX scaling (bundle size, render cost, avoid expensive layout work) |

### Scaling Priorities

1. **First bottleneck:** rerenders during RAF tick; keep guidance calculations O(1) and only persist settings on transitions.
2. **Second bottleneck:** DOM-measured tooltips/coachmarks; prefer inline callouts inside panels unless a floating overlay is essential.

## Anti-Patterns

### Anti-Pattern 1: Store onboarding in `GameState`

**What people do:** Add `onboardingStep` to `GameState` and save it with `emily-idle:save`.
**Why it's wrong:** Couples UX policy to domain model + save migrations; makes tests brittle; encourages “game logic depends on onboarding”.
**Do this instead:** Keep onboarding in settings (`src/App.tsx` localStorage) and derive “what to show” from state.

### Anti-Pattern 2: Duplicate threshold math across tabs

**What people do:** Hardcode `0.8` or prestige thresholds in UI repeatedly.
**Why it's wrong:** UX gets inconsistent and breaks when tuning thresholds.
**Do this instead:** Reuse selectors like `isWorkshopRevealReady`, `getUnlockVisibilityRatio`, and add new selector helpers only when they encode domain truth.

### Anti-Pattern 3: Floating overlays anchored by brittle selectors

**What people do:** Attach a tooltip to `.some-css-class` and rely on layout/DOM structure.
**Why it's wrong:** Small UI refactors break onboarding.
**Do this instead:** Anchor callouts to stable `id` or `data-testid` already used by tests (e.g. `data-testid="workshop-reset"`, `data-testid="nostalgia-prestige"`).

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `src/ui/guidance/*` ↔ `src/game/state.ts` | direct calls to selectors (read-only) | Guidance reads `GameState`, never mutates it |
| `src/ui/guidance/*` ↔ `src/App.tsx` | props + callbacks (`settings`, `persistSettings`, `activeTab`) | App remains the owner of settings persistence |
| `src/ui/tabs/*` ↔ guidance | shared components (Callout/Tooltip) + stable anchors | Tabs keep rendering; guidance adds UX affordances |

### Concrete Hook-In Locations

- **Top-level orchestration:** `src/App.tsx` is the natural place to instantiate `useGuidance(...)` because it already owns `settings`, `activeTab`, and the derived “reveal/progress” values.
- **Coachmarks surface:** `src/ui/tabs/CollectionTab.tsx` already renders coachmarks in a side panel; extend this into a more general “Next steps / coachmarks” panel (or keep coachmarks there and add per-tab callouts elsewhere).
- **Prestige clarity:**
  - Workshop: `src/ui/tabs/WorkshopTab.tsx` (`data-testid="workshop-reset"`, `canPrestigeWorkshop`, `workshopRevealProgress`)
  - Maison: `src/ui/tabs/MaisonTab.tsx` (`data-testid="maison-reset"`, `canPrestigeMaison`, `maisonRevealProgress`)
  - Nostalgia: `src/ui/tabs/NostalgiaTab.tsx` (`data-testid="nostalgia-prestige"`, `nostalgiaProgress`)
- **Tab/empty-state polish:** Use existing “teaser” states (`panel-teaser`) as onboarding triggers; they already encode “near unlock” thresholds via selectors.

## Suggested Build Order (Roadmap-Oriented)

1. **Guidance state model + settings migration**
   - Extend `Settings` in `src/App.tsx` (load + persist); keep backwards compatible defaults.
2. **`src/ui/guidance/useGuidance.ts` + minimal rendering surface**
   - Start by driving existing coachmarks with a more structured step model.
3. **Prestige clarity pass**
   - Centralize prestige copy; add contextual callouts when `canPrestige*` flips true and when teasers appear.
4. **Tooltips + progress callouts**
   - Add lightweight tooltip/callout components; avoid layout-measured overlays until needed.
5. **Tab + empty-state polish**
   - Improve copy and “what to do next” in each tab; ensure anchors remain stable for tests.

## Sources

- `src/App.tsx` (tabs + settings + coachmarks)
- `src/ui/tabs/CollectionTab.tsx` (coachmarks surface)
- `src/ui/tabs/WorkshopTab.tsx`, `src/ui/tabs/MaisonTab.tsx`, `src/ui/tabs/NostalgiaTab.tsx` (prestige UX)
- `src/game/runtime/useGameRuntime.ts` (tick + autosave)
- `src/game/persistence.ts` (save IO)
- `src/game/state.ts`, `src/game/selectors/index.ts`, `src/game/actions/index.ts` (domain boundaries)

---
*Architecture research for: onboarding + UX clarity in Emily Idle*
*Researched: 2026-01-25*
