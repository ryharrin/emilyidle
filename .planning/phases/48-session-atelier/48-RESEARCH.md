# Phase 48: Session & Atelier Rework - Research

**Researched:** 2026-02-05
**Domain:** Session cooldown UX + drag-based winding interaction + atelier bonus clarity (Vite/React/TS)
**Confidence:** HIGH (repo conventions + current MDN/spec references)

## Summary

Phase 48 is primarily an integration phase: the underlying economy primitives already exist (session policy + cooldown gating, interaction cooldowns, atelier blueprint/reset systems, power reserve multipliers, and upgrade previews). The work becomes production-ready when we (1) keep all new math inside `src/game/selectors/*` and `src/game/actions/*` (pure + cents + nowMs passed in), (2) implement touch-first input with Pointer Events + pointer capture (WebKit-friendly), and (3) add stable UI affordances and test anchors for cooldown/preview surfaces.

For "unknown unknowns", the biggest risk areas are input streams and time: drag interactions can silently fail on iOS Safari without correct `touch-action`/pointer-capture handling, and anything that derives from time can drift if we mix `Date.now()` with the runtime's `nowMs` or accidentally leak browser time into selectors/actions.

**Primary recommendation:** Treat sessions + winding as state-machine problems: compute policies in selectors, execute transitions in actions, and drive UI from derived ratios (cooldown remaining, ring progress, session cost multipliers) with stable `data-testid` anchors.

## Standard Stack

This phase should stay within the existing repo stack (no new dependencies required).

### Core

| Library/Tool | Version (repo) | Purpose | Why Standard |
|---|---:|---|---|
| React | 18.3.1 | UI components + event handling | Already used throughout `src/ui/*` |
| Vite | 6.0.0 | Dev/build tooling | Current build pipeline |
| TypeScript | 5.8.0 | Strict typing across domain + UI | Enforces the "pure selectors/actions" boundary |

### Supporting

| Library/Tool | Version (repo) | Purpose | When to Use |
|---|---:|---|---|
| Playwright | 1.49.1 | E2E/regression, esp. mobile WebKit | Cooldown ring + drag winding UX guardrails |
| Vitest | 1.6.0 | Unit tests | Selector/action math: progressive cost, cooldown ratios |
| Testing Library | 16.1.0 | Component tests | Cooldown ring rendering + a11y attributes |
| lucide-react | 0.563.0 | Icons | Status/alert icons for salary expiration, power reserve, etc |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| SVG ring (`stroke-dasharray`/`stroke-dashoffset`) | CSS `conic-gradient()` | Conic gradients can look great, but SVG is easier to theme, animate precisely, and test via DOM attributes; gradients are background-images and less semantic for assistive tech |

## Architecture Patterns

### Recommended Integration Points (Existing Code)

| Requirement area | Domain layer (pure) | UI layer (React) | Notes |
|---|---|---|
| Sessions (cost/payout/cooldown) | `src/game/selectors/therapistSessions.ts`, `src/game/selectors/therapistPolicy.ts`, `src/game/actions/index.ts` (`performTherapistSession`) | `src/ui/tabs/career/CareerPanel.tsx` | Session policy is already centralized; progressive costs should extend policy derivation, not duplicate it in UI |
| Watch interaction cooldowns | `src/game/selectors/interactions.ts`, `src/game/actions/interactions.ts` | `src/ui/tabs/CatalogTab.tsx`, modals wired in `src/App.tsx` | Interaction gating and cooldown timestamps already exist per watch tier (`interactionNextAvailableAtMsByItem`) |
| Winding UX (input/animation) | Keep outcome/reward math in `src/game/actions/interactions.ts` | `src/ui/components/WindingMiniGameModal.tsx`, `src/ui/components/winding/*` | UI already drives CSS via variables + RAF telemetry; drag-based winding should reuse the pointer patterns from pan/zoom |
| Atelier bonuses + blueprint costs | `src/game/selectors/index.ts` (`getWorkshopPrestigeGain`, `getWorkshopNextBlueprintProgress`), `src/game/selectors/enjoyment.ts` (`getPrestigeLegacyMultiplier`) | `src/ui/tabs/WorkshopTab.tsx`, `src/ui/tabs/UpgradesTab.tsx` | Bonuses exist but are easy to mis-explain; Phase 48 should clarify the display and previews without changing save contracts unnecessarily |
| Unlock/upgrade previews | `src/game/selectors/index.ts` (`getMilestoneUnlockProgressDetail`, `shouldShowUnlockTag`) | `src/ui/tabs/UpgradesTab.tsx` (rate preview), `src/ui/components/UnlockHint.tsx` | The pattern is already established: compute before/after preview from state deltas |

