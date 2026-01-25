# Stack Research

**Domain:** Onboarding + UX polish for a React + Vite incremental/idle game
**Researched:** 2026-01-25
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3.1 | UI runtime | Already in use; stable baseline for component-driven onboarding surfaces (coachmarks, dialogs, tooltips). |
| Vite | 6.0.0 | Dev/build tooling | Fast iteration for UI polish; integrates cleanly with Storybook's Vite framework when building onboarding UI in isolation. |
| TypeScript | 5.8.0 | Type-safe UI + state | Keeps onboarding state additions (settings flags, step ids) safe and refactorable. |
| Playwright | 1.49.1 | E2E verification | Best fit for onboarding regressions: "new user" flows, tooltip visibility, and cross-tab tours. |
| Vitest | 1.6.0 | Unit/DOM tests | Cheap checks for coachmark rendering/dismiss persistence (already present in tests). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-tooltip | 1.2.8 | Accessible tooltips (with Portal) | Lightweight hover/focus tooltips on UI affordances (e.g., "Enjoyment" gates, upgrades, prestige buttons). |
| @radix-ui/react-popover | 1.1.15 | Anchored info popovers | Rich, click-to-open help (mini explanations, examples, "why is this locked?") without building custom positioning. |
| @radix-ui/react-dialog | 1.1.15 | Modal onboarding surfaces | First-run "welcome" / "what changed" / "you unlocked X" flows; also reuse for confirmations. |
| @radix-ui/react-toast | 1.2.15 | Non-blocking notifications | Small progress callouts ("Milestone unlocked", "Auto-buy enabled") that should not interrupt play. |
| @radix-ui/react-visually-hidden | 1.2.4 | Screen-reader-only labels | Improves a11y for icon-only buttons in tooltips/popovers/toasts. |

Notes on fit with this repo:
- The app already has a persisted `settings.coachmarksDismissed` map and a `Coachmarks` panel (`src/ui/tabs/CollectionTab.tsx`) driven from `src/App.tsx`; keep that as the primary onboarding framework and add Radix primitives for *contextual* help.
- Radix primitives use a `Portal` part for Tooltip/Popover/Dialog; this is compatible with the existing non-portal UI as long as z-index is defined consistently in `src/style.css`.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Storybook | 10.2.0 | Build onboarding UI in isolation | Use `@storybook/react-vite` and `@storybook/addon-a11y` to iterate on tooltip/callout copy + layout without playing the whole game loop. |
| @storybook/react-vite | 10.2.0 | Storybook + Vite integration | Matches the repo's Vite dev stack; Storybook docs show `framework: { name: '@storybook/react-vite' }`. |
| @storybook/addon-a11y | 10.2.0 | Accessibility checks in stories | Catches common tooltip/dialog mistakes early (labels, focus, contrast). |
| @axe-core/playwright | 4.11.0 | A11y checks in E2E | Add a small helper to run axe on onboarding screens (welcome dialog open, tooltip shown, etc.). |
| axe-core | 4.11.1 | A11y engine | Underpins the Playwright integration; can also be used in dev-only manual checks if needed. |

## Installation

```bash
# Supporting
pnpm add \
  @radix-ui/react-dialog \
  @radix-ui/react-popover \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  @radix-ui/react-visually-hidden

# Dev dependencies
pnpm add -D \
  storybook \
  @storybook/react-vite \
  @storybook/addon-a11y \
  @axe-core/playwright \
  axe-core
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Radix primitives (Tooltip/Popover/Dialog/Toast) | Adopting a full component system (MUI/Chakra/etc.) | Only if you want a full redesign and are willing to migrate existing bespoke CSS/layout to the framework. |
| Storybook | Ladle | Ladle can be lighter, but in this environment the npm registry lookup returned `ladle@0.0.0` (unreliable); Storybook is well-supported and has first-class Vite + a11y addon docs. |
| Existing custom coachmarks + settings persistence | react-joyride (2.9.3) / Shepherd-style tour libs | Use a tour library only if you need complex "spotlight" overlays anchored to arbitrary DOM nodes across tabs; otherwise it adds bundle weight and tends to fight custom layouts. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| New global state management (Redux/MobX/XState) | Onboarding state here is simple and already persisted via `settings` in `src/App.tsx`; a new store adds indirection and migration cost. | Extend existing `Settings` + small local UI state. |
| Tailwind (or other wholesale styling overhaul) | This repo has an established bespoke visual language in `src/style.css`; a utility-first migration is a large, unrelated refactor for "UX polish" milestones. | Add small, targeted CSS classes (tooltips/toasts) that match existing panels/cards. |
| Tour library as the default | Hard to keep stable with frequent UI tweaks; often requires portals/overlays that can break existing z-index/layout assumptions. | Keep the existing `Coachmarks` panel + add contextual Radix Tooltip/Popover where needed. |

## Stack Patterns by Variant

**If you only need micro-explanations (hover/focus):**
- Use `@radix-ui/react-tooltip`.
- Because it stays out of the way and is accessibility-forward.

**If you need "why is this locked?" inline help:**
- Use `@radix-ui/react-popover` for click-to-open cards.
- Because it supports richer content and doesn't require pixel-perfect positioning.

**If you need first-run onboarding / release notes:**
- Use `@radix-ui/react-dialog` for a modal entry step, then keep ongoing guidance in the existing Coachmarks panel.
- Because the repo already uses modal patterns (e.g., Nostalgia modal), and Dialog handles focus trapping.

**If you want non-blocking progress callouts:**
- Use `@radix-ui/react-toast` with a fixed container (define z-index + placement in `src/style.css`).
- Because it preserves game flow while still communicating unlocks.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @radix-ui/react-tooltip@1.2.8 | react@18.3.1 | Uses a `Portal` part; ensure tooltip z-index is above `.panel`/`.card` but below full-screen modals.
| @storybook/react-vite@10.2.0 | vite@6.0.0 | Storybook docs explicitly support the `@storybook/react-vite` framework config.
| @axe-core/playwright@4.11.0 | @playwright/test@1.49.1 | Use for a11y regression coverage on onboarding dialogs/tooltips.

## Sources

- /radix-ui/website (Context7) - Tooltip/Popover/Dialog: Portal parts and usage examples
- /storybookjs/storybook (Context7) - `@storybook/react-vite` framework configuration and `@storybook/addon-a11y` setup
- /dequelabs/axe-core (Context7) - `axe.run()` API and general integration guidance
- npm registry (via `pnpm info`) - Version numbers listed above

---
*Stack research for: onboarding + UX improvements*
*Researched: 2026-01-25*
