---
title: "Game Architecture"
project: "Emily At Last"
date: "2026-02-23"
author: "Ryan"
version: "1.0"
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: "complete"

# Source Documents
gdd: "_bmad-output/gdd.md"
epics: "_bmad-output/epics.md"
brief: null
---

# Game Architecture

**Status:** ✅ COMPLETE — Ready for Implementation

---

## Executive Summary

**Emily At Last** is a 6-hour completable active incremental game celebrating Emily's watch collecting, psychology career, and family. Built on **React 19 + Vite 7 + TypeScript 5.8** for iOS Safari PWA.

**Key Architectural Decisions:**

- **State Management:** useReducer + Context (split by domain for re-render efficiency)
- **Game Loop:** RAF + fixed 100ms simulation ticks (deterministic progression)
- **Project Structure:** Domain-driven (`src/game/**` pure, `src/ui/**` React) with principles-based emergence
- **Mini-Games:** DOM-first + Motion for spring physics; local state + callback dispatch pattern
- **Mini-Game Clarity:** Each mini-game starts with plain-language Goal/How/Reward guidance and consistent result screens
- **Mailbox Delivery:** Orders and letters use deterministic clock-based scheduling (`clockMs`) with queued claim flow
- **Content Discovery:** Data-driven unlock registry (prevents emotional pacing accidents)
- **Persistence:** localStorage JSON (versioned) + autosave + import/export
- **Error Handling:** Result<T> types in domain + error boundaries in UI
- **Reliability:** Root + per-feature error boundaries, no white screens
- **Logging:** Structured JSON to console
- **Configuration:** Layered (constants → balancing → player settings → dev flags)
- **Debug Tools:** Dev panel + console commands (production-excluded)

**Organization:** Hybrid domain-driven + feature-based, with fixed naming conventions and principles-based directory emergence.

**Implementation Patterns:** 6 standard patterns ensuring consistent code across all agents.

**Validation:** ✅ All 10 core systems covered, all patterns defined, no conflicts.

---

## Development Environment

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 10+
- iOS device (iPhone 17+) or simulator
- macOS for development (Xcode command-line tools)

### Setup Commands

```bash
# 1. Create project from Vite template
pnpm create vite emily-at-last --template react-ts
cd emily-at-last

# 2. Install dependencies
pnpm install

# 3. Install architecture-specified libraries
pnpm add react-error-boundary@6.1.1
pnpm add motion@12.34.3  # animation/spring physics
pnpm add vite-plugin-pwa@1.2.0  # PWA support
pnpm add lucide-react@0.563  # icons
pnpm add @tanstack/react-virtual@3.13  # virtualization

# 4. Development server (port 5177)
pnpm run dev

# 5. Type checking & linting
pnpm exec tsc --noEmit
pnpm exec eslint .

# 6. Tests
pnpm exec vitest run               # unit tests
pnpm exec playwright test          # e2e tests
```

### AI Tooling

Context7 MCP is pre-configured. It provides documentation for React 19, Vite 7, Motion, and related libraries. No additional setup required.

### First Implementation Steps

1. Initialize project with setup commands above
2. Create `src/game/` and `src/ui/` structure
3. Implement root component + GameContext + reducer
4. Build main game loop (sim.ts + useGameRuntime.ts)
5. Implement mini-games and integration tests

---

## Project Context

### Game Overview

**Emily At Last** — A 6-hour completable active incremental game, built as a personalized gift celebrating Emily's watch collecting, psychology career, and family. Single recipient (Emily), single device (iPhone 17), zero crash tolerance.

**Design Inspiration:** Progress Knight and Increlution — progress-bar-driven life-simulation incrementals where the game IS the UI. Stats panels, tabbed activity areas, progress bars filling, numbers going up, content unlocking progressively.

### Technical Scope

**Platform:** iOS Safari (iPhone 17) — PWA
**Genre:** Active Incremental with Mini-Games
**Project Level:** Medium complexity (rich content, straightforward stack)
**Stack:** React 19 + Vite 7 + TypeScript 5.8 (ground-up redesign)

### Core Systems

| System                                | Complexity | Notes                                                                                                             |
| ------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Economy Engine                        | Low-Medium | Enjoyment → Career → Cash → Watches loop; cents-based math                                                        |
| Mini-Game Suite                       | **High**   | 4 distinct games (winding, quartz calibration, rhythm, therapy); clarity + feel/spring physics are core complexity |
| Career Progression                    | Low        | 6-stage state machine with gates, entered from one-time pre-PhD onboarding                                       |
| Mailbox and Deliveries                | Low-Medium | Unified queue for acceptance letters and watch packages; claim-based ownership                                   |
| Watch Collection + Catalog            | Low-Medium | 100+ real watches, 4 tiers; progressive image loading                                                             |
| Prestige System                       | Low        | Soft prestige (no reset), 3 sequential layers; content unlocks, not mechanical complexity                         |
| Home Life                             | Low        | Gallery of unlockable content; unlock logic lives in Discovery system                                             |
| **Content Discovery / Unlock System** | **Medium** | Cross-cutting system governing when content appears; emotional beat timing, milestone triggers, reveal scheduling |
| Persistence                           | Low        | localStorage with versioned migrations, autosave                                                                  |
| PWA / Offline                         | Low        | Service worker, home screen install, offline play                                                                 |

