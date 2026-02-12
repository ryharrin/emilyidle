# Testing Reliability Policy

This project uses Vitest for unit tests and Playwright for end-to-end tests.
Phase 54 closes with a strict reliability policy for local and CI execution.

## Canonical Order (Local and CI)

Run verification in this exact serial order:

1. `pnpm test:unit`
2. `pnpm test:e2e`
3. `pnpm typecheck`

Do not run unit and e2e suites concurrently on the same runner/workspace.

## Stable Commands

- Full stable gate (serial policy): `pnpm test:ci:stable`
- Stable e2e project matrix only: `pnpm test:e2e:stable-projects`
- Full unit suite: `pnpm test:unit`
- Full e2e matrix: `pnpm test:e2e`
- E2E desktop project only: `pnpm test:e2e:chromium`
- E2E mobile WebKit project only: `pnpm test:e2e:webkit-mobile`

## Scoped Suite Examples

- Unit single file: `pnpm test:unit -- tests/localstorage-schema.unit.test.tsx`
- Unit by test name: `pnpm test:unit -- -t "localStorage key string contracts"`
- E2E single spec on desktop: `pnpm test:e2e:chromium -- tests/career-landing.spec.ts`
- E2E grep on mobile project: `pnpm test:e2e:webkit-mobile -- -g "selector contract"`

## CI Runner Guidance

- Prefer one job/runner for the serial chain (`unit -> e2e -> typecheck`).
- If CI must parallelize, isolate jobs in separate workspaces/runners so Playwright server
  lifecycle and port usage do not contend.