### Pattern 1: Time-Gated Action (Session + Interaction)

**What:** A pure selector computes whether an action is available, its cost/payout, and cooldown; a pure action applies the transition using `nowMs`.

**When to use:** Any button that is disabled due to cooldown, affordability, or gating.

**Repo evidence:**
- `src/game/selectors/therapistSessions.ts` (`canPerformTherapistSession`, `getTherapistSessionPolicy`)
- `src/game/actions/index.ts` (`performTherapistSession`)
- `src/game/selectors/interactions.ts` (`isInteractionAvailable`, `getInteractionCooldownRemainingMs`)
- `src/game/actions/interactions.ts` (`setInteractionCooldown`)

**Example (cooldown remaining ratio):**

```ts
// Keep in UI (derived rendering), not in selectors/actions.
// Source patterns: src/ui/tabs/career/CareerPanel.tsx and src/game/selectors/interactions.ts
const remainingMs = Math.max(0, nextAvailableAtMs - nowMs);
const ratio = cooldownMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / cooldownMs)) : 1;
```

### Pattern 2: Pointer-Driven Drag Interaction (Winding)

**What:** Use Pointer Events with `setPointerCapture(pointerId)` so a drag continues even if the finger/mouse leaves the element.

**When to use:** Drag-based winding controls and any "game surface" requiring uninterrupted gesture streams.

**Repo evidence:** `src/ui/components/panZoom/usePanZoomSurface.ts` uses pointer capture + multi-pointer tracking.

**Official references:**
- MDN `Element.setPointerCapture()` docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- W3C Pointer Events spec entry: https://w3c.github.io/pointerevents/#dom-element-setpointercapture

**Example (minimal capture pattern):**

```ts
// Source: src/ui/components/panZoom/usePanZoomSurface.ts
const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
  event.currentTarget.setPointerCapture(event.pointerId);
  // store starting snapshot
};

const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
  // update based on clientX/clientY delta
};

const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
  // finalize + clear state
};
```

### Pattern 3: UI-Only Previews via State Deltas (Upgrades / Unlocks)

**What:** Create a "nextState" by calling the pure action, then compute derived values from both states to show before/after.

**When to use:** Upgrade effect previews, "next unlock" preview cards, blueprint cost displays.

**Repo evidence:** `src/ui/tabs/UpgradesTab.tsx` builds a preview by computing effective rates for `state` vs `nextState`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Drag gesture stream on mobile | Touch/mouse dual handlers + ad-hoc flags | Pointer Events + pointer capture | Pointer Events unify mouse/pen/touch; capture prevents losing the stream when the pointer leaves the element (MDN + W3C spec) |
| Scroll prevention for draggable surfaces | Global `preventDefault()` on touch events everywhere | `touch-action` on the specific surface | Pointer Events spec explicitly leans on `touch-action` rather than canceling events for viewport manipulations; it also avoids delayed click synthesis |
| Cooldown ring drawing | Canvas rendering loop | SVG circle with `stroke-dasharray`/`stroke-dashoffset` | SVG is declarative (testable), easy to theme, and supports smooth transitions without a render loop |
| New math duplication in UI | Copy/paste cost/cooldown formulas into components | Centralize in selectors/actions | Prevents divergence (especially as more multipliers are added) and keeps tests aligned |

