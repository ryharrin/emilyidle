# NOTES.md — Planned Features Implementation Plan

## Context

### Original Request

Create a plan to implement the features in `NOTES.md` that are marked as “Planned Features”.

### Source of Truth

- Requirements list: `NOTES.md` (section: “Planned Features”)
- Planning draft (decisions captured): `.sisyphus/drafts/notes-planned-features.md`

### Repo Constraints / Conventions

- App is Vite + React + TypeScript.
- Keep `id` and `data-testid` stable (tests depend on them).
- Domain logic lives in `src/game/*` and is functional/immutable.
- Save persistence: `src/game/persistence.ts` uses localStorage key `emily-idle:save` and must keep legacy key handling.
- Tests:
  - Unit: `pnpm run test:unit` (Vitest, `tests/**/*.unit.test.{ts,tsx}`)
  - E2E: `pnpm run test:e2e` (Playwright, `tests/**/*.spec.{ts,tsx}`, baseURL `http://localhost:5177`)

### Key Existing Code References

- Primary tabs (Vault/Atelier/Maison/Catalog/Stats/Save): `src/App.tsx`.
- Catalog entries: `src/game/catalog.ts` (`brand`, `model`, `tags`, optional `facts?`).
- Milestones + achievements + set bonuses: `src/game/state.ts`.
  - Milestones: `collector-shelf`, `showcase`, `atelier`, `archive-curator`.
  - Achievements include `first-drawer` as an early one.
  - Set bonuses exist already (`SET_BONUSES`) and affect income calculation.
- Existing progressive disclosure spec to follow: `.sisyphus/plans/09-ui-reveal-polish.md`.

---

## Work Objectives

### Core Objective

Implement all “Planned Features” from `NOTES.md` in a way that preserves existing gameplay feel, keeps selectors stable, and is fully covered by TDD (unit + targeted e2e).

### Concrete Deliverables

- Progress-gated UI tabs (Vault+Save always visible; others reveal near unlock).
- Settings menu (inside Save tab) with:
  - Light/dark/system theme toggle.
  - Hide completed achievements toggle.
  - Tab visibility customization (user hides any unlocked tab).
  - Dev mode indicator + controls (when enabled).
- Catalog “replica dealer site” light reskin.
- Deeper watch information display (owned-only in v1, curated blurbs).
- Collection impacts gameplay via new set bonuses (~6 total: 3 brand + 3 curated themes).
- Crafting system (moderate scope) using parts resource (dismantle → craft) that produces meaningful gameplay bonuses.
- Tutorial/help via inline coachmarks.
- Mini-game improvements (after a design spike).
- Prestige mechanics improvements (after a design spike).
- GitHub Pages hosting + deployment (Project Pages at `/emily-idle/`) via GitHub Actions on push to `main`.

### Must NOT Have (Guardrails)

- No multiplayer or social features.
- Do not change existing stable `id` / `data-testid` selectors without updating tests.
- Avoid deep art pipeline / large dependency additions for the catalog reskin.
- Do not store new settings inside the save payload.
- Do not remove legacy save key handling in `src/game/persistence.ts`.

---

## Verification Strategy (TDD)

### Test Decision

- Infrastructure exists: YES (Vitest + Playwright)
- Strategy: TDD (tests-first) for each feature

### Commands

- Unit: `pnpm run test:unit`
- E2E: `pnpm run test:e2e`
- Type/lint/build (plan-wide): `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`

### Evidence / Acceptance Pattern

For each TODO below:

- Add/adjust unit tests first (RED → GREEN → REFACTOR).
- Add/adjust Playwright coverage only where a critical user journey changed (e.g., tab gating, settings toggles).

---

## Task Flow

High-level ordering constraints:

- UI navigation / tab gating changes before large UI additions.
- Settings infrastructure before adding multiple toggles.
- Domain model changes (set bonuses/crafting) before UI polish that depends on them.

---

## TODOs

> Notes:
>
> - Each TODO includes tests as part of acceptance.
> - Parallelizable indicates whether tasks can be implemented independently.

