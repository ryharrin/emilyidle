# Pitfalls Research

**Domain:** Onboarding + contextual help (tooltips/coachmarks) + progress cues for an incremental/idle game with multi-layer prestige
**Researched:** 2026-01-25
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Teaching systems the player cannot use yet

**What goes wrong:**
Onboarding steps/coachmarks fire before the relevant mechanic is unlocked (or when the tab is still hidden), so players see advice they cannot act on and learn to ignore guidance.

**Why it happens:**
Tutorial triggers are built off “first session” timing instead of game state (milestones/unlocks/tab visibility).

**How to avoid:**
Gate every onboarding step by the same unlock signals the UI uses (milestones, reveal ratios, tab visibility). Prefer “pull” contextual help triggered by intent/state over forced “push” tours.

**Warning signs:**
Players report “I saw a tip but didn’t know where to go.” Analytics show coachmarks dismissed quickly without correlated actions (buy, upgrade, prestige).

**Phase to address:**
Phase 2 (Onboarding state + triggers).

---

### Pitfall 2: Over-explaining and creating tooltip fatigue

**What goes wrong:**
Too many tooltips/steps (or ones that explain obvious UI) creates “banner blindness”; players skip everything, including the one tip that matters.

**Why it happens:**
Teams respond to confusion by adding more hints instead of fixing the underlying comprehension problem.

**How to avoid:**
Limit to a small number of high-leverage moments (first buy, first upgrade, first prestige preview, first prestige confirmation). Keep each tip to one idea + one action.

**Warning signs:**
High skip/dismiss rates; support reports “tutorial is annoying”; usability sessions show users understand navigation without tips.

**Phase to address:**
Phase 1 (UX audit + copy/IA) and Phase 3 (Tooltips).

---

### Pitfall 3: “Push tutorials” that interrupt play and are quickly forgotten

**What goes wrong:**
A multi-step forced tour blocks interaction or steals focus, causing churn and poor retention of information.

**Why it happens:**
It’s cheaper to build a modal tour than to add in-context help, and it feels “complete” in demos.

**How to avoid:**
Prefer contextual help that is easy to dismiss and easy to recall later (e.g., a Coachmarks panel, a Help drawer, or per-feature “?” affordances).

**Warning signs:**
Players bounce during first session; people cannot repeat the task after the tour ends.

**Phase to address:**
Phase 3 (Tooltips/coachmarks UX) and Phase 5 (QA + iteration).

---

### Pitfall 4: Tooltip/coachmark state doesn’t survive the right resets

**What goes wrong:**
On prestige, the tutorial either resets (re-spams experienced players) or never reappears (players are lost after a reset introduces new dynamics).

**Why it happens:**
Tutorial state is stored in the wrong persistence bucket (game save vs user settings) or keyed too broadly (only “dismissed once ever”).

**How to avoid:**
Model onboarding state explicitly per layer:
- Per-account/per-browser (Settings): “I know the UI patterns” (dismissal).
- Per-run (Save): “I have done this action this run” (e.g., first purchase after Nostalgia prestige).
Add versioning so new onboarding can appear without wiping old state.

**Warning signs:**
Playtests: after prestige, players ask “what changed?”; returning players complain they keep seeing the same tips.

**Phase to address:**
Phase 2 (Persistence model) and Phase 4 (Prestige re-onboarding).

---

### Pitfall 5: Progress cues lie (or feel inconsistent)

**What goes wrong:**
Progress bars/teasers show 80-90% but the last 10% takes much longer, or “next milestone soon” appears too early/too late. Players feel manipulated or confused.

**Why it happens:**
Idle economies are nonlinear (exponential costs, multipliers). A naive linear ratio doesn’t match perceived time-to-goal.

**How to avoid:**
Pair % progress with a concrete “what to do next” and a tangible target (e.g., “Earn X enjoyment to unlock Atelier”). Where possible, show time-to-target using current rates, but label it as an estimate.

**Warning signs:**
Players stall around prestige thresholds; feedback like “the bar is stuck”; users repeatedly click locked buttons to "check".

**Phase to address:**
Phase 4 (Progress cues + pacing).

---

### Pitfall 6: Onboarding contradicts the game’s actual optimal loop

**What goes wrong:**
Tips encourage spending the wrong currency, buying the wrong items, or prestiging too early/late, resulting in slower progression and mistrust.

**Why it happens:**
Copy is written from a design doc, but the live balance has drifted (or differs per milestone/unlock).

