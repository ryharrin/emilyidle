# Consolidated Unfinished Work (Workstreams)

Purpose: Consolidate every unfinished task (unchecked or partial) from existing phase plans into one place, grouped by workstream, with deduplication and clear provenance.

## Sources

Unfinished work was gathered from:

- `.sisyphus/plans/06-balance-content.md`
- `.sisyphus/plans/07-packaging-polish.md`
- `.sisyphus/plans/09-ui-reveal-polish.md` (one partial task)
- `.sisyphus/plans/phase-11-notes.md`

## Definitions

- **Unfinished** means any checkbox not marked `[x]`.
- **Partial** tasks (`[~]`) are treated as unfinished and are represented here as `[ ]` with a note.
- **Deduplication**: Similar tasks are merged into a single canonical item, with explicit provenance pointers.

## Global Guardrails

- This file reorganizes existing tasks only; it does not introduce new requirements (explicit spec overrides are called out where applicable).
- When a task merges multiple sources, preserve the stricter/more specific requirements.
- Keep existing phase plan files unchanged; treat them as historical references.
- It is OK to update _this_ consolidated plan during execution to record decision outputs (e.g., Phase 06 pacing targets and Phase 06 content list).

---

## Workstreams

### Balance & Pacing

#### 06-01 — Balance pass (curves, thresholds, softcaps, pacing)

- [x] Establish target pacing goals (time-to-first-prestige, etc.)
  - **Output**: write explicit targets into this plan section (numbers + how to measure).
  - Suggested targets to fill in (edit as desired):
    - Time to first Workshop reset: 25 minutes on fresh save.
    - Time from first Workshop reset to first Maison reset: 40 minutes.
    - Total time to reach stable midgame loop (Workshop upgrades + some Maison lines): 120 minutes.
  - **Fresh save procedure** (recorded for repeatability):
    - Clear localStorage keys: `emily-idle:save` and `watch-idle:save`.
    - Reload page.
  - **How to measure**:
    - “Workshop reset reached” = Workshop panel is visible and the reset button becomes enabled (or `canWorkshopPrestige(state)` becomes true).
    - “Maison reset reached” = Maison panel is visible and the reset button becomes enabled (or `canMaisonPrestige(state)` becomes true).
  - **Files**: `.sisyphus/plans/02-collection-loop.md` (reference), `src/game/state.ts` (constants)
  - **Verification**: once targets are written, run `pnpm dev` and measure with a timer on fresh save; record observed times; `pnpm run test:unit`
  - **Parallelizable**: NO
  - **Source**: `.sisyphus/plans/06-balance-content.md`

- [x] Tune curves and thresholds across Collection/Workshop/Maison
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`
  - **Verification**:
    - `pnpm run test:unit`
    - Manual pacing re-measurement on fresh save meets the targets from 06-01 (suggested tolerance: ±15%).
  - **Parallelizable**: YES
  - **Source**: `.sisyphus/plans/06-balance-content.md`

#### Verification (06)

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`

### Content & Retention

#### 06-02 — Content pass (achievements, events, milestone goals)

- [x] Decide what "new content" means for this pass (because achievements + events already exist)
  - **Output**: a short list of specific additions/changes (e.g., 2–5 new achievements, 1–2 new events, milestone tweaks), written in this plan section before implementation.
  - **Decision**:
    - Achievements to add: `steady-collector` (totalItems ≥ 25), `vault-elite` (collectionValue ≥ $300k), `atelier-spark` (workshopPrestigeCount ≥ 2).
    - Events to add: `showcase-week` (collectionValue ≥ $250k, duration 120s, cooldown 300s, multiplier 1.45), `heritage-gala` (collectionValue ≥ $1.2M, duration 150s, cooldown 420s, multiplier 1.5).
    - Milestones: no new IDs; keep existing milestone list after 06-01 threshold tuning.
  - **References**:
    - Existing milestones: `src/game/state.ts:380`.
    - Existing achievements: `src/game/state.ts:428`.
    - Existing events: `src/game/state.ts:455`.
  - **Verification**: confirm the plan now names the specific items to add/change.
  - **Parallelizable**: NO
  - **Source**: `.sisyphus/plans/06-balance-content.md`

