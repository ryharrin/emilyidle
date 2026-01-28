# Phase 30: Workshop/Atelier + Docs (Tests-First)

## TL;DR

> Tighten the Atelier (Workshop) experience by (1) hiding dismantle everywhere until the Atelier system is actually unlocked, (2) adding a clear “next +1 Blueprint” readout (enjoyment remaining + dollars hint + rough ETA) in the reset panel, (3) tuning the post-reset pacing so the second run reaches the next Atelier reset ~3x faster, and (4) expanding existing Help sections (stable IDs) with very detailed v3.0 explanations + add ExplainButtons at key UI surfaces.

**Deliverables**:

- Dismantle gated everywhere until Atelier unlock, plus last-copy dismantle policy
- “Next +1 blueprint” readout in Atelier reset UI (enjoyment + dollars hint + ETA)
- Pacing tune: second run ~3x faster to next Atelier reset (with brief in-UI explanation)
- Very detailed Help updates (expand existing sections/IDs; no restructure)
- Updated Vitest + Playwright coverage for all changed behaviors

**Estimated effort**: Large
**Parallel execution**: YES (2 waves)
**Critical path**: Dismantle gating + tests -> Next blueprint readout + tests -> Help updates + tests

---

## Context

### Source of Truth

- Phase context: `.planning/phases/30-workshop-atelier-and-docs/30-CONTEXT.md`

### Existing Code Anchors

- Atelier tab / reset panel / dismantle list: `src/ui/tabs/WorkshopTab.tsx`
  - Reset threshold + current gain: `src/ui/tabs/WorkshopTab.tsx:97-108`
  - Teaser progress: `src/ui/tabs/WorkshopTab.tsx:216-229`
  - Dismantle list: `src/ui/tabs/WorkshopTab.tsx:233-276`
- Vault/Collection dismantle affordance also exists: `src/ui/tabs/CollectionTab.tsx` (search for `dismantleItem` usage)
- Dismantle action (currently ungated, allows going to 0 owned): `src/game/actions/index.ts:92-118`
- Workshop prestige gain formula (step function): `src/game/selectors/index.ts:325-331`
- Workshop reveal semantics used by UI:
  - `src/App.tsx` computes `showWorkshopPanel` / `showWorkshopTeaser` / `showWorkshopSection`
  - `src/game/selectors/index.ts:402-404` (`isWorkshopRevealReady`)
- Help content: `src/ui/help/helpContent.ts` (contains `HELP_SECTION_IDS` and `HELP_SECTIONS`)
- Explain button pattern: `src/ui/help/ExplainButton.tsx`

### Test Infrastructure

- Unit: Vitest (`pnpm run test:unit`) and Testing Library
- E2E: Playwright (`pnpm run test:e2e`)
- Existing dismantle tests to update:
  - `tests/catalog.unit.test.tsx:1276-1319`
  - `tests/collection-loop.spec.ts:767-787`
  - `tests/workshop.unit.test.tsx:82-107`

---

## Work Objectives

### Core Objective

Make Atelier/Workshop progression clearer and safer, tune prestige pacing, and ensure the Help system accurately and thoroughly describes v3.0 mechanics.

### Definition of Done

- `pnpm run test:unit` passes
- `pnpm run test:e2e` passes
- `pnpm run typecheck` passes
- `pnpm run lint` passes
- Manual spot-checks confirm:
  - Dismantle is hidden until unlock (Workshop + Vault/Collection)
  - Next +1 blueprint readout makes sense (including rate=0 cases)
  - Help content reads correctly and ExplainButtons land in the right section

### Guardrails (from Metis + user decisions)

- Keep Help section IDs stable; do not rename existing `HELP_SECTION_IDS.*` values.
- Hide dismantle _everywhere_ until Atelier unlock (not just in the Atelier tab).
- Block dismantling the last owned copy of a watch.
- Tests-first: every behavior change is introduced with tests (RED -> GREEN -> REFACTOR).
- Avoid scope creep:
  - No new navigation restructure for Help.
  - No new “Upgrades tab” creation here (Phase 27 owns that); only add ExplainButtons where surfaces exist.

---

## Verification Strategy (TDD)

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright)
- **User wants tests**: YES (TDD)
- **Frameworks**: `vitest` and `@playwright/test`

Each TODO below includes both (a) test acceptance and (b) manual verification steps.

---

## Execution Strategy

Wave 1 (Start Immediately):

- Task 1: Define Atelier unlock gating + dismantle policies at selector/action level (w/ unit tests)
- Task 2: Update UI surfaces to respect gating + last-copy (w/ unit tests)

