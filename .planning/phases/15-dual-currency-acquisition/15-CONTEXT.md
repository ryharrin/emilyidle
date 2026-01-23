---
phase: 15-dual-currency-acquisition
created: 2026-01-23
source: discuss-phase
locks:
  - dual_price_model
  - purchase_rules
  - ui_presentation
  - migration_and_timing
---

# Phase 15 Context: Dual-Currency Acquisition

Phase goal (fixed): Gate watch purchases by enjoyment while spending therapist-earned money.

This document locks product/UX decisions so planners/researchers can implement without re-asking.

## Dual-Price Model

- Enjoyment is a threshold gate only (NOT consumed on purchase).
- Cash spend is a NEW tier-based curve (do not reuse the existing watch price as-is).
- Enjoyment requirements are per-watch explicit values (not derived from tier or price).
- No existing upgrades/events affect purchase cash prices or enjoyment requirements in Phase 15.

## Purchase Rules

- Buying is only possible when BOTH conditions are true at click time:
  - current cash >= cash price (cash is spent)
  - current enjoyment >= enjoyment requirement (enjoyment is NOT spent)
- If requirements are not met:
  - Purchase control is disabled.
  - UI shows missing requirements (see UI section).
- If BOTH cash and enjoyment are insufficient:
  - UI prioritizes messaging about the enjoyment deficit only.
- If enjoyment drops later (e.g., therapist sessions reduce enjoyment):
  - Enjoyment-gated purchases re-lock until enjoyment is regained (no sticky unlock).

## UI Presentation

- Currency naming:
  - Spend currency is labeled as dollars ("$" / "Dollars").
- Watch card / purchase row display:
  - Always show the cash price.
  - Only show the enjoyment requirement when it is currently blocking purchase.
- When blocked by enjoyment:
  - Show a per-watch reason (inline/tooltip-style) so the player understands the lock.
  - Use a lock icon presentation for the disabled state.

## Migration & Unlock Timing

- For existing saves: dual-currency gating applies immediately after Phase 15 ships.
- Previously owned watches are never invalidated; only new purchases are gated.
- Starter/early-game watches have no enjoyment gate; enjoyment gating begins at higher tiers.
- Communication to returning players is inline-only (no modal/toast required); the UI explains the rule when it matters.

## Deferred Ideas (Out of Scope for Phase 15)

- None captured during discussion.
