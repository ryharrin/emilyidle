# Phase 44: Interaction Feedback & Rewards - Research

**Researched:** 2026-02-03
**Domain:** React interaction mini-game modals (winding/quartz/automatic), reward math + test coverage
**Confidence:** HIGH

## Summary

Phase 44 is primarily an alignment phase: the three interaction mini-games already exist as separate React modals with their own local “Miss/Good/Perfect” outcome state, and the game domain already has interaction reward application functions and cooldown enforcement. The main planning risk is divergence: right now the UI and domain reward constants are duplicated and (for quartz) contradictory, so players may see one reward label but receive a different state delta.

The standard approach for planning this phase well is to centralize *outcome tier semantics* and *reward computation* into a single pure domain module, then have each modal render a shared “Outcome” presentation fed by that domain output. Tests should assert that the outcome UI remains absent/hidden during the running animation and only appears after the run ends (stop click for winding/quartz; timer completion for automatic), and should assert *exact numeric deltas* so that reward math cannot silently drift.

**Primary recommendation:** Move interaction reward computation + display strings behind one shared helper (domain-owned, pure), and have all three modals render the same outcome component with the same tier labels and deterministic numeric deltas.

## Standard Stack

### Core
| Library | Version (repo) | Purpose | Why Standard |
|---------|----------------|---------|--------------|
| React | 18.3.1 | UI components + state | Established baseline for this codebase (`package.json`) |
| TypeScript | 5.8.x | Type safety | Repo runs `strict: true` |
| Vite | 6.x | Dev/build tooling | Repo uses Vite scripts + ESM |

### Supporting
| Library | Version (repo) | Purpose | When to Use |
|---------|----------------|---------|-------------|
| Vitest | 1.6.0 | Unit tests | Regression guardrails for outcome visibility + reward strings |
| @testing-library/react | 16.1.0 | Component/system tests in jsdom | Modal visibility + DOM contracts |
| @testing-library/user-event | 14.5.2 | Interaction simulation | Clicking stop/set/done flows |
| @testing-library/jest-dom | 6.6.4 | DOM matchers | `toBeVisible`, `toHaveTextContent`, etc |
| @playwright/test | 1.49.1 | E2E flow verification | One scenario across quartz → winding → automatic |

**Installation:**
```bash
pnpm install
```

## Architecture Patterns

### Recommended Project Structure
Focus changes in these layers (keep domain and UI aligned):

```
src/
├── game/
│   ├── actions/interactions.ts      # applies rewards + cooldown (pure)
│   ├── selectors/interactions.ts    # availability + power reserve (pure)
│   └── format.ts                    # money formatting
└── ui/components/
    ├── WindingMiniGameModal.tsx
    ├── QuartzMiniGameModal.tsx
    ├── AutomaticMiniGameModal.tsx
    └── winding/                     # winding-specific telemetry + math
tests/
├── *.unit.test.ts(x)                # Vitest + Testing Library
└── *.spec.ts                        # Playwright
```

### Pattern 1: Modal owns the run; App owns reward application
**What:** Each mini-game modal runs its own animation/telemetry and reports an outcome `{ tier, performance }` via `onComplete`. `src/App.tsx` applies the reward via a pure domain action and then closes the modal.

**When to use:** Always. Keep UI/animation state local; keep state transitions in `src/game/actions/*`.

**Example:**
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

### Pattern 2: Domain actions enforce availability + cooldown
**What:** Reward application checks `isInteractionAvailable` and sets `interactionNextAvailableAtMsByItem[itemId]` to gate repeated interactions.

**When to use:** Always. UI should not try to replicate cooldown rules.

**Example:**
```ts
// Source: src/game/actions/interactions.ts
export function applyWindingReward(state, itemId, nowMs, outcome) {
  if (!isInteractionAvailable(state, itemId, nowMs)) return state;
  // apply delta
  return setInteractionCooldown(state, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}
```

### Pattern 3: Outcome visibility is gated by `result` state
**What:** Outcome UI is rendered only once `result !== null`.

**When to use:** For all three modals to satisfy WATCH-05 (“clear success/failure states”) while keeping outcome hidden during the run.

**Example:**
```tsx
// Source: src/ui/components/WindingMiniGameModal.tsx
{result && (
  <div className={`winding-outcome winding-outcome-${result.tier}`} data-testid="winding-outcome">
    ...
  </div>
)}
```

### Anti-Patterns to Avoid
- **Duplicating reward constants in UI and domain:** Already causes divergence (see `src/ui/components/QuartzMiniGameModal.tsx` vs `src/game/actions/interactions.ts`). Put reward math in one place.
- **Randomness inside UI that tests must assert against:** Quartz generates a random target time; tests that assert exact tier/reward need deterministic control.
- **UI enforcing cooldown math:** Always use `isInteractionAvailable` + `setInteractionCooldown` in domain.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom `$` string builder | `formatMoneyFromCents` (`src/game/format.ts`) | Avoids rounding/locale drift |
| Timer/RAF test control | Ad-hoc sleeps / real-time waits | Vitest fake timers + `vi.advanceTimersToNextFrame` | Deterministic animation-driven tests |
| E2E waiting | Manual polling | Playwright web-first assertions (`await expect(locator).toBeVisible()`) | Eliminates flaky timing assumptions |