Wave 2 (After Wave 1):

- Task 3: “Next +1 Blueprint” readout (calc + UI) (w/ unit tests + e2e)
- Task 4: Help expansions + ExplainButtons (w/ unit tests)
- Task 5: Balance tuning harness + tuning + verification (unit tests where possible, manual benchmark)

---

## TODOs

- [ ] 1. Define “Atelier unlocked” gate + dismantle rules (selectors/actions)

  **What to do**:
  - Decide and implement a single boolean “Atelier unlocked” source of truth used by:
    - UI visibility (Workshop tab content + Vault/Collection)
    - `dismantleItem` action gating
  - Implement last-copy policy: dismantle must be a no-op when it would take a watch from 1 -> 0.
  - Implement “hide everywhere until unlocked” by ensuring `dismantleItem` is a no-op when locked.

  **Recommended default** (encode in code + tests):
  - Treat Atelier “unlocked” as the _panel unlock_ condition (`showWorkshopPanel` semantics in `src/App.tsx`), not mere teaser reveal.

  **References**:
  - `src/App.tsx:573-576` - current `showWorkshopPanel` / `showWorkshopTeaser` semantics
  - `src/game/actions/index.ts:92-118` - current `dismantleItem` implementation
  - `src/ui/tabs/WorkshopTab.tsx:233-276` - Workshop dismantle list surface
  - `tests/workshop.unit.test.tsx:82-107` - existing dismantle unit test to update

  **Acceptance Criteria (tests)**:
  - Add/extend unit tests in `tests/workshop.unit.test.tsx`:
    - Dismantle while locked returns unchanged state
    - Dismantle with owned=1 returns unchanged state
    - Dismantle with owned>=2 removes exactly 1 (or quantity) but never below 1
  - `pnpm run test:unit` -> PASS

  **Manual verification**:
  - N/A (behavior enforced by unit tests)

- [ ] 2. Hide dismantle everywhere until unlock (UI) + align copy with “gain only”

  **What to do**:
  - Workshop/Atelier UI:
    - When teaser-only: show teaser panel and a locked placeholder; do NOT show crafting/dismantle list.
    - When unlocked: show crafting/dismantle section as visible section.
  - Vault/Collection UI:
    - Remove/disable any dismantle affordance until Atelier unlocked.
    - Ensure “block last copy” is respected (button disabled when owned<=1).
  - Copy:
    - Dismantle cards should emphasize parts gained (gain-only), not “Lose” wording.
    - One-step action stays.

  **References**:
  - `src/ui/tabs/WorkshopTab.tsx:233-276` - dismantle card currently shows parts-per-watch + owned and a Dismantle button
  - `src/ui/tabs/WorkshopTab.tsx:216-229` - teaser-only state UI
  - `src/ui/tabs/CollectionTab.tsx` - contains current dismantle affordance and “Dismantle value” copy (search `dismantleItem`)
  - `src/style.css` - existing panel + card stack patterns; don’t invent a new design system

  **Acceptance Criteria (tests)**:
  - Update unit test `tests/catalog.unit.test.tsx:1276-1319`:
    - Seed enough tourbillons to dismantle twice _without_ hitting last-copy block (seed 3, dismantle twice -> ends at 1 owned).
    - Assert parts count reaches 16 and crafting still works.
  - Update Playwright test `tests/collection-loop.spec.ts:767-787` similarly (seed 3 tourbillons; dismantle twice; remaining owned=1).
  - Add a unit test (new or existing) asserting teaser-only state does not render `workshop-dismantle-list`.
  - `pnpm run test:unit` -> PASS
  - `pnpm run test:e2e` -> PASS

  **Manual verification**:
  - Run `pnpm dev`, load a save where Atelier is not unlocked but reveal teaser is visible:
    - Verify no dismantle controls appear anywhere.
    - Verify the locked placeholder explains what will unlock it.

