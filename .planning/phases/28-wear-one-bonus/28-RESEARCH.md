# Phase 28: Wear-One Bonus - Research

**Researched:** 2026-01-27
**Domain:** Single-slot equipment state + enjoyment-rate modifier + Vault UI + Stats breakdown integration
**Confidence:** HIGH

## Summary

Phase 28 is a small but cross-cutting feature: a new persisted state field (worn watch), a pure selector that converts that state into an enjoyment-rate modifier, UI affordances in the Vault (Collection tab) to set/clear it, and a Stats breakdown line item to make the bonus player-visible.

This codebase already has strong patterns for:
- Persisted state evolution without bumping save version (via `sanitizeState()` in `src/game/persistence.ts` and `createStateFromSave()` in `src/game/model/state.ts`)
- Rate breakdown term composition (`getEnjoymentRateBreakdown()` in `src/game/selectors/index.ts`) and `<details>` rendering (`src/ui/tabs/StatsTab.tsx`)
- Modal UI patterns (`nostalgia-modal` in `src/ui/tabs/NostalgiaTab.tsx`) and contextual explanation via `ExplainButton` + `HelpModal` (`src/ui/help/*`)

The critical planning insight: this repo's save loading intentionally drops unknown keys. If you add `wornWatchId` to `GameState` but forget to thread it through `sanitizeState()` + `PersistedGameState` + `createStateFromSave()`, the equip selection will silently never persist across reloads.

**Primary recommendation:** Implement `state.wornWatchId: WatchItemId | null` as a persisted field, derive an enjoyment multiplier via a selector, and add it as a conditional multiplier term in `getEnjoymentRateBreakdown()` (omit entirely when `null`).

## Standard Stack

### Core

| Library/Tool | Version | Purpose | Why Standard (in this repo) |
|---|---:|---|---|
| React | ^18.3.1 | UI | Existing UI architecture |
| TypeScript | ^5.8.0 | Types | `strict: true`, state modeled as TS types |
| Vite | ^6.0.0 | Dev/build | Repo standard |
| Vitest | ^1.6.0 | Unit tests | Existing suite for selectors/persistence |
| Playwright | ^1.49.1 | E2E tests | Existing suite uses `data-testid` and save seeding |

### Supporting

| Library/Tool | Version | Purpose | When to Use |
|---|---:|---|---|
| Testing Library React + user-event | ^16.1.0 / ^14.5.2 | Component/unit tests | If adding modal UI unit tests (optional) |
| lucide-react | 0.563.0 | Icons | If you need an equip icon (optional); badges can be pure text |

**Installation:** already present (no new deps needed).

## Architecture Patterns

### Recommended Project Structure (for this phase)

Follow existing domain/UI split:

- Domain state/types: `src/game/model/types.ts`, `src/game/model/state.ts`
- Persistence sanitization: `src/game/persistence.ts`
- Pure selectors: `src/game/selectors/*` (or `src/game/selectors/index.ts` if small)
- Pure actions: `src/game/actions/index.ts`
- Vault UI: `src/ui/tabs/CollectionTab.tsx`
- Stats breakdown UI: `src/ui/tabs/StatsTab.tsx`
- Help content: `src/ui/help/helpContent.ts`

### Pattern 1: Persisted optional field with sanitize + restore

**What:** Add a new field that survives save/load by updating:
1) `GameState` type
2) `PersistedGameState` type
3) `sanitizeState()` whitelist
4) `createInitialState()` default
5) `createStateFromSave()` restore + validation

**When to use:** Any new player-choice state (like equipment) that must persist.

**Example (existing pattern):**
- `src/game/persistence.ts` builds `PersistedGameState` explicitly (drops unknown keys).
- `src/game/model/state.ts` restores with defaulting + validation.

**Prescriptive guidance for worn watch:**
- Store: `wornWatchId: WatchItemId | null` on `GameState`
- Persisted input: `wornWatchId?: string` (then validate to `WatchItemId`)
- Restore rule: if `wornWatchId` is not a valid `WatchItemId` OR player doesn't own that watch anymore, restore as `null`

