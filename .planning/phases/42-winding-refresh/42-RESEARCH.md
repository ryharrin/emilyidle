# Phase 42: Winding Refresh - Research

**Researched:** 2026-02-02
**Domain:** React UI mini-game loop (RAF), CSS animation, accessibility, mobile touch
**Confidence:** HIGH

## Summary

Phase 42 is an in-place upgrade of the existing manual-winding mini-game. The codebase already has a timing-based winding modal (marker moves across a track; player taps/clicks to stop). The locked Phase 42 decisions (see `42-CONTEXT.md`) keep this mechanic, but change the scoring to explicit bands (under/good/perfect/over), extend the run to ~5-6 seconds, and add a crown + tension animation that visibly responds to progress and eases to a stop. "Pace" is therefore *perceived pace* (rotation speed + glow/pulse), while "amount" is the stop position.

The best way to implement this in this repo is to follow the existing mini-game pattern used by the quartz and automatic modals: a modal component owns a `requestAnimationFrame` loop, normalizes progress, applies a reduced-motion stepping mode, cancels RAF cleanly on stop/close, and calls `onComplete` immediately so domain rewards apply deterministically. Animation and band visuals belong in CSS, driven by a small set of computed values (`progress01`, `band`, `tension01`, `angleDeg`) exposed as CSS variables or inline styles.

**Primary recommendation:** Update `src/ui/components/WindingMiniGameModal.tsx` to use Phase 42 band rules and a 5-6s run, add a progress-driven crown/tension animation (RAF-driven angle with stop deceleration), reuse the HelpModal scroll-lock pattern for mobile, and keep the existing `data-testid` contracts stable to avoid widespread test churn.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.3.1 | UI components + state/effects | Existing app foundation |
| react-dom | 18.3.1 | DOM rendering | Existing app foundation |
| TypeScript | 5.8.x | Types + safety | Repo-wide strict TS |
| Vite | 6.4.1 | Dev/build tooling | Locked by repo tooling + lockfile |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.1 | Unit testing UI behavior | Winding modal behavior + regression tests |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Clicking/tapping modal controls |
| @playwright/test | 1.57.0 | E2E smoke coverage | Winding completes + reward/cooldown applied |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RAF-driven crown rotation + stop deceleration | CSS-only `@keyframes` + duration changes | CSS can’t reliably "ease to stop" from the current angle; RAF matches existing mini-game loops and keeps visuals deterministic |
| Adding a focus-trap dependency | Hand-rolled "good enough" focus management | New deps not used elsewhere; Phase 42 can focus the primary action and support Escape/keyboard without a full trap |

**Installation:**
```bash
# No new packages recommended for this phase.
```

## Architecture Patterns

### Where The Current Winding Mini-Game Lives

Current implementation ("winding interaction"):
- `src/ui/components/WindingMiniGameModal.tsx` (RAF run, current scoring, crown + track markup)
- `src/style.css` (winding crown/track styling, `.winding-crown-running` keyframes)
- `src/App.tsx` (modal open/close wiring, `onComplete` applies rewards)
- `src/ui/tabs/CatalogTab.tsx` (interact button `data-testid="vault-interact-${tierId}"` triggers `onInteract(tierId)`)
- `src/game/actions/interactions.ts` + `src/game/selectors/interactions.ts` (reward + per-item cooldown rules)

Test contracts that already pin behavior/selectors:
- `tests/catalog.unit.test.tsx` (opens modal, clicks `winding-stop`, expects outcome, closes)
- `tests/collection-loop.spec.ts` (E2E: completes winding; expects enjoyment increased + cooldown disables button)

### Best Integration Points For Phase 42 Enhancements

Winding bands:
- Compute from `progress01` at stop time in `src/ui/components/WindingMiniGameModal.tsx` (or a pure helper under `src/ui/components/winding/`).
- Keep domain tier as `"miss"|"good"|"perfect"` (because `applyWindingReward` accepts only those), but add a UI-only band label to render "Over-wound!" distinctly.

Crown + tension animation:
- Replace constant `.winding-crown-running` spin with a progress-driven rotation model:
  - During run: angle increases each tick by a speed derived from `progress01` (slow -> faster -> fastest near 0.70-1.00) and `tension01`.
  - On stop: keep `onComplete` immediate, but continue animating angle for a short deceleration window (mechanical easing) to "settle".
- Drive visual intensity (glow/pulse) from `tension01` so reduced-motion users still get readable feedback even though CSS animations are effectively disabled.

Mobile/a11y input handling:
- Use the HelpModal body scroll lock pattern (`document.body.style.overflow = "hidden"`) while the winding modal is open.
- Ensure the "tap zone" is a real `<button>` (or contains one) and meets touch target guidance (>=44px) via CSS.
- Add `touch-action: none` to the tap zone to prevent scroll/rubber-band interference.
- Add Escape-to-close (patterned after HelpModal).
- Add an `aria-live="polite"` status region that announces: start -> stopped at X% -> outcome label.
- On open, focus the primary action (Stop button) so keyboard users can act immediately.