- [x] Add achievements (small set) with persistence (as defined above)
  - **Files**: `src/game/state.ts`, `src/game/persistence.ts`, `src/App.tsx`
  - **Verification**: new/updated unit tests cover each new achievement threshold; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: YES
  - **Source**: `.sisyphus/plans/06-balance-content.md`

- [x] Add simple events/milestones to reduce idle monotony (as defined above)
  - **Files**: `src/game/state.ts`, `src/game/sim.ts`, `src/App.tsx`
  - **Verification**: unit tests cover activation/cooldown logic; `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO
  - **Source**: `.sisyphus/plans/06-balance-content.md`

### Packaging, Robustness & UX Polish

#### 07-01 — Build output, local run instructions, perf + accessibility polish

- [x] Add clear local run instructions (dev/build/preview)
  - **Files**: `README.md`
  - **Verification**: manual: `pnpm install` + `pnpm dev` works as written; optional: `pnpm run build` + `pnpm preview`
  - **Parallelizable**: YES
  - **Source**: `.sisyphus/plans/07-packaging-polish.md`

- [x] Improve save robustness (migrations, schema evolution)
  - **Files**: `src/game/persistence.ts`
  - **Verification**: add/update unit tests that decode legacy/edge-case payloads (invalid JSON, missing fields, negative numbers); `pnpm run test:unit`; `pnpm run test:e2e`
  - **Parallelizable**: NO
  - **Source**: `.sisyphus/plans/07-packaging-polish.md`

- [x] Performance polish (avoid unnecessary DOM writes; keep sim stable)
  - **Files**: `src/App.tsx`, `src/game/sim.ts`
  - **Verification**: `pnpm run test:e2e`; manual: devtools performance check shows stable frame pacing during idle (no runaway renders)
  - **Parallelizable**: YES
  - **Source**: `.sisyphus/plans/07-packaging-polish.md`

- [x] Accessibility + UX polish (keyboard focus, readable formatting)
  - **Files**: `index.html`, `src/style.css`, `src/App.tsx`
  - **Verification**: `pnpm run test:e2e`; manual: tab through primary controls without focus traps; headings and labels remain readable
  - **Parallelizable**: YES
  - **Source**: `.sisyphus/plans/07-packaging-polish.md`

#### Verification (07)

- [x] `pnpm run typecheck`
- [x] `pnpm run lint`
- [x] `pnpm run build`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`

### Copy, Naming & Consistency

#### Canonical: Atelier/Vault/Memories language pass (deduped)

- [x] Language consistency pass: “Vault / Atelier / Maison” and related labels

  **What this merges**:
  - Partial task “Add “vault” / “atelier” language consistency pass” from `.sisyphus/plans/09-ui-reveal-polish.md` (was `[~]`, represented here as `[ ]`).
  - Task “11-11 — Prestige naming alternatives (UI-only, scoped list)” from `.sisyphus/plans/phase-11-notes.md`.

  **Source A**: `.sisyphus/plans/09-ui-reveal-polish.md`
  - Original task was: `[~] Add “vault” / “atelier” language consistency pass`

  **Source B**: `.sisyphus/plans/phase-11-notes.md`
  - Original task id: `11-11`

  **What to do** (from 11-11):
  - Rename visible strings:
    - “Workshop” → “Atelier” (header + nav/tab label)
    - “Reset vault” → “Reset atelier” (update both the visually-hidden `<legend>` label and the visible button text; do not add an `aria-label` unless needed for tests)
  - Note: the Phase 11 source mention of an `aria-label` is outdated relative to the current UI structure (legend + button text).
  - Update adjacent explanatory sentences for consistency.

  **Must NOT do**:
  - Do not rename IDs/state keys/save fields.

  **References**:
  - Workshop title: `src/App.tsx` ("Workshop" heading inside the Workshop panel).
  - Reset label uses a visually-hidden legend: `src/App.tsx:637`.
  - Reset button text currently includes “Reset vault”: `src/App.tsx:668`.
  - Playwright uses panel/button selectors, not aria-labels: `tests/collection-loop.spec.ts:12`.

  **Acceptance Criteria (TDD)**:
  - [ ] Update any text assertions/selectors impacted by renames.
  - [ ] `pnpm run test:e2e` → PASS.

