# Phase 22: Unlock Clarity & Next Actions - Research

**Researched:** 2026-01-26
**Domain:** Unlock UX (locked reasons, progress, next actions) for a Vite + React + TypeScript idle game
**Confidence:** HIGH

## Summary

This codebase already has an explicit “reveal at 80%” philosophy for upcoming systems: a shared `REVEAL_THRESHOLD_RATIO` gates when unlock teasers/tabs appear, and several tabs already render progress bars (Atelier/Maison/Nostalgia). However, many locked things are currently silent until the 80% reveal threshold (eg: locked watch items/upgrades, hidden tabs like Career/Catalog/Stats before their reveal), and some empty states are text-only without a clear navigational next action.

Plan Phase 22 around a single, reusable “lock explanation” pattern that can be applied in three places:
1) a “Next unlocks” panel (visible early, likely in Collection) that explains hidden tabs/systems before they appear,
2) consistent lock reasons on locked-but-visible cards (watch items/upgrades/achievements), and
3) empty states that include one clear CTA that can switch tabs (via `activateTab`) and optionally scroll to the relevant section.

**Primary recommendation:** implement a small UI primitive (eg `UnlockHint`/`NextActionCallout`) driven by existing selectors (`getUnlockVisibilityRatio`, `getAchievementProgressRatio`, prestige reveal progress) plus a new selector that returns milestone progress details (current/threshold), then use it to power both “next unlock” callouts and per-card lock reasons.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| React | ^18.3.1 | UI rendering | Existing app is React-only, no component framework |
| TypeScript | ^5.8.0 | Types + safety | Strict TS, selectors/actions are pure |
| Vite | ^6.0.0 | Dev/build | Existing toolchain |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|---|---|---|---|
| Vitest | ^1.6.0 | Unit tests | Selector logic + rendering states |
| Testing Library | @testing-library/react ^16.1.0 | UI unit tests | Validate empty states + lock copy rendering |
| Playwright | ^1.49.1 | E2E tests | Tab visibility and CTA navigation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Passing `activateTab` down as a prop | Adding a router | Routing adds complexity; app already uses tabs as state |

## Architecture Patterns

### Existing Unlock/Reveal System (use this)

- **Reveal threshold (80%)** is baked in and should remain the basis of “unlocking soon” and teaser visibility.
  - `src/game/selectors/index.ts` exports:
    - `getUnlockVisibilityRatio(state, milestoneId)`
    - `shouldShowUnlockTag(state, milestoneId)` which checks `>= REVEAL_THRESHOLD_RATIO`
  - Unit coverage confirms the `0.8` behavior.

### Recommended Project Structure (for Phase 22 additions)

Prefer adding shared UI primitives under a new directory to avoid duplicating lock UX across tabs.

Recommended:
```
src/
├── game/
│   └── selectors/       # add progress-detail selectors (pure)
└── ui/
    ├── components/      # new: UnlockHint / NextUnlockPanel / EmptyStateCTA
    └── tabs/            # integrate components into tabs
```

### Pattern 1: “Unlock Hint” Component

**What:** A small block showing (a) what is locked, (b) the unlock condition, (c) progress toward it, and (d) one next action.

**When to use:**
- Hidden tabs/systems (before reveal) via a “Next unlocks” panel.
- Locked-but-visible content cards (items/upgrades/achievements).
- Teaser panels to add “why locked” text (Atelier/Maison/Nostalgia already show progress).

**Example (existing progress bar pattern):**
```tsx
// Source: src/ui/tabs/WorkshopTab.tsx
<div className="teaser-track">
  <div
    className="teaser-fill"
    style={{ width: `${Math.round(workshopRevealProgress * 100)}%` }}
  />
</div>
```

### Pattern 2: Navigation via `activateTab`

**What:** CTAs that move the user to the place where they can do the next action.

**Use:** pass a narrow callback down from `src/App.tsx`:
- existing `activateTab(tabId)` is the standard navigation primitive.
- optional: add a “navigate + scroll” helper in `App.tsx` that calls `activateTab` then scrolls to an element id.

**Why:** This avoids adding a router and keeps the existing tab visibility strategy intact.

### Anti-Patterns to Avoid

- **Gate/ungate tabs differently:** Phase constraint explicitly says keep existing tab visibility strategy.
- **Selectors that read Date/DOM:** keep all progress/lock computations pure (no `Date.now()` in selectors).
- **Over-explaining everything at once:** don’t plaster lock reasons on every card if it becomes noisy; prefer consistent placement and an always-available “Next unlocks” panel.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Navigation/CTA routing | A new routing system | `activateTab` (App state) | Matches current architecture, no dependency |
| Progress bars | Canvas/custom animations | Existing `.teaser-*` / `.nostalgia-progress-*` CSS | Consistent visuals + already tested in UI |
| Unlock computation | UI-side ad-hoc logic | `getUnlockVisibilityRatio`, `getAchievementProgressRatio` (+ new progress-detail selector) | Keeps domain logic centralized and testable |

**Key insight:** the codebase already centralizes “what is locked” in selectors and unlock IDs; extend selectors to provide richer progress/remaining information rather than re-deriving it in each tab.

## Common Pitfalls