### Pattern 2: Rate breakdown term lists + Stats `<details>`

**What:** Keep rate math in selectors; UI just renders term arrays.

- Enjoyment breakdown lives in `getEnjoymentRateBreakdown()` (`src/game/selectors/index.ts`)
- UI renders `multiplierTerms` list (`src/ui/tabs/StatsTab.tsx`)

**When to use:** Any "player-visible bonus" that must appear in breakdowns.

**Prescriptive guidance for worn watch bonus:**
- Implement a selector `getWornWatchEnjoymentMultiplier(state): number` (returns `1` when no worn watch)
- Update `getEnjoymentRateCentsPerSec()` (in `src/game/selectors/enjoyment.ts`) to multiply by worn multiplier
- Update `getEnjoymentRateBreakdown()` to conditionally insert a term like:
  - `id: "worn-watch"`
  - `label: "Worn watch"`
  - `multiplier: <computed>`
- Omit the term entirely if `state.wornWatchId === null` (per context decision)

### Pattern 3: Vault cards + action row

**What:** The Vault watch list is a card stack of watch cards with `card-actions` buttons.

**When to use:** Add "Wear" as a first-class, one-click action alongside other watch actions.

**Prescriptive guidance:**
- Add a `Wear` button inside the existing `card-actions` row
- Only render it when `owned > 0` (per decision: hide wear control for unowned)
- Add an "Equipped" badge on the worn card (simple `span` patterned after existing badges)

### Pattern 4: Simple modal overlay (no new system)

**What:** This repo uses an in-tab modal overlay pattern (`nostalgia-modal`).

**When to use:** "Change" should open a picker modal listing owned watches (+ "Wear none").

**Prescriptive guidance:**
- Reuse the same structural pattern:
  - overlay div: `className="nostalgia-modal"` (or a new `wear-modal` class if desired)
  - inner card: `className="nostalgia-modal-card"`
  - close via "Cancel" button
- For selection UX, a button list with an active class is consistent with existing Help section list buttons; optionally add `role="radiogroup"` semantics.

### Anti-Patterns to Avoid

- Forgetting persistence whitelist: If `sanitizeState()` doesn't include `wornWatchId`, equip never persists.
- Only updating breakdown, not rate math: If you add the breakdown term but don't update `getEnjoymentRateCentsPerSec()`, Stats summary and sim accrual won't match the breakdown.
- Showing a neutral x1.00 line: Context decision explicitly says omit when wear none.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Save migration for new field | New save version + migration system | Keep save version `2`, extend `sanitizeState()` + `createStateFromSave()` | Repo supports additive fields without bumping version |
| Modal framework | New modal manager | Copy the existing modal overlay structure from Nostalgia | Consistent UI + less risk |
| Rate breakdown rendering | Special-case UI calculations | Add a term in `getEnjoymentRateBreakdown()` | Keeps Stats tab dumb and consistent |

**Key insight:** In this repo, persistence is not automatic - loading is a strict sanitization pass. Treat it as schema evolution, not free-form JSON.

## Common Pitfalls

### Pitfall 1: Equip selection disappears after reload

**What goes wrong:** User equips a watch, refreshes, and it's gone.

**Why it happens:** `sanitizeState()` drops fields it doesn't explicitly copy into `PersistedGameState`.

**How to avoid:** Add `wornWatchId` to:
- `PersistedGameState` (`src/game/model/types.ts`)
- `sanitizeState()` (`src/game/persistence.ts`)
- `createInitialState()` + `createStateFromSave()` (`src/game/model/state.ts`)

### Pitfall 2: Equipped watch is invalid (not owned)

**What goes wrong:** State references a worn watch with `owned === 0` (e.g., after dismantle/prestige changes).

**Why it happens:** Actions that change `items` don't automatically enforce equipment invariants.

