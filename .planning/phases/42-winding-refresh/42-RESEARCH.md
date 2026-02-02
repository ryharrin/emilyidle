# Phase 42: Winding Refresh - Research

**Researched:** 2026-02-02
**Domain:** React UI mini-game loop (RAF), CSS animation, accessibility, mobile touch
**Confidence:** HIGH

## Summary

Phase 42 is an in-place upgrade of the existing timing-based winding modal: keep the “marker moves; click/tap to stop” loop, but change the timing (5-6s), scoring bands (under/good/perfect/over), and add a crown + tension animation that visually responds to progress and stop timing. The implementation should remain self-contained to the winding UI layer (no new libraries), preserve existing test selectors, and avoid broad refactors of other mini-games.

The codebase already establishes the mini-game pattern: a modal component owns a `requestAnimationFrame` loop, computes normalized progress, optionally “steps” progress in reduced motion, cancels RAF on close, and calls `onComplete` immediately on action. CSS provides the look; state/reward application is handled in `src/game/actions/interactions.ts` via the existing `InteractionOutcome` (`miss|good|perfect`).

**Primary recommendation:** Implement winding as a single RAF-driven run that updates both marker progress and crown rotation/tension (with a reduced-motion non-rotating fallback), keep existing `data-testid` contracts stable, and add accessibility (aria-live announcements + focus trapping + scroll lock) patterned after existing modal code.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.3.1 | UI components + state/effects | Existing app foundation |
| react-dom | 18.3.1 | DOM rendering | Existing app foundation |
| TypeScript | 5.8.x | Types + safety | Repo-wide strict TS |
| Vite | 6.0.x | Dev/build tooling | Repo build contract |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.1.0 | Unit testing UI behavior | Modal behavior + regression tests |
| @testing-library/user-event | 14.5.2 | User interaction simulation | Clicking/tapping modal controls |
| @playwright/test | 1.49.1 | E2E smoke coverage | Winding completes + rewards applied |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RAF-driven crown rotation/tension in-component | CSS-only `@keyframes` + `animation-duration` tweaks | CSS-only can’t reliably “mechanically ease to stop” from the current angle; RAF gives deterministic stop easing and is consistent with existing mini-game loops |
| Hand-rolled modal A11y hooks | A focus-trap library | Adds dependencies not currently in the repo; Phase scope favors a small local implementation |

**Installation:**
```bash
# No new packages recommended for this phase.
```

## Architecture Patterns

### Files Likely To Change (Exact)

UI + styling:
- `src/ui/components/WindingMiniGameModal.tsx` (core logic, bands, crown/tension behavior, a11y)
- `src/style.css` (winding crown size, band visuals, tension glow, reduced-motion styling, mobile touch)
- `src/App.tsx` (only if persisting the “tap hint” via existing settings/coachmarks; keep changes minimal)

Tests:
- `tests/catalog.unit.test.tsx` (unit coverage references `winding-*` testids; should remain stable)
- `tests/collection-loop.spec.ts` (E2E smoke test clicks `winding-stop` and asserts reward/cooldown)
- Optional new test file: `tests/winding-bands.unit.test.tsx` (fast regression on band mapping: 0-30 miss, 30-69 good, 70-95 perfect, >95 miss)

Supporting reference files (patterns to copy, not necessarily change):
- `src/ui/components/QuartzMiniGameModal.tsx` (RAF + reduced-motion stepping pattern)
- `src/ui/components/AutomaticMiniGameModal.tsx` (longer run duration + “test mode” shortening pattern)
- `src/ui/help/HelpModal.tsx` (Escape handling + body scroll lock pattern)
- `src/game/actions/interactions.ts` (reward mapping + cooldown; do not change for Phase 42)

### Recommended Project Structure (for new helpers)
If `src/ui/components/WindingMiniGameModal.tsx` risks exceeding ~300 LOC, split locally to keep ownership clear:
```
src/ui/components/winding/
├── windingMath.ts           # band mapping + clamp helpers
├── useWindingRun.ts         # RAF loop: progress + crown angle/velocity
└── WindingCrown.tsx         # crown markup (presentational)
src/ui/components/WindingMiniGameModal.tsx
```