### 1) Align “near unlock” threshold to 80%

**What to do**

- Update the existing progressive disclosure threshold in domain helpers to use 0.8 (currently 0.7 exists as `REVEAL_THRESHOLD_RATIO`).
- Ensure any copy/tag logic that depends on “near unlock” aligns with this.

**References**

- `src/game/state.ts` (`REVEAL_THRESHOLD_RATIO`, `shouldShowUnlockTag`, `isWorkshopRevealReady`, `isMaisonRevealReady`).
- `.sisyphus/plans/09-ui-reveal-polish.md` (prior behavior intent).

**Acceptance Criteria (TDD)**

- [x] Unit tests cover visibility threshold boundaries (just below 80%, at/above 80%).
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 2) Implement progress-gated primary tab visibility

**What to do**

- Keep Vault + Save visible from fresh save.
- Reveal other tabs when the user is “near unlock” (80% progress):
  - Catalog: gated by milestone `showcase`.
  - Stats: gated by first achievement progress.
    - Define a concrete “achievement progress ratio” helper (mirror the milestone helper):
      - `totalItems`: `owned / threshold`
      - `collectionValue`: `collectionValueCents / thresholdCents`
      - `catalogDiscovery`: `discoveredCatalogEntries.length / threshold`
      - `workshopPrestigeCount`: `workshopPrestigeCount / threshold`
    - Use the earliest/first achievement as the reference for “near first achievement” (likely `first-drawer`), so the rule is deterministic.
  - Atelier/Maison: use existing reveal readiness logic (currently `isWorkshopRevealReady`, `isMaisonRevealReady`) but aligned to 80%.
- Ensure hidden tabs are not focusable (ARIA tablist keyboard nav should skip them).
- Keep tab ids stable (`collection`, `workshop`, `maison`, `catalog`, `stats`, `save`).

**References**

- `src/App.tsx` (primary tabs array, tablist behavior).
- `src/game/state.ts` (`isWorkshopRevealReady`, `isMaisonRevealReady`, milestone progress helpers).
- `tests/catalog.unit.test.tsx` (primary nav tab tests).
- `tests/collection-loop.spec.ts` (tab navigation).

**Acceptance Criteria (TDD)**

- [x] Unit tests: fresh save shows only Vault + Save tabs.
- [x] Unit tests: setting up state near each threshold makes corresponding tab appear.
- [x] E2E: at least one seeded state validates Catalog/Atelier/Maison gating doesn’t break navigation.
- [x] `pnpm run test:unit` → PASS
- [x] `pnpm run test:e2e` → PASS

**Parallelizable**: NO (foundational UI behavior)

---

### 3) Add settings state + persistence (localStorage)

**What to do**

- Introduce a new localStorage key (e.g., `emily-idle:settings`) to store UI settings.
- Settings live in the Save tab (extend existing “Audio settings” precedent).
- Settings include: theme mode, hide-completed-achievements toggle, per-tab visibility preferences.
- Ensure defensive parsing (invalid JSON → defaults).

**References**

- `src/App.tsx` (audio settings pattern: `emily-idle:audio`).
- `tests/catalog.unit.test.tsx` (localStorage seeding patterns).

**Acceptance Criteria (TDD)**

- [x] Unit tests: defaults used when localStorage empty/invalid.
- [x] Unit tests: toggling settings persists and reloads correctly.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: NO (needed by multiple later tasks)

---

### 4) Implement theme toggle (system/light/dark)

**What to do**

- Default: follow system theme.
- Allow override to light/dark via settings.
- Apply via CSS class or data attribute on root; avoid destabilizing selectors.

**References**

- `src/style.css` (current dark styling and `color-scheme: light dark`).
- `src/main.tsx` / `src/App.tsx` (where to apply root attributes/classes).

**Acceptance Criteria (TDD)**

- [x] Unit tests verify theme state changes update DOM attribute/class.
- [x] Manual check: toggling theme changes visible palette.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES (after settings infrastructure)

---

### 5) Implement “hide completed achievements” setting