**How to avoid:**
Derive tip text from the same selectors that compute gates and thresholds (and keep tips generic when balance-sensitive). Add at least one unit test per “critical tip trigger” to prevent regressions.

**Warning signs:**
Players say “your tip was wrong”; guide content needs constant manual edits after balance changes.

**Phase to address:**
Phase 1 (UX + economy alignment) and Phase 5 (tests).

---

### Pitfall 7: Tooltips break when UI changes (brittle anchors)

**What goes wrong:**
Tooltips/coachmarks render off-screen, cover the wrong element, or fail to appear after refactors.

**Why it happens:**
Anchoring relies on fragile CSS selectors or DOM structure rather than stable IDs/test IDs.

**How to avoid:**
Anchor to stable, semantic targets (consistent ids/data-testid) and treat these as API. Add Playwright checks for at least one representative tip per tab.

**Warning signs:**
Random reports like “tooltip is floating in the middle”; small layout tweaks cause large onboarding regressions.

**Phase to address:**
Phase 3 (Implementation) and Phase 5 (E2E tests).

---

### Pitfall 8: No clear “end” or re-entry for onboarding

**What goes wrong:**
Players don’t know when the tutorial is finished, and later cannot find help again when they forget.

**Why it happens:**
Onboarding is treated as a one-time linear tour, not a help system.

**How to avoid:**
Provide:
- A visible “You’re set” completion moment.
- A way to revisit help (Settings toggle, Help tab/section, reset coachmarks).

**Warning signs:**
Users ask the same questions repeatedly; “I skipped it, how do I see it again?”

**Phase to address:**
Phase 3 (Help UX) and Phase 4 (Re-onboarding moments).

---

### Pitfall 9: Ignoring the returning-player context (offline gains + reorientation)

**What goes wrong:**
Players come back after time away and can’t tell what changed: what they earned, what to buy next, what new system unlocked.

**Why it happens:**
Design focuses on first-time onboarding only; idle games need “re-entry UX” every session.

**How to avoid:**
Add lightweight session-start cues: highlight the next upgrade/milestone, show “since you were away” deltas, and surface the single best next action.

**Warning signs:**
Players reopen the game, stare at numbers, and close it; churn is high for returning sessions.

**Phase to address:**
Phase 4 (Progress cues + re-entry).

---

### Pitfall 10: Adding guidance instead of reducing complexity

**What goes wrong:**
Tooltips become a crutch for confusing UI (dual currency, prestige layers, unlock order), increasing cognitive load rather than reducing it.

**Why it happens:**
It’s faster to add text than to change information architecture or visual hierarchy.

**How to avoid:**
Use onboarding findings to drive UI fixes: clearer labels, better grouping, stronger affordances, and progressive disclosure. Tooltips should clarify edge cases, not explain the main loop.

**Warning signs:**
Tooltip text grows over time; new players still fail the same tasks even with more help.

**Phase to address:**
Phase 1 (UX audit) and Phase 5 (iteration).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode tooltip copy/IDs throughout tab components | Fast to ship | Impossible to evolve onboarding; inconsistent phrasing | Only for one-off labels; otherwise centralize definitions |
| Store onboarding completion only as booleans (no versioning) | Simple persistence | You can’t introduce new tips without wiping state | Never; add a schema version for onboarding state |
| Tie tooltips to DOM structure/CSS selectors | Avoids adding stable anchors | Refactors break guidance | Never; use stable ids/data-testid |
| Recompute onboarding/progress cue logic on every sim tick | Easy access to `state` | Jank/rerenders; difficult to test | Only if memoized and scoped to active tab |

## Integration Gotchas