### Player Experience Goals

| System             | Target Feeling                                 |
| ------------------ | ---------------------------------------------- |
| Mini-Games         | Tactile satisfaction, meditative flow, mastery |
| Career Progression | Pride, accomplishment, "I built this"          |
| Watch Collection   | Collector's thrill, aesthetic appreciation     |
| Home Life          | Surprise, warmth, feeling deeply loved         |
| Content Discovery  | Delight at unexpected personal references      |
| Prestige           | Forward momentum, always growing               |
| Completion (Ch. 6) | Emotional climax — "At Last"                   |

### Technical Requirements

- 60fps on iPhone 17 (A19 chip)
- <2s initial load on WiFi/5G
- <100MB memory, <5% battery/hour
- Portrait-primary, Dynamic Island + safe area support
- Offline-capable PWA with persistent storage
- Zero crash tolerance (gift-grade reliability)
- Progressive loading for 100+ watch catalog images

### Complexity Drivers

**High Complexity:**

- 4 distinct mini-games with different input models — complexity is in the _feel_ (spring physics, easing, haptic timing, visual feedback), not the input handling

**Medium Complexity:**

- Cross-cutting Content Discovery / Unlock system — governs when emotional beats land; must be data-driven to prevent accidental reveal reordering

**Novel Concepts:**

- Soft prestige without reset (always forward, never backward)
- Gift-grade reliability standard (zero tolerance for failures)
- Single-device optimization (constraint as superpower)

### Technical Risks

| Risk                             | Impact                      | Mitigation                                                     |
| -------------------------------- | --------------------------- | -------------------------------------------------------------- |
| iOS Safari PWA storage eviction  | Save data loss              | Persistent storage request + export-to-clipboard backup button |
| Audio autoplay restrictions      | Broken audio on first load  | User-gesture-gated audio init                                  |
| 100+ catalog images loading      | Jank, slow initial load     | Progressive loading, WebP, lazy load                           |
| Haptic API inconsistency         | Missing tactile feedback    | Graceful degradation, optional feature                         |
| 6-hour session battery drain     | Dead phone mid-gift         | RAF pause on inactive, efficient rendering                     |
| State shape evolution during dev | Migration bugs on save load | Composable migrations, tested migration path                   |
| Clock-driven delivery edge cases | Late/early package behavior | Deterministic `clockMs` scheduling + unit tests on delay bands |
| White screen crash               | Ruined gift                 | react-error-boundary at app root, autosave on every transition |

---

## Engine & Framework

### Selected Engine

**React 19 + Vite 7 + TypeScript 5.8** — Ground-up redesign (existing prototype was for learning)

**Rationale:** Emily At Last is a progress-bar-driven incremental game in the style of Progress Knight and Increlution. The entire experience is reactive UI — stats panels, tabbed activity areas, progress bars filling, numbers going up, content unlocking. React is purpose-built for exactly this kind of complex, reactive, state-driven interface. Starting fresh on current stable versions means no legacy debt, current tooling, and a clean architecture designed specifically for the 6-hour emotional journey.

### Project Initialization

```bash
pnpm create vite emily-at-last --template react-ts
cd emily-at-last
pnpm install
```

### Version Decisions

| Component  | Version | Rationale                                                                              |
| ---------- | ------- | -------------------------------------------------------------------------------------- |
| React      | 19.2.4  | Current stable. Clean slate = no migration risk. `use()` hook useful for lazy loading. |
| Vite       | 7.3.1   | Current stable. Environment API, fastest builds.                                       |
| TypeScript | 5.8.x   | Current stable. strict: true from day one.                                             |

### Additional Libraries

| Library                 | Version | Purpose                                                          | When to Add                      |
| ----------------------- | ------- | ---------------------------------------------------------------- | -------------------------------- |
| react-error-boundary    | 6.1.1   | Gift-grade crash prevention — no white screens                   | Day 1                            |
| motion                  | 12.34.3 | Spring physics for mini-game feel (import from `"motion/react"`) | When building mini-games         |
| vite-plugin-pwa         | 1.2.0   | Service worker, offline play, home screen install                | Day 1                            |
| @tanstack/react-virtual | 3.13.x  | Virtualized lists for 100+ watch catalog                         | When building collection UI      |
| lucide-react            | 0.563+  | SVG icon system                                                  | Day 1                            |
| howler.js               | 2.2.x   | Audio playback                                                   | Defer until audio is implemented |

**Cut (with rationale):**

- ~~Zustand~~ — React 19's built-in state primitives (useState, useReducer, use) are sufficient for a single-player game
- ~~idb-keyval~~ — IndexedDB adds Safari PWA eviction risk; localStorage (5MB) is sufficient for save data

