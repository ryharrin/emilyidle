# Watch Idle

## What This Is

A browser-based idle / incremental game themed around luxury watches, built for personal use. You earn currency, acquire watches featuring real-world brands (Rolex, Jaeger‑LeCoultre, Audemars Piguet) using publicly-licensed images, and build a “collection value engine” that accelerates over time. Progression is driven by three distinct layers (Collection → Workshop → Maison), each with its own reset/persist rules and permanent meta-progression.

## Core Value

Make collecting and growing a high-end watch “vault” feel irresistibly compounding.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Core idle loop: earn currency → buy watches/upgrades → increase income rate
- [ ] Real-image watch catalog for Rolex / Jaeger‑LeCoultre / Audemars Piguet using publicly-licensed images (no logos required)
- [ ] Three prestige layers, each with a distinct fantasy and reset/persist rules
- [ ] Offline-friendly (runs locally in a browser) for personal use

### Out of Scope

- Monetization, ads, IAP — personal use only
- Official branding, logos, or “endorsed by” presentation — reduces trademark confusion risk
- Using random web product photos without an explicit reuse license — avoid copyright risk

## Context

- Greenfield repo (only `.git/` exists currently).
- Prestige structure is **Collection → Workshop → Maison** (3 layers total):
  - **Collection (Layer 1)**: Earn currency, buy watches, and grow “collection value” that accelerates your income.
  - **Workshop (Layer 2 / Prestige 1)**: Reset Collection progress to gain a persistent meta-currency that improves production/upgrade systems (faster scaling, better upgrades, new mechanics).
  - **Maison (Layer 3 / Prestige 2)**: Reset Workshop + Collection to gain long-term “legacy/brand equity” progression that permanently expands the game (new systems, stronger multipliers, longer-term goals).
- Brands should be included as content (e.g., collections/catalog entries), but prestige layers represent gameplay domains (not “brand = layer”).
- Image sourcing approach: prefer Wikimedia Commons / other CC-licensed sources with explicit reuse terms and store attribution (even if personal use).

## Constraints

- **Platform**: Browser-based — should run as a static site
- **IP / licensing**: Use publicly-licensed images with clear reuse terms; avoid official product shots without permission
- **Scope**: 3 prestige layers total

## Prestige Structure

**Layer 1 — Collection (primary loop)**
- Earn currency → buy watches (catalog across Rolex / Jaeger‑LeCoultre / Audemars Piguet) → increase earnings via collection value, set bonuses, and upgrades.
- Primary objective: grow total collection value and earnings rate until a prestige threshold is hit.

**Layer 2 — Workshop (prestige reset)**
- Resets Collection progress (currency, owned watches, most upgrades).
- Grants a permanent meta-currency (e.g., "Blueprints" / "Parts") used to unlock automation, improve production efficiency, and boost future Collection runs.
- Fantasy: you’re no longer just buying watches—you’re building the capability to produce/restore/upgrade them.

**Layer 3 — Maison (prestige reset)**
- Resets Workshop + Collection progress.
- Grants a higher-tier permanent currency (e.g., "Reputation" / "Heritage") used to found and grow your own brand empire (new product lines, permanent multipliers, special rules).
- Fantasy: from collector → craftsman → founder.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 3 prestige layers | You requested multi-layer prestige | — Pending |
| Use CC/publicly-licensed images | Lowest-drama way to use “real images” | — Pending |
| Keep brands as content, not layer structure | Prestige should represent gameplay domains | — Pending |

---
*Last updated: 2026-01-14 after initialization*
