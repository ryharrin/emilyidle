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