### Pitfall 1: Hidden tabs remain “mysterious”
**What goes wrong:** Tabs like Career/Catalog/Stats/Atelier/Maison are invisible until their reveal threshold; users never see what’s coming or why.
**How to avoid:** Add a Collection-visible “Next unlocks” panel that lists upcoming tabs/systems with progress + CTA before they appear.

### Pitfall 2: Locked cards have disabled buttons but no reason
**What goes wrong:** Locked items/upgrades are visible but have no lock explanation until `shouldShowUnlockTag` starts rendering at 80%.
**How to avoid:** Show a compact lock row for any `unlockMilestoneId` when not unlocked, using the milestone requirement label and progress.

### Pitfall 3: Missing unlock paths (milestone vs nostalgia)
**What goes wrong:** Some items can become unlocked via `state.nostalgiaUnlockedItems` even if the milestone is not unlocked.
**How to avoid:** When presenting a lock reason for an item, treat it as locked only if `isItemUnlocked(state, id)` is false; don’t assume milestone-only.

### Pitfall 4: Ratios exceed bounds / inconsistent percent labels
**What goes wrong:** Ratios can exceed 1; percent labels can disagree across UI.
**How to avoid:** Clamp ratios for display (`Math.min(1, ratio)`), and use a shared formatter (eg `formatPercent(ratio)`).

### Pitfall 5: Tests seed partial GameState
**What goes wrong:** Playwright tests (eg `tests/tabs.spec.ts`) seed localStorage with partial state objects; any new required fields in persisted state can break tests.
**How to avoid:** Phase 22 should be UI/selector-only (no persistence shape changes). If new data is required, derive it rather than storing it.

## Code Examples

### Milestone progress ratio (existing)
```ts
// Source: src/game/selectors/index.ts
export function getUnlockVisibilityRatio(state: GameState, milestoneId: MilestoneId): number {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return 0;
  }
  if (milestone.requirement.type === "totalItems") {
    const owned = getTotalItemCount(state);
    return milestone.requirement.threshold > 0 ? owned / milestone.requirement.threshold : 0;
  }
  if (milestone.requirement.type === "collectionValue") {
    return milestone.requirement.thresholdCents > 0
      ? getCollectionValueCents(state) / milestone.requirement.thresholdCents
      : 0;
  }
  return milestone.requirement.threshold > 0
    ? state.discoveredCatalogEntries.length / milestone.requirement.threshold
    : 0;
}
```

### Purchase gate provides deficits (use for clearer lock reasons)
```ts
// Source: src/game/selectors/index.ts
export type WatchPurchaseGate =
  | { ok: true; cashPriceCents: number; enjoymentRequiredCents: number }
  | {
      ok: false;
      cashPriceCents: number;
      enjoymentRequiredCents: number;
      blocksBy: "enjoyment" | "cash";
      enjoymentDeficitCents?: number;
      cashDeficitCents?: number;
    };
```

### Teaser progress bar styling exists (reuse)
```css
/* Source: src/style.css */
.teaser-track { height: 6px; border-radius: 999px; overflow: hidden; }
.teaser-fill { height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(72,175,255,0.5)); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Hide everything until unlocked | Reveal “teasers” at 80% progress | Present in current repo | Lets users anticipate unlocks without changing gating |

**Current “reveal at 80%” instances (keep consistent):**
- `shouldShowUnlockTag` for milestone-based unlock tags.
- `isWorkshopRevealReady` / `isMaisonRevealReady` in `src/game/selectors/index.ts`.
- `showNostalgiaTeaser` computed in `src/App.tsx` with `nostalgiaProgress >= 0.8`.

## Open Questions

1. **Where should the global “Next unlocks” panel live?**
   - What we know: Collection is always visible and already houses several “overview” panels.
   - Recommendation: put it in `src/ui/tabs/CollectionTab.tsx` near the top, so users always have a single place to check what’s locked and what to do next.

2. **How aggressive should per-card lock messaging be before 80%?**
   - What we know: the existing design intentionally delays “Unlocking soon” until reveal.
   - Recommendation: keep the subtlety on cards (eg only show full lock reason at 80% via `shouldShowUnlockTag`), but ensure the “Next unlocks” panel covers the always-visible requirement.

## Sources

### Primary (HIGH confidence)
- `src/game/selectors/index.ts` (unlock ratios, reveal threshold, purchase gates)
- `src/game/data/milestones.ts` (milestone ids, requirement types)
- `src/ui/tabs/WorkshopTab.tsx`, `src/ui/tabs/MaisonTab.tsx`, `src/ui/tabs/NostalgiaTab.tsx` (teaser/progress patterns)
- `src/ui/tabs/CollectionTab.tsx` (unlock-tag usage + milestone labels)
- `src/App.tsx` (tab visibility strategy; `activateTab`)
- `src/style.css` (existing lock/progress styles)
- `.planning/REQUIREMENTS.md` (CLAR-01/02/04 definitions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified by repo structure and imports
- Architecture: HIGH - verified by App/tab gating and selectors usage
- Pitfalls: HIGH - based on observed UI gaps + existing unlock mechanisms

**Research date:** 2026-01-26
**Valid until:** 2026-02-25
