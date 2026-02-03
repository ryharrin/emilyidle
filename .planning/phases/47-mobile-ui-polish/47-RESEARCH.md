# Phase 47: Mobile & UI Polish - Research

**Researched:** 2026-02-03
**Domain:** Mobile-first UI polish for a Vite + React + TypeScript idle game (navigation, scroll, modals, touch targets)
**Confidence:** MEDIUM

## Summary

Phase 47 is primarily about making the existing UI usable and comfortable on touch devices without inventing new product surface area. The repo is already set up for this style of work: global CSS in `src/style.css`, tab-based navigation in `src/App.tsx` with accessible `tablist/tab/tabpanel` semantics, and several modal implementations that already handle reduced-motion and (in at least one case) focus trapping + scroll locking.

The standard implementation approach for the sticky horizontal tabs + carousel content is: keep the sticky tab bar outside the horizontally-transformed content area (to avoid breaking `position: sticky` semantics), use CSS Scroll Snap for the tab strip itself (not JS snapping), and use a single translated “panel rail” for tab panels. Underline sizing/position should be driven by measuring the active tab button and writing CSS variables (or style props) so the underline can animate smoothly and stay connected to the active pill.

For modals and other primary actions, the codebase already demonstrates a reliable mobile pattern (in `src/ui/components/WindingMiniGameModal.tsx`): lock body scroll and touch action, contain overscroll, trap focus with sentinels, restore focus on close, and respect `prefers-reduced-motion`. Phase 47 should reuse and standardize that pattern across help/settings/interaction modals rather than introducing a new modal framework.

**Primary recommendation:** Implement mobile polish using native platform primitives (CSS Scroll Snap, `scrollIntoView`, `prefers-reduced-motion`, `env(safe-area-inset-*)`) and reuse the repo’s established modal/focus/scroll-lock patterns.

## Standard Stack

### Core
| Library / Feature | Version | Purpose | Why Standard |
|---|---:|---|---|
| React | 18.3.1 | UI composition | Existing app runtime | 
| TypeScript | 5.8.x | Type-safe UI state | Existing project standard | 
| Vite | 6.0.x | Dev/build toolchain | Existing project standard |
| CSS Scroll Snap (`scroll-snap-type`, `scroll-snap-align`, `scroll-padding`, `scroll-margin`) | n/a | Snap-scrolling tab strip and section rails | Native browser feature; avoids JS snap bugs | 
| `Element.scrollIntoView(options)` | n/a | Center active tab, jump to section anchors | Native API; supports `inline` and `block` options | 
| `@media (prefers-reduced-motion: reduce)` / `matchMedia` | n/a | Disable/step animations | Accessibility baseline; already used in modals | 
| CSS `env(safe-area-inset-*)` | n/a | Notch / home-indicator safe padding | Native safe-area handling | 
| New viewport units (`svh/lvh/dvh`) | n/a | Avoid mobile `100vh` browser UI bugs | Current best practice for mobile layout sizing |

### Supporting
| Library / Feature | Version | Purpose | When to Use |
|---|---:|---|---|
| `overscroll-behavior` | n/a | Prevent rubber-band / background scroll chaining | Scrollable rails and modals | 
| `touch-action` | n/a | Prevent gesture conflicts in interactive areas | Mini-games + swipe/drag regions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| CSS transitions for carousel | Animation libraries (e.g. spring/motion libs) | Extra dependency surface; harder to integrate with sticky + reduced motion contracts |
| CSS Scroll Snap | JS-driven snapping | More code, worse cross-browser edge cases, easy to regress |

**Installation:**

No new dependencies required for the Phase 47 goals.

## Architecture Patterns

### Recommended Project Structure
The phase is “mostly UI”, but should still keep concerns separated:

```
src/
├── App.tsx                 # primary navigation + tab switching + modal wiring
├── style.css               # global styling + responsive rules + motion prefs
└── ui/
    ├── tabs/*              # tab panels
    ├── help/*              # help modal + search
    └── components/*        # shared modal patterns + interaction modals
```

### Pattern 1: Sticky Tab Bar + Scroll-Snap Tab Strip
**What:** A horizontally scrollable tab strip that snaps and can be programmatically centered; the strip stays sticky while the content scrolls.

**When to use:** `MOBILE-01` and `MOBILE-02`.

**Implementation notes (prescriptive):**
- Keep the sticky bar in its own DOM layer above the scrolled content (do not place it inside the horizontally-transformed carousel container).
- Use `scroll-snap-type: x proximity` (or `mandatory` only when you are sure the tab strip will never need independent overflow scrolling).
- Use `scroll-snap-align` on each tab.
- Use `scroll-padding-inline` on the tab strip so snap points feel centered.
- When activating a tab, call `activeTabButton.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" })`.

