# Roadmap

## Shipped Milestones

- ✅ **v2.0 Upcoming Major Changes to Game Design** — Phases 13-18 (shipped 2026-01-25) — `.planning/milestones/v2.0-ROADMAP.md`
- ✅ **v2.1 Onboarding & UX** — Phases 20-24 (shipped 2026-01-27) — see phases 20-24 in this file and `.planning/phases/`

## Current Milestone: v3.0 Catalog-First Economy & Interactions (Planning)

### Phase 1: Foundation

**Goal:** [To be planned]
**Depends on:** None
**Plans:** 1/10 plans complete

Plans:
- [ ] TBD (run /gsd:plan-phase 1 to break down)

**Details:**
[To be added during planning]

### Phase 2: Collection Loop

**Goal:** [To be planned]
**Depends on:** Phase 1
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 2 to break down)

**Details:**
[To be added during planning]

### Phase 3: Catalog Images

**Goal:** [To be planned]
**Depends on:** Phase 2
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 3 to break down)

**Details:**
[To be added during planning]

### Phase 4: Workshop Prestige

**Goal:** [To be planned]
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 4 to break down)

**Details:**
[To be added during planning]

### Phase 5: Maison Prestige

**Goal:** [To be planned]
**Depends on:** Phase 4
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 5 to break down)

**Details:**
[To be added during planning]

### Phase 6: Balance Content

**Goal:** [To be planned]
**Depends on:** Phase 5
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 6 to break down)

**Details:**
[To be added during planning]

### Phase 7: Packaging Polish

**Goal:** [To be planned]
**Depends on:** Phase 6
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 7 to break down)

**Details:**
[To be added during planning]

### Phase 8: Collection Integration

**Goal:** [To be planned]
**Depends on:** Phase 7
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 8 to break down)

**Details:**
[To be added during planning]

### Phase 9: UI Reveal Polish

**Goal:** [To be planned]
**Depends on:** Phase 8
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 9 to break down)

**Details:**
[To be added during planning]

### Phase 10: Theme Enjoyment

**Goal:** [To be planned]
**Depends on:** Phase 9
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 10 to break down)

**Details:**
[To be added during planning]

### Phase 11: Phase 11 Notes

**Goal:** [To be planned]
**Depends on:** Phase 10
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 11 to break down)

**Details:**
[To be added during planning]

### Phase 12: major-updates-01-21

**Goal:** [To be planned]
**Depends on:** Phase 11
**Plans:** 10/10 plans complete

Plans:
- [x] 12-01-PLAN.md
- [x] 12-02-PLAN.md
- [x] 12-03-PLAN.md
- [x] 12-04-PLAN.md
- [x] 12-05-PLAN.md
- [x] 12-06-PLAN.md
- [x] 12-07-PLAN.md
- [x] 12-08-PLAN.md
- [x] 12-09-PLAN.md
- [x] 12-10-PLAN.md

**Details:**
[To be added during planning]

### Phase 19: Refactor phase 13 code with phase 13 research in mind

**Goal:** Refactor the Phase 13 enjoyment economy code into clearer, more navigable modules and lock in research-informed invariants with unit tests (no gameplay changes).
**Depends on:** Phase 18
**Plans:** 2/2 plans complete

Plans:
- [x] 19-01-PLAN.md — Extract enjoyment economy selectors into dedicated module
- [x] 19-02-PLAN.md — Add unit coverage for prestige-scaled enjoyment + purchase gating

**Details:**
[To be added during planning]

### Phase 20: Help & Iconography

**Goal:** Users can access game help from anywhere and recognize core UI cues (help/lock/prestige) consistently.
**Depends on:** Phase 19
**Requirements:** GUIDE-01, POLISH-05
**Plans:** 5/5 plans complete

Plans:
- [x] 20-01-PLAN.md — Add shared lucide-react icon wrappers
- [x] 20-02-PLAN.md — Add global Help modal + persistence + header entry point
- [x] 20-03-PLAN.md — Standardize lock/prestige cues using shared icons
- [x] 20-04-PLAN.md — Add Playwright coverage for Help + icon cues
- [x] 20-05-PLAN.md — Human verify mobile Help usability + icon consistency

**Success criteria:**
1. User can open a Help/Glossary entry point from any tab.
2. Help/lock/prestige cues use a consistent icon language across tabs.
3. Help entry point is discoverable and usable on both desktop and mobile.

**Details:**
Add a global Help/Glossary entry point (mobile full-screen modal) and unify the icon language for help/lock/prestige cues.