Common mistakes when connecting onboarding/progress cues to existing game systems.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Settings vs Save persistence | Tutorial state stored in save and wiped/reset unexpectedly | Split: per-browser settings for dismissals; per-run save flags for “did action this run”; version both |
| Prestige resets (Workshop/Maison/Nostalgia) | Same onboarding shown pre- and post-reset; or never shown for new meta systems | Re-onboard at each new layer with minimal steps, triggered by first unlock/first visit |
| Unlock visibility ratios / teaser panels | “Soon” hints spammed or mismatch actual availability | Reuse existing reveal thresholds consistently; include concrete next goal label |
| Playwright selectors | Tooltips introduce unstable DOM or reorder elements, breaking tests | Keep `data-testid` stable; add dedicated test IDs for onboarding targets |
| Import/export save | Onboarding flags not migrated on save version bumps | Treat onboarding state as first-class schema with migration/sanitization |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Tooltip overlays cause layout thrash | Flicker, shifting UI, scroll jumps | Prefer non-layout-affecting overlays; avoid measuring on every render | On low-end mobile / lots of UI cards |
| Re-rendering tooltip layers every tick | High CPU; fan noise; dropped frames | Memoize tip computations; update only on relevant state changes | Always noticeable on long sessions |
| Highlight animations stacked with idle counters | Visual noise; motion sickness complaints | Use restrained animation; throttle attention-drawing effects | When many unlocks trigger together |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering tooltip content from imported saves or external data as HTML | XSS in a static app context | Keep tooltip content plain text/React nodes; never `dangerouslySetInnerHTML` for help content |
| Over-collecting analytics/events for onboarding | Privacy expectations mismatch for a casual game | Keep instrumentation minimal, transparent, and local-only unless explicitly adding telemetry |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Tooltips use internal jargon (e.g., names of layers/currencies without grounding) | Confusion, misinterpretation | Use player-facing language, tie to visible UI labels |
| No "what next" after completing a step | Players stall | Each cue ends with a single next action and points to the relevant control |
| Progress cues focus only on percentages | Players don’t know what to do | Show target labels, unlock names, and concrete thresholds |
| One-size-fits-all onboarding | Experienced players annoyed, new players lost | Segment by progress (first session vs first prestige vs returning) |

## "Looks Done But Isn't" Checklist

- [ ] **Onboarding triggers:** Don’t fire when a tab is hidden/locked; verify with milestone gating.
- [ ] **Skip + recall:** Every multi-step flow is skippable and has a way to revisit later.
- [ ] **Prestige re-onboarding:** After each reset layer, the player gets reoriented on what changed.
- [ ] **Persistence:** Onboarding state survives reloads and doesn’t corrupt/migrate badly across save versions.
- [ ] **Mobile:** Tooltips never render off-screen; scrolling doesn’t break anchors.
- [ ] **Tests:** At least one unit test for trigger logic and one Playwright test for a representative tooltip path.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Premature tips / wrong context | MEDIUM | Add gating conditions; add a "later" queue (show on first eligible state) |
| Tooltip fatigue | MEDIUM | Remove low-value tips; add per-session cap; consolidate into a help panel |
| Brittle anchors | LOW/MEDIUM | Switch to stable anchors; add tests to catch regressions |
| Misleading progress cues | HIGH | Rework cues to show concrete targets; add time-to-target estimate; A/B test copy |
| Reset-related confusion | HIGH | Add post-reset summary and re-entry prompts; ensure onboarding is layer-aware |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Teaching systems the player cannot use yet | Phase 2 | New save: no tips for locked tabs; tips appear after unlock |
| Tooltip fatigue | Phase 1/3 | Dismiss rate decreases; users complete key actions faster |
| Push tutorials interrupt play | Phase 3 | Tutorial completion without increased churn; help is recallable |
| Onboarding state doesn’t survive resets | Phase 2/4 | After prestige, only relevant new-layer tips appear |
| Progress cues lie | Phase 4 | Players reach first prestige with fewer stalls; fewer "stuck" reports |
| Guidance contradicts optimal loop | Phase 1/5 | Tips match selectors; tests prevent regression |
| Brittle anchors | Phase 3/5 | Layout tweaks don’t break tooltip placement in e2e |
| No end/re-entry | Phase 3/4 | Users can restart onboarding; help usage persists over time |

## Sources

- https://www.nngroup.com/articles/onboarding-tutorials/ (contextual help vs disruptive tutorials; pull vs push revelations)
- https://jayzipursky.com/2023/09/26/onboarding-part-3-pitfalls/ (common tooltip/tour pitfalls: timing, excess, forced flows, brittle triggers)
- https://apptrove.com/how-to-make-an-idle-game/ (idle game UI guidance: show progression, introduce complexity gradually; marketing source)
- https://adriancrook.com/passive-resource-systems-in-idle-games/ (idle game progress indicators + reset mechanics; marketing/consulting source)
- https://cjleo.com/blog/we-are-addicted-to-progress/ (why progress feedback matters; older but relevant)

---
*Pitfalls research for: onboarding/tooltips/progress cues in an idle game*
*Researched: 2026-01-25*