### Engine-Provided Architecture

| Category           | Decision                                        | Provided By    |
| ------------------ | ----------------------------------------------- | -------------- |
| **Rendering**      | DOM-based reactive components                   | React 19       |
| **Build System**   | ESM bundling, HMR, code splitting, tree shaking | Vite 7         |
| **Dev Server**     | Instant start, SWC-based Fast Refresh           | Vite 7         |
| **Type Safety**    | Strict mode, discriminated unions, no `any`     | TypeScript 5.8 |
| **Module System**  | ESM (`"type": "module"`)                        | Vite 7         |
| **Asset Handling** | Static assets, CSS modules, image optimization  | Vite 7         |

### Remaining Architectural Decisions

The following decisions must be made explicitly (Step 4):

1. State management pattern — useReducer vs useState vs context architecture
2. Game loop design — RAF tick accumulation, simulation step size, pause behavior
3. Mini-game rendering — DOM + CSS transforms + Motion vs Canvas
4. Content Discovery / Unlock system — Data-driven milestone map vs hardcoded gates
5. Persistence architecture — Save format, versioned migrations, autosave, backup/export
6. Audio architecture — Web Audio API vs Howler.js, user-gesture gating
7. Asset loading strategy — Lazy loading, progressive enhancement for watch images
8. Error boundary granularity — App-level vs per-feature boundaries
9. PWA caching strategy — Cache-first vs network-first per asset type
10. Haptic feedback abstraction — Direct API vs abstraction layer
11. Project structure — Feature-based vs layer-based module organization

### AI Tooling (MCP Servers)

**Context7** (upstash/context7) — Already configured. Provides current documentation for React 19, Vite 7, Motion, and any other library. No engine-specific MCP needed for web stack.

---

## Architectural Decisions

### Decision Summary

| Category                    | Decision                                                                                             | Version                                                   | Rationale                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| State Management            | useReducer + Context (split contexts/selectors)                                                      | React 19.2.4 (verified 2026-02-23)                        | Centralized, serializable game state with pure transitions; UI-first incremental pattern; good testability and debuggability |
| Game Loop                   | requestAnimationFrame + fixed timestep (e.g. 100ms sim ticks)                                        | N/A                                                       | Deterministic simulation for progression math; stable behavior across device performance; easy pause/clamp behavior          |
| Project Structure           | Hybrid: `src/game` (pure domain) + `src/ui` (React)                                                  | N/A                                                       | Keeps simulation logic testable and framework-agnostic; UI remains a shell over domain state                                 |
| Mini-Game Rendering         | DOM-first mini-games + Motion for feel                                                               | motion 12.34.3 (verified 2026-02-23)                      | One rendering paradigm; minimal integration overhead; fits small “action” portion of UI-first game                           |
| Content Discovery / Unlocks | Data-driven unlock registry in `game/discovery`                                                      | N/A                                                       | Protects pacing; single place to audit “when does X unlock”; prevents scattered gating logic                                 |
| Persistence / Save          | localStorage JSON (versioned) + autosave + import/export string + request persistent storage         | StorageManager persist() (supported; verified 2026-02-23) | Simple, robust, offline-first; human-backup via export; avoids IndexedDB complexity/quirks for this scope                    |
| Reliability                 | Error boundaries: Root + per-tab + mini-games boundary                                               | react-error-boundary 6.1.1 (verified 2026-02-23)          | Prevents “white screen” failures; isolates faults to a feature area without killing the whole app                            |
| Audio                       | Defer audio implementation; define minimal interface now                                             | howler.js 2.2.4 (verified 2026-02-23; deferred)           | Avoid premature complexity; keep an integration seam ready for later without committing early                                |
| Asset Loading               | Hybrid: preload “current + next few” + lazy-load the rest + skeletons                                | N/A                                                       | Keeps startup fast while avoiding scroll hitching; supports 100+ watch images and photo gallery                              |
| PWA / Caching               | Enable PWA; cache-first for hashed assets; stale-while-revalidate for images; network-first for HTML | vite-plugin-pwa 1.2.0 (verified 2026-02-23)               | Offline-capable with safe update behavior; avoids trapping stale HTML while still caching heavy assets                       |
| Haptics                     | No haptics (visual/audio feedback only)                                                              | iOS Safari vibrate unsupported (verified 2026-02-23)      | Avoid fragile workarounds; keep feedback deterministic and consistent on target device                                       |

### State Management

**Approach:** useReducer + Context with selective context splitting

**Details:**

- Maintain a single authoritative `GameState` updated by a pure reducer (`game/state.ts`).
- Split contexts by “hot” update domains (e.g., economy tick state vs UI navigation vs collection browsing) to control re-render scope.
- Prefer selectors to derive computed values (rates, unlock visibility, affordability) from state.

### Game Loop

**Approach:** `requestAnimationFrame` + fixed timestep simulation

**Details:**