- [x] 11-01 — Rename “Sentimental value” to “Memories” (UI-only, all occurrences)

  **What to do**:
  - Replace all user-visible strings “Sentimental value” → “Memories”.
  - Keep formatting (`formatMoneyFromCents`) unchanged.

  **Must NOT do**:
  - Do not change `getCollectionValueCents()` semantics.
  - Do not rename IDs/types/state keys.

  **Parallelizable**: YES

  **References**:
  - Vault stats label: `src/App.tsx:423`.
  - Watch item copy: `src/App.tsx:572`.
  - Milestone descriptions include Sentimental value: `src/game/state.ts:391`.
  - Achievement copy/tests referencing Sentimental value: `tests/maison.unit.test.tsx:48`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit tests assert “Memories” appears in vault stats and item cards.
  - [ ] `pnpm run test:unit` → PASS.
  - [ ] `pnpm run test:e2e` → PASS.

## Execution Notes (Dependencies)

- Prefer doing `11-03` (Primary Tabs) before `11-02` (Catalog Owned/Unowned) and before any Playwright updates that depend on navigation.
- Prefer doing `11-05` (new brands/entries with known years) before `11-07` (sorting by year) to avoid rework in tests.
- Expect `11-01` and the language consistency task to require updating unit tests/E2E assertions.

### Navigation & IA

- [x] 11-03 — Main UI navigation: ARIA tabs (Vault/Workshop/Maison/Catalog/Stats/Save)

  **What to do**:
  - Replace anchor nav with tablist.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Primary Tabs (replace anchor nav)").
  - Implement **manual** activation (Enter/Space to activate, Arrow keys move focus).
  - Render tabpanel shells for all tabs and conditionally render panel content only when active.
  - Keep existing DOM IDs inside panels intact.
  - Update E2E tests to click the Catalog tab before filtering.
  - Default active tab is **Vault**.

  **Must NOT do**:
  - Don’t touch simulation loop/autosave hooks.

  **Parallelizable**: NO

  **References**:
  - Current nav in hero header: `src/App.tsx:383`.
  - Playwright selectors object: `tests/collection-loop.spec.ts:3`.

  **Acceptance Criteria (TDD)**:

- [x] E2E tests navigate via tabs, not anchors.
- [x] First render shows Vault tab with `#collection-list` etc.
- [x] Unit test: tabs expose correct ARIA roles/attributes and manual activation (Enter/Space).
- [x] `pnpm run test:e2e` → PASS.

### Audio & Settings

- [x] 11-04 — Audio: SFX + BGM toggles (default OFF)

  **What to do**:
  - **Scope**: this task implements persisted toggles only (no audio playback yet). A follow-up task should add actual audio assets + playback wiring.
  - Add two toggles in Save tab.
  - Persist to localStorage key `emily-idle:audio` with `{ sfxEnabled, bgmEnabled }`.
  - Parse localStorage defensively: invalid JSON or missing keys fall back to defaults.
  - No audio initialization before user gesture.

  **Must NOT do**:
  - Do not store settings inside save string.

  **Parallelizable**: YES

  **References**:
  - Save section: `src/App.tsx:1162`.
  - Autoplay constraints: `https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide`.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Audio: two toggles (SFX + BGM), default OFF until user gesture").

  **Acceptance Criteria (TDD)**:
  - [x] Unit test: defaults OFF when localStorage empty.
  - [x] Unit test: invalid JSON falls back to defaults.
  - [x] Unit test: toggling writes expected JSON.
  - [x] E2E test: toggles exist and are clickable.

