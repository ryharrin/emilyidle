# Phase 23: Prestige Confirmation & Re-Onboarding - Research

**Researched:** 2026-01-26
**Domain:** React UI flows for prestige resets + in-game state transitions
**Confidence:** HIGH

## Summary

Phase 23 is primarily a UI/UX layer over existing prestige actions (`prestigeWorkshop`, `prestigeMaison`, `prestigeNostalgia`). The core game logic already cleanly expresses what resets/keeps/gains for each prestige tier, and Nostalgia already has a dedicated confirmation modal plus a persisted “reset complete” results card. Workshop and Maison already use a two-step “armed” confirm pattern, but they do not provide a structured lose/keep/gain summary nor any post-prestige re-onboarding guidance.

Planning should focus on (1) a consistent confirmation experience that explicitly lists **Gain / Keep / Lose** and (2) a lightweight “what now?” re-onboarding surface shown immediately after a prestige. Because the constraint is “no save schema changes,” any new post-prestige results state should be **UI-only** (React state in `src/App.tsx`) except for Nostalgia, which already persists `nostalgiaLastGain`/`nostalgiaLastPrestigedAtMs`.

**Primary recommendation:** Implement a shared, data-driven prestige summary (Gain/Keep/Lose) sourced from the existing actions’ semantics, and show a post-prestige “Next actions” card/modal driven by UI state set in `src/App.tsx` when a prestige purchase occurs.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI rendering | Existing app stack |
| react-dom | ^18.3.1 | DOM bindings | Existing app stack |
| vite | ^6.0.0 | Dev/build tooling | Existing app stack |
| typescript | ^5.8.0 | Type safety | Existing app stack |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @playwright/test | ^1.49.1 | E2E tests | Add coverage for modal/back-out flows |
| vitest | ^1.6.0 | Unit tests | Add unit tests for prestige summary computation helpers |
| @testing-library/react | ^16.1.0 | Component tests | If adding UI behavior tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Ad-hoc overlays (`.nostalgia-modal`) | Dialog libraries (Radix, Headless UI) | Not used elsewhere; would add dependency + styling work |

**Installation:**
```bash
# No new libraries required for Phase 23.
```

## Architecture Patterns

### Recommended Project Structure
Keep domain logic pure and UI-only state in `src/App.tsx`:

```
src/
├── ui/
│   ├── tabs/
│   │   ├── WorkshopTab.tsx
│   │   ├── MaisonTab.tsx
│   │   └── NostalgiaTab.tsx
│   └── (optional) components/
│       └── PrestigeSummary.tsx   # pure presentational
└── game/
    ├── actions/index.ts          # prestige state transitions
    └── selectors/index.ts        # prestige gain calculations
```

### Pattern 1: Two-step “Armed” Confirmation (Workshop/Maison)
**What:** Local UI boolean toggles into a confirm/cancel control group.
**When to use:** Lightweight confirmations embedded in a panel.
**Example:**
```tsx
// Source: src/ui/tabs/WorkshopTab.tsx
{workshopResetArmed ? (
  <div className="workshop-confirm">
    <button onClick={() => {
      onPurchase(prestigeWorkshop(state, workshopPrestigeGain));
      onToggleWorkshopResetArmed(false);
    }}>Confirm reset</button>
    <button className="secondary" onClick={() => onToggleWorkshopResetArmed(false)}>Cancel</button>
  </div>
) : (
  <button className="secondary" onClick={() => onToggleWorkshopResetArmed(true)}>Reset atelier</button>
)}
```

### Pattern 2: Full-screen Overlay Modal (Nostalgia)
**What:** A fixed overlay with `role="dialog"` + `aria-modal="true"` and a card inside.
**When to use:** High-impact actions needing more explanation.
**Example:**
```tsx
// Source: src/ui/tabs/NostalgiaTab.tsx
{nostalgiaModalOpen && (
  <div className="nostalgia-modal" data-testid="nostalgia-modal" role="dialog" aria-modal="true">
    <div className="nostalgia-modal-card">
      <h3>Confirm nostalgia prestige</h3>
      <button onClick={() => {
        onPurchase(prestigeNostalgia(state, Date.now()));
        onToggleNostalgiaModal(false);
      }}>Confirm reset</button>
      <button className="secondary" onClick={() => onToggleNostalgiaModal(false)}>Cancel</button>
    </div>
  </div>
)}
```