**Key insight:** The "hard" part of this phase is not math; it's gesture correctness and time-based UI consistency across Chrome + iOS Safari.

## Common Pitfalls

### Pitfall 1: Pointer Gestures Break on iOS Safari

**What goes wrong:** Drag winding feels "sticky" or stops updating mid-gesture; `pointermove` stops firing when the finger leaves the element; scroll/pinch gestures steal the interaction.

**Why it happens:** Missing pointer capture, missing `touch-action`, or not handling `pointercancel`. Also, applying scroll-lock globally can interfere with assistive zoom.

**How to avoid:**
- Use `setPointerCapture(event.pointerId)` on pointer down (see `src/ui/components/panZoom/usePanZoomSurface.ts`).
- Ensure the drag surface has `touch-action: none` (or the narrowest acceptable `pan-*`/`manipulation` value).
- Handle `pointercancel` the same as `pointerup`.

**Warning signs:** Works with mouse/trackpad; fails intermittently on iPhone 12 WebKit Playwright run.

**Sources:**
- MDN `touch-action`: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- Pointer Events spec note that viewport manipulations are controlled by `touch-action`: https://w3c.github.io/pointerevents/

### Pitfall 2: Time Leaks Into Pure Logic

**What goes wrong:** Tests become flaky, cooldowns feel wrong after tab restore, or progressive costs diverge from UI labels.

**Why it happens:** Introducing `Date.now()` or `performance.now()` inside selectors/actions, or mixing different clocks.

**How to avoid:**
- Keep selectors/actions pure: accept `nowMs` as an argument (pattern already used in `canPerformTherapistSession(state, nowMs)` and `performTherapistSession(state, nowMs)`).
- UI can use the runtime `nowMs` already passed into panels (`CareerPanel`, `CatalogTab`, etc.).

**Warning signs:** A cost label says one thing but the button disables for another reason; cooldown ring shows progress but the status label shows different seconds.

### Pitfall 3: Progressive Session Cost Becomes a Hard Lock

**What goes wrong:** SESSION-01 ends up punishing players so much that sessions effectively become unavailable, contradicting the goal (strategic, not blocked).

**Why it happens:** Costs increase without a cap/decay model, or cost multipliers stack with existing career multipliers unexpectedly.

**How to avoid:**
- Implement progressive cost as a bounded multiplier or "fatigue" that decays with time or with non-session actions.
- Keep the base terms in `getTherapistBaseSessionEnjoymentCostCents(...)` and apply progressive behavior as a separate, explicit layer in the session policy.

**Repo evidence:** base session costs are centralized in `src/game/selectors/therapistPolicy.ts` and then multiplied in `src/game/selectors/therapistSessions.ts`.

### Pitfall 4: Cooldown Ring Lies (Off-by-One and Rounding)

**What goes wrong:** The ring reaches "full" while the button still says `Cooldown 1s`, or the ring oscillates near 0%.

**Why it happens:** `Math.ceil` vs `Math.floor` mismatch between label and ratio; ratio uses unclamped `nowMs`.

**How to avoid:**
- Decide one rounding convention for labels (existing patterns use `Math.ceil(remainingMs/1000)`).
- Derive the ring from the same underlying `remainingMs`.
- Clamp timestamps to integers (pattern used in `getInteractionCooldownRemainingMs` and `performTherapistSession`).

### Pitfall 5: Atelier Bonus Copy Doesn’t Match Actual Multipliers

**What goes wrong:** ATELIER-01/02 improves the display but players still can’t reason about why the second run is faster.

**Why it happens:** The core multiplier is split across workshop prestige count, maison heritage, workshop upgrades, and set bonuses.

**How to avoid:**
- When displaying "Atelier bonus" or "Legacy bonus", compute it from the same functions that drive rates:
  - `getPrestigeLegacyMultiplier(state)` (`src/game/selectors/enjoyment.ts`)
  - `getWorkshopPrestigeGain(state)` / `getWorkshopNextBlueprintProgress(state, nowMs)` (`src/game/selectors/index.ts`)

