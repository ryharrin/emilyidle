# Pitfalls Research

**Domain:** Incremental/idle game — adding a catalog-first shop + economy overhaul + equipment bonuses + mini-games to an existing save-based architecture
**Researched:** 2026-01-27
**Confidence:** MEDIUM (grounded in current codebase patterns like `src/game/persistence.ts` + `src/game/sim.ts`)

## Critical Pitfalls

### Pitfall 1: Economy rewrite breaks save compatibility (semantic drift, not just schema drift)

**What goes wrong:** Old saves load but "feel wrong" (players lose progress, get softlocked, or skip content) because what currency, rates, and thresholds mean changed under them.

**How to avoid:**
- Define migration invariants (progress still possible in minutes, no softlocks).
- Maintain a set of golden saves (early/mid/late) and assert post-migration KPIs.
- Consider versioned economy formulas if needed to preserve prior semantics.

**Warning signs:** scattered v<->v3 conditionals across selectors/actions; playtest reports like "my money is gone".

**Phase to address:** Phase 1 (migration design).

---

### Pitfall 2: Session costs conflict with "no negative money" assumptions

**What goes wrong:** Costs silently disappear or behave inconsistently because sanitization clamps values (non-negative currency).

**How to avoid:**
- Decide: currency never below 0 (guard spends) vs explicit debt field.
- Enforce the rule in actions and in sanitization.

**Warning signs:** players can start sessions with 0 and still benefit; reload removes costs.

**Phase to address:** Phase 2 (economy rules) + Phase 1 (migration updates).

---

### Pitfall 3: Double-application (or missed application) of new cash sources/costs in the sim loop

**What goes wrong:** Income/costs apply twice per tick or not at all under offline catch-up/clamped dt.

**How to avoid:**
- Centralize rate-based earnings in one selector and apply once per step.
- Apply discrete costs only in actions (sessions, purchases).
- Define and test order-of-operations in `step()`.

**Warning signs:** small dt vs large dt produces different totals beyond rounding.

**Phase to address:** Phase 2 (economy pipeline).

---

### Pitfall 4: Catalog-first shop conflates discovery with ownership and breaks gating

**What goes wrong:** players can buy items they haven’t discovered, or can’t buy items they own.

**How to avoid:** keep separate state for discovery, ownership/inventory, and equip; base purchase eligibility on explicit rules.

**Warning signs:** UI uses discovered to render both inventory and shop.

**Phase to address:** Phase 3 (catalog shop integration).

---

### Pitfall 5: Watch model expansion causes ID churn and orphaned inventories

**What goes wrong:** legacy holdings disappear because IDs were renamed/split.

**How to avoid:** treat IDs as immutable; maintain deprecated ID mapping; test every deprecated ID migrates.

**Warning signs:** renaming IDs in `data/` without explicit migration mapping.

**Phase to address:** Phase 1 (migration scaffolding).

---

### Pitfall 6: Equip-one bonuses stack, persist incorrectly, or break prestige/reset flows

**What goes wrong:** bonuses stack across equips or persist after unequip/reset.

**How to avoid:** single equipped id enforced by actions; bonus applied in one selector path; explicitly define reset behavior.

**Warning signs:** bonus math scattered in multiple selectors.

**Phase to address:** Phase 4 (equipment).

---

### Pitfall 7: Mini-games introduce non-determinism that breaks offline progress and fairness

**What goes wrong:** outcomes vary by refresh/frame rate; players reroll rewards.

**How to avoid:** seeded RNG tied to persisted run id; persist in-flight mini-game state; grant rewards once as discrete actions.

**Warning signs:** "I can reroll rewards by refreshing".

**Phase to address:** Phase 5 (mini-games).

---

### Pitfall 8: Sanitizer/migration omissions drop new fields or accept corrupted ones

**What goes wrong:** new fields reset each reload or corrupted saves creep in.

**How to avoid:** round-trip encode/decode tests; strict sanitize coverage for v3 fields.

**Phase to address:** Phase 1 + ongoing.

---

### Pitfall 9: UI-driven logic leaks into the pure domain layer

**What goes wrong:** actions/selectors depend on UI-only state (filters, current tab), creating impossible states.

**How to avoid:** keep UI state ephemeral; keep selectors/actions pure (no browser APIs).

**Phase to address:** Phase 3 (catalog shop UX) + guardrails.

---

### Pitfall 10: Rebalancing breaks prestige pacing and invalidates progression layers

**What goes wrong:** prestige thresholds become unreachable or trivial after economy shift.

**How to avoid:** define target time-to-prestige bands; validate with golden saves; recalibrate thresholds with new economy.

**Phase to address:** Phase 6 (balancing + regression).

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|--------|------------------|--------------|
| Economy semantic drift breaks saves | Phase 1 | Golden saves load; KPI assertions pass |
| Session costs vs non-negative currency | Phase 2 | Can’t start without funds (or debt tracked); reload doesn’t remove penalties |
| Double-counted sources/costs | Phase 2 | dt invariance tests |
| Discovery vs ownership conflation | Phase 3 | Tests: discovered != owned; purchase eligibility matches rules |
| ID churn orphans inventory | Phase 1 | Deprecated ID mapping coverage |
| Equip bonus stacking/reset bugs | Phase 4 | Equip idempotent; reset rules tested |
| Mini-game reroll exploits | Phase 5 | Seeded runs persist; rewards granted once |
| Sanitizer omissions | Phase 1 + ongoing | Round-trip tests include v3 fields |
| UI state leaks into domain | Phase 3 | Code review guardrails + tests |
| Prestige pacing breaks | Phase 6 | Time-to-prestige bands validated |

## Sources

- `src/game/persistence.ts` (sanitize/clamping behavior)
- `src/game/sim.ts` (rate-based tick application)
- `src/game/model/state.ts` (save->state construction)

---
*Pitfalls research for: v3.0 Catalog-First Economy & Interactions*
*Researched: 2026-01-27*
