# Epic 1: Foundation

## Overview

Ground-up project scaffolding for Emily At Last. Establishes the Vite + React 19 + TypeScript project, domain/UI boundary, core GameState type and reducer, game loop (RAF + fixed 100ms timestep), persistence (localStorage versioned JSON), error boundaries, PWA setup, and the content discovery system skeleton.

This epic produces a running app shell with no gameplay — but with all architectural infrastructure in place so that subsequent epics can focus purely on features.

## Epic Goal

Deliver a deployable, zero-crash app shell that boots on iOS Safari, persists state, handles errors gracefully, and provides the architectural seams (state, reducer, sim loop, discovery registry, persistence) that every later epic depends on.

## Dependencies

None — this is the first epic.

## Architecture References

- State Management: useReducer + Context (split by domain)
- Game Loop: RAF + fixed 100ms sim ticks (`src/game/sim.ts`)
- Project Structure: `src/game/**` (pure domain) + `src/ui/**` (React)
- Persistence: localStorage JSON versioned + autosave
- Error Handling: Result<T> + react-error-boundary
- PWA: vite-plugin-pwa, cache-first hashed assets

---

## Story 1.1: Project Initialization & Tooling

**As a** developer,
**I want** a fresh Vite + React 19 + TypeScript project with all architecture-specified tooling,
**So that** I have a clean foundation matching the architecture document exactly.

**Acceptance Criteria:**

**Given** a fresh checkout,
**When** I run `pnpm install && pnpm dev`,
**Then** the dev server starts on port 5177 with React 19.2.4, Vite 7.3.1, TypeScript 5.8.

**Given** the project is initialized,
**When** I inspect dependencies,
**Then** react-error-boundary 6.1.1, motion 12.34.3, vite-plugin-pwa 1.2.0, lucide-react 0.563+, and @tanstack/react-virtual 3.13.x are installed.

**Given** the project structure,
**When** I inspect the directory layout,
**Then** `src/game/` and `src/ui/` directories exist with clear domain/UI boundary.

**Given** TypeScript config,
**When** I run `pnpm exec tsc --noEmit`,
**Then** strict mode passes with zero errors.

---

## Story 1.2: GameState Type & Reducer

**As a** developer,
**I want** the core GameState type and pure reducer with discriminated union actions,
**So that** all game state mutations flow through a single, testable, serializable pipeline.

**Acceptance Criteria:**

**Given** the GameState type,
**When** I inspect its definition,
**Then** it includes all primary fields: currencyCents, enjoyment, love, careerXp, careerStage, ownedWatchIds, pendingToasts, pendingUnlocks, and version.

**Given** the Action union type,
**When** I inspect it,
**Then** it uses discriminated unions with UPPER_SNAKE_CASE type names.

**Given** the reducer function,
**When** I dispatch an unknown action type,
**Then** it returns the current state unchanged.

**Given** the reducer function,
**When** I dispatch a valid action,
**Then** it returns a new state object (never mutates).

**Given** the Result<T> type,
**When** I import it from game/types,
**Then** it provides `{ ok: true; value: T } | { ok: false; error: string }`.

---

## Story 1.3: Game Loop & Simulation Tick

**As a** developer,
**I want** a RAF-based game loop with fixed 100ms simulation ticks,
**So that** progression math is deterministic regardless of frame rate.

**Acceptance Criteria:**

**Given** the game loop is running,
**When** a frame fires,
**Then** it accumulates delta time and steps the simulation in SIM_TICK_MS (100ms) chunks.

**Given** a large frame delta (e.g. tab switch returning after 30s),
**When** the loop processes it,
**Then** the delta is clamped to prevent giant progression leaps.

**Given** the document is hidden (visibilitychange),
**When** the tab goes to background,
**Then** the RAF loop pauses to conserve battery.

**Given** the `step(state, dtMs)` function,
**When** called with a dtMs value,
**Then** it returns a new GameState with progression applied (pure function, no side effects).

**Given** a test environment,
**When** `isTestEnvironment()` returns true,
**Then** the RAF loop is skipped.

---

## Story 1.4: Persistence & Save System

**As a** player,
**I want** my progress to save automatically and survive browser restarts,
**So that** I never lose my collection or career progress.

**Acceptance Criteria:**

**Given** the game is running,
**When** state changes occur,
**Then** autosave triggers every 2 seconds when dirty.

**Given** the save system,
**When** it serializes state,
**Then** it writes versioned JSON to `emily-idle:save` in localStorage.