### Phase 21: Explanations & Rate Transparency

**Goal:** Users can understand what currencies/gates mean and why their enjoyment/cash rates are what they are.
**Depends on:** Phase 20
**Requirements:** GUIDE-02, GUIDE-03, CLAR-03
**Plans:** 6/6 plans complete

Plans:
- [x] 21-01-PLAN.md — Add selector-level cash/enjoyment rate breakdown exports
- [x] 21-02-PLAN.md — Add help section ids + ExplainButton + help wiring for point-of-use explanations
- [x] 21-03-PLAN.md — Show purchase gate explanations (cash vs enjoyment) in Vault
- [x] 21-04-PLAN.md — Add rate breakdown disclosure UI in Stats
- [x] 21-05-PLAN.md — Explain Nostalgia unlock order from the unlock store
- [x] 21-06-PLAN.md — Add Playwright coverage for explain triggers + rate breakdown

**Success criteria:**
1. User can view contextual explanations for currencies and jargon at the point of use.
2. User can see explanations for enjoyment gates vs cash spend and nostalgia unlock order.
3. User can view a basic rate breakdown (base + modifiers) for enjoyment and cash.

**Details:**
Surface existing rules at point-of-use: contextual explanations for currencies/gates and a basic rate breakdown (base + modifiers) for cash and enjoyment.

### Phase 22: Unlock Clarity & Next Actions

**Goal:** Users always see what is locked, why it is locked, and what to do next to progress.
**Depends on:** Phase 21
**Requirements:** CLAR-01, CLAR-02, CLAR-04
**Plans:** 5/5 plans complete

Plans:
- [x] 22-01-PLAN.md — Add selector helpers for unlock progress detail
- [x] 22-02-PLAN.md — Add shared unlock hint + next unlock panel + empty CTA components
- [x] 22-03-PLAN.md — Integrate next unlocks panel + lock reasons into Vault (Collection)
- [x] 22-04-PLAN.md — Add Catalog empty states with a single next-action CTA
- [x] 22-05-PLAN.md — Add e2e coverage + human verify unlock clarity UX

**Success criteria:**
1. User can see why a tab/system is locked and the unlock condition.
2. Empty states explain what the panel is for and provide one clear next action.
3. User can see progress feedback toward next unlocks (progress bar + "next unlock" callout).

**Details:**
Add a consistent lock explanation pattern: a Vault-visible Next unlocks panel for hidden tabs/systems, always-on lock reasons for locked cards, and empty states that include one clear next action.

### Phase 23: Prestige Confirmation & Re-Onboarding

**Goal:** Users can prestige confidently and re-orient immediately after a reset.
**Depends on:** Phase 22
**Requirements:** PRES-01, PRES-02
**Plans:** 3/3 plans complete

Plans:
- [x] 23-01-PLAN.md — Add shared Gain/Keep/Lose prestige summary helpers + renderer
- [x] 23-02-PLAN.md — Integrate summary into Atelier/Maison/Nostalgia confirmation UI
- [x] 23-03-PLAN.md — Add post-prestige onboarding modal + Playwright coverage

**Success criteria:**
1. Before prestiging, user sees a clear lose/keep/gain summary with a safe confirmation.
2. After prestige, user sees a re-onboarding summary and a recommended next action.
3. User can back out of prestiging without committing the reset.

**Details:**
Standardize the prestige UX for Atelier, Maison, and Nostalgia:
- Before prestiging: show a clear Gain/Keep/Lose summary and a safe confirmation that can be canceled.
- After prestiging: show an immediate re-onboarding surface with one recommended next action.
- Keep Workshop/Maison results session-scoped (UI-only state in `src/App.tsx`); reuse Nostalgia's existing persisted last-gain fields.

### Phase 24: UI Polish Pass

**Goal:** The UI feels consistent, readable, and responsive, improving scanability and reducing friction.
**Depends on:** Phase 23
**Requirements:** POLISH-01, POLISH-02, POLISH-03, POLISH-04
**Plans:** 6/6 plans complete

Plans:
- [x] 24-01-PLAN.md — Harden global CSS primitives (focus, motion, responsive helpers)
- [x] 24-02-PLAN.md — Reuse stats grid + nav styling hooks in App header
- [x] 24-03-PLAN.md — Polish Vault + Career hierarchy and CTA emphasis
- [x] 24-04-PLAN.md — Polish prestige tabs CTA hierarchy (Workshop/Maison/Nostalgia)
- [x] 24-05-PLAN.md — Polish Catalog/Stats/Save hierarchy and responsiveness
- [x] 24-06-PLAN.md — Run smoke checks + human verify polish pass

