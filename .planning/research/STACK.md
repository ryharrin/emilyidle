# Stack Research

**Domain:** Browser idle game (Vite + React + TS) — "catalog-first" economy + interaction mini-games
**Researched:** 2026-01-27
**Confidence:** HIGH (repo reality + npm registry for optional deps)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3.1 (current in repo) | UI + interaction surfaces (Catalog becomes primary purchase UI) | Already integrated; component/state patterns are sufficient for shop flows + mini-games without introducing global state libs |
| Vite | 6.0.0 (current in repo) | Build/dev server | Already working; no new build needs implied by catalog/economy/itemization changes |
| TypeScript | 5.8.0 (current in repo) | Type-safe domain modeling (catalog models, itemization, diminishing returns rules) | Domain complexity increases; strict TS is the cheapest "stack upgrade" for correctness and refactors |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 | Runtime validation for save migrations + catalog/model invariants | Recommended if v3.0 adds new save shape (career-only economy, itemization by model ID, duplicate counters, wear bonuses). Prevents "corrupt save" edge cases from silently producing broken state |
| @tanstack/react-virtual | 3.13.18 | List virtualization for large catalogs | Only if catalog grows enough to cause scroll/render perf issues (e.g., hundreds/thousands of models, rich cards, images) |
| xstate | 5.26.0 | Explicit state machines for mini-games / modal flows | Only if interaction mini-games expand into multi-step, interruptible flows (pause/resume, failure states, timers, multiple inputs). Otherwise stick to current reducer/discriminated-union UI state |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Playwright | 1.49.1 (current in repo) | E2E coverage for "Catalog is default + purchase surface" | Keep stable `data-testid` selectors; add coverage around purchase flow relocation + new economy rules |
| Vitest + Testing Library | vitest 1.6.0 / @testing-library/react 16.1.0 (current in repo) | Unit tests for pure domain rules | Prioritize tests for: pricing, therapist session rules (first free), diminishing returns, wear-one-watch bonus, duplicate handling |

## Installation

```bash
# Supporting (only if needed)
pnpm add zod
pnpm add @tanstack/react-virtual
pnpm add xstate
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| "No new state library" (keep existing domain separation + local UI state) | Redux Toolkit / Zustand | Only if you introduce cross-tab UI orchestration that becomes hard to trace with current patterns (not implied by the milestone; domain already centralized in `src/game/*`) |
| zod | io-ts / runtypes | Only if the team already standardizes on them elsewhere; otherwise zod is the most common TS-first validation choice |
| @tanstack/react-virtual | react-window / react-virtuoso | Use if you need a higher-level component API; otherwise TanStack Virtual stays headless and lightweight |

## What NOT to Use

| Avoid | Why | Use Instead |
|------|-----|-------------|
| Heavy animation frameworks (e.g., Framer Motion) | Adds bundle + mental overhead; milestone is rules + purchase surface shift, not animation-driven UI | CSS transitions + small targeted animations; keep interactions responsive and testable |
| Full "app state" frameworks by default | Rework risk + selector churn; existing architecture already separates domain logic from UI | Extend `src/game/model|data|selectors|actions` and keep UI state local per modal/tab |

## Stack Patterns by Variant

**If the catalog becomes "big" (perf issues when scrolling):**
- Use `@tanstack/react-virtual`
- Because it solves the one real scaling risk (render cost) without re-architecting UI state

**If mini-games become multi-step with interrupts/timeouts + analytics-like events:**
- Use `xstate` (or keep an explicit reducer if still simple)
- Because explicit state machines prevent "boolean soup" and make edge cases testable

**If v3.0 includes a save migration that changes core identifiers (tier -> model IDs, duplicate tracking):**
- Use `zod`
- Because runtime validation catches partial/old/invalid saves early and makes migrations safer

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @tanstack/react-virtual@3.13.18 | react@18.3.1 | Declares peer support for React 18 |
| zod@4.3.6 | typescript@5.8.0 | TS-only integration; runtime validation library |
| xstate@5.26.0 | react@18.3.1 | Core library; React bindings optional depending on integration style |

## Sources

- `package.json` - current repo versions (React/Vite/TS/tooling)
- https://registry.npmjs.org/zod/latest - verified zod version (4.3.6)
- https://registry.npmjs.org/@tanstack/react-virtual/latest - verified react-virtual version (3.13.18)
- https://registry.npmjs.org/xstate/latest - verified xstate version (5.26.0)

---
*Stack research for: catalog-first economy + interactions (v3.0)*
*Researched: 2026-01-27*
