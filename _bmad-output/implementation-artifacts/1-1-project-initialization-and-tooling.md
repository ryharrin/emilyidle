# Story 1.1: Project Initialization and Tooling

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want a fresh Vite + React 19 + TypeScript project with architecture-specified tooling,  
so that I have a clean foundation matching the architecture document exactly.

## Acceptance Criteria

1. Given a fresh checkout, when I run `pnpm install && pnpm dev`, then the dev server starts on port 5177 with React 19.2.4, Vite 7.3.1, and TypeScript 5.8.x.
2. Given the project is initialized, when I inspect dependencies, then `react-error-boundary@6.1.1`, `motion@12.34.3`, `vite-plugin-pwa@1.2.0`, `lucide-react@0.563+`, and `@tanstack/react-virtual@3.13.x` are installed.
3. Given the project structure, when I inspect the directory layout, then `src/game/` and `src/ui/` directories exist with a clear domain/UI boundary.
4. Given TypeScript config, when I run `pnpm exec tsc --noEmit`, then strict mode passes with zero errors.

## Tasks / Subtasks

- [x] Bootstrap project runtime and scripts (AC: 1, 4)
  - [x] Create project scaffold using Vite React TypeScript template in repo root (or align existing scaffold to equivalent state without destructive reset).
  - [x] Ensure package manager is `pnpm` and lockfile is generated/updated.
  - [x] Configure dev server port to `5177` in `vite.config.ts`.
  - [x] Verify `pnpm install && pnpm dev` runs successfully.
- [x] Install and pin architecture-required dependencies (AC: 1, 2)
  - [x] Pin core stack versions to architecture baseline:
    - `react@19.2.4`
    - `react-dom@19.2.4`
    - `vite@7.3.1`
    - `typescript@5.8.3` (or `5.8.2` if lock constraints require)
  - [x] Install required support libs:
    - `react-error-boundary@6.1.1`
    - `motion@12.34.3`
    - `vite-plugin-pwa@1.2.0`
    - `lucide-react@^0.563.0`
    - `@tanstack/react-virtual@^3.13.0`
- [x] Establish architecture boundary directories and minimal entry points (AC: 3)
  - [x] Create `src/game/` for pure domain modules (no React/DOM imports).
  - [x] Create `src/ui/` for React UI modules.
  - [x] Add minimal README note in code comments or docs describing `src/ui -> src/game` one-way dependency.
- [x] Enforce TypeScript strictness and baseline quality checks (AC: 4)
  - [x] Ensure TypeScript strict mode is enabled (in `tsconfig.app.json` and `tsconfig.node.json`; `tsconfig.json` is a references-only solution config).
  - [x] Run `pnpm exec tsc --noEmit` and resolve all type errors.
  - [x] Run lint baseline (`pnpm exec eslint .`) and resolve initialization-level issues.

## Dev Notes

### Developer Context Section

- This story is foundational scaffolding for all following stories in Epic 1.
- Do not implement gameplay systems yet (reducer logic, sim loop, persistence internals, unlock registry behavior are covered by later stories).
- Prioritize deterministic project setup and reproducible tooling over feature work.
- This repository currently contains planning artifacts but no app scaffold at root (`package.json` and `src/` are absent), so this story should create the initial runtime project footprint.

### Technical Requirements

- Runtime/tooling baseline:
  - Node.js 20+ and `pnpm` 9+ (aligned with `"packageManager"` pin in `package.json`)
  - Vite + React + TypeScript
- Required commands to pass before marking complete:
  - `pnpm install`
  - `pnpm dev` (port 5177)
  - `pnpm exec tsc --noEmit`
- Keep all initial code and configs ASCII-only unless third-party tooling generates otherwise.

### Architecture Compliance

- Enforce domain/UI separation from day 1:
  - `src/game/**` is pure TypeScript domain logic.
  - `src/ui/**` is React rendering/interaction.
  - Dependency direction is one-way: `src/ui` can depend on `src/game`; `src/game` must not depend on React or DOM APIs.
- Keep file/module naming aligned with architecture conventions:
  - Components: PascalCase `.tsx`
  - TS modules: camelCase `.ts`
  - Constants: UPPER_SNAKE_CASE

### Library / Framework Requirements

- Architecture-locked versions for this story:
  - `react@19.2.4`
  - `vite@7.3.1`
  - `typescript@5.8.x`
  - `react-error-boundary@6.1.1`
  - `motion@12.34.3`
  - `vite-plugin-pwa@1.2.0`
  - `lucide-react@0.563+`
  - `@tanstack/react-virtual@3.13.x`
- Avoid adding non-architecture state libraries at this stage (`zustand` is explicitly cut in architecture rationale).
- Avoid introducing IndexedDB helper libs in this story (`idb-keyval` is explicitly cut in architecture rationale).

### File Structure Requirements

