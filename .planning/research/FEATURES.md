# Feature Research

**Domain:** Idle / incremental game onboarding + UX clarity (existing web idle game)
**Researched:** 2026-01-25
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features players assume exist in a modern idle/incremental game. Missing these = confusion, early churn, and “I don’t get what to do next.”

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| First-session guidance (short) | Idle games often start “blank”; players need the first 30-120 seconds structured | MEDIUM | 3-7 steps max; step-by-step not a wall of text; ideally action-based (advance only after doing the thing). Reuse existing `coachmarks` + settings persistence patterns (`coachmarksDismissed`). |
| Clear “what to do next” CTA | Players expect a single next action and a visible goal | LOW | A small “Next:” block per tab, or a top-level ribbon pointing at the highest-impact action; should degrade gracefully into “explore” once familiar. |
| Contextual hints/tooltips for currencies + jargon | Incremental games introduce many nouns quickly; players expect in-place explanations | MEDIUM | Prefer inline “What is this?” links / info drawer over hover-only tooltips for mobile; keep hints 1-2 sentences. |
| Rate transparency | Players expect to understand “why number went up” (rates, multipliers, sources) | MEDIUM | Show current per-sec rates with breakdown (base + bonuses). Add “recent change” callouts when unlocks affect rates. |
| Locked content clarity | Tabs/systems unlock over time; players expect to see what’s locked and why | LOW | Show locked tabs with preview + unlock condition, not “missing.” Existing tabs already have some gating/teaser copy; standardize tone and placement. |
| Empty-state polish | Many states are “you have none yet”; players expect friendly empty states + a way forward | LOW | Empty state should include: what it is, why it matters, one CTA. Avoid scolding. |
| Prestige/reset clarity + safe confirmations | Prestiging is core loop; players expect “what resets / what carries” and a clear confirmation | MEDIUM | Confirmation dialog should show: items lost, items kept, rewards gained (and estimate), plus a “don’t ask again” toggle (already exists for nostalgia unlock confirms). |
| Progress feedback for long goals | Progress bars/percentages are expected for “almost there” loops | LOW | Already present in Nostalgia progress; extend same pattern to other prestige loops and unlock store thresholds. |
| Lightweight notifications (in-place) | Players expect to notice unlocks/bonuses without hunting | LOW | Prefer in-tab banners or a compact “Recent” feed; avoid intrusive toast spam. Reuse existing `aria-live` patterns (Save/Nostalgia tabs). |
| Help access is always available | Players expect to re-check rules later | LOW | A consistent Help entry point (icon/tab section) linking to glossary, prestige rules, and “how this tab works.” |

### Differentiators (Competitive Advantage)

Features that make the game feel unusually “legible” compared to typical idle games.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Action-gated onboarding (“learn by doing”) | Higher retention than skimmable tours; makes systems feel earned | MEDIUM | Coachmarks don’t just dismiss; they resolve when the user takes the action (buy first item, switch tab, confirm first prestige). |
| Adaptive hints for “stuck” moments | Helps players when they stall without feeling hand-holdy | HIGH | Define “stuck” heuristics (no purchases, no unlocks, idle too long, currency capped) and show one hint at a time; must be easy to dismiss. |
| “Why did this change?” explanations | Turns a mathy economy into something intuitive and satisfying | MEDIUM | When a multiplier/unlock applies, show a small diff panel: “+12% from X” and link to details. |
| Prestige planner + recommendations | Reduces fear of resets; improves “I know when to prestige” clarity | HIGH | Show projected prestige gain now vs. after milestones; optionally “recommended” based on marginal gain/time. Validate calculations carefully. |
| Meta-loop map (Atelier → Maison → Nostalgia) | Players understand progression and don’t get lost across multiple prestiges | MEDIUM | A visual or structured checklist showing loops, what each resets, and what permanent power it adds. |
| Post-prestige re-onboarding | Makes resets feel purposeful and faster, not repetitive | MEDIUM | On new run, highlight “newly unlocked since last run” and one new best action. |
| “Explain like I’m new” mode | Players self-select more guidance; avoids annoying veterans | MEDIUM | A settings toggle that increases hint density, shows extra breakdowns, and re-enables key coachmarks. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Unskippable long tutorial | “Users must learn everything” | Players disengage; feels like homework; blocks fun loop | Short first-session steps + always-available help + contextual hints |
| Popups/toasts for every unlock | “Make sure they see it” | Notification fatigue; covers UI; breaks idle flow | In-place banners + a compact “Recent unlocks” feed |
| Hover-only explanations | “Tooltips are easy” | Mobile/touch users can’t access; discoverability is poor | Clickable info drawer / glossary entries with optional hover tooltip |
| Hiding the reset consequences | “Prestige should be mysterious” | Leads to rage-quits; feels like a trap | Always show “lose/keep/gain” summary with an optional “details” expand |
| Over-explaining formulas in the UI | “Show the math” | Cognitive overload; players want meaning, not derivations | Show breakdown contributors; link formulas to a Help/Glossary section |

