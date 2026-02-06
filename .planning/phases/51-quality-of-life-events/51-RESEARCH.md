# Phase 51: Quality of Life & Events - Research

**Researched:** 2026-02-06
**Domain:** Persistence UX, notifications, achievement/event surfacing, mini-game progression
**Confidence:** HIGH (internal patterns already cover required mechanics)

## Summary

Phase 51 is an internal extension phase. The codebase already includes the primitives needed to ship all requirements:
- save decode/encode + localStorage guardrails,
- runtime last-simulated timestamps,
- non-blocking toast feedback,
- achievements/events data models,
- mini-game outcome hooks for winding/automatic/quartz.

No new external services or dependencies are needed. The safest path is to extend existing state/action/selector modules and wire additive UI controls with explicit regression coverage.

## Discovery Level

- **Level:** 0 (skip external discovery)
- **Why:** No new external libraries, no third-party APIs, and all work follows established internal architecture.

## Standard Stack

Use existing stack only:
- React + TypeScript for UI surfaces
- Existing pure action/selector architecture for domain logic
- Existing persistence/runtime wiring for save/offline handling
- Vitest + Playwright for regression guardrails

## Architecture Patterns to Reuse

### Pattern 1: Additive persistence contracts
- Extend `PersistedGameState` and settings payloads additively.
- Keep legacy save decoding tolerant and deterministic.
- Reuse localStorage guardrail tests as hard contracts.

### Pattern 2: Toast-driven feedback
- Reuse `ToastStack` for achievement and event notifications.
- Keep copy deterministic and driven by state transitions.

### Pattern 3: Domain-first mini-game behavior
- Put difficulty/streak/practice rules in actions/selectors.
- Keep modal UI as a thin presenter of outcome and mode.

### Pattern 4: Settings-owned preferences
- Keep notification toggles alongside existing settings in Save tab.
- Persist through existing settings storage path to avoid key sprawl.

## Don't Hand-Roll

| Problem | Avoid | Use Instead |
|---|---|---|
| Offline accrual | ad-hoc time diffs in components | runtime + persistence timestamps with explicit cap |
| Import validation | loose `JSON.parse` in UI handlers | existing persistence decode path + discriminated errors |
| Achievement/event feedback | custom modal prompts | existing toast stack and additive queue patterns |
| Mini-game scaling | copy-pasted threshold logic per modal | centralized outcome scaling helpers in interactions domain |

## Common Pitfalls

1. Breaking save compatibility by making required persisted fields non-optional.
2. Letting practice mode accidentally award progression resources.
3. Duplicating achievement/event condition math between UI and actions.
4. Adding file overlap across plans (`App.tsx`, `CollectionTab.tsx`) without explicit dependencies.
5. Introducing non-deterministic countdown logic that diverges in tests.

## Recommendation

Plan Phase 51 as five execute plans:
- offline/save resilience,
- undo/favorites QoL,
- notification preferences + achievement toasts,
- achievement/event expansion,
- mini-game practice/difficulty/streak progression.

This keeps each plan under context budget while allowing two-wave parallel execution.

---

*Phase: 51-quality-of-life-events*
*Research completed: 2026-02-06*