**What to do**

- Default OFF.
- When ON, filter achievements list in UI to show only locked ones.

**References**

- `src/game/state.ts` (`achievementUnlocks`).
- `src/App.tsx` achievements rendering.

**Acceptance Criteria (TDD)**

- [x] Unit tests cover both settings states and expected rendered list.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES (after settings infrastructure)

---

### 6) Implement per-tab visibility customization

**What to do**

- Provide UI in Save settings allowing the user to hide/unhide any unlocked tab.
- Guardrails:
  - Vault + Save cannot be hidden.
  - If active tab becomes hidden, automatically switch to Vault.

**References**

- `src/App.tsx` tab activation logic.
- Unit tests for tabs in `tests/catalog.unit.test.tsx`.

**Acceptance Criteria (TDD)**

- [x] Unit tests: user hides a tab and it disappears from tablist and tab order.
- [x] Unit tests: active tab fallback to Vault when hidden.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES (after settings infrastructure)

---

### 7) Catalog “replica dealer site” light reskin

**What to do**

- Adjust catalog visuals: typography, card layout, price/metadata presentation, subtle dealer-site motifs (banners, pill filters, etc.).
- Keep all existing catalog flows intact.

**References**

- `src/App.tsx` Catalog tab markup.
- `src/style.css` catalog classes (e.g., `.catalog-tablist`, `.catalog-card`, etc.).
- Tests rely on `data-testid` mentioned in `.sisyphus/notepads/03-catalog-images/decisions.md`.

**Acceptance Criteria**

- [x] No selector changes (or tests updated if unavoidable).
- [x] `pnpm run test:unit` → PASS
- [x] `pnpm run test:e2e` → PASS
- [x] `pnpm run build` → PASS

**Parallelizable**: YES

---

### 8) Watch info: curated blurbs + specs (owned-only v1)

**What to do**

- Extend catalog entry presentation to show richer information for owned watches.
- Data source: curated text stored alongside catalog entries (likely via `facts?` or new fields).
- Ensure attribution/license display remains correct.

**References**

- `src/game/catalog.ts` (existing fields: `description`, optional `facts?`).
- `src/App.tsx` catalog card rendering.

**Acceptance Criteria (TDD)**

- [x] Unit tests: owned entry shows extra facts/specs; unowned does not.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 9) Set bonuses expansion (v1: 6 sets)

**What to do**

- Add 3 brand sets + 3 theme sets chosen from existing catalog coverage.
- Effects can include: production multiplier, discounts, and prestige-related boosts.
- Provide clear UI feedback: what sets exist, progress toward each, active bonuses.

**References**

- `src/game/state.ts` (`SET_BONUSES`, `getActiveSetBonuses`, income computation).
- `src/game/catalog.ts` (brands/tags to support brand/theme sets).

**Acceptance Criteria (TDD)**

- [x] Unit tests: each set activates at the intended thresholds and modifies derived multipliers.
- [x] Unit tests: UI shows active bonuses and progress.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES (but coordinate with crafting if overlapping bonuses)

---

### 10) Crafting system (moderate) with parts resource

**What to do**

- Add a dismantle flow: convert owned watches into parts.
- Add crafting recipes that consume parts (and possibly watches) to produce:
  - Unique crafted watches and/or permanent bonus items.
  - Bonuses that integrate into existing multiplier model (production/discounts/prestige boosts).
- Add UI for crafting (likely in Atelier or a new section inside an existing tab), respecting tab gating.

**References**

- Domain patterns: `src/game/state.ts` (existing upgrades/set bonuses).
- UI patterns: `src/App.tsx` (Atelier tab content).
- Persistence: `src/game/persistence.ts` (new state fields must serialize/deserialize safely).

**Acceptance Criteria (TDD)**

- [x] Unit tests: dismantle increases parts and decreases watch counts.
- [x] Unit tests: crafting consumes inputs and produces outputs deterministically.
- [x] Unit tests: save/load includes new crafting fields; invalid payloads fall back safely.
- [x] `pnpm run test:unit` → PASS
- [x] `pnpm run test:e2e` → PASS (at least one journey if UI is substantial)

