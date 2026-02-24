# Story 1.6: PWA Configuration & Offline Support

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,  
I want to install the game on my home screen and play offline,  
so that it feels like a native app and works without internet.

## Acceptance Criteria

1. Given the PWA manifest, when I visit the game in Safari, then I can add it to my home screen with the correct name, icon, and theme colors.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.6]
2. Given vite-plugin-pwa configuration, when assets are loaded, then hashed JS/CSS uses cache-first, images use stale-while-revalidate, HTML uses network-first.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.6]
3. Given no internet connection, when I open the installed PWA, then the app loads from cache and is fully playable offline.  
   [Source: `_bmad-output/planning-artifacts/epic-1-foundation.md` Story 1.6]

## Tasks / Subtasks

- [x] Configure PWA plugin (AC: 2, 3)
  - [x] Update `vite.config.ts` to enable `vite-plugin-pwa` with:
    - [x] `registerType` appropriate for safe updates
    - [x] Workbox runtime caching rules:
      - [x] Cache-first for hashed JS/CSS
      - [x] Stale-while-revalidate for images
      - [x] Network-first for HTML (with offline fallback)
  - [x] Ensure service worker registration is safe on iOS Safari and does not block initial render.
  - [x] Keep config aligned with architecture caching strategy.  
    [Source: `_bmad-output/game-architecture.md` PWA / Caching]

- [x] Add manifest + icons (AC: 1)
  - [x] Provide a PWA manifest with:
    - [x] Name: "Emily At Last"
    - [x] Short name: "Emily At Last"
    - [x] Theme colors aligned to UI direction (warm cream, rose gold accents, navy text)
    - [x] Icons at required sizes
  - [x] Add icons under `public/` and reference them from manifest.

- [x] Add offline-first UX guardrails (AC: 3)
  - [x] Ensure all core UI routes render without network (no hard dependency on external APIs).
  - [x] Provide a small “offline ready” indicator only in dev builds (optional).

- [x] Add smoke validation script or checklist
  - [x] Add a short doc snippet in the story’s dev notes describing how to validate offline on iOS Safari (Airplane mode, installed PWA, reload).

- [x] Quality gates green
  - [x] `pnpm exec tsc --noEmit`
  - [x] `pnpm exec eslint .`
  - [x] `pnpm test`
  - [x] `pnpm run build` (SW build integration)

## Dev Notes

### Developer Context Section

- This is an Emily-only gift app; PWA install and offline support are part of the “it feels like a real app” experience.
- Avoid update traps:
  - HTML should be network-first so new versions land cleanly.
  - Hashed assets can be cache-first.
- Offline must mean “game still runs”, not “blank shell”.

### Technical Requirements

- Library: `vite-plugin-pwa@1.2.0` (already installed).  
  [Source: `_bmad-output/implementation-artifacts/1-1-project-initialization-and-tooling.md`]
- Caching strategies must match AC exactly.

### Architecture Compliance

- PWA caching strategy: cache-first hashed assets; SWR images; network-first HTML.  
  [Source: `_bmad-output/game-architecture.md` PWA / Caching]

### File Structure Requirements

- Likely touched/created files:
  - `vite.config.ts` (PWA plugin config)
  - `public/manifest.webmanifest` (or plugin-generated manifest)
  - `public/icons/*` (PWA icons)
  - `src/main.tsx` (SW registration hook if needed)

### Testing Requirements

- Not all PWA behavior is unit-testable. Minimum expectation is a repeatable manual validation checklist plus build succeeds.

### References

- `_bmad-output/planning-artifacts/epic-1-foundation.md` (Story 1.6 ACs)
- `_bmad-output/game-architecture.md` (PWA / Caching strategy)

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Story generated from sprint backlog ordering (`sprint-status.yaml`)
- ACs sourced from Epic 1 Foundation (Story 1.6)
- PWA strategy sourced from Game Architecture

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Enabled `vite-plugin-pwa` with runtime caching strategies matching ACs (HTML network-first, images SWR, scripts/styles cache-first).
- Added PWA manifest metadata (name/theme colors) and generated minimal icon set under `public/icons/`.
- Added `index.html` links for favicon, apple touch icon, and manifest.
- Added a small dev-only “PWA/offline enabled” indicator in the UI.
- Offline validation checklist (manual):
  - Install: open in iOS Safari, use Add to Home Screen, then launch from home screen.
  - Offline: enable Airplane mode, relaunch the installed app, verify it loads.
  - Update: disable Airplane mode, refresh once, verify no blank/white screen.
- Verified gates: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`, `pnpm run build`.

### File List

- `_bmad-output/implementation-artifacts/1-6-pwa-configuration-and-offline-support.md`
- `vite.config.ts`
- `index.html`
- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-512-maskable.png`
- `src/ui/App.tsx`

### Change Log

- 2026-02-23: Implemented Story 1.6 PWA plugin + manifest/icons + caching strategies; build generates SW; gates green; status moved to review.