### Catalog UX, Data & Features

- [x] 11-02 — Catalog tabs: Owned vs Unowned (remove View select)

  **What to do**:
  - Replace `data-testid="catalog-owned"` select with ARIA tabs.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Catalog: Owned vs Unowned").
  - Remove `showDiscoveredOnly` state and its filtering logic.
  - Default active tab is **Unowned**.
  - Keep search and brand filters unchanged.

  **Must NOT do**:
  - Don’t break `data-testid="catalog-results-count"`, `data-testid="catalog-grid"`, `data-testid="catalog-card"`.

  **Parallelizable**: NO

  **References**:
  - View select to remove: `src/App.tsx:1068`.
  - Filtering logic to update: `src/App.tsx:294` (`const filteredCatalogEntries = useMemo`).
  - Tag inference: `src/game/catalog.ts:998`.
  - Tags list: `src/game/catalog.ts:1020`.
  - Item counts helper: `src/game/state.ts:847` (`getItemCount`).
  - Unit test that depends on `catalog-owned`: `tests/catalog.unit.test.tsx:30`.
  - E2E catalog test coverage: `tests/collection-loop.spec.ts:67`.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Catalog: Owned vs Unowned").

  **Acceptance Criteria (TDD)**:
  - [x] Unit test: default tab is Unowned on fresh save.
  - [x] Unit test: Owned tab returns only entries whose tier is owned.
  - [x] Unit test: Unowned tab excludes owned tiers.
  - [x] Unit test: Owned empty-state message shown when no items owned.
  - [x] Update tests to stop selecting `catalog-owned`.

- [x] 11-05 — Catalog expansion: add 2 brands + 6 entries

  **What to do**:
  - Expand `CatalogBrand` to include `Omega` and `Cartier`.
  - Add ≥3 entries per brand (6 total) with attribution/license metadata.
  - Ensure ≥2 entries have known years (not “Unknown”) for deterministic sorting tests.
  - For each new entry: provide either a matching local image under `public/catalog/` or add the Wikimedia path to `MISSING_LOCAL_IMAGES`.

  **Parallelizable**: YES

  **References**:
  - Brand union: `src/game/catalog.ts:1`.
  - Entry schema: `src/game/catalog.ts:12`.
  - Local image mapping + missing list: `src/game/catalog.ts:969` (`LOCAL_CATALOG_ROOT`, `MISSING_LOCAL_IMAGES`, `getCatalogImageUrl`).
  - Catalog licensing/local image rules: `src/game/AGENTS.md`.

  **Acceptance Criteria (TDD)**:
  - [x] Unit test: brand filter includes Omega and Cartier.
  - [x] Unit test: selecting each brand yields >0 results.

- [x] 11-06 — Women’s watches: tag + facet + 4 entries

  **What to do**:
  - Represent women’s as tag `womens`.
  - Add ≥4 entries tagged `womens` (can overlap 11-05).
  - Add a Style filter with `All` and `Womens` options.

  **Parallelizable**: YES

  **References**:
  - Tags: `src/game/catalog.ts:1020`.
  - Filter UI pattern: `src/App.tsx` (search for `data-testid="catalog-filters"`).
  - Catalog licensing/local image rules: `src/game/AGENTS.md`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: Style=Womens returns only entries with `womens` tag.

