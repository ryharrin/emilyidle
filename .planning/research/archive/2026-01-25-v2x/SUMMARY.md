# Project Research Summary

**Project:** Emily Idle
**Domain:** Onboarding + UX clarity for a React/Vite idle game (multi-layer prestige)
**Researched:** 2026-01-25
**Confidence:** MEDIUM

## Executive Summary

This project is a UX/onboarding layer for an existing idle game: the goal is to make the first session, unlock pacing, and prestige loops legible without turning the game into a modal tutorial. The winning pattern in this domain is to keep guidance contextual (tied to real unlock/state signals), short (one idea + one action), and always recallable later (help entry point + re-enable toggles).

The recommended approach is to extend the existing settings-backed coachmarks pattern (already present in `src/App.tsx` / Collection tab) into a small, explicit “guidance” subsystem in UI land (`src/ui/guidance/*`). Guidance should read `GameState` via existing selectors (gates, reveal ratios, prestige readiness) and persist only UI onboarding state in settings (versioned), not in the core save.

Main risks are (1) tips firing before mechanics are usable, (2) tooltip fatigue / intrusive “push tours”, (3) reset-related confusion (prestige re-onboarding), and (4) performance regressions from doing guidance work on every RAF tick. Mitigate by gating all steps with the same unlock signals the UI uses, preferring inline callouts/help drawers over floating overlays, versioning onboarding state per “layer”, and making guidance computations O(1) + transition-triggered.

## Key Findings

### Recommended Stack

The current stack (React 18 + Vite 6 + TS 5.8 + Vitest + Playwright) is already well-suited; onboarding improvements are mostly UI primitives + testing. The most pragmatic add is Radix primitives for accessible tooltip/popover/dialog/toast, plus optional Storybook and axe tooling for rapid iteration and regression coverage.

**Core technologies:**
- React 18.3.1: UI runtime — already in use; stable baseline for guidance surfaces.
- Vite 6.0.0: tooling — fast iteration, aligns with Storybook Vite framework.
- TypeScript 5.8.0: safety — makes onboarding settings/state refactors safe.
- Playwright 1.49.1: E2E — best fit for “new user” flows and tooltip placement.
- Vitest 1.6.0: unit tests — cheap coverage for trigger logic + persistence.

### Expected Features

**Must have (table stakes):**
- First-session guidance (short, 3-7 steps) — avoid blank-start confusion.
- Prestige/reset clarity + safe confirmations — reduce “I lost everything” shock.
- Empty-state + locked content polish — always provide a clear next action.
- Rate transparency (basic breakdown) — players understand why numbers changed.
- Always-available Help/Glossary entry point — guidance is recallable.

**Should have (competitive):**
- Action-gated onboarding (“learn by doing”) — steps resolve on actions, not dismissals.
- “Why did this change?” explanations — show contributors to rate/multiplier deltas.
- Post-prestige re-onboarding — highlight what changed and the new best action.

**Defer (v2+):**
- Prestige planner + recommendations — high leverage but correctness-sensitive.
- Adaptive “stuck” hints — high effort; must avoid nagging.
- Meta-loop map — best once loops and terminology stabilize.

### Architecture Approach

This repo already has clean boundaries: domain math lives in selectors/actions; runtime owns RAF + autosave; UI owns settings and presentation. Onboarding should stay UI-only and be driven by selector “signals,” with persistence in settings (not save) and transition detection handled via small previous snapshots (not the tick loop).

**Major components:**
1. `src/App.tsx` — composition root (game state + settings + tab orchestration).
2. `src/ui/guidance/*` (new) — computes and renders onboarding/callouts/tooltips.
3. `src/game/selectors/index.ts` — source of truth for gates, reveal ratios, readiness.

### Critical Pitfalls

1. **Tips before mechanics unlock** — gate steps by the same signals that gate tabs/unlocks.
2. **Tooltip fatigue / intrusive tours** — keep tips sparse and action-oriented; prefer recallable help.
3. **Onboarding state vs resets** — split per-browser dismissal (settings) from per-run “did action” flags; version onboarding so new tips can ship without wiping old.
4. **Misleading progress cues** — pair % with concrete targets; time-to-target only as “estimate”.
5. **Brittle anchors** — attach to stable `id`/`data-testid`; cover with Playwright.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: UX Audit + Content Model
**Rationale:** Reduces complexity before adding guidance; prevents tooltip fatigue and wrong/contradictory advice.
**Delivers:** Glossary/help content model (ids + copy), per-tab “Next action” definition, naming/terminology pass.
**Addresses:** Help entry point, empty-state polish, locked content clarity.
**Avoids:** Tooltip fatigue, guidance contradicting optimal loop.