- Use an accumulator and step the simulation in fixed chunks (e.g. `SIM_TICK_MS = 100`) via a pure `step(state, dtMs)` function in `src/game/sim.ts`.
- Clamp large frame deltas (tab-switch / resume) to avoid giant progression leaps and reduce battery spikes.
- Gate loop execution behind document visibility where appropriate (pause when hidden).

### Project Structure

**Approach:** Hybrid domain core + UI shell

**Details:**

- `src/game/**`: Pure TypeScript domain logic (types, reducer, sim, selectors, discovery/unlocks). No React. No DOM.
- `src/ui/**`: React components that render state and dispatch actions.
- UI should not contain progression math or unlock rules; it should call domain APIs.

### Mini-Game Rendering

**Approach:** DOM-first mini-games + Motion for “feel”

**Details:**

- Implement mini-games as React components (DOM elements) with `motion` for spring physics, easing, and timing polish.
- Keep mini-game internal state local unless it must persist or affect long-term progression, in which case dispatch domain actions.
- Avoid Canvas/Phaser unless a future requirement clearly demands it.

### Content Discovery / Unlock System

**Approach:** Data-driven unlock registry

**Details:**

- Central registry of unlockable content (photos, messages, career milestones, watch tier reveals, prestige unlocks).
- Each entry defines:
  - `id`
  - `category` (home-life, career, collection, prestige, etc.)
  - `condition(state) -> boolean` (pure)
  - `onUnlock(state) -> state` (pure; optional)
- Features query discovery for visibility; unlocking is not embedded ad-hoc in UI components.

### Data Persistence

**Save System:** localStorage JSON, versioned

**Details:**

- Persist the authoritative `GameState` as JSON with explicit `version`.
- Autosave on cadence and/or after meaningful state transitions.
- Provide manual import/export as a string (clipboard-friendly) as a “gift-grade” backup.
- Request persistent storage via `navigator.storage.persist()` to reduce eviction risk for installed PWA.

### Reliability / Error Handling

**Approach:** Root + per-tab + mini-games boundary

**Details:**

- Wrap the app root with an error boundary to prevent total app loss.
- Wrap each major tab/panel and the mini-games area with feature-level boundaries to isolate failures.
- Error boundary fallback should preserve:
  - a way to export save
  - a way to reload the app
  - a visible, non-technical message

### Asset Management

**Loading Strategy:** Hybrid (preload near-term + lazy-load remainder)

**Details:**

- Virtualize large lists (watch catalog) to keep DOM small.
- Preload only what’s likely needed next (current selection + adjacent items), lazy-load the rest.
- Use skeleton placeholders to avoid layout jump and to keep the “numbers and bars” loop readable.

### Audio Architecture

**Approach:** Defer audio; define interface seam now

**Details:**

- Define a thin audio interface (e.g., `playSfx(id)`, `setMusic(track)`, `setEnabled(boolean)`).
- Implement later when the content direction is ready; ensure user-gesture gating on iOS Safari when implemented.

### PWA / Caching

**Approach:** PWA enabled with mixed strategies

**Details:**

- Cache-first: hashed JS/CSS assets.
- Stale-while-revalidate: images (watch catalog, home gallery).
- Network-first: HTML (so updates apply cleanly), with offline fallback.

### Haptics

**Approach:** No haptics

**Details:**

- Do not implement haptics given iOS Safari's lack of vibration API support.
- Rely on visual feedback (motion, progress effects) and audio (when added) for tactility.

---

## Cross-cutting Concerns

These patterns apply to **ALL systems** and must be followed by every implementation.

---

### Error Handling

**Strategy:** Result objects for domain logic + try/catch at UI/storage boundaries

**Error Levels:**

| Level   | When to use                                                                |
| ------- | -------------------------------------------------------------------------- |
| `FATAL` | Unrecoverable — trigger error boundary, show fallback UI                   |
| `ERROR` | Operation failed, safe fallback used — log and surface to user if relevant |
| `WARN`  | Unexpected but handled — log only                                          |

**Domain functions return discriminated unions. Never throw inside `src/game/**`:\*\*

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// Good — domain function
function loadSave(raw: string): Result<GameState> {
  const parsed = tryParse(raw);
  if (!parsed.ok) return { ok: false, error: "Invalid save format" };
  return { ok: true, value: migrate(parsed.value) };
}

