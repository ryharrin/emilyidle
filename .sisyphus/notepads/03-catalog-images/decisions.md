## 2026-01-16 Task: catalog tests

- Added stable `data-testid` hooks to catalog search, brand, grid, results count, cards, and sources list in `src/App.tsx` for deterministic unit and e2e assertions.
- Unit tests render `App` directly with Testing Library and target catalog filters via regex-matched testids.