**How to avoid (prescriptive):**
- Add a selector `getWornWatchId(state)` that returns `null` unless `getItemCount(state, id) > 0`
- In `createStateFromSave()`, clear worn watch if not owned
- In actions that can remove items (`dismantleItem`, prestige resets that zero `items`), clear `wornWatchId` if it becomes invalid

### Pitfall 3: Breakdown mismatch vs accrual

**What goes wrong:** Enjoyment/sec displayed doesn't equal breakdown base * multipliers.

**Why it happens:** Bonus applied in breakdown but not in `getEnjoymentRateCentsPerSec()` (or vice versa).

**How to avoid:** Define one selector `getWornWatchEnjoymentMultiplier()` and reuse it in both places.

### Pitfall 4: Unstable test selectors

**What goes wrong:** E2E becomes flaky or breaks with minor UI changes.

**Why it happens:** No stable `data-testid` for wear/change controls.

**How to avoid:** Follow existing naming conventions (`vault-buy-*`, `purchase-gate-*`).

## State of the Art (in this repo)

| Old Approach | Current Approach | Impact |
|---|---|---|
| Implicit UI-only state | Persisted `GameState` with strict load sanitization | All new gameplay-affecting state must be threaded through persistence explicitly |
| Rate display without breakdown | Selector-level breakdown exports + `<details>` | New bonuses should be expressed as breakdown terms, not hidden math |

## Test Strategy

### Unit (Vitest)

Add/extend tests to cover:

1) Selector math + visibility
- When `wornWatchId === null`, `getEnjoymentRateBreakdown().multiplierTerms` should NOT include `id === "worn-watch"`
- When worn, it SHOULD include `id === "worn-watch"` and `multiplier > 1`
- `breakdown.effectiveCentsPerSec` should continue matching selector-derived enjoyment rate (existing invariant test pattern)

2) Persistence roundtrip
- Encode/decode a seeded state containing a worn watch id
- Assert `decoded.save.state.wornWatchId` is preserved (or normalized to null if invalid)

3) Actions invariant (optional but valuable)
- `wearWatch` equips only if owned; setting a new worn id replaces previous; `wearWatch(null)` clears
- Dismantle last copy of worn watch clears worn state (if handled in dismantle logic)

### E2E (Playwright)

Add a dedicated spec that asserts end-to-end UX:
- Seed or buy a watch
- Wear it via Vault card button (`vault-wear-starter`)
- Verify summary card shows worn watch + worn card shows "Equipped" badge
- Navigate to Stats, expand enjoyment breakdown, assert "Worn watch" line appears
- Switch worn watch, assert badge moves and breakdown updates immediately

Recommended new test ids:
- `data-testid="worn-watch-card"` (summary card)
- `data-testid="worn-watch-change"` (opens modal)
- `data-testid="worn-watch-clear"` (wear none)
- `data-testid="worn-watch-modal"`
- `data-testid={\`worn-watch-option-${id}\`}`

## Open Questions

1) Exact numeric values per archetype
- Recommendation: pick conservative multipliers (e.g., +5/+10/+15/+20% enjoyment), centralize in a single data map.

2) Multiplier vs addend presentation
- Recommendation: use a multiplier term to match existing enjoyment breakdown shape.

## Sources

Primary (HIGH confidence):
- `src/game/persistence.ts` (save v2 sanitization)
- `src/game/model/types.ts`, `src/game/model/state.ts` (GameState + restore patterns)
- `src/game/selectors/enjoyment.ts`, `src/game/selectors/index.ts` (enjoyment rate math + breakdown)
- `src/ui/tabs/CollectionTab.tsx` (Vault list + card actions)
- `src/ui/tabs/StatsTab.tsx` (breakdown rendering)
- `src/ui/help/ExplainButton.tsx`, `src/ui/help/HelpModal.tsx`, `src/ui/help/helpContent.ts` (Explain + Help)
- `tests/rate-breakdowns.unit.test.ts` (breakdown invariant pattern)
- `src/ui/tabs/NostalgiaTab.tsx` (modal overlay pattern)

Secondary:
- None required for this phase.
