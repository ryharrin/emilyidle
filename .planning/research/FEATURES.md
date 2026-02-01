# Feature Research

**Domain:** Unified catalog/shop + vault/inventory surface (games + e-commerce patterns), applied to Emily Idle milestone v3.2
**Researched:** 2026-02-01
**Confidence:** MEDIUM (based on common UX patterns; exact affordances are product/tuning dependent)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single source of truth for purchasing (catalog cards) | When catalog is the shop, users expect one consistent purchase affordance | MEDIUM | Each card has one primary purchase CTA (or disabled state) and clearly communicates price + requirements (cash + enjoyment threshold). Remove competing Vault purchase entry points |
| Owned state is visible in the same surface as shopping | Unified catalog/storage implies you can see "do I own this?" while browsing | MEDIUM | Card shows Owned count and owned status (e.g., Owned 0/1+). Avoid forcing users to switch tabs to confirm ownership |
| Capacity-awareness at point of purchase | In inventory-limited games, users expect the UI to prevent or warn about full storage | HIGH | If vault is full, buy CTA is disabled with a clear reason and an immediate path: "Upgrade vault" / "Free space" (if freeing space exists; if not, only upgrade) |
| Vault summary is always available while shopping | When merging surfaces, "how full am I?" is table stakes | LOW | Show capacity used/max, current vault upgrade tier/level, and (if relevant) vault value in a fixed header/section on the Catalog tab |
| Item card supports both shop and owned actions | Players expect they can act on owned items from where they see them | HIGH | Owned cards surface secondary actions like equip/unequip (existing) and show equipped state. Keep the primary CTA for purchase distinct from ownership actions |
| Clear affordability and requirement messaging | Dual-currency/requirements are only acceptable if they're legible | MEDIUM | Card clearly differentiates: "Cost: $X" and "Requires: Enjoyment >= Y" (or equivalent) and highlights the blocking requirement (not enough cash vs not enough enjoyment) |
| Purchase feedback and state updates are immediate | One-tap buying expects instant UI feedback | MEDIUM | After purchase: owned count updates, vault usage updates, any new unlock state updates, and the CTA changes appropriately (e.g., Buy -> Owned/Buy again) |
| Low-friction browsing tools (sort/filter) | Unified surfaces get dense quickly; users expect ways to navigate | MEDIUM | At minimum: sort by price/owned/affordable; filter owned/unowned; keep selection stable when purchasing (no surprise scroll jumps) |
| No data loss across consolidation | Users expect their inventory, upgrades, and equipped state to survive UI changes | HIGH | Maintain save compatibility and migrate any old Vault purchase history into the new card purchase model without deleting items |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Mode-switching card layout (shop vs owned) | Keeps unified UI readable without adding more screens | MEDIUM | Cards present a compact shop view until owned, then expand/collapse to show owned controls and vault-specific info (equipped, count, contribution) |
| "Capacity coach" UX | Reduces frustration and increases upgrade conversion without dark patterns | MEDIUM | When full: show "You're full" with one-click navigation to upgrade; optionally show "X purchases until full" when near capacity |
| Purchase intent preservation | Avoids the classic "I forgot what I was shopping for" problem | LOW | After upgrading capacity, return the user to the same catalog item with the buy CTA enabled |
| Contribution/benefit explanation on owned cards | Improves comprehension of enjoyment-only multipliers and reduces mis-buying | HIGH | Owned state shows what the watch affects (enjoyment multiplier only) and where it applies. Helps support "upgrade copy" update work |
| "Affordable now" quick filter | Turns the catalog into a decision tool rather than a scroll gallery | LOW | One-tap filter or section: affordable items, with explicit reasons for ineligible items (cash vs enjoyment vs capacity) |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Two separate purchase surfaces (Catalog + Vault) | Familiar "shop + inventory" split | Duplicates logic, creates inconsistencies, and confuses "where do I buy?" | Make catalog cards the only purchase flow; vault becomes informational/management only |
| Shopping cart / multi-step checkout | Feels "proper" like e-commerce | Adds friction, increases modal complexity, and doesn't fit one-tap idle loops | One-tap buy with clear disabled states; optional confirm only for extremely expensive buys |
| Auto-buy while browsing (accidental purchases) | Convenience | Players feel tricked; hard to recover in a constrained economy | Explicit Buy CTA; optional bulk-buy affordances behind a deliberate control |
| Auto-selling / deleting items to make room | Prevents being blocked by capacity | Violates ownership expectations; risks perceived loss | Disable buy when full and route to capacity upgrade (or an explicit, reversible "manage space" action if it exists) |
| Overloading every card with too many buttons | Power users want shortcuts | Turns browsing into a cluttered control panel | Progressive disclosure: primary CTA + 1-2 secondary actions; details in expandable panel |