**Success criteria:**
1. Key stats and primary CTAs have clear visual hierarchy (typography/spacing emphasis).
2. Card/layout styling is consistent across tabs with reduced clutter.
3. Color/contrast changes improve readability for typical play on desktop and mobile.
4. Primary buttons and progress transitions provide clear micro-interaction feedback.

**Details:**
Harden global CSS primitives (focus-visible rings, reduced-motion handling, pressed states, responsive header helpers, missing layout utilities like `.stats-grid`) and then apply low-risk class/markup tweaks per tab to improve hierarchy, reduce clutter, and preserve stable selectors.

### Phase 25: Watch Models & Duplicates

**Goal:** Watches are specific models and duplicates have diminishing returns.
**Depends on:** Phase 24
**Requirements:** WATCH-01, WATCH-02
**Plans:** 7/7 plans complete

Plans:
- [x] 25-01-PLAN.md — Add watch model roster + state + duplicate curve helpers
- [x] 25-02-PLAN.md — Implement model buy/dismantle + apply diminishing returns to enjoyment/memories
- [x] 25-03-PLAN.md — Update Vault UI to buy models grouped by brand + show duplicate multiplier
- [x] 25-04-PLAN.md — Update unit + e2e coverage for model purchasing and duplicates
- [x] 25-05-PLAN.md — Human verify Vault model purchase UX + duplicate messaging
- [x] 25-06-PLAN.md — Migrate legacy watch ownership to model ownership
- [x] 25-07-PLAN.md — Auto-buy purchases watch models instead of tiers

**Success criteria:**
1. User sees specific watch models (brand/model) as the purchasable items (not generic tiers).
2. Buying a watch increases the owned count for that specific model.
3. Buying duplicate copies after the first yields visibly reduced enjoyment/memories gains vs the first copy.

**Details:**
Introduce a model-level purchasable watch system (IDs stable, mapped to catalog references) and apply a transparent diminishing-returns curve for duplicates.

### Phase 26: Catalog-First Shop

**Goal:** Catalog is the default landing and primary purchase surface with in-context help.
**Depends on:** Phase 25
**Requirements:** CATALOG-01, CATALOG-02, CATALOG-03, CATALOG-04
**Plans:** 0/5 plans complete

Plans:
- [ ] 26-01-PLAN.md — Make Catalog the default landing tab (+ deep link override)
- [ ] 26-02-PLAN.md — Add catalog shopping help section (duplicates + lock reasons)
- [ ] 26-03-PLAN.md — Add catalog card buy action bar + wire purchases + owned/unowned by ownership
- [ ] 26-04-PLAN.md — Add single Catalog help button + expandable card details + micro-feedback + unit coverage
- [ ] 26-05-PLAN.md — Human verify catalog-first shop UX (desktop + mobile)

**Success criteria:**
1. Fresh save lands on the Catalog; existing saves open predictably.
2. Each catalog entry shows price, owned count, and a buy CTA or clear lock reason.
3. User can buy a watch directly from a catalog entry and immediately see ownership reflected without leaving the catalog flow.
4. User can access catalog-relevant help tips while browsing/buying.

**Details:**
Move the watch purchase UX into the Catalog tab and make the Catalog the primary progression surface (with clear CTAs and lock explanations).

### Phase 27: Career-First Economy & Upgrades Surface

**Goal:** Cash economy is career-driven; upgrades are separated and transparent.
**Depends on:** Phase 26
**Requirements:** ECON-01, ECON-02, CAREER-01, CAREER-02, NAV-01, CLAR-05
**Plans:** 0/6 plans complete

Plans:
- [ ] 27-01-PLAN.md — Add career tracks + progression tree state + save persistence
- [ ] 27-02-PLAN.md — Make cash career-only and implement track-aware session rules (free-first)
- [ ] 27-03-PLAN.md — Make Career visible from start and add progression tree UI + messaging
- [ ] 27-04-PLAN.md — Add dedicated Upgrades tab with before/after previews; remove Vault duplication
- [ ] 27-05-PLAN.md — Add unit + e2e coverage for career-first economy and upgrades surface
- [ ] 27-06-PLAN.md — Human verify career-first economy + upgrades preview UX

