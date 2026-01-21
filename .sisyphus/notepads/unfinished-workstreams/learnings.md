# Learnings

## 2026-01-18

- Added achievements steady-collector (25 items), vault-elite ($300k value), atelier-spark (workshop prestige 2).
- Added events showcase-week (250k value) and heritage-gala (1.2M value) with activation/cooldown coverage.
- Save decoding now clamps legacy negative values, handles catalogTierUnlocks, and rejects oversized payloads in tests.
- Bounded simulation catch-up to max 20 steps per frame while batching state updates.
- Added focus-visible outlines for nav links, buttons, and form controls for keyboard accessibility.
- Renamed UI copy from Sentimental value to Memories across stats, achievements, and milestone descriptions.
- Renamed Workshop UI copy to Atelier (nav, panel headers, reset legend/button).
- Implemented primary ARIA tabs with manual activation; moved Atelier/Maison panels into their tabs and updated Playwright/unit tests to activate tabs before assertions.
- Added Save tab audio toggles with default-off persistence coverage.
- Replaced Catalog View select with Owned/Unowned ARIA tabs and tier-based filtering defaults.
- Expanded catalog with Omega + Cartier entries, including licensed metadata and year coverage.

## Design spikes

### Mini-game improvement (wind-up)

- Mechanic update: Keep the 10-click interaction but add a timed streak window (e.g., 5s) that grants extra clicks if the player keeps a rhythm.
- Reward impact: Each completed streak extends the wind-up boost duration by +15s (capped at 90s) and increases multiplier from 1.05 → 1.15 while active.
- UI change: Show a streak meter and remaining bonus duration in the wind modal.
- Acceptance tests:
  - Unit: fast 10-click path grants 90s boost + 1.15 multiplier.
  - Unit: slow clicks (beyond streak window) cap at base 60s + 1.05.
  - Unit: streak meter resets after close/reopen.

### Prestige improvement

- Mechanic update: Add a visible prestige track that converts a % of workshop blueprints into a permanent vault multiplier (stacking up to 25%).
- Reward impact: Workshop reset grants 1–3% permanent vault bonus based on enjoyment at reset; Maison reset preserves bonus.
- UI change: Show permanent bonus in Atelier/Maison panels and on Stats.
- Acceptance tests:
  - Unit: prestige track increases multiplier on reset and persists across resets.
  - Unit: bonus capped at 25%.
  - Unit: stats panel displays permanent bonus label.
