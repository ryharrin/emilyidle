# Decisions (notes-planned-features)

Append-only. Record decisions made while executing `.sisyphus/plans/notes-planned-features.md`.

## 2026-01-27T02:59:55Z Task: GitHub Pages base path

- Decision: Treat GitHub Pages base path as `/emilyidle/` (not `/emily-idle/`).
- Rationale: `git remote -v` points to `github.com:ryharrin/emilyidle.git` and both Vite `base` + Playwright e2e assertions use `/emilyidle/`.

## 2026-01-27T02:59:55Z Task: Design spike output (minigame improvements)

- Goal: Make the wind interaction feel like a short session with meaningful choices and a clear reward curve.
- Mechanics:
  - Session length: 5 rounds.
  - State variables: round progress + tension (0..10).
  - Choices per round:
    - Steady: low tension gain, safe progress.
    - Push: faster progress but adds tension and introduces slip risk.
  - End conditions:
    - Complete 5 rounds: apply boosted wind-up multiplier (x1.15).
    - Slip ends early: apply base wind-up multiplier (x1.05).
  - Modal lifecycle: closing/reopening resets session progress (no partial carryover).
- Testable acceptance:
  - Unit: modal open/close resets progress; completing 5 rounds yields x1.15; forced slip yields x1.05 (`tests/catalog.unit.test.tsx`).
  - E2E: "wind session completes and applies rewards" journey (`tests/collection-loop.spec.ts`).

## 2026-01-27T02:59:55Z Task: Design spike output (prestige mechanics improvements)

- Goal: Make prestige feel more meaningful by adding a persistent, always-on legacy multiplier that affects both cash and enjoyment rates.
- Mechanics:
  - New derived multiplier: `getPrestigeLegacyMultiplier(state)`.
  - Inputs:
    - `workshopPrestigeCount` -> atelier legacy: `1.05^count`.
    - `maisonHeritage` -> maison legacy: `1.03^heritage`.
  - Composition: `min(10, atelierLegacy * maisonLegacy)`.
  - Application: multiplies both enjoyment rate and income-related rates (cash generation) without changing other core formulas.
- Testable acceptance:
  - Unit: multiplier is applied to cash and enjoyment rates (`tests/maison.unit.test.tsx`).