### Recommended Project Structure

If `src/ui/components/WindingMiniGameModal.tsx` would grow beyond ~300 LOC, keep it modular by splitting out helpers:
```
src/ui/components/winding/
├── windingMath.ts        # band mapping (under/good/perfect/over) + label/tier mapping
├── useWindingRun.ts      # RAF loop for progress + angle + stop deceleration
└── WindingCrown.tsx      # presentational crown (CSS vars for angle/tension)
src/ui/components/WindingMiniGameModal.tsx
```

### Pattern 1: RAF Run With Reduced Motion "Stepping"
**What:** Drive progress from `requestAnimationFrame`; in reduced motion, update in discrete steps.
**When to use:** Winding marker progress and any JS-driven crown motion.
**Example:**
```ts
// Source: src/ui/components/WindingMiniGameModal.tsx
const stepMs = prefersReducedMotion ? STEP_MS_REDUCED_MOTION : 0;
const tick = (nowMs: number) => {
  if (startTimeRef.current === null) startTimeRef.current = nowMs;
  const elapsedMs = nowMs - startTimeRef.current;
  const normalized = clamp01(elapsedMs / RUN_DURATION_MS);
  const stepped = stepMs > 0
    ? Math.min(1, (Math.floor(elapsedMs / stepMs) * stepMs) / RUN_DURATION_MS)
    : normalized;
  setProgress(stepped);
  if (stepped < 1) rafIdRef.current = requestAnimationFrame(tick);
};
```

### Pattern 2: Modal Escape + Body Scroll Lock
**What:** Escape closes; lock body scroll while open.
**When to use:** Full-screen overlays that must prevent background scroll (mobile requirement).
**Example:**
```ts
// Source: src/ui/help/HelpModal.tsx
useEffect(() => {
  if (!open) return;
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [onClose, open]);

useEffect(() => {
  if (!open || typeof document === "undefined") return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, [open]);
```

### Anti-Patterns to Avoid
- **Changing `data-testid` values:** existing unit/E2E tests rely on `winding-modal`, `winding-track`, `winding-stop`, `winding-outcome`, `winding-done`.
- **Moving reward logic into UI:** keep rewards/cooldown in `src/game/actions/interactions.ts`.
- **Waiting for animations before calling `onComplete`:** tests and UX assume immediate result.
- **Relying on CSS animations for reduced-motion feedback:** global reduced-motion rules clamp animation/transition durations to ~0.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reward/cooldown rules | New reward tables or cooldown logic in UI | `applyWindingReward()` in `src/game/actions/interactions.ts` | Centralizes rules and keeps existing unit tests valid |
| Reduced-motion handling | Custom settings toggles | Existing `matchMedia("(prefers-reduced-motion: reduce)")` pattern in mini-games | Consistent across mini-games |
| New persistence keys for coachmarks | New localStorage keys | Existing settings persistence (if needed) | Avoids localStorage key/schema guardrail updates |

**Key insight:** Phase 42 is UX polish on an existing mini-game. Keep domain rules stable and treat the winding modal as a self-contained interaction surface.

## Common Pitfalls

### Pitfall 1: Reduced motion kills your visuals
**What goes wrong:** In reduced motion, crown spin/glow animations disappear, leaving no feedback.
**Why it happens:** `src/style.css` applies `animation-duration: 0.01ms !important` for all elements under `@media (prefers-reduced-motion: reduce)`.
**How to avoid:** Drive feedback from progress via static styling (color/glow intensity) or stepped JS updates rather than pure CSS animation.
**Warning signs:** Reduced-motion users see a frozen crown and an unreadable run.

### Pitfall 2: Band rules conflict with domain outcome types
**What goes wrong:** Over-wind needs a distinct message, but domain rewards only accept `"miss"|"good"|"perfect"`.
**Why it happens:** `InteractionOutcome` in `src/game/actions/interactions.ts` has no separate "over" outcome.
**How to avoid:** Keep `tier: "miss"` for both under/over, and carry a UI-only band enum for copy + styling.
**Warning signs:** Planner tries to change domain types (unnecessary scope) or UI cannot communicate "Over-wound!".

### Pitfall 3: RAF leaks and test flakiness
**What goes wrong:** RAF keeps running after close/stop, causing state updates after unmount and flaky tests.
**Why it happens:** Missing cancellation paths or multiple RAF loops started per open.
**How to avoid:** Centralize cancel logic; ensure stop cancels run RAF; ensure close/unmount cancels all RAF ids.
**Warning signs:** Vitest warnings about state updates on unmounted components; Playwright timeouts.

### Pitfall 4: Mobile scroll/touch quirks
**What goes wrong:** Tapping/swiping scrolls the page under the modal or produces rubber-banding that ruins timing.
**Why it happens:** Fixed overlay alone doesn't prevent body scroll; touch actions propagate.
**How to avoid:** Apply scroll lock (`document.body.style.overflow = "hidden"`) and add `touch-action: none` on the primary tap zone.
**Warning signs:** Users report accidental misses because the page moves.