## Feature Dependencies

```
[Onboarding step system]
    └──requires──> [Persistent settings/state]
                       └──exists──> [SETTINGS_KEY + settings UI]

[Contextual hints + tooltips]
    └──requires──> [Help/Glossary content model]

[Prestige clarity UI]
    └──requires──> [Accurate prestige gain calculation]
                       └──requires──> [State selectors for reset deltas]

[Adaptive stuck detection]
    └──requires──> [Telemetry signals / heuristics]
                       └──requires──> [Event log or derived activity]

[Meta-loop map]
    └──enhances──> [Locked content clarity]
```

### Dependency Notes

- **Onboarding step system requires persistent settings/state:** needs per-step dismissal/completion stored similarly to `coachmarksDismissed`, plus a reset/re-enable entry in settings.
- **Contextual hints require a help/glossary content model:** keep content centralized (ids + strings) so hints/tooltips can be reused consistently across tabs.
- **Prestige clarity UI requires accurate gain + reset deltas:** UI should be driven by selectors (what resets, what stays, reward estimate) so copy stays correct as balance changes.
- **Adaptive stuck detection requires heuristics:** can be done without full analytics by deriving “recent actions” from game state or a small in-memory event log.

## MVP Definition

### Launch With (v1)

- [ ] First-session guidance (short) — ensures a smooth first 2 minutes
- [ ] Prestige/reset clarity + safe confirmations — prevents “I lost everything” shocks
- [ ] Empty-state + locked content polish — prevents “this tab is pointless” impressions
- [ ] Rate transparency (basic breakdown) — makes the economy feel fair and learnable
- [ ] Always-available Help/Glossary entry point — makes learning self-serve

### Add After Validation (v1.x)

- [ ] Action-gated onboarding — increases completion of critical learning steps
- [ ] “Why did this change?” panels — supports deeper mastery without clutter
- [ ] Post-prestige re-onboarding — reduces reset fatigue

### Future Consideration (v2+)

- [ ] Prestige planner + recommendations — high leverage but correctness-sensitive
- [ ] Adaptive stuck hints — high effort; must avoid feeling naggy
- [ ] Meta-loop map — best once loops stabilize and terminology is final

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| First-session guidance (short) | HIGH | MEDIUM | P1 |
| Prestige/reset clarity + safe confirmations | HIGH | MEDIUM | P1 |
| Empty-state + locked content polish | HIGH | LOW | P1 |
| Rate transparency (basic breakdown) | HIGH | MEDIUM | P1 |
| Always-available Help/Glossary entry point | MEDIUM | LOW | P1 |
| Action-gated onboarding | MEDIUM | MEDIUM | P2 |
| Post-prestige re-onboarding | MEDIUM | MEDIUM | P2 |
| “Why did this change?” panels | MEDIUM | MEDIUM | P2 |
| Prestige planner + recommendations | HIGH | HIGH | P3 |
| Adaptive stuck hints | MEDIUM | HIGH | P3 |
| Meta-loop map | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Cookie Clicker (Ascension) | AdVenture Capitalist | Our Approach |
|---------|----------------------------|----------------------|--------------|
| Prestige clarity | Legacy/Ascension screen summarizes rewards + reset | Multiple loops introduced gradually | “Lose/keep/gain” summary for each prestige loop + progress % + confirmations |
| Onboarding | Minimal, learn-by-doing | Simple early flow; introduce systems over time | Short guided steps + coachmarks that point at the next action |
| Help/explanations | Community/wiki-heavy; some in-game explanation | In-game UI cues + frequent unlock prompts | Always-available glossary + contextual explanations, no toast spam |

## Sources

- Apple: “Onboarding for Games” (2025) https://developer.apple.com/app-store/onboarding-for-games/ (MEDIUM)
- Livefront: “Put me in coach (marks)” (2024) https://livefront.com/writing/put-me-in-coach-marks/ (MEDIUM)
- Nielsen Norman Group: “Instructional Overlays and Coach Marks for Mobile Apps” https://www.nngroup.com/articles/mobile-instructional-overlay/ (MEDIUM; older but still relevant patterns)
- Global Games Forum: “Idle Game Design Lessons From developing AdVenture Capitalist” (2021) https://www.globalgamesforum.com/features/idle-game-design-lessons-from-developing-adventure-capitalist (LOW/MEDIUM; older)
- Cookie Clicker Wiki (wiki.gg): “Ascension” (2024) https://cookieclicker.wiki.gg/wiki/Ascension (LOW/MEDIUM; community-maintained)

---
*Feature research for: idle/incremental onboarding + UX clarity*
*Researched: 2026-01-25*