// Good — UI boundary (storage API)
try {
  const raw = localStorage.getItem(SAVE_KEY);
  const result = loadSave(raw ?? "");
  if (!result.ok) showToast(result.error);
} catch (e) {
  log({ level: "ERROR", scope: "persistence", msg: "localStorage read failed", data: e });
}
```

**Error boundary fallbacks must always expose:**

- A way to export save data
- A reload button
- A plain-language message (not a stack trace)

---

### Logging

**Format:** Structured JSON to console  
**Destination:** `console.log` / `console.warn` / `console.error` (no external service)

**Usage:**

| Level   | Method                   | When                                                 |
| ------- | ------------------------ | ---------------------------------------------------- |
| `ERROR` | `console.error`          | Operation failed, state potentially corrupted        |
| `WARN`  | `console.warn`           | Unexpected but recovered                             |
| `INFO`  | `console.log`            | Lifecycle milestones (save loaded, unlock triggered) |
| `DEBUG` | `console.log` (DEV only) | Tick details, selector outputs                       |

```ts
// Single log shape used everywhere:
log({ level: "INFO", scope: "persistence", msg: "Save loaded", data: { version: 3 } });
log({ level: "DEBUG", scope: "sim", msg: "Tick", data: { dt: 100, income: 150 } });

// Performance-critical paths: guard with DEV flag
if (import.meta.env.DEV) {
  log({ level: "DEBUG", scope: "sim", msg: "step()", data: { dtMs } });
}
```

---

### Configuration

**Layers (outermost wins for player-visible settings):**

| Layer             | Location                                                                  | Contents                                               |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Game constants    | `src/game/constants.ts`                                                   | `SIM_TICK_MS`, `AUTOSAVE_INTERVAL_MS`, `SAVE_KEY`      |
| Balancing values  | `src/game/{domain}/constants.ts`                                          | XP thresholds, prices, multipliers — grouped by domain |
| Player settings   | `localStorage` (`emily-idle:settings`)                                    | Volume, theme — persisted, user-controlled             |
| Dev / debug flags | `?debug=1` query param OR `localStorage.setItem('emily-idle:debug', '1')` | Fast progression, god mode, state injection            |

```ts
// game/constants.ts
export const SIM_TICK_MS = 100;
export const AUTOSAVE_INTERVAL_MS = 2_000;
export const SAVE_KEY = "emily-idle:save";

// game/career/constants.ts
export const CAREER_XP_PER_STAGE = [0, 100, 500, 2000, 8000, 25000] as const;

// Reading dev flag
export const isDebug = (): boolean =>
  new URLSearchParams(location.search).has("debug") ||
  localStorage.getItem("emily-idle:debug") === "1";
```

---

### Event System

**Pattern:** None — state is the only communication channel

All cross-system communication happens through the reducer. "Events" that the UI needs to react to (unlock reveals, achievement pops, toast notifications) are represented as **state fields consumed and cleared by the UI layer:**

```ts
// In GameState:
pendingToasts: Toast[];        // UI reads, dispatches CLEAR_TOAST after showing
pendingUnlocks: UnlockId[];    // UI animates reveal, dispatches ACKNOWLEDGE_UNLOCK

// Dispatcher (UI side):
dispatch({ type: "CLEAR_TOAST", id: toast.id });
dispatch({ type: "ACKNOWLEDGE_UNLOCK", id: unlock.id });
```

No `EventEmitter`, no `window.dispatchEvent`, no pub/sub. If a system needs to communicate, it either returns new state or the UI observes state changes directly.

---

### Debug / Development Tools

**Available (DEV builds only, excluded via `import.meta.env.DEV`):**

| Tool             | Access                           | What it does                                                |
| ---------------- | -------------------------------- | ----------------------------------------------------------- |
| Debug Panel UI   | `?debug=1` or tap sequence (TBD) | Fast-forward time, toggle unlocks, dump state as JSON       |
| Console commands | `window.__emily`                 | `setState()`, `fastForward(ms)`, `unlockAll()`, `getSave()` |

```ts
// Injected in src/debug/index.ts, imported conditionally in main.tsx:
if (import.meta.env.DEV || isDebug()) {
  const { mountDebugPanel, registerConsoleCommands } = await import("./debug");
  registerConsoleCommands(store);
  mountDebugPanel(store);
}

