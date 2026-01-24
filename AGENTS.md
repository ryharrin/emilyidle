# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-16
**Commit:** 27038c3
**Branch:** ulw-phases-08-10

## OVERVIEW

Emily Idle is a Vite + React + TypeScript idle game. This repo also vendors a full Vite monorepo under `vite/` for reference and upstream work.

## STRUCTURE

```
watch-idle/
├── src/                 # React UI + runtime + game domain
├── tests/               # Vitest unit + Playwright e2e
├── public/              # static assets (catalog images)
├── vite/                # Vite monorepo snapshot
├── watch-images.csv
├── watch-images.json
├── dist/                # generated build output
├── target/              # generated artifacts
├── test-results/        # Playwright output
└── tmp/                 # scratch
```

## WHERE TO LOOK

| Task          | Location                   | Notes                             |
| ------------- | -------------------------- | --------------------------------- |
| App entry     | `src/main.tsx`             | imports styles + renders App      |
| UI root       | `src/App.tsx`              | composes tabs + runtime hook      |
| UI tabs       | `src/ui/tabs/*`            | tab panels + test selectors       |
| Runtime       | `src/game/runtime/*`       | RAF tick + autosave + lifecycle   |
| Game facade   | `src/game/state.ts`        | re-exports model/data/actions     |
| Simulation    | `src/game/sim.ts`          | `step()` tick loop                |
| Persistence   | `src/game/persistence.ts`  | save v2 + localStorage            |
| Catalog data  | `src/game/catalog.ts`      | maps Wikimedia URLs to `/catalog` |
| Styles        | `src/style.css`            | global layout/theme               |
| Unit tests    | `tests/**/*.unit.test.tsx` | Vitest (jsdom)                    |
| E2E tests     | `tests/**/*.spec.ts`       | Playwright, port 5177             |
| Vite monorepo | `vite/`                    | separate tooling + rules          |

## CONVENTIONS

- Prettier: `semi: true`, `printWidth: 100`, `trailingComma: all`, double quotes (`.prettierrc.json`).
- ESLint ignores `dist/**` and `.planning/**` (`eslint.config.js`).
- TypeScript `strict: true`; `src` and `tests` are included (`tsconfig.json`).
- Entry point is `src/main.tsx`; `src/main.ts` is an empty stub.
- Keep `id` and `data-testid` values stable for Playwright/Vitest selectors.
- Keep domain logic pure in `src/game/model`, `src/game/data`, `src/game/selectors`, `src/game/actions`.
- Keep runtime side effects isolated in `src/game/runtime`.

## ANTI-PATTERNS

- Avoid editing generated output in `dist/`, `target/`, `test-results/`, or `tmp/`.
- In the Vite subtree, `vite/packages/plugin-legacy/src/snippets.ts` contains content labeled “DO NOT ALTER THIS CONTENT.”

## UNIQUE STYLES

- Catalog assets are served from `/public/catalog` and mapped from Wikimedia URLs in `src/game/catalog.ts`.

## COMMANDS

```bash
pnpm dev
pnpm run lint
pnpm run typecheck
pnpm run test:unit
pnpm run test:e2e
pnpm run build
pnpm -C vite <script>   # when working under vite/
```

## NOTES

- `watch-images.csv` and `watch-images.json` are present at repo root but unused by src/tests.
- Playwright dev server uses `http://localhost:5177` (`playwright.config.ts`).
