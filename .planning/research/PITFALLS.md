# Pitfalls Research

**Domain:** Incremental/idle game UI consolidation (v3.2) — merging Catalog shopping and Vault ownership/upgrade information into a single purchase surface
**Researched:** 2026-02-01
**Confidence:** MEDIUM (grounded in this repo's constraints: save compatibility, stable `data-testid`, and a tick-driven UI that re-renders frequently)

## Critical Pitfalls

### Pitfall 1: "Two sources of truth" for ownership/value after the merge

**What goes wrong:** Catalog cards show different ownership, value, or upgrade state than the Vault (or than what the simulation actually uses), leading to mispriced purchases, wrong affordances, and "I bought it but it didn't count" reports.

**Why it happens:** The UI consolidation is done by copying Vault computations into Catalog components (or vice-versa) instead of defining one canonical selector/source and reusing it.

**How to avoid:**
- Identify the canonical state for: owned watch IDs, vault capacity/usage, upgrade level(s), computed watch value, purchase eligibility.
- Consolidate computations into selectors (domain layer) and keep Catalog components as a presentation of those selectors.
- Add targeted unit tests that compare "catalog purchase eligibility" with "domain purchase eligibility" for a few representative watches.

**Warning signs:** Same label/number is computed in multiple places; bug reports like "Vault says full but catalog lets me buy"; fixes that touch only UI.

**Phase to address:** v3.2-02 (Domain consolidation + invariants).

---

### Pitfall 2: Leaving two purchase entry points and letting them diverge

**What goes wrong:** Users can still purchase from an old Vault control path (or legacy button remains reachable) and the two flows apply slightly different rules (capacity checks, prices, side effects like toasts), creating inconsistent outcomes and exploit-y behavior.

**Why it happens:** The UI merge removes navigation but not underlying handlers/routes, and old UI is "hidden" rather than removed or hard-disabled.

**How to avoid:**
- Make a single purchase action/function the only way to buy watches; route both old and new UI (temporarily) through it.
- Hard-disable legacy purchase UI (feature flag or guard) before deleting it, and add tests to ensure it cannot be triggered.

**Warning signs:** Two different call sites for "buy"; different error messages/side effects depending on where you click; regressions that only reproduce via an old tab.

**Phase to address:** v3.2-03 (UI merge implementation) + v3.2-04 (QA/regression).

---

### Pitfall 3: Breaking muscle memory by changing location without "wayfinding"

**What goes wrong:** Players feel lost because the Vault concept (capacity, upgrades, storage) disappears as a distinct place; they stop engaging with upgrades because they can't find them.

**Why it happens:** Teams optimize for fewer tabs/screens and assume "obvious" placement inside the catalog, but the old mental model was "Vault = where storage/upgrade lives".

**How to avoid:**
- Preserve conceptual anchors: keep a clearly labeled "Vault" section/panel within Catalog, not just scattered numbers on cards.
- Add a one-time callout or inline hint the first time after upgrade: "Vault moved into Catalog".
- Keep wording consistent (still call it Vault) so search/memory works.

**Warning signs:** Playtest notes like "where did the vault go?"; fewer vault upgrades purchased; players repeatedly open/close unrelated tabs.

**Phase to address:** v3.2-01 (UX/IA design) + v3.2-04 (playtest).

---

### Pitfall 4: Turning each catalog card into a "dashboard" (cognitive overload)

**What goes wrong:** Cards become dense with vault stats (capacity, value, upgrade status, multipliers), making the primary action (buy / owned / cannot buy) harder to parse and slowing purchase decisions.

**Why it happens:** The merge is interpreted as "put everything in one place" and information is distributed across every item instead of being layered.

**How to avoid:**
- Use progressive disclosure: put global vault stats in a single header/panel; keep cards focused on item-level info.
- If you must show vault data on cards, pick one high-signal item-level cue (e.g., owned badge + current value) and avoid global stats.

**Warning signs:** Cards exceed original height significantly; key CTA is no longer above the fold on mobile; players hesitate or misclick.

**Phase to address:** v3.2-01 (UX/IA design).

---

### Pitfall 5: Purchase eligibility edge cases regress (full vault, upgrades, duplicates)

**What goes wrong:** Players can purchase when the vault is full (or get blocked incorrectly), upgrade prompts loop, or duplicate-purchase rules change unintentionally.

**Why it happens:** Old flow had implicit sequencing (go to vault, see capacity, upgrade, then buy). Consolidation can remove those guardrails and introduce race conditions between "upgrade" and "buy" affordances.

**How to avoid:**
- Define explicit purchase eligibility rules (including full vault behavior) in the domain layer.
- Design an intentional "blocked" state with a clear next action (upgrade vault / sell / cannot buy).
- Add Playwright coverage for the full-vault purchase attempt and the expected resolution path.

**Warning signs:** Manual testing finds purchases that succeed but overflow storage; support issues like "I lost a watch"; UI shows contradictory states ("Full" + "Buy").

**Phase to address:** v3.2-02 (domain rules) + v3.2-04 (E2E verification).

---

### Pitfall 6: Save compatibility breaks in subtle ways (fields preserved but meaning changes)

**What goes wrong:** Saves still load, but vault upgrades or computed values behave differently (e.g., upgrade level now affects enjoyment-only but UI still implies cash, or the same upgrade produces a different multiplier than before).

**Why it happens:** UI consolidation often triggers refactors of where upgrade state lives or how it's computed, and it's easy to "simplify" by renaming/moving fields without migration or by changing formulas to fit new copy.

**How to avoid:**
- Treat vault-related fields as part of the save contract; only change with explicit migration and invariants.
- Keep a small set of golden saves that include multiple vault upgrade levels and verify post-change values and multipliers.
- If copy changes imply formula changes, track them explicitly as economy changes (not "just UI").

**Warning signs:** Migration/sanitize code grows ad hoc; QA reports "my vault upgrade stopped working"; values differ after reload.

**Phase to address:** v3.2-02 (migration & invariants) + v3.2-04 (regression).

---

### Pitfall 7: Copy claims the wrong economic effect (cash vs enjoyment)

**What goes wrong:** Upgrade text/previews say "earn more cash" or imply the wrong multiplier target; players make decisions based on incorrect expectations, and balancing becomes harder because UX and economy drift apart.

**Why it happens:** Copy is updated late and in isolation; preview components reuse old labels that were correct pre-v3.1/31 but are now wrong.

**How to avoid:**
- Establish a "copy-to-formula contract": every upgrade preview must map to a real computed effect.
- For each upgrade, define: what it affects (enjoyment? value? capacity?), where computed, and how preview is derived.
- Add snapshot-style unit tests for upgrade preview text/values to prevent regressions.

**Warning signs:** Copy is updated without touching selectors; preview numbers are hardcoded; terms like "cash" appear in vault context.

**Phase to address:** v3.2-01 (UX/copy spec) + v3.2-03 (implementation) + v3.2-04 (review).

---

### Pitfall 8: Breaking test selectors while restructuring the UI hierarchy

**What goes wrong:** Playwright tests fail (or worse: pass but assert the wrong element) because `data-testid` moved/renamed, or the element the test relied on no longer exists.

**Why it happens:** Consolidation is often a big component shuffle; test IDs are treated as incidental attributes instead of part of the public UI contract.

**How to avoid:**
- Inventory all `data-testid` used by E2E/unit tests and treat them as API.
- Keep existing test IDs even if DOM nesting changes; add new IDs only when necessary.
- If a selector must change, change tests in the same PR/plan step and add a migration note.

**Warning signs:** "Quick" refactors touch many `data-testid`; tests updated by switching to brittle CSS selectors; failing tests fixed by increasing timeouts.

**Phase to address:** v3.2-03 (implementation) + v3.2-04 (test stabilization).

---

### Pitfall 9: Persisted navigation behavior regresses (last-tab / deep link expectations)

**What goes wrong:** Returning players land somewhere unexpected, or deep links/bookmarks no longer work, compounding the confusion created by the surface merge.

**Why it happens:** Removing a tab/surface changes routing/tab indices; persisted "last opened" logic may point to an invalid tab and fall back unpredictably.

**How to avoid:**
- Preserve existing "last tab" persistence semantics: if Vault used to be a destination, map it deterministically to Catalog + a Vault section.
- Add explicit compatibility mapping for removed tabs rather than relying on array index behavior.
- Add E2E coverage for "existing save loads into previous tab" and any known deep link behavior.

**Warning signs:** Reports like "it always opens career now" from old saves; intermittent navigation weirdness; code that uses numeric tab indices without guards.

**Phase to address:** v3.2-03 (implementation) + v3.2-04 (regression).

---

### Pitfall 10: Performance regressions from per-card derived vault computations

**What goes wrong:** Catalog becomes janky because every tick triggers re-renders of many cards doing expensive derived computations (formatting, aggregations, value calculations).

**Why it happens:** Consolidation often adds more derived data to each card; in an idle game, state changes frequently and can amplify render costs.

**How to avoid:**
- Compute heavy aggregates once (selectors) and pass to UI; avoid per-card recomputation of global stats.
- Memoize expensive formatting and avoid allocating objects in render paths.
- Verify with React devtools profiling during a running tick.

**Warning signs:** FPS drops only on Catalog; CPU spikes while idle; adding a single badge makes scroll stutter on mobile.

**Phase to address:** v3.2-03 (implementation) + v3.2-04 (performance pass).

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep the old Vault purchase flow hidden behind a debug flag | Avoids deleting code | Divergent logic; regressions when re-enabled; increases cognitive load | Only for 1 release as a rollback switch, with a hard deletion date |
| Duplicate vault computations inside Catalog components | Fast to ship UI | Two sources of truth; impossible-to-debug mismatches | Never |
| Hardcode upgrade preview numbers in UI | Quick copy alignment | Preview drifts from economy; breaks trust | Never |
| Use array indices for tab persistence after removing Vault | Minimal code change | Non-deterministic landing behavior; broken muscle memory | Never |

## Integration Gotchas

Common mistakes when connecting to external services (in this repo: persistence + test harness are the integrations that matter).

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Save/load + migration (`src/game/persistence.ts`) | UI refactor moves/renames vault fields without explicit migration | Treat vault fields as save contract; write migration + sanitize + golden-save checks |
| Playwright (`tests/**/*.spec.ts`) | Changing `data-testid` instead of preserving it | Keep IDs stable; update tests only when unavoidable and in the same change |
| Catalog asset mapping (`src/game/catalog.ts`) | Rebuilding cards changes image/layout assumptions, causing broken images or CLS | Keep existing image elements/attrs stable; keep e2e image checks in place |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-card recomputation of global vault stats | Scroll/jank on Catalog; high CPU while idle | Compute aggregates once in selectors; memoize formatting | Dozens of cards + frequent ticks (common on mobile) |
| Layout thrash from dynamic "vault panel" height changes | Content jumps; click targets move | Reserve space; avoid pushing CTA downward | Small screens; when numbers tick frequently |
| Over-eager re-render on every simulation tick | Catalog rerenders even when vault-related state didn't change | Split state slices; use memoization/selectors to narrow updates | Always, but most visible on slower devices |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Assuming localStorage values are always sane | Corrupted saves cause crashes, NaN propagation, or impossible UI states | Strict sanitize; clamp/validate; fail safe by resetting only the corrupted field, not the whole save |
| Exposing purchase actions without domain guards | UI-only gating can be bypassed (or triggered from stale UI state) | Enforce eligibility in actions; UI reflects, not enforces |
| Mixing user-facing strings with numeric logic | Localization/copy tweaks accidentally break parsing/computation | Keep numbers as data; format at the edges |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Renaming Vault concepts while also moving them | Confusion; players can't search memory | Keep vocabulary stable while changing layout |
| Hiding upgrades behind small icons inside cards | Upgrades "disappear"; engagement drops | Provide a dedicated Vault panel/section with a clear CTA |
| Switching primary CTA label/placement | Misclicks; perceived "new rules" | Keep CTA position stable; if changing label, keep iconography consistent |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Catalog as sole purchase flow:** No remaining reachable Vault purchase path (including keyboard/hidden routes) and purchase action is single-sourced.
- [ ] **Save compatibility:** Golden saves (at least one with vault upgrades) load and show identical upgrade levels and expected multipliers.
- [ ] **Selector stability:** All existing `data-testid` referenced by tests remain present and unique.
- [ ] **Blocked purchase UX:** Full-vault purchase attempt shows an intentional resolution path (upgrade/sell/can't buy), not a silent failure.
- [ ] **Copy/economy alignment:** Upgrade preview text and numbers match actual computed effects (especially enjoyment vs cash).

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Two sources of truth | HIGH | Pick one canonical selector; remove duplicate computations; add tests comparing catalog vs domain eligibility/value |
| Muscle memory confusion | MEDIUM | Add in-UI wayfinding ("Vault moved here"), restore a dedicated Vault panel in Catalog, keep naming consistent |
| Save semantic drift | HIGH | Add explicit migration + invariants; hotfix preview copy; preserve old formula behind versioned migration if needed |
| Test selector breaks | LOW | Restore previous `data-testid` attributes; adjust tests only if absolutely necessary |
| Performance regression | MEDIUM | Profile; move aggregates into selectors; memoize; reduce tick-driven rerenders on Catalog |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Two sources of truth for ownership/value | v3.2-02 | Unit tests assert catalog affordances match domain eligibility; no duplicate computations |
| Divergent purchase entry points | v3.2-03 | Grep for purchase handlers shows single purchase action; e2e covers purchase via catalog only |
| Muscle memory break without wayfinding | v3.2-01 | Playtest: users find vault upgrades quickly; "where is vault" reports drop |
| Card-level cognitive overload | v3.2-01 | Mobile view: primary CTA visible and clear; vault info discoverable without scanning every card |
| Full-vault / upgrade edge cases | v3.2-02 | E2E: full vault blocks purchase with clear resolution path |
| Save semantic drift | v3.2-02 | Golden saves + reload invariants; upgrade effects stable |
| Copy/economy misalignment | v3.2-01 | Copy spec maps to selectors; snapshot tests for previews |
| `data-testid` instability | v3.2-03 | E2E suite passes without switching to brittle selectors |
| Persisted nav regressions | v3.2-03 | E2E verifies last-tab mapping + compatibility for removed Vault tab |
| Render/perf regression | v3.2-04 | Basic profiling shows Catalog stable while ticking; no scroll stutter on mobile |

## Sources

- `.planning/PROJECT.md` (v3.2 milestone goal + constraints)
- `src/game/persistence.ts` (save compatibility + sanitize/migration patterns)
- `tests/**/*.spec.ts` (Playwright dependence on `data-testid` stability)

---
*Pitfalls research for: v3.2 Catalog/Vault Consolidation*
*Researched: 2026-02-01*