- [ ] 3. Implement “Next +1 Blueprint” readout (enjoyment + dollars hint + ETA)

  **What to do**:
  - Compute “next +1 blueprint” as the next point where `getWorkshopPrestigeGain(state)` would increase by 1.
  - Display in `src/ui/tabs/WorkshopTab.tsx` reset section near:
    - Reset threshold
    - Current gain
  - Display must include:
    - Enjoyment remaining
    - Dollars-related hint (if derivable)
    - Rough ETA using current enjoyment rate

  **Defaults applied (to keep scope bounded)**:
  - Dollars-related hint uses a derivable estimate: “expected dollars earned by the ETA at current dollars/sec”.
    - If enjoyment rate is 0 -> show ETA as “—” and omit dollars estimate.

  **References**:
  - `src/game/selectors/index.ts:325-331` - current gain formula
  - `src/ui/tabs/WorkshopTab.tsx:97-108` - reset panel layout
  - `src/ui/tabs/StatsTab.tsx` - existing rate breakdown patterns to reuse for terminology
  - `tests/workshop.unit.test.tsx:19-28` - existing workshop gain tests

  **Acceptance Criteria (tests)**:
  - Add new unit tests (suggest `tests/workshop.unit.test.tsx`) for helper(s) that compute:
    - enjoyment required for next +1 gain across step boundaries
    - correct handling when `enjoymentRateCentsPerSec` is 0
  - Add/extend a unit test that renders WorkshopTab and asserts the new readout appears only when Atelier panel is unlocked.
  - `pnpm run test:unit` -> PASS

  **Manual verification**:
  - In dev, confirm readout behaves sensibly at:
    - enjoyment=0
    - just below/above a step boundary
    - when Maison line bonus / crafted boost multiplier affects gain

- [ ] 4. Tune Atelier bonuses so second run is ~3x faster; add brief in-UI explanation

  **What to do**:
  - Define a benchmark scenario for “time to next Atelier reset”:
    - Include offline/idle time as real-time.
    - Compare run 1 vs run 2 using the same purchase policy (document in plan notes).
  - Adjust only allowed knobs (explicitly list in implementation PR):
    - Atelier upgrade effects and/or costs
    - Prestige/legacy multipliers relevant to enjoyment accumulation
    - (Avoid broad economy rewrites.)
  - Add a brief “Faster run: Atelier upgrades + Prestige legacy” line in the Atelier reset panel with an ExplainButton.

  **References**:
  - Legacy multiplier (current): `src/game/selectors/enjoyment.ts` (search `workshopPrestigeCount` multiplier)
  - Workshop upgrades: `src/game/model/state.ts` (search `WORKSHOP_UPGRADES`)
  - Atelier panel copy location: `src/ui/tabs/WorkshopTab.tsx:147-153`
  - Prestige onboarding copy: `src/ui/prestigeOnboarding.ts` (Atelier reset complete messaging)

  **Acceptance Criteria (tests)**:
  - Add unit tests for any new helper that reports “run speed sources” for display.
  - Add unit test to assert the Atelier panel shows the “Faster run: …” line once the first reset has happened (seeded state).
  - Manual benchmark required (non-flaky): document and verify ~3x target.

  **Manual verification (required)**:
  - With two seeded saves (pre-first-reset and post-first-reset), measure time-to-next-reset by stopwatch.
  - Target: run 2 time is ~1/3 run 1 time (± reasonable tolerance).

- [ ] 5. Expand Help content (very detailed) and add ExplainButtons at key surfaces

  **What to do**:
  - Expand existing Help sections in `src/ui/help/helpContent.ts`:
    - Very detailed rules, edge cases, and numbers where helpful.
    - Cover: dual currency + gates, career progression, interactions/mini-games.
  - Do not restructure Help navigation; preserve section ids.
  - Add ExplainButtons at:
    - Atelier reset panel
    - Career tab
    - Interaction buttons/modals
    - Upgrades tab (only if/when that surface exists; otherwise leave a TODO for Phase 27 integration)

  **References**:
  - Help content: `src/ui/help/helpContent.ts`
  - Help modal: `src/ui/help/HelpModal.tsx`
  - Explain button: `src/ui/help/ExplainButton.tsx`
  - Existing Explain usage (example): `src/ui/tabs/CollectionTab.tsx:530-531`

  **Acceptance Criteria (tests)**:
  - Add unit tests verifying:
    - `HELP_SECTION_IDS` values remain unchanged
    - New/expanded content includes required keywords (e.g., “career”, “sessions”, “winding”, “power reserve”) to avoid regressions
    - ExplainButton opens the HelpModal focused on the expected section id (existing test patterns)
  - `pnpm run test:unit` -> PASS

  **Manual verification**:
  - Open Help, skim each updated section for correctness and readability.
  - Click each new ExplainButton and confirm it navigates to the intended section.

---

## Commit Strategy

- Commit 1: `feat(workshop): gate dismantle until atelier unlock`
- Commit 2: `feat(workshop): show next +1 blueprint readout`
- Commit 3: `tune(workshop): adjust atelier pacing and disclose sources`
- Commit 4: `docs(help): expand v3.0 mechanics and add explain links`

---

## Final Verification

Run:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:unit
pnpm run test:e2e
```