## Code Examples

### Cooldown Ring (SVG stroke-dashoffset)

```tsx
// Use an SVG circle with strokeDasharray and strokeDashoffset.
// Source docs: MDN stroke-dasharray (links to SVG2 spec)
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
// Spec: https://svgwg.org/svg2-draft/painting.html#StrokeDashing

const size = 18;
const r = 7;
const c = 2 * Math.PI * r;
const dashOffset = c * (1 - progress01);

return (
  <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    <circle
      cx="9"
      cy="9"
      r={r}
      fill="none"
      stroke="rgba(72,175,255,0.9)"
      strokeWidth="2"
      strokeDasharray={c}
      strokeDashoffset={dashOffset}
      strokeLinecap="round"
      transform="rotate(-90 9 9)"
    />
  </svg>
);
```

### Pointer Capture + touch-action for Drag Winding

```ts
// Follow the same event binding shape as usePanZoomSurface.
// Repo source: src/ui/components/panZoom/usePanZoomSurface.ts
// Docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
// Spec: https://w3c.github.io/pointerevents/#dom-element-setpointercapture

// CSS (local class): touch-action: none;
// Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action

// JS/TS: setPointerCapture(pointerId) on pointerdown; clear state on up/cancel.
```

### Progressive Cost as Policy Layer (Concept)

```ts
// Keep this shape: base terms -> multipliers -> derived policy.
// Repo source: src/game/selectors/therapistPolicy.ts and src/game/selectors/therapistSessions.ts

// Suggested layering:
// 1) base terms (track+level)
// 2) career multipliers
// 3) progressive cost multiplier (bounded/decaying)
// 4) final cents rounded down
```

## Open Questions

1. **What is the exact progressive cost design for SESSION-01?**
   - What we know: base costs exist; Phase 48 wants "strategic" repeated sessions without hard lock.
   - What's unclear: whether progressive cost depends on "consecutive sessions", "sessions within a window", or "per-day" scaling.
   - Recommendation: pick a bounded multiplier with time decay, stored in career state as a simple counter + lastSessionAtMs so it can be tested deterministically.

2. **Should scroll/pinch be disabled globally while winding modal is open?**
   - What we know: `WindingMiniGameModal` currently sets `document.body.style.touchAction = "none"` while open.
   - What's unclear: whether this is acceptable for accessibility (MDN warns `touch-action: none` can inhibit zoom) vs a localized surface-only approach.
   - Recommendation: scope `touch-action` to the winding drag surface whenever possible; keep body-level lock only if WebKit requires it for reliable gesture capture.

## Sources

### Primary (HIGH confidence)
- Repo architecture + patterns (evidence in files):
  - `src/game/selectors/therapistSessions.ts`
  - `src/game/actions/index.ts`
  - `src/game/actions/interactions.ts`
  - `src/ui/components/WindingMiniGameModal.tsx`
  - `src/ui/components/panZoom/usePanZoomSurface.ts`
  - `src/game/selectors/index.ts`
  - `src/game/selectors/enjoyment.ts`

### Web Platform References (HIGH confidence)
- MDN: `Element.setPointerCapture()` https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- W3C Pointer Events: `setPointerCapture` https://w3c.github.io/pointerevents/#dom-element-setpointercapture
- MDN: `touch-action` https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- MDN: SVG `stroke-dasharray` https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
- SVG 2 draft: Stroke dashing https://svgwg.org/svg2-draft/painting.html#StrokeDashing
- MDN: `conic-gradient()` https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - sourced from `package.json` and existing repo usage.
- Architecture: HIGH - patterns are already implemented (sessions, interactions, pointer capture).
- Pitfalls: HIGH - verified against current MDN + W3C pointer events guidance and repo’s existing WebKit focus/touch constraints.

**Valid until:** 2026-03-05 (web platform APIs stable; re-check if browser behavior changes are observed in WebKit runs)
