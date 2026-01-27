# Feature Research

**Domain:** Idle/incremental watch-collecting game — v3.0 "Catalog-First Economy & Interactions"
**Researched:** 2026-01-27
**Confidence:** MEDIUM (grounded in current repo behavior + common incremental patterns; exact tuning is design-dependent)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Catalog-first purchase hub (buy from Catalog) | If "catalog-first" is the headline, players expect the catalog is the shop | HIGH | Default landing view shows a catalog grid/list; each entry has price + "Buy" CTA + owned count; clear locked/unlocked states; aligns with existing Catalog UI patterns (`src/ui/tabs/CatalogTab.tsx`) but adds purchase affordances |
| Default view = Catalog (or Catalog-centric hub) | Players expect the "main loop" screen on load | MEDIUM | App currently defaults to Collection (`src/App.tsx` activeTab "collection"); expected behavior: new saves land on catalog hub; existing saves may preserve last-tab or migrate safely |
| Clear progression signals inside Catalog | Catalog browsing needs "what's next" guidance | MEDIUM | Expect: filters/search/sort persist; entry badges (Owned, Undiscovered, Locked); "Next unlock" pointers similar to Collection's next-unlock patterns |
| Career-first cash loop that avoids deadlocks | If "career-first cash economy" is a goal, cash must be reachable early and reliably | HIGH | Current therapist loop converts enjoyment -> cash; session cost rule changes must preserve visible cost/payout/cooldown and avoid circular dependencies |
| Watch models (more than 4 coarse tiers) | A catalog-first experience implies variety and identity | HIGH | Today: 4 item IDs (generic tiers). Expected: explicit model IDs with deterministic mapping + stats + unlock gates |
| Diminishing returns on duplicates (transparent) | Players accept nerfs if explained; they reject hidden nerfs | HIGH | Expected UI: shows base stats + "marginal gain next copy" or "efficiency %"; explains why copy #10 is weaker; avoids breaking satisfaction of buying in bulk |
| Wear-one-watch (equip slot) + clear active bonus | Equipping is only fun if it's obvious what changes | MEDIUM | Expected: one active "worn" slot with swap UX; worn watch bonus is immediate + visible in rate breakdowns; equipping should not turn off income from the rest of the vault |
| Interactions from owned/worn watches | Players expect "interactions" to be actionable and rewarding | MEDIUM | Current Interact always opens wind session; expected: interactions vary by watch model/type and/or worn watch; interaction availability (cooldown/charges) must be communicated |
| Mini-games: winding polish + automatics (accessible + optional) | New mini-games are only "content" if they're reachable and repeatable | HIGH | Expected: short (10-60s), optional, yields burst reward (cash/enjoyment) and/or temporary buff; clear failure/partial-success outcomes; caps/cooldowns to prevent mandatory grinding |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Catalog entries are real references and economic objects | Makes the catalog feel meaningful, not just a gallery | HIGH | "Owned reference" = something you bought; "Discovered reference" = something you've encountered; discovery is experienced as a direct result of catalog play |
| Wear-one-watch bonus tied to brand/era/type tags | Creates identity + build variety beyond pure numbers | HIGH | Use tags to drive perk families, but avoid combinatorial explosion; ensure readability |
| Interaction-driven discovery | "Doing things" finds references faster than passive accumulation | MEDIUM | Interactions can grant a discovery roll or temporary "archive focus" buff |
| Careers as the spender | Shifts feel from "career is a side button" to a core decision loop | HIGH | Make sessions influence catalog economy (dealer access, price growth tweaks, discovery rate) while keeping cost->reward legible |
| Model sets / collections as goals | Encourages collecting for theme, not only ROI | MEDIUM | Builds on existing set-bonus patterns; show progress and rewards |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Gacha / lootbox packs | Feels exciting; easy content scaling | Undermines catalog-first intentionality; fairness concerns | Deterministic catalog with unlock gates + curated rotations |
| Punitive durability decay | Adds realism | Turns idle into chores; negative loops | Wear as a soft cap on active bonus only (temporary fatigue) |
| Only the worn watch produces income | Makes equipping feel important | Breaks idle accumulation fantasy; encourages micromanagement | Entire vault produces; worn watch grants a multiplier/utility perk |
| Player-to-player trading | Auctions are thematic | Huge scope + exploit risk | NPC dealer + periodic events |
| Too many new currencies | Tuning knobs | Cognitive overload | Keep currencies minimal; use buffs/flags/perks |

## Feature Dependencies

```
[Catalog-first purchase hub]
    -> [Watch models (explicit mapping to catalog entries)]
           -> [Save/state schema update + migration]

[Wear-one-watch slot] -> enhances -> [Mini-games + interactions]

[Career-first cash economy]
    -> [Session rule changes (cost, payout, cooldown)]
    -> enhances -> [Catalog buy loop (affordability, rotations, discounts)]

[Diminishing returns]
    -> conflicts -> [Bulk-buy "always optimal" purchasing]
```

## MVP Definition

### Launch With (v3.0)

- Catalog-first default view + purchase from Catalog entries
- Watch model ownership + worn slot with one clear, visible bonus
- One new interaction/mini-game path beyond current winding (e.g., polishing)
- Career session rule changes that keep early cash reliable
- Diminishing returns v1 (simple, explainable)

### Add After Validation (v3.0.x)

- Model sets/collections with progress rewards
- Automatics mini-game + model-specific interaction table
- Dealer rotations (curated offers)

### Future Consideration (v4+)

- Deep condition/maintenance systems (only if "wear" proves fun)
- Complex market simulation (only if economy is stable)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Catalog-first purchase hub + default view | HIGH | HIGH | P1 |
| Watch models (explicit mapping + stats) | HIGH | HIGH | P1 |
| Wear-one-watch slot + visible bonus | HIGH | MEDIUM | P1 |
| Career-first cash loop (session rule change) | HIGH | HIGH | P1 |
| Diminishing returns (transparent v1) | MEDIUM | HIGH | P1 |
| Polishing mini-game | MEDIUM | MEDIUM | P2 |
| Automatics mini-game | MEDIUM | HIGH | P2 |
| Dealer rotations | MEDIUM | MEDIUM | P2 |
| Model collections/sets | MEDIUM | MEDIUM | P2 |
| Tag-based perk families | HIGH | HIGH | P3 |

**Priority key:**
- P1: Must have for v3.0 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Sources

- Repo behavior and UI structure:
  - `src/ui/tabs/CatalogTab.tsx`
  - `src/ui/tabs/CollectionTab.tsx`
  - `src/ui/tabs/CareerTab.tsx`
  - `src/game/selectors/index.ts`
  - `src/game/actions/index.ts`

---
*Feature research for: v3.0 Catalog-First Economy & Interactions*
*Researched: 2026-01-27*