**Success criteria:**
1. Career progression is usable from the beginning and offers specialization/path depth the user can choose.
2. User earns cash through career progression; owning watches does not create a parallel cash faucet.
3. Therapist sessions: first session costs 0 enjoyment; subsequent sessions spend enjoyment (rule is visible before committing).
4. Upgrades are accessible from a dedicated surface/tab separate from the catalog purchase flow.
5. Before buying an upgrade, user can see the effect it will have on cash/enjoyment rates.

**Details:**
Rework cash generation to align with a career-first economy and split upgrade browsing/purchasing into a dedicated surface, with clear before/after effects.

### Phase 28: Wear-One Bonus

**Goal:** User can wear exactly one watch and see its unique bonus.
**Depends on:** Phase 27
**Requirements:** WATCH-03
**Plans:** 0/7 plans complete

Plans:
- [ ] 28-01-PLAN.md — Add worn watch state + persistence sanitization
- [ ] 28-02-PLAN.md — Implement worn-watch enjoyment bonus + breakdown line
- [ ] 28-03-PLAN.md — Add Vault equip UX + worn summary + picker modal
- [ ] 28-04-PLAN.md — Add unit tests for worn watch persistence + breakdown
- [ ] 28-05-PLAN.md — Add Help content + ExplainButton for worn-watch bonus
- [ ] 28-06-PLAN.md — Add Playwright coverage for wear-one flow + stats bonus
- [ ] 28-07-PLAN.md — Human verify wear-one UX on desktop + mobile

**Success criteria:**
1. User can select exactly one owned watch to wear; UI indicates which is worn.
2. Wearing a watch provides a distinct visible bonus; switching the worn watch updates the bonus immediately.
3. Equipping one watch always unequips the previous one (no stacking).

**Details:**
Add a single equip slot and a clear, player-visible bonus per worn watch that integrates into rate breakdowns.

### Phase 29: Interactions & Mini-Games

**Goal:** Watch-type interactions work (winding + automatics) with clear feedback.
**Depends on:** Phase 28
**Requirements:** ACT-01, ACT-02, ACT-03, ACT-04, ACT-05
**Plans:** 0/6 plans complete

Plans:
- [ ] 29-01-PLAN.md — Add movement typing + per-item cooldown/power reserve state + reward actions
- [ ] 29-02-PLAN.md — Replace wind session with timing-bar winding mini-game (animation + tiers)
- [ ] 29-03-PLAN.md — Add automatic mini-game + power reserve reward (decay + enjoyment effect)
- [ ] 29-04-PLAN.md — Add quartz time-setting mini-game + complete interaction gating
- [ ] 29-05-PLAN.md — Update unit + e2e coverage for interactions (stable selectors)
- [ ] 29-06-PLAN.md — Human verify interaction feel + clarity (desktop + mobile)

**Success criteria:**
1. Winding is available only for non-automatic watches; automatic watches do not show winding.
2. Winding includes a visible winding animation.
3. Winding provides clear success/failure cues and communicates rewards.
4. Winding is skill/timing-based (player input matters beyond a single button).
5. Automatic watches have at least one distinct interaction mini-game and its rewards are communicated.

**Details:**
Generalize interactions into watch-type gated mini-games; improve winding UX and add at least one automatic-specific interaction.

### Phase 30: Workshop/Atelier + Docs

**Goal:** Workshop/Atelier UX is clearer, balance improves, and help matches v3.0.
**Depends on:** Phase 29
**Requirements:** WORK-01, WORK-02, BAL-01, HELP-01, HELP-02
**Plans:** 0/4 plans complete

Plans:
- [ ] 30-01-PLAN.md — Gate dismantle behind Atelier unlock + add next-Blueprint progress + tune legacy pace
- [ ] 30-02-PLAN.md — Expand Help content + add stable section IDs for v3.0 systems
- [ ] 30-03-PLAN.md — Wire ExplainButtons in Atelier/Career/Upgrades/Interactions + add micro-copy
- [ ] 30-04-PLAN.md — Human verify Workshop/Atelier clarity + Help deep-links

**Success criteria:**
1. Workshop dismantle UI is hidden until the workshop system is unlocked.
2. Atelier view shows how much money is needed for the next blueprint.
3. Atelier bonuses are tuned so the second vault run is meaningfully faster than the first.
4. Help documentation explains the dual-currency system and career progression mechanics in detail.
5. Help is updated to reflect the v3.0 catalog-first economy and interaction mechanics.

**Details:**
Tighten Workshop/Atelier presentation and tune bonuses for better pacing; refresh Help content to match v3.0 systems.

---

## Upcoming Milestones

- TBD
