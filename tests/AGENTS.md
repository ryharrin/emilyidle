# AGENTS

## Overview

Vitest unit tests and Playwright e2e coverage for Emily Idle.

## Where to look

- `*.unit.test.tsx`: Vitest unit tests (jsdom).
- `*.spec.ts`: Playwright e2e tests.
- `vitest.setup.ts`: shared test setup.
- `playwright.config.ts`: e2e server/port configuration (root).

## Conventions

- Unit tests use Testing Library + `user-event`.
- E2E tests seed localStorage via `page.addInitScript`.
- Base URL and dev server port are `5177`.
- Keep selectors stable (`id`, `data-testid`, roles).
- Runtime side effects are gated in tests via `isTestEnvironment` to avoid flakiness.

## Anti-patterns

- Don’t change ports without updating `playwright.config.ts`.
- Avoid brittle selectors; prefer test IDs and roles.