### Pattern 1: RAF Run With Reduced Motion “Stepping”
**What:** Drive mini-game state from `requestAnimationFrame` with normalized progress; in reduced motion, update in discrete steps.
**When to use:** Any continuously-progressing UI interaction (winding marker movement, crown rotation).
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
**What:** On open, attach a keydown listener for Escape; lock body scroll by setting `document.body.style.overflow = "hidden"` and restore it on close.
**When to use:** Full-screen overlays that must prevent background scroll/interference (mobile requirement).
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
  return () => { document.body.style.overflow = previousOverflow; };
}, [open]);
```

### Anti-Patterns to Avoid
- **Delaying `onComplete` until animations finish:** tests and UX expect the result immediately; animate in parallel.
- **New localStorage keys for hint state:** would require updating `tests/localstorage-keys.unit.test.ts`; use `Settings.coachmarksDismissed` if persistence is needed.
- **Changing `data-testid` values:** existing unit/E2E tests rely on `winding-modal`, `winding-stop`, `winding-done`, `winding-outcome`, `winding-track`.
- **CSS-only “mechanical stop” claim:** pure CSS spin can’t guarantee easing to a stop from the current rotation; use an RAF-driven angle with a deceleration curve.

## Don't Hand-Roll

| Problem | Don’t Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reward/cooldown rules | New reward tables or cooldown logic inside UI | `applyWindingReward()` in `src/game/actions/interactions.ts` | Keeps domain rules centralized and covered by unit tests |
| Reduced-motion detection | Custom settings toggles or animation flags | `matchMedia("(prefers-reduced-motion: reduce)")` pattern already used in mini-games | Consistent behavior across modals |
| New persistence key for a coachmark | `emily-idle:winding-hint` localStorage key | Existing `Settings.coachmarksDismissed` in `src/App.tsx` | Avoids storage key contract tests and schema churn |

**Key insight:** The “winding refresh” is primarily UI/UX; keep domain unchanged and treat the modal as a self-contained interaction surface.

## Common Pitfalls

### Pitfall 1: Reduced-motion disables your “pulse” too
**What goes wrong:** A pulse implemented as CSS animation doesn’t show because global `@media (prefers-reduced-motion: reduce)` clamps all animation/transition durations.
**Why it happens:** `src/style.css` globally forces `animation-duration: 0.01ms !important` in reduced motion.
**How to avoid:** In reduced motion, use static styling that maps to progress (e.g., stronger glow as you near 70-95%) or a stepped JS toggle (no CSS animation dependence).
**Warning signs:** Reduced-motion users see a frozen crown with no other feedback.

### Pitfall 2: Test flakiness from time-based behavior
**What goes wrong:** Tests become flaky if they rely on waiting 5-6 seconds or if the modal continues RAF after closing.
**Why it happens:** RAF loops are time-dependent; closing/unmount without cancellation causes state updates after unmount.
**How to avoid:** Keep the “stop” action immediate and deterministic; cancel RAF on stop/close; avoid “auto-stop after duration” UX that hides results behind timeouts.
**Warning signs:** Vitest warnings about state updates on unmounted components; Playwright timeouts.

### Pitfall 3: Over-wind band conflicts with existing tier type
**What goes wrong:** UI needs a distinct “Over-wound!” message, but domain rewards only accept `miss|good|perfect`.
**Why it happens:** `InteractionOutcome` in `src/game/actions/interactions.ts` has no “overwind” tier.
**How to avoid:** Keep `tier` as `miss` for both under- and over-wind, but carry an additional UI-only band label (`"under"|"good"|"perfect"|"over"`) for copy + styling.
**Warning signs:** UI displays “Miss” with no indication why, or planner attempts to change domain outcome types.

### Pitfall 4: Mobile scroll interference
**What goes wrong:** Swiping while the mini-game is active scrolls the page behind the overlay, or triggers rubber-banding.
**Why it happens:** Fixed overlays don’t automatically prevent scroll; touch input can scroll the body.
**How to avoid:** Apply the HelpModal body overflow lock pattern and set `touch-action: none` on the primary interaction surface (track + crown hit area).
**Warning signs:** Player can “miss” because the page moved during the tap.

## Code Examples

### Band Mapping (Phase 42 rules)
```ts
// Source: .planning/phases/42-winding-refresh/42-CONTEXT.md
// Map progress (0..1) to an outcome tier plus a UI band label.
type WindingBand = "under" | "good" | "perfect" | "over";

function getWindingBand(progress: number): WindingBand {
  if (progress < 0.3) return "under";
  if (progress < 0.7) return "good";
  if (progress <= 0.95) return "perfect";
  return "over";
}

function getOutcomeTierFromBand(band: WindingBand): "miss" | "good" | "perfect" {
  return band === "good" ? "good" : band === "perfect" ? "perfect" : "miss";
}
```

### Stable Test Selectors
```tsx
// Source: tests/catalog.unit.test.tsx + tests/collection-loop.spec.ts
// Keep these stable across Phase 42.
<div data-testid="winding-modal" />
<div data-testid="winding-track" />
<button data-testid="winding-stop" />
<div data-testid="winding-outcome" />
<button data-testid="winding-done" />
```

### Persisting “Tap Hint” Without New Storage Keys
```ts
// Source: src/App.tsx (Settings.coachmarksDismissed)
// Prefer storing a dismissal flag under coachmarksDismissed.
// Example key: "winding:tap-hint".
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only spin (`.winding-crown-running`) at constant speed | Crown rotation speed varies by progress and eases to stop (likely RAF-driven) | Phase 42 | “Feels like winding” and visually communicates tension + penalty zone |
| 4s linear run + center-based distance scoring | 5-6s run + explicit under/good/perfect/over bands | Phase 42 | Clearer player intent and teaches over-wind avoidance |

**Deprecated/outdated:**
- “Distance from 0.5” scoring for winding (`getOutcomeTier(progress)` in `src/ui/components/WindingMiniGameModal.tsx`) should be replaced by Phase 42 band rules.

## Open Questions

1. **What exactly counts as “input pace” given the locked timing mechanic?**
   - What we know: The mechanic remains “marker moves; click/tap to stop,” with a total run of 5-6 seconds.
   - What’s unclear: “Pace control” typically implies multi-input control, but Phase 42 defers hold/drag mechanics.
   - Recommendation: Treat “pace” as *perceived pace* via crown rotation speed curve + tension indicator that responds continuously to progress, and treat “amount” as stop position.

2. **Should the first-play tap hint persist across sessions?**
   - What we know: Context requests a “tap-hint on first play.”
   - What’s unclear: Whether “first play” means per session, per modal-open, or persisted.
   - Recommendation: Persist via `Settings.coachmarksDismissed["winding:tap-hint"]` (no new keys), but keep Phase 42 changes to `src/App.tsx` minimal.

## Sources

### Primary (HIGH confidence)
- `src/ui/components/WindingMiniGameModal.tsx` - current loop, selectors, reduced-motion stepping
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