**Example (existing tab semantics):**
```tsx
// Source: src/App.tsx
<div role="tablist" aria-label="Primary navigation" className="page-nav-tabs">
  {visibleTabs.map((tab) => (
    <button
      key={tab.id}
      type="button"
      className="page-nav-link"
      role="tab"
      id={`${tab.id}-tab`}
      aria-selected={tab.id === activeTab}
      aria-controls={tab.id}
      tabIndex={tab.id === focusedTab ? 0 : -1}
      onClick={() => activateTab(tab.id, "user")}
    >
      {tab.label}
    </button>
  ))}
</div>
```

**Source (CSS Scroll Snap):**
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts

### Pattern 2: Underline That Tracks Active Tab Width
**What:** A colored underline that resizes and translates to match the active tab button.

**When to use:** `MOBILE-01` tab affordance polish.

**Implementation notes (prescriptive):**
- Measure active tab button bounds relative to the tab strip container.
- Write `--tab-underline-x` and `--tab-underline-w` CSS variables on the tab strip element.
- Animate underline via `transform: translateX(var(--tab-underline-x))` and `width: var(--tab-underline-w)` with a short easing.
- Update measurement on: tab change, window resize, and when fonts load / layout changes (use `ResizeObserver` on the tab strip if needed).

**Anti-patterns to avoid:**
- Measuring on every `scroll` event.
- Putting the underline inside each tab (causes layout shifts, harder to animate).

### Pattern 3: Carousel-Style Tab Panels (Horizontal Slide)
**What:** Switching tabs slides the tab panels horizontally like a carousel while the tab bar remains sticky.

**When to use:** Locked phase decision for mobile feel.

**Implementation notes (prescriptive):**
- Render a “panel rail” container that contains each tab panel at `flex: 0 0 100%`.
- Translate the rail by `-index * 100%`.
- Use CSS `transition` for the translate, and disable it under `@media (prefers-reduced-motion: reduce)`.
- Keep each panel’s `role="tabpanel"` and `hidden` semantics coherent; if the rail keeps panels mounted, ensure focus cannot move into hidden panels (use `inert` if available, otherwise guard focus via `tabIndex=-1` on focusables or keep using `hidden` with conditional rendering).

**Source (reduced motion media query):**
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

### Pattern 4: Modal Scroll Lock + Focus Trap (Reuse Existing)
**What:** Mobile-friendly modals that lock background scroll, prevent scroll chaining, trap focus, and restore focus.

**When to use:** `MOBILE-05`, `MOBILE-06`, `MOBILE-07`.

**Example (focus sentinels + scroll/touch lock):**
```tsx
// Source: src/ui/components/WindingMiniGameModal.tsx
useEffect(() => {
  if (!open || typeof document === "undefined") return;
  const previousOverflow = document.body.style.overflow;
  const previousTouchAction = document.body.style.touchAction;
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
  return () => {
    document.body.style.overflow = previousOverflow;
    document.body.style.touchAction = previousTouchAction;
  };
}, [open]);

<span tabIndex={0} className="winding-focus-sentinel" onFocus={handleTopSentinel} />
...
<span tabIndex={0} className="winding-focus-sentinel" onFocus={handleBottomSentinel} />
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Tab snapping | JS scroll snapping logic | CSS Scroll Snap | Native behavior + fewer edge cases | 
| Section anchor offsets under sticky bars | Manual pixel math everywhere | `scroll-margin-*` / `scroll-padding-*` + `scrollIntoView` | Centralizes offset; avoids hidden headings | 
| Reduced motion handling | Per-component ad hoc flags | `@media (prefers-reduced-motion: reduce)` and `matchMedia` pattern already in modals | Consistency and a11y | 
| Modal focus trap and scroll lock | New modal framework | Existing sentinel + body scroll lock pattern | Proven in repo; avoids regressions |

**Key insight:** These problems are “deceptively simple” and regress easily on mobile (iOS Safari scroll, keyboard focus, sticky interactions). Reuse native primitives and the repo’s established patterns.

## Common Pitfalls

### Pitfall 1: Sticky breaks because of transform/overflow ancestors
**What goes wrong:** The tab bar stops sticking, or sticks to the wrong scroll container.

**Why it happens:** `position: sticky` sticks to the nearest scrolling ancestor (any ancestor with overflow creating a scrolling mechanism) and has special behavior in the presence of transforms/stacking contexts.

**How to avoid:** Keep the sticky tab bar outside the transformed carousel rail and avoid placing it inside `overflow: hidden/auto` containers unless that container is the intended sticky scroll ancestor.

**Source:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position

### Pitfall 2: Scroll snap “mandatory” makes content unscrollable
**What goes wrong:** Users cannot scroll within a snapped child, or the strip fights scrolling.

**Why it happens:** `mandatory` snap can prevent reaching intermediate scroll positions; MDN explicitly warns about overflow content inside snapped children.

**How to avoid:** Prefer `proximity` for the tab strip unless you have strict control over child overflow.

**Source:** https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts

### Pitfall 3: Section jumps land under sticky headers
**What goes wrong:** In-page subnav scrolls, but the target heading is hidden under the sticky bar.

**Why it happens:** `scrollIntoView` aligns to the start by default.

**How to avoid:** Use `scroll-margin-top` (or `scroll-padding-top` on the container) to reserve space for sticky UI.

**Source:** https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

### Pitfall 4: Mobile viewport units cause clipped content
**What goes wrong:** Panels that try to fill the screen leave “dead space” or get covered by the browser address bar.

**Why it happens:** Default `vh` behaves like the *large* viewport (`lvh`) in many browsers; dynamic browser UI changes complicate sizing.

**How to avoid:** Use `svh/lvh/dvh` intentionally; avoid `dvh` for constantly animating layouts if it causes resize jank.

**Source:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#viewport-percentage_lengths

### Pitfall 5: Touch targets are too small or too dense
**What goes wrong:** Miss-taps, accidental activations, and fatigue.

**Why it happens:** Small icon buttons, tight chip rows, and condensed action stacks.

**How to avoid:** Enforce a minimum 44px target size per project requirement (`MOBILE-09`). (This exceeds WCAG 2.5.8 minimum 24px; use 44px as the house standard.)

**Source (baseline accessibility minimum):** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

## Code Examples

### Center active tab with `scrollIntoView`
```ts
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
activeTabEl.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
```

### Existing in-page jump for a section anchor
```ts
// Source: src/ui/tabs/CatalogTab.tsx
document.getElementById("catalog-unowned")?.scrollIntoView({ block: "start" });
```

### Existing CSS Scroll Snap pattern (reference implementation)
```css
/* Source: src/style.css */
.career-tree-tier-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
}