// Console usage:
window.__emily.fastForward(1000 * 60 * 60); // skip 1 hour
window.__emily.unlockAll();
window.__emily.getSave(); // returns JSON string for inspection
```

---

## Project Structure

### Architectural Boundaries

**Ground-up rewrite = emergence over rigidity.** We define clear boundaries now, but directory details emerge as code grows. Refactor structure freely once patterns become clear.

**Fixed boundaries:**

| Boundary        | Rule                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Domain ↔ UI** | `src/game/**` is pure (no React, no DOM). `src/ui/**` calls domain APIs. One-way dependency: UI → Domain.                                  |
| **Debug Tools** | `src/debug/**` (DEV-only, guarded by `import.meta.env.DEV`). Production builds exclude this entirely.                                      |
| **Tests**       | `tests/` mirrors source structure. Unit tests for domain; integration + E2E for flows.                                                     |
| **Assets**      | `public/` served as-is. No bundled assets in `src/`.                                                                                       |
| **Persistence** | Save format is `localStorage` JSON (versioned). Autosave cadence and lifecycle managed at React level; load/migrate logic at domain level. |

---

### Naming Conventions (Fixed)

Follow these everywhere — they're the vocabulary agents and humans use to communicate code:

**Files:**

| Category           | Convention                                   | Examples                                              |
| ------------------ | -------------------------------------------- | ----------------------------------------------------- |
| React Components   | PascalCase + `.tsx`                          | `HomeTab.tsx`, `ProgressBar.tsx`, `MiniGameShell.tsx` |
| TypeScript Modules | camelCase + `.ts`                            | `constants.ts`, `reducer.ts`, `persistence.ts`        |
| Hooks              | `use*` + PascalCase + `.ts`                  | `useGameState.ts`, `useGameRuntime.ts`                |
| Tests              | Match source + `.unit.test.ts` or `.spec.ts` | `sim.unit.test.ts`, `save-persistence.spec.ts`        |

**Code:**

| Element        | Convention             | Examples                                            |
| -------------- | ---------------------- | --------------------------------------------------- |
| Types          | PascalCase             | `GameState`, `Action`, `Result<T>`, `CareerStage`   |
| Constants      | UPPER_SNAKE_CASE       | `SIM_TICK_MS`, `AUTOSAVE_INTERVAL_MS`, `SAVE_KEY`   |
| Functions      | camelCase              | `step()`, `loadSave()`, `applyIncome()`             |
| Variables      | camelCase              | `state`, `action`, `newState`                       |
| Booleans       | `is*` or `has*` prefix | `isUnlocked`, `hasEnoughMoney`, `canProgressCareer` |
| Selectors      | `get*` or adjective    | `getCareerProgress()`, `affordableWatches()`        |
| Event Handlers | `on*` prefix           | `onClick`, `onStateChange`, `onUnlock`              |

**Game Data:**

| Category       | Convention             | Examples                                         |
| -------------- | ---------------------- | ------------------------------------------------ |
| Watch ID       | kebab-case             | `rolex-submariner`, `seiko-5-snk`                |
| Career Stage   | PascalCase (enum-like) | `AssistantPsychologist`, `LicensedPsychologist`  |
| Achievement ID | kebab-case             | `first-watch-acquired`, `career-stage-3-reached` |
| Unlock ID      | kebab-case             | `home-photo-1`, `prestige-layer-2-intro`         |

**Numeric Suffixes (always use):**

| Type  | Suffix              | Why                        | Example                                     |
| ----- | ------------------- | -------------------------- | ------------------------------------------- |
| Money | `Cents` or `_CENTS` | Avoid float precision bugs | `currencyCents`, `WATCH_PRICE_CENTS`        |
| Time  | `Ms` or `_MS`       | Clarify units              | `dtMs`, `SIM_TICK_MS`, `autosaveIntervalMs` |
| Rates | `PerSec` or context | Avoid ambiguity            | `incomePerSec`, `enjoymentRate`             |

---

### Directory Emergence Strategy

**Start minimal.** As code grows, structures reveal themselves:

**Likely structure (evolves organically):**

```
src/game/
  ├── types.ts              # GameState, Action unions, Result<T>
  ├── constants.ts          # Game-wide constants
  ├── {domain}/             # Emerges as domains separate: career/, economy/, collection/, prestige/, discovery/
  ├── sim.ts                # Pure step(state, dtMs) function
  ├── persistence.ts        # Save/load/migrate (Result types)
  └── index.ts              # Public API facade

src/ui/
  ├── App.tsx               # Root + shell
  ├── {features}/           # Emerges as features organize: tabs/, mini-games/, modals/, components/
  └── hooks/                # Shared React hooks

tests/
  ├── {mirrors-src}         # Unit tests mirror source structure
  ├── integration/          # Cross-domain tests
  └── e2e/                  # Full playthrough tests
```

**Refactor freely.** Once a domain grows to >300 LOC or a feature has 3+ related files, extract it into its own directory. The naming conventions keep it consistent.

---

### Anti-Patterns to Avoid

- ❌ Code files >300 LOC — split immediately
- ❌ Hardcoded game data in components — move to domain constants
- ❌ Side effects in domain functions — only pure transitions
- ❌ Circular dependencies — UI → Domain only
- ❌ Abandoned catch blocks — if you catch, log and return safe value
- ❌ Stringly-typed actions — use discriminated unions
- ❌ localStorage access outside domain — persistence.ts is the only gate

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents. No novel patterns needed — standard, battle-tested patterns fit Emily At Last perfectly.

---

### Pattern 1: State Transitions

**Pattern:** Discriminated union actions + `useReducer`

**Why:** Single source of truth, deterministic, testable, no mutations.

**Implementation:**

```ts
// types.ts
type Action =
  | { type: "EARN_MONEY"; amount: number }
  | { type: "BUY_WATCH"; watchId: string }
  | { type: "PROGRESS_CAREER"; xp: number }
  | { type: "RECORD_INTERACTION"; payload: InteractionResult }
  | { type: "ACKNOWLEDGE_UNLOCK"; id: string };
// ... one type per state mutation

// reducer.ts
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "EARN_MONEY":
      return { ...state, currencyCents: state.currencyCents + action.amount };

    case "BUY_WATCH":
      if (state.currencyCents < getWatchPrice(action.watchId)) return state; // Guard
      return {
        ...state,
        currencyCents: state.currencyCents - getWatchPrice(action.watchId),
        ownedWatchIds: [...state.ownedWatchIds, action.watchId],
      };

    case "PROGRESS_CAREER":
      return { ...state, careerXp: state.careerXp + action.xp };

    default:
      return state;
  }
}
```

**Convention:**

- Action type names are `UPPER_SNAKE_CASE`
- If action carries data, use a `payload` field (not multiple fields)
- Guards are inline in reducer; invalid actions return state unchanged
- Never mutate; always return new state via spread/shallow copy

---

### Pattern 2: Selectors (Derived State)

**Pattern:** Pure functions that take state and return computed values. Memoizable by the UI layer.

**Implementation:**

```ts
// selectors/economy.ts
export function getIncomePerSecond(state: GameState): number {
  return state.careerIncomeRate + state.passiveIncomeRate;
}

export function getCurrencyDisplay(state: GameState): string {
  return `$${(state.currencyCents / 100).toFixed(2)}`;
}

// selectors/career.ts
export function getCareerProgress(state: GameState): number {
  const current = state.careerXp;
  const threshold = CAREER_XP_PER_STAGE[state.careerStage];
  return Math.min(current / threshold, 1);
}

export function canAdvanceCareer(state: GameState): boolean {
  return getCareerProgress(state) >= 1;
}

// selectors/collection.ts
export function affordableWatches(state: GameState): Watch[] {
  return WATCHES.filter((w) => state.currencyCents >= w.priceCents);
}

export function ownedWatches(state: GameState): Watch[] {
  return WATCHES.filter((w) => state.ownedWatchIds.includes(w.id));
}
```

**Convention:**

- Selectors live in `game/selectors/` split by domain
- Each selector is a pure function with signature `(state: GameState): T`
- Selector names are descriptive: `get*`, `is*`, `can*`, or adjective + noun
- No side effects; same input → same output always
- Selectors are the only place progression math lives (not in components)

---

### Pattern 3: Static Game Data

**Pattern:** TS constants (not JSON files), organized by domain, immutable.

**Implementation:**

```ts
// game/data/watches.ts
export const WATCHES = [
  {
    id: "rolex-submariner",
    name: "Rolex Submariner",
    priceCents: 100000,
    tier: "luxury",
    imageUrl: "/catalog/watches/rolex-submariner.webp",
  },
  {
    id: "seiko-5-snk",
    name: "Seiko 5 SNK",
    priceCents: 25000,
    tier: "standard",
    imageUrl: "/catalog/watches/seiko-5-snk.webp",
  },
  // ...
] as const;

// game/data/careers.ts
export const CAREER_STAGES = [
  {
    id: "AssistantPsychologist",
    title: "Assistant Psychologist",
    xpRequired: 0,
    incomePerSecCents: 10,
  },
  {
    id: "LicensedPsychologist",
    title: "Licensed Psychologist",
    xpRequired: 500,
    incomePerSecCents: 50,
  },
  // ...
] as const;

// game/constants.ts
export const SIM_TICK_MS = 100;
export const AUTOSAVE_INTERVAL_MS = 2_000;
export const SAVE_KEY = "emily-idle:save";
export const MAX_CURRENCY_CENTS = 999_999_999;
```

**Convention:**

- Data arrays are exported as `const` with `as const` for type safety
- Objects use `id` as the primary key (kebab-case)
- Money values always end in `Cents`
- Time values always end in `Ms`
- Never hardcode game data in components; always reference from `game/data/**`

---

### Pattern 4: Result Type (Error Handling)

**Pattern:** Return `Result<T>` for fallible operations. Never throw inside `src/game/**`.

**Implementation:**

```ts
// types.ts
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// game/persistence.ts
export function loadSave(raw: string): Result<GameState> {
  if (!raw) {
    return { ok: false, error: "No save found" };
  }

  try {
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    return migrated.ok ? { ok: true, value: migrated.value } : migrated;
  } catch (e) {
    return { ok: false, error: `Invalid save: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

// UI boundary (src/ui/hooks/useGameRuntime.ts)
try {
  const result = loadSave(localStorage.getItem(SAVE_KEY) ?? "");
  if (result.ok) {
    dispatch({ type: "LOAD_SAVE", state: result.value });
  } else {
    log({ level: "WARN", scope: "persistence", msg: result.error });
    showToast(`Load failed: ${result.error}`);
  }
} catch (e) {
  log({ level: "ERROR", scope: "persistence", msg: "localStorage access failed", data: e });
  // Graceful fallback: continue with initial state
}
```

**Convention:**

- Domain functions return `Result<T>`, never throw
- UI layer checks `.ok` and handles errors
- Storage APIs, import/export parsing are wrapped in `try/catch`
- Error messages are user-friendly (no stack traces)

---

### Pattern 5: React Custom Hooks

**Pattern:** `useGameState()` and `useGameDispatch()` provide consistent access to domain state/actions from any component.

**Implementation:**

```ts
// ui/hooks/useGameState.ts
import { useContext } from "react";
import { GameContext } from "../context/GameContext";

export function useGameState(): GameState {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used inside GameProvider");
  }
  return context.state;
}

export function useGameDispatch(): React.Dispatch<Action> {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameDispatch must be used inside GameProvider");
  }
  return context.dispatch;
}

// In a component:
export function CareerPanel() {
  const state = useGameState();
  const dispatch = useGameDispatch();

  const progress = getCareerProgress(state);
  const canAdvance = canAdvanceCareer(state);

  const handleClaimReward = () => {
    dispatch({ type: "PROGRESS_CAREER", xp: 100 });
  };

  return (
    <div>
      <ProgressBar value={progress} />
      {canAdvance && <button onClick={handleClaimReward}>Advance</button>}
    </div>
  );
}
```

**Convention:**

- Create two hooks: `useGameState()` and `useGameDispatch()`
- Both throw if context is missing (fail fast)
- Never fetch selectors inside component; use selectors on state
- Dispatch actions on user interaction (clicks, form submission, etc.)

---

### Pattern 6: Mini-Game Pattern

**Pattern:** Modal wrapper handles domain dispatch; mini-game component has local state for input/animations and calls `onComplete` callback.

**Implementation:**

```ts
// ui/mini-games/MiniGameShell.tsx
export function MiniGameShell({ onResult, children }: Props) {
  const dispatch = useGameDispatch();

  const handleGameEnd = (result: InteractionResult) => {
    dispatch({
      type: "RECORD_INTERACTION",
      payload: {
        gameType: result.gameType,
        perfects: result.perfects,
        duration: result.duration,
      },
    });
    onResult?.();
  };

  return (
    <Modal isOpen>
      <div className="mini-game-shell">
        {children} {/* Mini-game component cloned with onComplete handler */}
      </div>
    </Modal>
  );
}