- Expected minimum structure after completion:
  - `package.json`
  - `pnpm-lock.yaml`
  - `vite.config.ts`
  - `tsconfig.json`
  - `src/game/`
  - `src/ui/`
  - `src/main.tsx`
  - `src/ui/App.tsx` (or equivalent app entry under `src/ui`)
- Configure Vite dev server port in `vite.config.ts` to `5177`.
- Keep existing planning artifacts under `_bmad-output/**` untouched.

### Testing Requirements

- Validation gates for this story:
  - Install succeeds with `pnpm install`.
  - Dev server starts with `pnpm dev` on port `5177`.
  - Type checking passes with `pnpm exec tsc --noEmit` using strict mode.
  - No initialization regressions in lint baseline.
- Add at least one lightweight smoke test or script-level assertion proving app bootstrap renders without runtime crash (unit or integration as appropriate to scaffold level).

### Latest Tech Information

NPM registry snapshot (captured during story creation):

- `react`: latest `19.2.4`
- `vite`: latest `7.3.1`
- `typescript`: latest `5.9.3` (architecture baseline remains `5.8.x` for compatibility with accepted design docs)
- `react-error-boundary`: latest `6.1.1`
- `motion`: latest `12.34.3`
- `vite-plugin-pwa`: latest `1.2.0`
- `lucide-react`: latest `0.575.0` (meets `0.563+`)
- `@tanstack/react-virtual`: latest `3.13.18` (meets `3.13.x`)

Guardrail:
- Keep architecture-pinned versions for story acceptance unless an explicit architecture update is approved.
- If upgrading TypeScript to `5.9.x`, do it in a dedicated change with compatibility verification and docs alignment.

### Project Structure Notes

- This story establishes seams, not features.
- Future stories must layer on this scaffold rather than reorganizing boundaries ad hoc.
- Do not place game progression math, reducer mutation logic, persistence migration logic, or unlock orchestration in this story.

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.1 definition and acceptance criteria)
- `_bmad-output/game-architecture.md` (Development Environment, Engine and Framework, Architectural Decisions, Project Structure, Implementation Patterns)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (story tracking and lifecycle state machine)
- `npm view <package> version dist-tags --json` outputs collected during story creation

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story selected from first backlog item in sprint status: `1-1-project-initialization-and-tooling`
- Architecture and GDD loaded from `_bmad-output/game-architecture.md` and `_bmad-output/gdd.md`
- Live registry checks performed via npm view commands
- Scaffold source generated via Vite template in `tmp/watch-idle-app` and promoted to repo root
- Validation commands executed:
  - `pnpm install`
  - `pnpm test`
  - `pnpm exec tsc --noEmit`
  - `pnpm exec eslint .`
  - `pnpm dev` (verified `http://localhost:5177/`)

### Completion Notes List

- Implemented Story 1.1 scaffold and tooling baseline.
- Created Vite + React + TypeScript app foundation in repo root.
- Set dev server port to `5177`.
- Installed and pinned architecture-required dependencies for Story 1.1.
- Established `src/game/**` and `src/ui/**` boundary with guidance in `src/game/README.md`.
- Added smoke test coverage for app bootstrap rendering.
- All required checks passed (`test`, `tsc --noEmit`, `eslint`, and dev server launch).
- Story status moved to `review`.

### File List

- `_bmad-output/implementation-artifacts/1-1-project-initialization-and-tooling.md`
- `eslint.config.js`
- `index.html`
- `package.json`
- `pnpm-lock.yaml`
- `src/game/README.md`
- `src/index.css`
- `src/main.tsx`
- `src/test/setup.ts`
- `src/ui/App.css`
- `src/ui/App.test.tsx`
- `src/ui/App.tsx`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`

### Change Log

- 2026-02-23: Implemented Story 1.1 foundation scaffold, pinned architecture tooling, validated core quality gates, and moved status to review.
- 2026-02-23: Senior dev review fixes: make dev port deterministic, correct document title, remove unused scaffold files, expand config typecheck coverage, and align story text to actual TS config/pnpm pin.

## Senior Developer Review (AI)

Reviewer: AI (adversarial code review)  
Date: 2026-02-23  
Outcome: Changes requested (fixed) → ready to approve

### Findings and Fixes

- Fixed AC determinism for dev server port by enabling `server.strictPort = true` in `vite.config.ts`.
- Updated `index.html` title to `Emily At Last` for consistent branding.
- Removed unused Vite template files (`src/App.tsx`, `src/App.css`, `src/assets/react.svg`) to avoid confusion and eliminate unsafe `target="_blank"` usage without `rel`.
- Ensured TypeScript config typechecks `vitest.config.ts` by including it in `tsconfig.node.json`.
- Corrected story documentation: strict-mode note now reflects the actual referenced TS configs; pnpm requirement now matches the pinned `packageManager` field.

### Notes

- No `project-context.md` was found in-repo (not blocking for this story).
