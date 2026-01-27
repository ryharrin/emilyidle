# Roadmap

## Shipped Milestones

- ✅ **v2.0 Upcoming Major Changes to Game Design** — Phases 13-18 (shipped 2026-01-25) — `.planning/milestones/v2.0-ROADMAP.md`

## Current Milestone: v2.1 Onboarding & UX (Planning)

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
**Plans:** 0/2 plans complete

Plans:
- [ ] 19-01-PLAN.md — Extract enjoyment economy selectors into dedicated module
- [ ] 19-02-PLAN.md — Add unit coverage for prestige-scaled enjoyment + purchase gating

**Details:**
[To be added during planning]

### Phase 20: Help & Iconography

**Goal:** Users can access game help from anywhere and recognize core UI cues (help/lock/prestige) consistently.
**Depends on:** Phase 19
**Requirements:** GUIDE-01, POLISH-05
**Plans:** 4/5 plans complete

Plans:
- [x] 20-01-PLAN.md — Add shared lucide-react icon wrappers
- [x] 20-02-PLAN.md — Add global Help modal + persistence + header entry point
- [x] 20-03-PLAN.md — Standardize lock/prestige cues using shared icons
- [x] 20-04-PLAN.md — Add Playwright coverage for Help + icon cues
- [ ] 20-05-PLAN.md — Human verify mobile Help usability + icon consistency

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
**Plans:** 0/6 plans complete

Plans:
- [ ] 21-01-PLAN.md — Add selector-level cash/enjoyment rate breakdown exports
- [ ] 21-02-PLAN.md — Add help section ids + ExplainButton + help wiring for point-of-use explanations
- [ ] 21-03-PLAN.md — Show purchase gate explanations (cash vs enjoyment) in Vault
- [ ] 21-04-PLAN.md — Add rate breakdown disclosure UI in Stats
- [ ] 21-05-PLAN.md — Explain Nostalgia unlock order from the unlock store
- [ ] 21-06-PLAN.md — Add Playwright coverage for explain triggers + rate breakdown

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
**Plans:** 0/5 plans complete

Plans:
- [ ] 22-01-PLAN.md — Add selector helpers for unlock progress detail
- [ ] 22-02-PLAN.md — Add shared unlock hint + next unlock panel + empty CTA components
- [ ] 22-03-PLAN.md — Integrate next unlocks panel + lock reasons into Vault (Collection)
- [ ] 22-04-PLAN.md — Add Catalog empty states with a single next-action CTA
- [ ] 22-05-PLAN.md — Add e2e coverage + human verify unlock clarity UX

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
**Plans:** 0/3 plans complete

Plans:
- [ ] 23-01-PLAN.md — Add shared Gain/Keep/Lose prestige summary helpers + renderer
- [ ] 23-02-PLAN.md — Integrate summary into Atelier/Maison/Nostalgia confirmation UI
- [ ] 23-03-PLAN.md — Add post-prestige onboarding modal + Playwright coverage

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
**Plans:** 0/6 plans complete

Plans:
- [ ] 24-01-PLAN.md — Harden global CSS primitives (focus, motion, responsive helpers)
- [ ] 24-02-PLAN.md — Reuse stats grid + nav styling hooks in App header
- [ ] 24-03-PLAN.md — Polish Vault + Career hierarchy and CTA emphasis
- [ ] 24-04-PLAN.md — Polish prestige tabs CTA hierarchy (Workshop/Maison/Nostalgia)
- [ ] 24-05-PLAN.md — Polish Catalog/Stats/Save hierarchy and responsiveness
- [ ] 24-06-PLAN.md — Run smoke checks + human verify polish pass

**Success criteria:**
1. Key stats and primary CTAs have clear visual hierarchy (typography/spacing emphasis).
2. Card/layout styling is consistent across tabs with reduced clutter.
3. Color/contrast changes improve readability for typical play on desktop and mobile.
4. Primary buttons and progress transitions provide clear micro-interaction feedback.

**Details:**
Harden global CSS primitives (focus-visible rings, reduced-motion handling, pressed states, responsive header helpers, missing layout utilities like `.stats-grid`) and then apply low-risk class/markup tweaks per tab to improve hierarchy, reduce clutter, and preserve stable selectors.

---

## Upcoming Milestones

- TBD