**Key insight:** The risk is not UI polish; it’s mismatch between what the UI *says* and what state deltas *actually* apply. Centralize reward computation and export it so UI + tests cannot drift.

## Common Pitfalls

### Pitfall 1: Quartz reward mismatch (UI vs domain vs help text)
**What goes wrong:** Quartz modal currently displays enjoyment rewards (`QUARTZ_ENJOYMENT_BY_TIER_CENTS` in `src/ui/components/QuartzMiniGameModal.tsx`) while domain `applyQuartzReward` applies a different set of enjoyment deltas, and help text claims quartz pays a cash burst.
**Why it happens:** Reward math is duplicated across layers.
**How to avoid:** Define a single reward computation helper (pure) and have both UI and `apply*Reward` consume it.
**Warning signs:** UI reward labels don’t match localStorage `state.currencyCents` / `state.enjoymentCents` changes in tests.

### Pitfall 2: Flaky tests due to randomness + RAF
**What goes wrong:** Quartz uses `Math.random()` to choose a target time; both quartz and automatic advance via `requestAnimationFrame`, which can be timing-sensitive in jsdom.
**Why it happens:** Non-deterministic inputs (RNG) and real timers.
**How to avoid:** In unit tests, mock RNG and use Vitest fake timers; for RAF, prefer `vi.advanceTimersToNextFrame`.
**Warning signs:** Tests pass locally but fail in CI, or tier outcomes vary run-to-run.

### Pitfall 3: Outcome visibility contract breaks during refactors
**What goes wrong:** Outcome UI appears early (during animation) or remains visible after reopening the modal.
**Why it happens:** `result` not reset on open/close, or outcome container rendered unconditionally.
**How to avoid:** Reset `result` on open transitions; assert this in unit tests for all three modals.
**Warning signs:** `*-outcome` testid exists immediately after open.

## Code Examples

### Unit test contract: outcome hidden until stop
```tsx
// Source: tests/winding-modal-a11y.unit.test.tsx
expect(screen.queryByTestId("winding-outcome")).toBeNull();
await user.click(screen.getByTestId("winding-stop"));
await screen.findByTestId("winding-outcome");
```

### Vitest fake timers for animation-driven code
```ts
// Source: https://github.com/vitest-dev/vitest/blob/main/docs/api/vi.md
import { vi } from "vitest";

vi.useFakeTimers();
// ... schedule requestAnimationFrame work ...
vi.advanceTimersToNextFrame();
vi.useRealTimers();
```

### Playwright visibility assertions for outcome reveal
```ts
// Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-locatorassertions.md
await expect(page.getByTestId("winding-outcome")).toBeHidden();
await page.getByTestId("winding-stop").click();
await expect(page.getByTestId("winding-outcome")).toBeVisible();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UI-only reward constants | Domain-owned reward helpers consumed by UI + actions | Recommended for Phase 44 | Prevents UI/state divergence, enables deterministic tests |
| Manual waits in E2E | Web-first assertions (`toBeVisible`, `toBeHidden`) | Current Playwright best practice | Reduces flakiness |

**Deprecated/outdated:**
- Relying on `isVisible()` / manual polling in Playwright instead of `await expect(locator).toBeVisible()`.

## Open Questions

1. **What is the canonical “reward payload” each interaction should report and display?**
   - What we know: Phase context requires asserting numeric enjoyment/cash values alongside tier labels; current domain actions only change enjoyment for winding/quartz and reserve for automatic.
   - What’s unclear: Whether quartz should truly grant `currencyCents` (matches help text) and whether winding/automatic should also have a cash component (could be 0).
   - Recommendation: Define a single `InteractionRewardBreakdown` with `{ enjoymentCentsDelta, currencyCentsDelta, powerReserveDelta? }` and always display both numeric deltas (0 allowed) so tests can assert them.

2. **What tier-scaling formula should be used for WATCH-06?**
   - What we know: Watch “tiers” exist as `WatchItemId` buckets with strong progression signals (`basePriceCents`, `incomeCentsPerSec`, `enjoymentCentsPerSec`).
   - What’s unclear: Which property should drive scaling and how aggressive the scaling should be.
   - Recommendation: Use a pure helper keyed by `WatchItemId` (bucket) so scaling is deterministic, testable, and easy to tune (and doesn’t require touching UI).

## Sources

### Primary (HIGH confidence)
- `package.json` - library versions used by repo
- `src/ui/components/WindingMiniGameModal.tsx` - outcome gating + copy
- `src/ui/components/QuartzMiniGameModal.tsx` - RNG target + outcome rendering
- `src/ui/components/AutomaticMiniGameModal.tsx` - timer-completion outcome rendering
- `src/game/actions/interactions.ts` - canonical reward application + cooldown
- `tests/winding-modal-a11y.unit.test.tsx` - unit test pattern for outcome-hidden contract
- `tests/collection-loop.spec.ts` - existing E2E patterns for winding + automatic

### Primary (HIGH confidence, external)
- /vitest-dev/vitest - fake timers and `vi.advanceTimersToNextFrame`
- /microsoft/playwright - locator assertions `toBeHidden` / `toBeVisible`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from `package.json`
- Architecture: HIGH - derived from current modal/action code paths
- Pitfalls: HIGH - directly observed divergences + existing test patterns

**Research date:** 2026-02-03
**Valid until:** 2026-03-05