### Pattern 3: Persisted “Reset Complete” Results (Nostalgia)
**What:** Post-prestige UI shown when `state.nostalgiaLastGain > 0` and dismissed via UI state.
**When to use:** Re-onboarding summary without adding new persistence.
**Example:**
```tsx
// Source: src/ui/tabs/NostalgiaTab.tsx
{state.nostalgiaLastGain > 0 && !nostalgiaResultsDismissed && (
  <div className="nostalgia-results" data-testid="nostalgia-results">
    <h4>Reset complete</h4>
    <p>+{state.nostalgiaLastGain} Nostalgia · New total {state.nostalgiaPoints}</p>
    <button className="secondary" onClick={onDismissResults}>Back to progress</button>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Adding new persisted fields for “last prestige”:** Constraint is “avoid save schema changes.” If Workshop/Maison need results UI, keep it in React state.
- **Introducing a new modal library:** Existing code uses simple overlays and test IDs; keep consistency.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Prestige semantics (what resets/keeps) | New bespoke rules | Derive directly from existing actions | Avoid drift between UI promises and game logic |
| Post-prestige persistence | New save schema fields | UI-only `useState` in `src/App.tsx` (or Nostalgia’s existing persisted fields) | Avoid migration work + schema coupling |
| Confirmation UI patterns | New patterns per tab | Reuse existing “armed confirm” and `.nostalgia-modal` overlay patterns | Keeps UX consistent; minimizes CSS/test churn |

**Key insight:** The “truth” of prestige is already encoded in `src/game/actions/index.ts`; the confirmation summary must stay aligned with those transitions.

## Common Pitfalls

### Pitfall 1: UI promises diverge from actual resets
**What goes wrong:** Confirmation says “keeps upgrades” or “keeps workshop upgrades” but the action resets them (e.g., `prestigeMaison` resets all `workshopUpgrades`).
**Why it happens:** Multiple prestige tiers have subtly different keep/reset sets.
**How to avoid:** Build the Gain/Keep/Lose copy from a single per-tier definition checked against the action implementation.
**Warning signs:** Tests or players report missing upgrades/lines after prestige.

### Pitfall 2: Post-prestige “results” disappears unexpectedly
**What goes wrong:** A results card is shown using UI-only state and vanishes on reload/navigation.
**Why it happens:** Workshop/Maison lack persisted “last gain” fields.
**How to avoid:** Treat Workshop/Maison re-onboarding as “immediate guidance only” (session-scoped) and make the copy explicit; for Nostalgia, rely on persisted `nostalgiaLastGain`.
**Warning signs:** Users expect the results to persist across refreshes.

### Pitfall 3: Active tab becomes hidden after prestige
**What goes wrong:** After a prestige that resets gating inputs (especially Maison/Nostalgia), a tab may no longer be eligible for visibility.
**Why it happens:** Tab visibility is computed from state in `src/App.tsx` and may change after resets.
**How to avoid:** If showing a global results modal, render it outside tab panels (in `src/App.tsx`) so it survives tab changes; otherwise ensure the tab that initiated prestige remains visible post-action.
**Warning signs:** “It kicked me back to Vault and I missed the summary.”

## Code Examples

### Detecting Prestige Type From State Transition (UI-only)
This enables a global post-prestige results modal without changing any tab props.

```ts
// Source: src/App.tsx (current handlePurchase exists)
// Pattern: compare prev and next in a functional setState.
// if (next.nostalgiaResets === prev.nostalgiaResets + 1) => nostalgia prestige
// else if (next.workshopPrestigeCount === prev.workshopPrestigeCount + 1) => workshop prestige
// else if (next.maisonHeritage > prev.maisonHeritage || next.maisonReputation > prev.maisonReputation) => maison prestige
```

### Prestige Gain Calculations (selectors)
```ts
// Source: src/game/selectors/index.ts
export function getWorkshopPrestigeGain(state: GameState): number { /* ... */ }
export function getMaisonPrestigeGain(state: GameState): number { /* ... */ }
export function getMaisonReputationGain(state: GameState): number { /* ... */ }
export function getNostalgiaPrestigeGain(state: GameState): number { /* ... */ }
```

### Prestige Resets (actions)
```ts
// Source: src/game/actions/index.ts
export function prestigeWorkshop(state: GameState, earnedPrestigeCurrency = 0): GameState { /* ... */ }
export function prestigeMaison(state: GameState): GameState { /* ... */ }
export function prestigeNostalgia(state: GameState, nowMs: number): GameState { /* ... */ }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No explicit Nostalgia confirmation/results | Nostalgia confirmation modal + persisted results (`nostalgiaLastGain`) | Present in current code | Provides a proven pattern for Phase 23 re-onboarding |
| Single-click prestige | Workshop/Maison “armed confirm” | Present in current code | Already satisfies “ability to back out,” but needs clearer summary |

**Deprecated/outdated:**
- N/A (current code already uses the intended simple patterns).

## Open Questions

1. **What exactly are PRES-01 / PRES-02 acceptance checks?**
   - What we know: Phase description requires “clear lose/keep/gain summary” + “re-onboarding summary after prestige” + “ability to back out.”
   - What's unclear: Whether this must apply to all three prestige tiers (Atelier/Maison/Nostalgia) and whether re-onboarding must persist across reloads.
   - Recommendation: Assume all three tiers; implement Workshop/Maison re-onboarding as session-scoped UI, keep Nostalgia persisted behavior.

2. **Should re-onboarding reuse Coachmarks or be a dedicated results panel?**
   - What we know: Coachmarks exist and persist dismissals in settings (`coachmarksDismissed`).
   - What's unclear: Whether re-onboarding is allowed to re-enable dismissed coachmarks.
   - Recommendation: Do not override dismissals; show a prestige-specific “Next actions” card/modal with explicit buttons to jump to relevant tabs.

## Sources

### Primary (HIGH confidence)
- `src/ui/tabs/NostalgiaTab.tsx` - Nostalgia confirmation modal + reset complete results
- `src/ui/tabs/WorkshopTab.tsx` - Armed confirm pattern
- `src/ui/tabs/MaisonTab.tsx` - Armed confirm pattern
- `src/game/actions/index.ts` - Ground truth for resets/keeps/gains per prestige
- `src/game/selectors/index.ts` - Prestige gain calculation APIs
- `src/App.tsx` - Tab visibility gating + `handlePurchase` entry point
- `src/style.css` - `.nostalgia-modal` overlay styling
- `tests/nostalgia-prestige.spec.ts` - E2E selector expectations for nostalgia modal/results

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified via `package.json`
- Architecture: HIGH - verified via current UI/action patterns
- Pitfalls: HIGH - derived from concrete state reset semantics and current gating logic

**Research date:** 2026-01-26
**Valid until:** 2026-02-25