// ui/mini-games/WatchWindingGame.tsx
export interface WatchWindingGameProps {
  onComplete: (result: { perfects: number; duration: number }) => void;
}

export function WatchWindingGame({ onComplete }: WatchWindingGameProps) {
  const [position, setPosition] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [startTime] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);

  const handleInputDown = (direction: "cw" | "ccw") => {
    // Local game logic: animation, haptics, perfect detection
    const targetRotation = direction === "cw" ? position + 45 : position - 45;
    const isPerfect = Math.abs(targetRotation % 90) < PERFECT_WINDOW;

    if (isPerfect) {
      setPerfects(p => p + 1);
      playFeedback(); // Local effect
    }

    setPosition(targetRotation);
  };

  const handleGameEnd = () => {
    setIsActive(false);
    onComplete({
      perfects,
      duration: Date.now() - startTime,
    });
  };

  return (
    <motion.div className="winding-game">
      <motion.div
        className="watch-face"
        animate={{ rotate: position }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Visual representation */}
      </motion.div>
      <PerfectCounter count={perfects} />
      <button onClick={handleGameEnd} disabled={!isActive}>
        Finish Game
      </button>
    </motion.div>
  );
}
```

**Convention:**

- Mini-game component has local state (position, counters, animations)
- Input handling is internal to the component
- `onComplete` callback passes results back to parent
- Parent (modal wrapper) dispatches domain action
- Never directly access `useGameState()` inside mini-game; all domain updates go through callback

---

### Consistency Rules

| Pattern              | Rule                                                                | Enforcement                                                        |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Actions**          | Every mutation is a discriminated union variant                     | Code review + TypeScript strict mode                               |
| **Selectors**        | Pure functions, no side effects, memoizable                         | Avoid `useState`, `useEffect`, `Date.now()` inside selectors       |
| **Data**             | All constants in `game/data/**`, never hardcoded in components      | Search codebase for `"watchId"` or `priceCents` literals           |
| **Results**          | Fallible operations return `Result<T>`, never throw                 | eslint rule: no `throw` in `src/game/**`                           |
| **Hooks**            | Access state via `useGameState()` + selectors, not context directly | No `useContext(GameContext).state` in components                   |
| **Mini-Games**       | Local state in component, dispatch results via callback             | No `dispatch()` calls inside game logic                            |
| **Numeric suffixes** | Money = `Cents` or `_CENTS`, Time = `Ms` or `_MS`                   | Code review: reject `price`, `interval`, `duration` without suffix |

---

**Validation Check:**

- ✅ 6 standard patterns with concrete code examples
- ✅ Each pattern has a "convention" section for consistency
- ✅ Coverage: state, selectors, data, errors, hooks, mini-games
- ✅ Consistency rules table prevents drift

---

**Select an option:**

**[A]** Advanced Elicitation — explore alternative patterns  
**[P]** Party Mode — get perspectives on patterns  
**[C]** Continue — save this and move to Validation (Step 8 of 9)
