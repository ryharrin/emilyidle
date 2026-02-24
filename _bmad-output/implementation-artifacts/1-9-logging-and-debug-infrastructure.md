# Story 1.9: Logging & Debug Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want structured JSON logging and a dev-only debug panel,  
so that I can diagnose issues during development without impacting production.

## Acceptance Criteria

1. Given the logging system, when I log an event, then it uses a structured JSON shape (level, scope, msg, data, tsMs).  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.9]
2. Given the debug panel, when running in development mode, then I can view current state (redacted as needed) and trigger safe debug actions.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.9]
3. Given production build, when I inspect bundles, then debug panel code is excluded or gated so it does not affect production behavior.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.9]

## Tasks / Subtasks

- [x] Add structured logger utility (AC: 1)
  - [x] Add `src/game/log.ts` (or `src/ui/log.ts` if you prefer logging in UI boundary) exporting:
    - [x] `export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"`
    - [x] `export type LogEvent = { level: LogLevel; scope: string; msg: string; tsMs: number; data?: unknown }`
    - [x] `export function log(event: Omit<LogEvent, \"tsMs\">): void` (adds `tsMs`, logs as one JSON object)
  - [x] Log output must be one JSON object per call (no concatenated strings).

- [x] Add dev-only debug panel (AC: 2, 3)
  - [x] Add `src/ui/debug/DebugPanel.tsx` that:
    - [x] Renders only when `import.meta.env.DEV` is true.
    - [x] Shows current `GameState` (consider redaction for any personal content later; this is Emily-only but still keep it clean).
    - [x] Provides safe actions:
      - [x] Clear localStorage save (calls UI persistence bridge)
      - [x] Force-add some currency / enqueue a toast / enqueue an unlock (using reducer actions)
      - [x] Export save (reuse the export function from Story 1.4/1.5)
  - [x] Ensure no debug actions exist in production builds (render gate + avoid side-effectful imports in prod).

- [x] Add logging call sites (AC: 1)
  - [x] Add a few “high signal” log sites:
    - [x] persistence load/save errors
    - [ ] reducer unknown-action occurrences (optional; beware noise)
    - [x] error boundary catches

- [x] Tests (AC: 1, 3)
  - [x] Unit test for logger shape (tsMs exists, required keys present).
  - [x] Unit test that DebugPanel does not render when `import.meta.env.DEV` is false (if test setup allows), or structure the debug panel behind an injected boolean for testability.

- [x] Quality gates green
  - [x] `pnpm test`
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`

## Dev Notes

### Developer Context Section

- Logging is for development diagnosis, not telemetry. There is no backend and no analytics requirement.
- Keep logs structured so debugging can be done by filtering JSON in console.
- Debug tools must never jeopardize the gift experience; production must be clean.

### Technical Requirements

- Log event schema: `level`, `scope`, `msg`, `data?`, `tsMs`.
- Debug panel only in development.
- Avoid time estimates anywhere in UI copy or debug outputs.

### Architecture Compliance

- Logging: structured JSON to console.  
  [Source: `_bmad-output/game-architecture.md` Executive Summary (Logging)]
- Debug tools: dev panel + console commands (production-excluded).  
  [Source: `_bmad-output/game-architecture.md` Executive Summary (Debug Tools)]

### File Structure Requirements

- Suggested files:
  - `src/game/log.ts`
  - `src/ui/debug/DebugPanel.tsx`
  - `src/ui/debug/DebugPanel.css` (optional)

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.9 ACs)
- `_bmad-output/game-architecture.md` (Logging + Debug Tools)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.9)
- Logging/debug constraints sourced from Game Architecture

### Completion Notes List

- Added structured JSON logging (`src/game/log.ts`) with the required schema and a unit test.
- Implemented a dev-only debug panel with safe actions (clear save, add currency, enqueue toast/unlock, export save) and wired it into the app shell.
- Added high-signal log call sites for persistence failures and error-boundary catches.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`.

### File List

- `_bmad-output/implementation-artifacts/1-9-logging-and-debug-infrastructure.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/game/log.ts`
- `src/game/log.unit.test.ts`
- `src/ui/App.tsx`
- `src/ui/debug/DebugPanel.tsx`
- `src/ui/debug/DebugPanel.unit.test.tsx`
- `src/ui/errors/ErrorBoundary.unit.test.tsx`
- `src/ui/errors/FeatureErrorBoundary.tsx`
- `src/ui/errors/RootErrorBoundary.tsx`
- `src/ui/hooks/usePersistence.ts`

### Change Log

- 2026-02-23: Added structured logger + dev-only debug panel, wired high-signal log call sites, gates green; status moved to done.