.career-tree-tier {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
```

### Existing focus-trapped modal pattern
```tsx
// Source: src/ui/components/WindingMiniGameModal.tsx
<div className="nostalgia-modal-card" role="dialog" aria-modal="true">
  <span tabIndex={0} className="winding-focus-sentinel" onFocus={handleTopSentinel} />
  {/* modal content */}
  <span tabIndex={0} className="winding-focus-sentinel" onFocus={handleBottomSentinel} />
</div>
```

### Existing reduced-motion handling in CSS
```css
/* Source: src/style.css */
@media (prefers-reduced-motion: reduce) {
  .winding-track {
    animation: none !important;
    transition: none !important;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `height: 100vh` for full-height mobile panels | Use `svh/lvh/dvh` intentionally | Modern mobile browsers (current docs 2025) | Prevents browser UI overlap and weird blank space | 
| JS snapping | CSS Scroll Snap | Mature and widely available | Less code; better behavior | 
| Ignoring motion preferences | `prefers-reduced-motion` honored | Widely available since ~2020 | Better accessibility; less nausea | 
| No notch/home-indicator padding | `env(safe-area-inset-*)` | Widely available since ~2020 | Prevents UI under safe areas |

**Deprecated/outdated (avoid):**
- Using default `vh` without understanding it may behave like `lvh` on mobile.
- Building custom scroll snap behavior in JS for the tab strip.

## Open Questions

1. **Should the carousel keep all tab panels mounted during the slide?**
   - What we know: Current tabs use `hidden` and `isActive` gating per panel (e.g., `hidden={!isActive}` patterns in tab components).
   - What's unclear: Whether keeping non-active panels mounted is acceptable for performance and focus management.
   - Recommendation: Start with “keep mounted but inert/unfocusable” only if needed for animation; otherwise keep the existing conditional rendering semantics and animate a wrapper that contains only the active panel.

2. **Safe-area padding strategy for sticky bars and modals**
   - What we know: `env(safe-area-inset-*)` is available and intended for this.
   - What's unclear: Whether current CSS already accounts for safe area insets globally.
   - Recommendation: Apply safe-area padding locally to sticky bars/footers that sit at screen edges.

## Sources

### Primary (HIGH confidence)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts
- https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

### Repo evidence (HIGH confidence)
- `src/App.tsx` (tablist semantics and navigation wiring)
- `src/style.css` (existing scroll-snap usage + reduced-motion rules)
- `src/ui/components/WindingMiniGameModal.tsx` (scroll lock + focus trap sentinels)
- `src/ui/help/HelpModal.tsx` (help modal baseline structure)
- `src/ui/tabs/CatalogTab.tsx` (in-page anchor jump with `scrollIntoView`)

### Secondary (MEDIUM confidence)
- Apple HIG touch target guidance could not be fetched (Apple docs require JS in this environment); Phase uses project requirement `MOBILE-09` (44px) as enforcement target.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all items are either current repo dependencies or platform primitives with authoritative docs.
- Architecture: MEDIUM - sticky + carousel interactions are known to be tricky on mobile; plan should include manual verification on iOS Safari + Android Chrome.
- Pitfalls: HIGH - sourced from MDN/W3C and observed patterns in repo.

**Research date:** 2026-02-03
**Valid until:** 2026-03-05