**Parallelizable**: NO (touches core state + persistence)

---

### 11) Tutorial/help via inline coachmarks

**What to do**

- Add coachmarks that explain core mechanics in context (Vault, Catalog, Atelier, Maison, Prestige, Set bonuses, Crafting).
- Ensure coachmarks can be dismissed and do not reappear aggressively.
- Persist dismissal state in localStorage settings.

**References**

- `src/App.tsx` tab panels.
- Settings persistence work from Task 3.

**Acceptance Criteria (TDD)**

- [x] Unit tests: coachmarks render for new players and can be dismissed.
- [x] Unit tests: dismissal persists via localStorage.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 12) Dev mode (URL flag) with cheats + tuning

**What to do**

- Activation via URL flag and/or localStorage (as decided: URL flag).
- Show a clear “DEV MODE” banner when active.
- Provide controls:
  - Core: grant Memories, unlock all watches, unlock all tabs, reset save.
  - Tuning: sim speed/tick rate and/or multipliers.
- Ensure dev controls are inert when not enabled.

**References**

- `src/App.tsx` state update patterns.
- Simulation loop in `src/game/sim.ts` (tick rate) and state in `src/game/state.ts`.

**Acceptance Criteria (TDD)**

- [x] Unit tests: dev mode off → controls hidden/inert.
- [x] Unit tests: dev actions produce expected state changes.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 13) Design spike: mini-game improvements

**What to do**

- Add a short “design spike” doc section (inside this plan’s execution notes or as plan task output) defining:
  - What makes the mini-game more engaging (reward curve, skill element, frequency).
  - Updated mechanics and expected reward impact.
  - Testable acceptance criteria.
- Then implement with TDD.

**References**

- Existing “wind-up” manual event and any minigame tests: `tests/catalog.unit.test.tsx` (wind minigame).
- Events: `src/game/state.ts` (manual event `wind-up`).

**Acceptance Criteria**

- [x] Spike output lists concrete mechanics + tests.
- [x] Implementation changes covered by unit tests.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 14) Design spike: prestige mechanics improvements

**What to do**

- Add a short “design spike” output defining:
  - What “more meaningful” means (new permanent choices, more visible payoffs, better integration with sets/crafting).
  - Changes to Workshop/Maison loops.
  - Testable acceptance criteria.
- Then implement with TDD.

**References**

- Prestige thresholds/helpers: `src/game/state.ts`.
- Simulation loop: `src/game/sim.ts`.

**Acceptance Criteria**

- [x] Spike output lists concrete mechanics + tests.
- [x] Implementation changes covered by unit tests.
- [x] `pnpm run test:unit` → PASS

**Parallelizable**: YES

---

### 15) GitHub Pages hosting + deployment

**What to do**

- Configure Vite base path for Project Pages: `/emily-idle/`.
- Add a GitHub Actions workflow that:
  - Installs deps with pnpm.
  - Runs `pnpm run test:unit`.
  - Runs `pnpm run build`.
  - Publishes `dist/` to GitHub Pages.
- Run Playwright e2e tests in CI before deploying (per user decision).
  - Ensure browsers are installed and the workflow can run `pnpm run test:e2e` reliably.
- Ensure deploy triggers on push to `main`.

**References**

- `vite.config.ts` (add `base`).
- `package.json` scripts.

**Acceptance Criteria**

- [x] `pnpm run build` produces valid assets under `/emily-idle/` base path.
- [x] GitHub Actions workflow configured for Pages and runs on push to `main`.

**Parallelizable**: YES

---

## Plan-wide Success Criteria

- [x] `pnpm run typecheck` → PASS
- [x] `pnpm run lint` → PASS
- [x] `pnpm run test:unit` → PASS
- [x] `pnpm run test:e2e` → PASS
- [x] `pnpm run build` → PASS
- [x] GitHub Pages deploy workflow present and configured for `/emily-idle/`.