## Feature Dependencies

```
[Catalog cards are sole purchase flow]
    -> requires -> [Existing purchase logic (cash + enjoyment threshold)]
        -> requires -> [Clear requirement messaging]

[Vault info embedded in Catalog]
    -> requires -> [Existing vault capacity + upgrades]
        -> requires -> [Capacity-aware purchase gating]

[Owned/equipped actions on cards]
    -> requires -> [Existing watch ownership + equipped state]

[Save compatibility]
    -> requires -> [Migration of any Vault-purchase UI state into catalog-driven UX]

[Upgrade copy: enjoyment-only multipliers]
    -> requires -> [Current upgrade system behavior (enjoyment affects cash indirectly)]
```

### Dependency Notes

- **Catalog cards are sole purchase flow requires existing purchase logic:** buying remains one action (no divergent logic between tabs).
- **Vault info embedded in Catalog requires capacity-aware purchase gating:** otherwise the unified surface creates accidental deadlocks (user sees buy, but can't store).
- **Owned/equipped actions on cards requires ownership + equipped state:** card must be able to represent both "shop" and "inventory" states accurately.
- **Upgrade copy requires current upgrade system behavior:** copy must match reality (enjoyment-only multiplier) even if downstream cash changes.

## MVP Definition

### Launch With (v3.2)

- [ ] Catalog cards are the only purchase flow (Vault purchase removed) - 1:1 parity with existing purchase rules
- [ ] Vault summary (capacity used/max, upgrade status) visible on Catalog tab while browsing
- [ ] Capacity-aware purchasing (disabled buy with explanation + route to upgrade)
- [ ] Card states: unowned vs owned (owned count) vs equipped (if applicable), with minimal-but-sufficient actions
- [ ] Upgrade copy updated to "enjoyment-only multiplier" language and aligned with displayed effects
- [ ] Save compatibility preserved (migrations + UI state changes do not delete items/upgrades)

### Add After Validation (v3.2.x)

- [ ] Sort/filter quality pass (affordable/owned/unowned, price) - 1: based on playtest friction
- [ ] Progressive disclosure card layout (expand owned cards) if catalog feels too dense
- [ ] Better post-purchase feedback (micro-animations, focus retention) if users lose their place

### Future Consideration (v4+)

- [ ] Rich inventory management primitives (sell/trade/scrap) only if a strong game loop needs them
- [ ] Multiple vault types / separate storages only if content scale forces it

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Catalog cards are sole purchase flow (remove Vault purchase) | HIGH | MEDIUM | P1 |
| Vault summary embedded in Catalog | HIGH | LOW | P1 |
| Capacity-aware purchase gating + upgrade routing | HIGH | HIGH | P1 |
| Card state model (owned/equipped) + owned actions | HIGH | MEDIUM | P1 |
| Upgrade copy aligned to enjoyment-only multipliers | MEDIUM | LOW | P1 |
| Save compatibility + migration coverage | HIGH | HIGH | P1 |
| Sort/filter improvements (affordable/owned/unowned) | MEDIUM | MEDIUM | P2 |
| Progressive disclosure card layout for owned items | MEDIUM | MEDIUM | P2 |
| Contribution/benefit explanation on owned cards | MEDIUM | HIGH | P2 |
| "Capacity coach" UX | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v3.2 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Unified browse + owned state in one list | "Collection" screens that show owned/unowned with acquisition method (common in CCG/collection games) | E-commerce product listings with "in your library/owned" indicators (common in digital storefronts) | Catalog cards show Owned count + equipped state alongside Buy CTA (or disabled) |
| Capacity/limit blocking at purchase | Inventory-limited RPG shops often block purchase when over capacity | Digital storefronts rarely have capacity, but subscriptions/storage quotas show warnings | Block buy when vault is full; surface upgrade option directly from catalog |
| One-tap buying vs cart | Mobile F2P shops favor one-tap CTAs | General e-commerce uses cart/checkout | Keep one-tap buy; avoid cart; optional confirm only for edge cases |

## Sources

- Repo feature context (existing Catalog/Vault/equip/upgrade behaviors):
  - `.planning/PROJECT.md`
  - `src/ui/tabs/CatalogTab.tsx`
  - `src/ui/tabs/VaultTab.tsx`
  - `src/game/persistence.ts`
- General UX patterns (no single authoritative source; treat as MEDIUM confidence): inventory-limited shop patterns in games + owned-state indicators in digital storefronts

---
*Feature research for: unified catalog/shop + vault consolidation (Emily Idle v3.2)*
*Researched: 2026-02-01*