### Phase 2: Guidance State + Triggers (Settings-Backed)
**Rationale:** All other guidance depends on a durable, versioned persistence model and correct gating.
**Delivers:** Versioned `Settings.onboarding` schema, `useGuidance(...)` producing steps/callouts from selector signals, first-session short flow.
**Uses:** Existing settings persistence in `src/App.tsx` (don’t touch the core save).
**Avoids:** Teaching locked systems, per-tick expensive computation, reset-related spam.

### Phase 3: Contextual Help Surfaces (Tooltips/Popovers/Dialogs)
**Rationale:** Once triggers exist, surface explanations at the point of need with accessible primitives.
**Delivers:** Radix-based Tooltip/Popover/Dialog (or equivalent), mobile-friendly “what is this?” affordances, in-tab callouts.
**Implements:** `src/ui/guidance/*` rendering components anchored on stable ids/testids.
**Avoids:** Brittle anchors, hover-only UX, portal/z-index regressions.

### Phase 4: Prestige Clarity + Re-Onboarding
**Rationale:** Prestige is the highest-risk confusion point; requires consistent copy and layer-aware re-entry cues.
**Delivers:** Centralized “lose/keep/gain” copy, confirmation dialogs, post-prestige summary + a single recommended next action, progress cues tied to concrete thresholds.
**Addresses:** Prestige/reset clarity, progress feedback, returning-player reorientation.
**Avoids:** Onboarding state not surviving the right resets, progress cues that feel like they lie.

### Phase 5: Verification (E2E + A11y + Perf)
**Rationale:** Guidance is easy to regress with small UI tweaks; tests are the guardrails.
**Delivers:** Unit tests for trigger/gating logic, Playwright new-user + prestige flows, representative tooltip placement checks; optional axe checks on onboarding screens.
**Avoids:** Broken guidance after refactors, hidden accessibility failures, slowdowns from guidance logic.

### Phase Ordering Rationale

- Do content/IA first so guidance clarifies, not compensates.
- Build persistence + trigger logic next so all UI surfaces share consistent gating.
- Add UI primitives after trigger logic exists; keep anchors stable to protect tests.
- Tackle prestige/re-onboarding after the system can represent “layer-aware” onboarding.
- Add E2E/a11y coverage as soon as surfaces exist; treat guidance anchors as API.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** time-to-target estimates, “optimal” recommendations, and reset deltas are correctness-sensitive; validate against current selectors/balance.
- **Post-v1 (v2+):** prestige planner and adaptive “stuck” hints need dedicated validation and guardrails.

Phases with standard patterns (skip research-phase):
- **Phase 2:** settings-backed UI state + selector-driven signals is already idiomatic in this repo.
- **Phase 3:** Radix tooltip/popover/dialog usage is well-documented; integration is straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Solid, but optional additions (Radix/Storybook/axe) are recommendations, not verified in-repo yet. |
| Features | MEDIUM | Derived from domain best-practices; needs player validation and tuning to this game’s economy. |
| Architecture | HIGH | Grounded in current repo boundaries and proven patterns already present. |
| Pitfalls | MEDIUM | Patterns are consistent across sources; exact impact needs playtest feedback. |

**Overall confidence:** MEDIUM

### Gaps to Address

- Mobile/touch interaction model for help (tooltip vs popover vs drawer) needs an explicit decision and testing.
- Which prestige actions need per-run flags (save) vs per-browser dismissal (settings) needs careful mapping per prestige layer.
- “Rate transparency” scope needs definition (basic breakdown first; avoid formula dumps).

## Sources

### Primary (HIGH confidence)
- Local codebase: `src/App.tsx`, `src/game/selectors/index.ts`, `src/game/runtime/useGameRuntime.ts`, `src/game/persistence.ts`.
- /radix-ui/website (Context7) — Tooltip/Popover/Dialog/Toast patterns and Portal behavior.
- /storybookjs/storybook (Context7) — `@storybook/react-vite` configuration + a11y addon.
- /dequelabs/axe-core (Context7) — Playwright + axe integration.

### Secondary (MEDIUM confidence)
- Apple “Onboarding for Games” — early-session guidance expectations.
- Nielsen Norman Group — coachmark/overlay patterns and pitfalls.

### Tertiary (LOW confidence)
- Community/wiki sources (Cookie Clicker, older idle game talks) — useful comparisons; validate against current game design.

---
*Research completed: 2026-01-25*
*Ready for roadmap: yes*
