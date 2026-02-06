# AGENTS

Emily Idle (`watch-idle`) is a Vite + React + TypeScript idle/incremental game.
Primary code lives in `src/` with tests in `tests/`. A vendored Vite monorepo snapshot lives in
`vite/` for reference (avoid editing unless you are intentionally working on the snapshot).

If you are working inside a subtree, also read:

- `src/AGENTS.md`
- `src/game/AGENTS.md`
- `tests/AGENTS.md`

## Build / Lint / Test Commands (pnpm)

```bash
pnpm install
pnpm dev                 # vite dev server (host 127.0.0.1, port 5177)
pnpm build
pnpm preview

pnpm format              # prettier . --write
pnpm format:check        # prettier . --check
pnpm lint                # eslint .
pnpm typecheck           # tsc --noEmit

pnpm test:unit           # vitest run (jsdom)
pnpm test:e2e            # playwright test (uses port 5177)
```

### Run a single test

Vitest (unit):

```bash
pnpm test:unit -- tests/localstorage-schema.unit.test.tsx
pnpm test:unit -- -t "localStorage key string contracts"

# watch mode (when iterating)
pnpm exec vitest --config vitest.config.ts tests/localstorage-schema.unit.test.tsx
```

Playwright (e2e):

```bash
pnpm test:e2e -- tests/selectors-contract.spec.ts
pnpm test:e2e -- -g "selector contract"
pnpm test:e2e -- --headed
```

Notes:

- The dev server port is part of the test contract: `5177` (`playwright.config.ts`).
- Playwright starts (or reuses) `pnpm dev` via `webServer` and `reuseExistingServer: true`.

## Codebase Map (where things live)

- App entry: `src/main.tsx` (bootstraps React, imports `src/style.css`)
- UI root: `src/App.tsx` (tabs + modals + runtime wiring)
- Tab panels: `src/ui/tabs/*` (one component per tab)
- UI components: `src/ui/components/*`
- Help system: `src/ui/help/*` (persists help state)
- Domain facade: `src/game/state.ts` (re-exports model/data/selectors/actions)
- Pure domain logic:
  - `src/game/model/*` (types + state constructors)
  - `src/game/data/*` (static definitions)
  - `src/game/selectors/*` (derived computations)
  - `src/game/actions/*` (state transitions)
- Runtime side effects: `src/game/runtime/*` (RAF tick + autosave + lifecycle)
- Simulation tick: `src/game/sim.ts` (`SIM_TICK_MS = 100`, `step()` advances state)
- Persistence: `src/game/persistence.ts` (save v3, legacy v1/v2 acceptance + legacy key support)
- Catalog + assets: `src/game/catalog.ts` + `public/catalog/`
- Unit tests: `tests/**/*.unit.test.{ts,tsx}` (Vitest + Testing Library)
- E2E tests: `tests/**/*.spec.{ts,tsx}` (Playwright)

## How the game runs (high-level)

- `useGameRuntime` (`src/game/runtime/useGameRuntime.ts`) owns the main loop:
  - Runs `requestAnimationFrame`, accumulates time, steps the sim in `SIM_TICK_MS` chunks.
  - Clamps frame delta to avoid giant jumps; marks save dirty if any steps happened.
  - Autosaves every 2s when dirty; also saves on `visibilitychange:hidden` and `pagehide`.
  - Skips the RAF loop in tests via `isTestEnvironment()`.
- `step()` (`src/game/sim.ts`) is pure: it clamps dt, applies income/enjoyment accrual, events,
  passive career progress, discovery, and achievements.

## Domain invariants (do not break)

- Money values are in cents (numbers). Prefer naming like `currencyCents`, `*_CENTS`.
- Rates are cents/sec; convert via `rate * dtMs / 1000` (see `src/game/sim.ts`).
- Selectors/actions must stay pure (no `Date.now()`, no browser APIs). Pass `nowMs` in.
- State transitions are functional and often return the same reference if nothing changed.

Interactions (example of state-transition style):

- Cooldown base: `INTERACTION_BASE_COOLDOWN_MS = 20_000` (`src/game/actions/interactions.ts`).
- Guards: if not available, return `state` unchanged.

## Persistence contracts (save + localStorage)

- Save format is JSON `version: 3` (`src/game/persistence.ts`). Legacy `version: 1` and
  `version: 2` are still accepted and sanitized.
- Keys:
  - `emily-idle:save` (current) and `watch-idle:save` (legacy)
  - Also: `emily-idle:settings`, `emily-idle:audio`, `emily-idle:navigation`, `emily-idle:help`,
    `emily-idle:career-map-viewport:v1`, `emily-idle:career-upgrades-viewport:v1`
- If you add/change keys or schemas, update the guardrail tests:
  - `tests/localstorage-keys.unit.test.ts`
  - `tests/localstorage-schema.unit.test.tsx`
  - Any Playwright seeding in `tests/*.spec.ts`

## Code style guidelines

Formatting (enforced by Prettier):

- `.prettierrc.json`: semicolons, double quotes, `printWidth: 100`, `trailingComma: all`
- Run `pnpm format` instead of hand-formatting.

TypeScript:

- `strict: true` (`tsconfig.json`). Avoid `any`; prefer `unknown` and narrow with guards.
- Use `import type { ... }` for type-only imports.
- Repo is ESM (`"type": "module"`); do not use `require`. Use `node:` imports in tests/scripts.

Imports:

- Group imports with blank lines: external -> internal -> types (or types inline via `import type`).
- Prefer importing domain APIs from `src/game/state.ts` in UI (keeps layering clean).

Naming:

- Types: `PascalCase`, values/functions: `camelCase`, constants: `UPPER_SNAKE_CASE`.
- Time values: suffix `_MS`; cents: suffix `Cents` / `_CENTS`.

Error handling:

- For parsing (localStorage/save/import), prefer discriminated unions (`{ ok: true } | { ok: false }`)
  and explicit validation (see `src/game/persistence.ts`).
- Do not add empty `catch {}` blocks. If you catch, return a safe value and/or surface a useful
  message.

UI/testing stability:

- Keep `id` and `data-testid` values stable; Playwright/Vitest relies on them.
- Prefer role-based queries in Playwright when possible; use `data-testid` for contract anchors.

Modularity:

- Keep new/changed code modular and small. If a file is already large (e.g. `src/App.tsx`), prefer
  extracting helpers/components instead of adding more.

## Tests and how to write them

- Vitest uses jsdom + Testing Library (`tests/vitest.setup.ts` adds DOM shims like `scrollIntoView`).
- Playwright tests often seed localStorage with `page.addInitScript` and a save payload. Follow
  existing patterns in `tests/selectors-contract.spec.ts`.
- Deployment base path `/emilyidle/` is a real constraint; there is an e2e guard for catalog images:
  `tests/catalog-image-rendering.spec.ts`.

## Repo hygiene / anti-patterns

- Do not edit generated output: `dist/`, `target/`, `test-results/`, `tmp/`.
- `vite/` is a snapshot; run scripts there with `pnpm -C vite <script>`.
  - Do not modify `vite/packages/plugin-legacy/src/snippets.ts` (it is labeled DO NOT ALTER).

## Cursor / Copilot rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules`).
- No Copilot instructions found (`.github/copilot-instructions.md`).