- [x] 11-07 — Catalog sorting + filtering: Era + Type

  **What to do**:
  - Add Sort options:
    - Default
    - Brand (A→Z)
    - Year (newest→oldest; Unknown last)
    - Tier (starter→tourbillon)
  - Add Era filter: `All`, `Pre-1970`, `1970-1999`, `2000+`, `Unknown`.
  - Add Type filter: `All`, `GMT`, `Chronograph`, `Dress`, `Diver` (based on tags).

  **Parallelizable**: NO

  **References**:
  - Catalog filter logic: `src/App.tsx:288`.
  - Tier inference: `src/game/catalog.ts:998`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: Brand sort yields alphabetical order.
  - [ ] Unit test: Year sort places Unknown last.
  - [ ] Unit test: Era filter selects correct ranges.
  - [ ] Unit test: Type filter uses tags (`gmt`, `chronograph`, `dress`, `diver`).

- [x] 11-10 — Catalog info boxes: add `facts` and render with `<details>`

  **What to do**:
  - Extend `CatalogEntry` with optional `facts: string[]`.
  - Render facts using `<details><summary>Facts</summary>…</details>`.
  - Add facts for ≥3 entries.

  **Parallelizable**: YES

  **References**:
  - Catalog card markup: `src/App.tsx` (search for `data-testid="catalog-card"`).
  - Entry schema: `src/game/catalog.ts:12`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: entry with facts renders a `<details>` element.

- [x] 11-12 — Real trusted dealer names: new panel + disclaimer

  **What to do**:
  - Add “Trusted dealers (external)” panel under Catalog (below Sources & Licenses).
  - Include disclaimer:
    - “Dealer names are provided for reference only; no affiliation or endorsement is implied.”
  - MVP list (3): Jason007, Lena, Ethan.

  **Parallelizable**: YES

  **References**:
  - Catalog section end (where to append the dealers panel): `src/App.tsx` (search for `data-testid="catalog-sources"`).

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: disclaimer exists.
  - [ ] Unit test: 5 dealer names render.

### Stats & Lore

- [x] 11-08 — Stats dashboard (derived metrics only)

  **Depends on**: 11-03 (Primary tabs)

  **What to do**:
  - Add a Stats tab panel with derived metrics (no new tracking counters):
    - cash, cash/sec, enjoyment, enjoyment/sec
    - Memories (collection value)
    - workshopPrestigeCount
    - maisonHeritage + maisonReputation
    - current event multiplier

  **Parallelizable**: YES

  **References**:
  - Stats computation: `src/App.tsx:241` (`const stats = useMemo`).
  - Event multiplier: `src/App.tsx:287` (`const currentEventMultiplier = useMemo`).

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: Stats tab shows all listed metrics.

- [x] 11-16 — Lore: 3 chapters unlocked by milestones

  **Depends on**: 11-03 (Primary tabs), 11-08 (Stats dashboard)

  **What to do**:
  - Add `LORE_CHAPTERS` (3) unlocked by milestones:
    - `collector-shelf` → chapter 1 ("First arrivals")
    - `showcase` → chapter 2 ("The cabinet grows")
    - `atelier` → chapter 3 ("Atelier nights")
  - Render in Stats tab as “Journal” section.
  - Provide 2–4 sentence placeholder text for each chapter (written in-house).

  **Parallelizable**: YES

  **References**:
  - Milestones list: `src/game/state.ts:380`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: unlocked milestones show correct chapters.

### Achievements

- [x] 11-09 — Achievements: add 3 new achievements (cents)

  **What to do**:
  - Add achievements:
    - `vault-century`: totalItems ≥ 100
    - `million-memories`: collectionValue ≥ $1,000,000 → `thresholdCents: 100_000_000`
    - `workshop-decade`: workshopPrestigeCount ≥ 10

  **Must NOT do**:
  - Do not add new requirement types.

  **Parallelizable**: YES

  **References**:
  - AchievementRequirement: `src/game/state.ts:95`.
  - Achievements list: `src/game/state.ts:428`.
  - Unlock evaluation helper: `src/game/state.ts:1498`.

  **Acceptance Criteria (TDD)**:
  - [ ] Unit tests: each achievement unlocks at its threshold (cents).

### Calendar & Manual Events

