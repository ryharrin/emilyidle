## 2026-01-27T05:13:32Z Task: 21-06

- Stats tab visibility is gated via `getAchievementProgressRatio(state, "first-drawer") >= 0.8` (needs >=10/12 total items).
- Playwright can expand `<details>` via `getByTestId(...).locator("summary").click()`.
- Help deep-link assertions: `data-testid=help-active-section` renders the active section title.

## 2026-01-27T05:19:43Z Task: 22-01

- Unlock progress details use a shared `UnlockProgressDetail` shape (label/current/threshold/ratio).
- Progress helpers clamp `current` and `ratio` for display; current values still come from authoritative milestone/achievement requirements.

## 2026-01-27T05:29:27Z Task: 22-02

- New UI primitives live in `src/ui/components/` and avoid importing from `src/App.tsx`.
- `NextUnlockPanel` uses stable test ids: `next-unlocks` and `next-unlock-{id}`.
- Unit tests for not-yet-existing modules can avoid TS resolution errors via `import(/* @vite-ignore */ "../path/" + "Module")`.

## 2026-01-27T05:41:30Z Task: 22-03

- Centralize one-shot navigation in `src/App.tsx` (`navigateTo`) and plumb as `onNavigate` into tabs.
- For cross-tab scroll targets, a double `requestAnimationFrame` before `scrollIntoView` avoids scrolling before the tab content mounts.

## 2026-01-27T05:49:09Z Task: 22-04

- Preserve existing empty-state `data-testid` values by wrapping new components rather than moving ids onto nested buttons.
- Catalog empty-state CTAs can be asserted by role/name (e.g. "Go to Vault") while keeping wrapper ids stable.

## 2026-01-27T08:26:00Z Task: 23-01

- Prestige confirmation copy stays consistent by centralizing Gain/Keep/Lose strings in `src/ui/prestigeSummary.ts` and rendering via a presentational `src/ui/components/PrestigeSummary.tsx`.
- Avoid aria-label on generic wrappers without a role; lint may flag unsupported ARIA usage.

## 2026-01-27T08:33:00Z Task: 23-02

- For prestige confirmations, pass `{ prestigeTier: "workshop" | "maison" | "nostalgia" }` metadata through `onPurchase` so App-level UI can react without heuristics.
- Keep confirm/cancel pattern intact: cancel only disarms/closes; confirm triggers state reset.

## 2026-01-27T08:48:00Z Task: 23-03

- Detect post-prestige onboarding at the App purchase boundary via `detectPrestigeEvent(prev, next, nowMs, override)`.
- For Playwright tests that compare live stats (`#currency`, `#enjoyment`), stub `window.requestAnimationFrame` to freeze the sim loop.
- If a modal can contain variable-height content (e.g. embedded summaries), ensure the modal card has `max-height` + `overflow: auto` so confirm/cancel stays reachable.
