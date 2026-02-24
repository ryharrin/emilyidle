# Story 1.4: Persistence & Save System

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want my progress to save automatically and survive browser restarts,  
so that I never lose my collection or career progress.

## Acceptance Criteria

1. Given the game is running, when state changes occur, then autosave triggers every 2 seconds when dirty.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
2. Given the save system, when it serializes state, then it writes versioned JSON to `emily-idle:save` in localStorage.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
3. Given a saved game exists, when I reload the page, then the save is loaded, migrated if needed, and state is restored.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
4. Given the save format, when I inspect it, then it includes an explicit `version` field for future migrations.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
5. Given the tab becomes hidden (`visibilitychange`) or `pagehide` fires, when the event triggers, then an immediate save is performed.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
6. Given a corrupted save string, when `loadSave()` is called, then it returns `Result<GameState>` with `{ ok: false, error: string }` (never throws).  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]
7. Given the PWA is installed, when the app starts, then it requests `navigator.storage.persist()` to reduce eviction risk.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.4]

## Tasks / Subtasks

- [x] Add persistence constants (AC: 1, 2)
  - [x] Add to `src/game/constants.ts`:
    - [x] `export const SAVE_KEY = "emily-idle:save" as const`
    - [x] `export const AUTOSAVE_INTERVAL_MS = 2_000 as const`

- [x] Implement versioned serialization + migration (AC: 2, 3, 4, 6)
  - [x] Add `src/game/persistence.ts` exporting:
    - [x] `export function serializeSave(state: GameState): string` (must include `version`)
    - [x] `export function loadSave(raw: string): Result<GameState>` (never throws)
    - [x] `export function migrateSave(rawObject: unknown): Result<GameState>` (pure, version-aware)
  - [x] Rules:
    - [x] Persistence functions are deterministic and side-effect free (no localStorage calls inside `src/game/**`).
    - [x] `loadSave()` catches JSON parse errors and returns `{ ok: false, error }`.
    - [x] Migration strategy:
      - [x] Unknown versions must fail gracefully with a helpful error.
      - [x] Known older versions must migrate forward (even if “no-op” for v1).
  - [x] Use `Result<T>` from `src/game/types.ts`.  
    [Source: `_bmad-output/game-architecture.md` Pattern 4: Result Type]

- [x] Implement UI-layer storage bridge (AC: 1, 2, 3, 5)
  - [x] Add `src/ui/hooks/usePersistence.ts` (or similar) that:
    - [x] Loads from localStorage at startup and dispatches an action to replace state (e.g., `LOAD_SAVE`).
    - [x] Tracks “dirty” state changes and writes to localStorage on cadence.
    - [x] Flushes immediately on `visibilitychange` (hidden) and `pagehide`.
  - [x] Ensure localStorage access is try/catch guarded; persistence must never crash the app.
  - [x] Ensure domain purity: localStorage lives in UI boundary only.  
    [Source: `_bmad-output/game-architecture.md` Anti-Patterns to Avoid: localStorage access outside domain]

- [x] Add reducer actions for persistence plumbing (AC: 3)
  - [x] Extend `Action` to include:
    - [x] `LOAD_SAVE { state: GameState }`
    - [x] `MARK_DIRTY` / `CLEAR_DIRTY` (optional) OR derive dirty state in UI by comparing last saved snapshot
  - [x] Ensure unknown action behavior remains safe.

- [x] Add PWA persist request (AC: 7)
  - [x] On app startup, request persistent storage when available:
    - [x] `await navigator.storage?.persist?.()` (guard for browser support)
  - [x] Keep it best-effort; failure should not block gameplay.

- [x] Tests (AC: 2, 4, 6)
  - [x] Add `src/game/persistence.unit.test.ts` verifying:
    - [x] `serializeSave()` includes `version` and round-trips for current schema.
    - [x] `loadSave()` returns `{ ok: false }` on corrupted JSON (and never throws).
    - [x] Migration behavior for at least one older schema shape (even if synthetic).

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- This is a gift-grade experience for Emily only. Persistence failures are a “gift ruiner”; treat this like a boss fight.
- Keep the save format *boring* and resilient: localStorage JSON with explicit `version` is the intended design.
- Avoid cleverness. Make corruption handling graceful and non-throwing.

### Technical Requirements

- Autosave cadence: every `AUTOSAVE_INTERVAL_MS` when state is dirty.
- Immediate flush on `visibilitychange` hidden and `pagehide`.
- Save key is fixed by AC: `SAVE_KEY = "emily-idle:save"`.
- Domain never touches localStorage; UI bridge owns side effects.

### Architecture Compliance

- Persistence format: versioned JSON + migrations.  
  [Source: `_bmad-output/game-architecture.md` Data Persistence]
- Fallible operations return `Result<T>`; do not throw in `src/game/**`.  
  [Source: `_bmad-output/game-architecture.md` Pattern 4: Result Type]

### Library / Framework Requirements

- No IndexedDB helper libraries (explicitly cut); use localStorage.  
  [Source: `_bmad-output/game-architecture.md` Cut (with rationale)]

### File Structure Requirements

- Domain:
  - `src/game/constants.ts` (SAVE_KEY, AUTOSAVE_INTERVAL_MS)
  - `src/game/persistence.ts`
  - `src/game/types.ts` (Result<T>, GameState)
- UI boundary:
  - `src/ui/hooks/usePersistence.ts` (side effects: localStorage, events, timers)

### Testing Requirements

- Unit tests must prove “corrupt save never crashes” by asserting `loadSave()` does not throw.
- Unit tests must prove `version` exists and is preserved.

### Previous Story Intelligence

- Keep state serializable (no Date, no Map/Set) to support persistence.
  [Source: `_bmad-output/implementation-artifacts/1-2-gamestate-type-and-reducer.md`]

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.4 ACs)
- `_bmad-output/game-architecture.md` (Persistence; Pattern 4; Anti-patterns)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.4)
- Persistence constraints sourced from Game Architecture (localStorage JSON, migrations, Result<T>)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added persistence constants (`SAVE_KEY`, `AUTOSAVE_INTERVAL_MS`) to `src/game/constants.ts`.
- Implemented versioned JSON serialization + migration in `src/game/persistence.ts` (domain-pure, never touches localStorage).
- Implemented UI persistence bridge with autosave cadence and immediate flush on `visibilitychange`/`pagehide`.
- Added `LOAD_SAVE` action to enable restoring state at startup.
- Added unit tests covering round-trip, corruption handling, and legacy migration behavior.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-4-persistence-and-save-system.md`
- `src/game/constants.ts`
- `src/game/persistence.ts`
- `src/game/persistence.unit.test.ts`
- `src/game/types.ts`
- `src/game/reducer.ts`
- `src/ui/hooks/usePersistence.ts`
- `src/ui/App.tsx`

### Change Log

- 2026-02-23: Implemented Story 1.4 persistence (versioned JSON, migration, autosave cadence + flush, persist request); gates green; status moved to review.
- 2026-02-23: Review fix: validate migrated `careerStage` against allowed values; status moved to done.