### Pitfall 5: Accessibility regression from clickable divs
**What goes wrong:** The tap zone isn't keyboard-accessible (div with `onClick`).
**Why it happens:** Click handlers on non-interactive elements don't provide default keyboard behavior.
**How to avoid:** Make tap targets actual buttons; keep `aria-label`s and focus outlines intact.
**Warning signs:** Keyboard users can't stop the run; automated a11y tooling flags non-interactive click handlers.

## Code Examples

### Band Mapping (locked Phase 42 rules)
```ts
// Source: .planning/phases/42-winding-refresh/42-CONTEXT.md
type WindingBand = "under" | "good" | "perfect" | "over";

function getWindingBand(progress01: number): WindingBand {
  if (progress01 < 0.3) return "under";
  if (progress01 < 0.7) return "good";
  if (progress01 <= 0.95) return "perfect";
  return "over";
}

function getOutcomeTierFromBand(band: WindingBand): "miss" | "good" | "perfect" {
  return band === "good" ? "good" : band === "perfect" ? "perfect" : "miss";
}
```

### Current Wiring (UI -> domain rewards)
```tsx
// Source: src/App.tsx
<WindingMiniGameModal
  open={activeInteraction?.kind === "winding"}
  onComplete={(outcome) => {
    if (activeInteraction?.kind !== "winding") return;
    handlePurchase(applyWindingReward(state, activeInteraction.itemId, Date.now(), outcome.tier));
  }}
  onClose={() => setActiveInteraction(null)}
/>
```

### Test Selector Contract (keep stable)
```tsx
// Sources: tests/catalog.unit.test.tsx, tests/collection-loop.spec.ts
// These IDs are referenced directly.
data-testid="winding-modal"
data-testid="winding-track"
data-testid="winding-stop"
data-testid="winding-outcome"
data-testid="winding-done"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Constant-speed CSS spin (`.winding-crown-running`) | Progress-driven rotation speed + stop deceleration (best done via RAF) | Phase 42 | Crown "feels" like it tightens; tension/penalty zone becomes legible |
| Distance-from-center scoring | Explicit band scoring (under/good/perfect/over) | Phase 42 | Easier to message "Over-wound!" without changing domain reward tiers |

**Deprecated/outdated:**
- Winding scoring by `Math.abs(progress - 0.5)` in `src/ui/components/WindingMiniGameModal.tsx` does not match Phase 42 band rules.

## Open Questions

1. **Should the run auto-complete at 100% (and count as over-wind), or remain stoppable-only?**
   - What we know: The marker runs across the track for ~5-6s and there is an over-wind penalty zone >95%.
   - What's unclear: Whether hitting 100% should automatically stop and resolve as "Over-wound!".
   - Recommendation: Auto-resolve at 100% as over-wind (UI band "over" -> domain tier "miss"), to make the penalty zone meaningful even if the player does nothing.

2. **Should "tap here" hint persist across sessions?**
   - What we know: Context calls for a first-play hint and larger touch target.
   - What's unclear: Whether the hint is per session or persistent.
   - Recommendation: Keep it session-only unless the planner already intends to wire it into existing settings persistence (avoid introducing new localStorage keys).

## Sources

### Primary (HIGH confidence)
- `src/ui/components/WindingMiniGameModal.tsx` (current winding mini-game)
- `src/style.css` (winding crown/track styles and reduced-motion global rules)
- `src/App.tsx` (interaction modal wiring and reward application)
- `src/ui/tabs/CatalogTab.tsx` (interaction entry points + cooldown display)
- `src/game/actions/interactions.ts` and `src/game/selectors/interactions.ts` (reward/cooldown domain rules)
- `tests/catalog.unit.test.tsx` and `tests/collection-loop.spec.ts` (existing test contracts)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified in `package.json` and `pnpm-lock.yaml`
- Architecture: HIGH - code locations and wiring confirmed in `src/` and `tests/`
- Pitfalls: HIGH - reduced-motion global CSS and existing RAF patterns confirmed in code

**Research date:** 2026-02-02
**Valid until:** 2026-03-03
- `src/style.css` - winding styling and global reduced-motion overrides
- `src/ui/help/HelpModal.tsx` - Escape handling and body scroll lock pattern
- `src/game/actions/interactions.ts` - reward outcomes + cooldown, do not change
- `tests/catalog.unit.test.tsx` and `tests/collection-loop.spec.ts` - existing selector contracts for winding flow
- `.planning/phases/42-winding-refresh/42-CONTEXT.md` - locked mechanic + band definitions + animation requirements

### Secondary (MEDIUM confidence)
- None (no external ecosystem/library decisions required).

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified in `package.json`
- Architecture: HIGH - patterns verified in existing mini-game modals + HelpModal
- Pitfalls: HIGH - derived from current tests, global reduced-motion CSS, and existing RAF patterns

**Research date:** 2026-02-02
**Valid until:** 2026-03-03