- [x] 11-13 — Emily’s birthday event (annual calendar date)

  **What to do**:
  - Add event `emily-birthday`:
    - incomeMultiplier: 1.27
    - duration: 24 hours (local day)
    - trigger: `{ type: "calendarDate", month: 4, day: 27, timezone: "local" }` (1-based month)
  - Extend `EventTrigger` union and `applyEventState` accordingly.
  - `applyEventState` currently only supports `{ type: "collectionValue" }` triggers; extend with calendar date triggers in a way that preserves existing behavior.
  - `getEventStatusLabel` should show “Ready” if outside 4/27 and not cooling down; show “Active for …” on 4/27, and “Cooldown …” on 4/28.

  **Parallelizable**: YES

  **References**:
  - Current `EventTrigger` type: `src/game/state.ts:111`.
  - Current `applyEventState` implementation: `src/game/state.ts:1035`.
  - Current `getEventStatusLabel` implementation: `src/game/state.ts:1104`.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Calendar Date Tests").

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: 4/27 local date activates event + multiplier 1.27 applies.
  - [ ] Unit test: 4/28 local date sets `nextAvailableAtMs` to next year’s 4/27 at local midnight.

- [x] 11-14 — Mini-game MVP: “Wind the watch” manual event

  **What to do**:
  - Add “Interact” button to each **collection** watch card (not catalog).
  - Modal contract:
    - `role="dialog"`, `aria-modal="true"`, and a close button with `data-testid="wind-close"`.
    - “Wind” button with `data-testid="wind-button"` and progress text `data-testid="wind-progress"`.
    - Closing the modal resets progress to 0.
  - Modal flow: user clicks “Wind” 10 times.
  - Reward: +5% cash and enjoyment for 60 seconds.
  - Implement reward via manual event `wind-up` and `activateManualEvent` helper.
  - `wind-up` event definition: `durationMs: 60_000`, `cooldownMs: 120_000`, `incomeMultiplier: 1.05`.

  **Must NOT do**:
  - Do not build a complex mini-game system.

  **Parallelizable**: NO

  **References**:
  - Watch cards: `src/App.tsx` (collection list card rendering; search for the collection list `#collection-list`).
  - Current `EventTrigger` type: `src/game/state.ts:111`.
  - Current event state shape: `src/game/state.ts:158`.
  - Current `applyEventState` implementation: `src/game/state.ts:1035`.
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Manual Events (for mini-game)").

  **Acceptance Criteria (TDD)**:
  - [ ] Unit test: modal opens/closes.
  - [ ] Unit test: after 10 clicks, manual event activates and multiplier applies.

### Passive Abilities

- [x] 11-15 — Watch abilities: 2 passive bonuses

  **What to do**:
  - Abilities are **multiplicative** and affect **cash only** (do not change enjoyment rate).
  - Spec override: this consolidated plan (user confirmed cash-only).
  - Add abilities:
    - Own 10 `starter` (WatchItemId) → +2% cash
    - Own 5 `chronograph` (WatchItemId) → +5% cash
  - Apply as an additional multiplier in income pipeline.
  - Bonuses stack multiplicatively.

  **Parallelizable**: YES

  **References**:
  - Raw cash income pipeline (pre-softcap): `src/game/state.ts:1002`.
  - Effective cash rate applies event multiplier then softcap: `src/game/state.ts:1081`.
  - Enjoyment rate is computed separately (events apply): `src/game/sim.ts:25` (abilities should NOT apply to enjoyment).
  - Spec: `.sisyphus/plans/phase-11-notes.md` ("Event Multipliers (cash vs enjoyment)").

  **Acceptance Criteria (TDD)**:
  - [ ] Unit tests: seeded state increases effective income with bonuses.

---

## Verification (Phase 11)

- [x] `pnpm run lint`
- [x] `pnpm run typecheck`
- [x] `pnpm run test:unit`
- [x] `pnpm run test:e2e`
- [x] `pnpm run build`