**Given** a saved game exists,
**When** I reload the page,
**Then** the save is loaded, migrated if needed, and state is restored.

**Given** the save format,
**When** I inspect it,
**Then** it includes an explicit `version` field for future migrations.

**Given** the tab becomes hidden (visibilitychange) or pagehide fires,
**When** the event triggers,
**Then** an immediate save is performed.

**Given** a corrupted save string,
**When** `loadSave()` is called,
**Then** it returns `Result<GameState>` with `{ ok: false, error: string }` (never throws).

**Given** the PWA is installed,
**When** the app starts,
**Then** it requests `navigator.storage.persist()` to reduce eviction risk.

---

## Story 1.5: Error Boundaries & Reliability

**As a** player,
**I want** the game to never show a white screen, even if something breaks,
**So that** the gift experience is never ruined by a crash.

**Acceptance Criteria:**

**Given** the app root,
**When** a component throws an error,
**Then** the root error boundary catches it and shows a friendly fallback.

**Given** any error boundary fallback,
**When** it renders,
**Then** it shows: (1) a plain-language message, (2) an export-save button, (3) a reload button.

**Given** individual tabs/panels,
**When** a tab-level error occurs,
**Then** only that tab shows a fallback; other tabs remain functional.

**Given** a mini-game area,
**When** a mini-game crashes,
**Then** only the mini-game shows a fallback; the rest of the app continues.

---

## Story 1.6: PWA Configuration & Offline Support

**As a** player,
**I want** to install the game on my home screen and play offline,
**So that** it feels like a native app and works without internet.

**Acceptance Criteria:**

**Given** the PWA manifest,
**When** I visit the game in Safari,
**Then** I can add it to my home screen with the correct name, icon, and theme colors.

**Given** vite-plugin-pwa configuration,
**When** assets are loaded,
**Then** hashed JS/CSS uses cache-first, images use stale-while-revalidate, HTML uses network-first.

**Given** no internet connection,
**When** I open the installed PWA,
**Then** the app loads from cache and is fully playable offline.

---

## Story 1.7: UI Shell & Navigation

**As a** player,
**I want** a tab-based navigation shell with Home, Collection, Career, and Market tabs,
**So that** I can navigate between game areas easily on mobile.

**Acceptance Criteria:**

**Given** the app loads,
**When** I see the interface,
**Then** bottom navigation shows 4 tabs: Home, Collection, Career, Market.

**Given** I tap a tab,
**When** it activates,
**Then** the corresponding panel renders and the tab is highlighted.

**Given** the UI renders on iPhone 17,
**When** I inspect the layout,
**Then** it respects Dynamic Island and safe area insets.

**Given** the color palette,
**When** I inspect styles,
**Then** warm cream backgrounds, rose gold accents, and navy text are used.

**Given** touch targets,
**When** I inspect interactive elements,
**Then** all tap targets are at minimum 44x44pt.

---

## Story 1.8: Content Discovery System Skeleton

**As a** developer,
**I want** a data-driven unlock registry skeleton,
**So that** all future content unlocks flow through a centralized, auditable system.

**Acceptance Criteria:**

**Given** the discovery system,
**When** I inspect `src/game/discovery/`,
**Then** it exports a registry of unlock entries with: id, category, condition(state) → boolean, onUnlock(state) → state.

**Given** a registered unlock,
**When** `condition(state)` returns true,
**Then** the unlock is marked as triggered in state.

**Given** the UI,
**When** pendingUnlocks exist in state,
**Then** the UI can render reveal animations and dispatch ACKNOWLEDGE_UNLOCK.

**Given** the skeleton implementation,
**When** no content is registered yet,
**Then** the system operates correctly with an empty registry.

---

## Story 1.9: Logging & Debug Infrastructure

**As a** developer,
**I want** structured JSON logging and a dev-only debug panel,
**So that** I can diagnose issues during development without impacting production.

**Acceptance Criteria:**

**Given** any log call,
**When** I use `log({ level, scope, msg, data })`,
**Then** it outputs structured JSON to the appropriate console method.

**Given** a production build,
**When** I inspect the bundle,
**Then** debug panel code and DEBUG-level logs are excluded via `import.meta.env.DEV`.

**Given** `?debug=1` query param in DEV,
**When** the app loads,
**Then** `window.__emily` console commands are available (fastForward, unlockAll, getSave, setState).

**Given** the debug panel,
**When** activated,
**Then** it shows state inspector, time controls, and unlock toggles.
