# Phase 20: Help & Iconography - Research

**Researched:** 2026-01-26
**Domain:** React UI help entrypoint + iconography consistency
**Confidence:** MEDIUM

## Summary

This phase is mostly UI plumbing: add a universal Help/Glossary entry point (header button) and standardize the “help / lock / prestige” visual language across tabs. The repo currently has no icon library (only a CSS-drawn lock glyph) and uses a simple custom modal pattern (notably the Nostalgia overlay modal). Settings are stored in localStorage via `persistSettings()` in `src/App.tsx`, and coachmarks are already curated content that can seed Help sections.

Primary implementation recommendation:
- Add a global `HelpModal` controlled from `src/App.tsx`, opened via a header icon button placed next to the tab list, and make the modal full-screen on mobile via CSS media queries.
- Introduce `lucide-react` and define three explicit icon components (Help/Lock/Prestige) to prevent bundle bloat and to unify icon usage across tabs.

**Primary recommendation:** Implement `HelpModal` (responsive full-screen on mobile) + `lucide-react` icons (`CircleQuestionMark`, `Lock`, `RotateCcw`) and replace ad-hoc lock/prestige cues with those icons.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI framework | Existing app stack (`package.json`) |
| typescript | ^5.8.0 | Type safety | Existing app stack (`package.json`) |
| vite | ^6.0.0 | Build/dev | Existing app stack (`package.json`) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | SVG icon components | Standardize help/lock/prestige iconography without custom SVG work |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `lucide-react` | Keep CSS-only / hand-drawn SVGs | Fewer deps, but harder to maintain consistency and add new UI cues |

**Installation:**
```bash
pnpm add lucide-react
```

## Architecture Patterns

### Existing Patterns To Align With
- **Single-root state ownership:** `src/App.tsx` owns most UI state (active tab, settings, modals) and passes props down.
- **Settings persistence:** `persistSettings()` writes to `window.localStorage` under `emily-idle:settings` (`src/App.tsx`).
- **Modal pattern:** Nostalgia uses an overlay + centered card with `role="dialog" aria-modal="true"` and CSS classes `.nostalgia-modal` / `.nostalgia-modal-card` (`src/ui/tabs/NostalgiaTab.tsx`, `src/style.css`).
- **Coachmark content:** Curated onboarding snippets are defined in `src/App.tsx` (`const coachmarks = useMemo(() => [...])`) and displayed in `src/ui/tabs/CollectionTab.tsx`.

### Recommended Project Structure
```
src/
├── ui/
│   ├── help/
│   │   ├── helpContent.ts        # canonical help/glossary sections
│   │   └── HelpModal.tsx         # modal UI (responsive)
│   └── icons/
│       └── coreIcons.tsx         # HelpIcon/LockIcon/PrestigeIcon wrappers
└── App.tsx                       # owns helpOpen + helpLastSectionId
```

### Pattern 1: Global Header Help Button
**What:** Add a Help icon button in the main header next to the tab list, so it’s always visible regardless of active tab.
**When to use:** Always (GUIDE-01: “open Help from any tab”).
**Where:** `src/App.tsx` header area near `role="tablist"` (`src/App.tsx:929+`).

### Pattern 2: Responsive Overlay Modal (Desktop + Mobile Full-Screen)
**What:** Reuse the existing overlay modal approach (Nostalgia) but with responsive CSS: centered card on desktop; full-screen sheet on mobile.
**When to use:** For Help (locked decision: full-screen modal on mobile).
**Implementation notes:**
- Use a single markup structure; switch layout with `@media (max-width: 900px)` to match existing breakpoint usage in `src/style.css`.
- Include a visible top bar with a large close button (tap target).
- Store `lastSectionId` in settings; set it when user selects a section.

### Anti-Patterns to Avoid
- **Generic “Icon by name” wrapper that imports everything:** Lucide explicitly warns that a generic `icons[name]` approach can pull in all icons and bloat bundles.
- **Adding new settings fields in only one file:** `Settings` types are duplicated across tab components (e.g., `src/ui/tabs/SaveTab.tsx`, `src/ui/tabs/NostalgiaTab.tsx`, `src/ui/tabs/CollectionTab.tsx`). If you add a *required* field in App’s `Settings`, you must update every tab’s `Settings` type (or centralize the type) to keep `persistSettings` assignable under `strictFunctionTypes`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon system | One-off SVGs/CSS icons scattered through tabs | `lucide-react` + 3 explicit wrapper components | Keeps iconography consistent; easy future additions |
| Icon registry | `icons[name]` / dynamic icon lookup across the whole library | Explicit imports (`import { Lock } ...`) | Prevents bundling unused icons (Lucide docs caution) |

**Key insight:** The project already accepts small bespoke UI (custom CSS, custom modals), but iconography consistency is easier/safer with a standard icon package and a tiny local wrapper layer.

## Common Pitfalls

### Pitfall 1: Settings Type Divergence
**What goes wrong:** Help state is added to App settings, but tab prop types for `settings`/`persistSettings` aren’t updated, causing TS errors or runtime loss of persisted fields.
**Why it happens:** Tabs locally redeclare `type Settings = { ... }` rather than importing a shared type.
**How to avoid:** Create a single exported `Settings` type (recommended) or update every tab’s local `Settings` type in the same commit.
**Warning signs:** `Type '(nextSettings: AppSettings) => void' is not assignable to type '(nextSettings: TabSettings) => void'`.

### Pitfall 2: Modal Scroll + Mobile Layout Bugs
**What goes wrong:** Full-screen modal doesn’t scroll, background scrolls behind it, or close button is offscreen on iOS.
**Why it happens:** Fixed overlays + nested scrolling need explicit `overflow` handling.
**How to avoid:** Make the modal card a flex column with a scrollable content region; on open, lock page scroll (e.g., `document.body.style.overflow = 'hidden'`) and restore on close.
**Warning signs:** Page scroll moves while modal is open; content can’t be reached on small screens.

### Pitfall 3: Inconsistent Icon Semantics
**What goes wrong:** “Prestige” uses different glyphs or placements across Workshop/Maison/Nostalgia; “Locked” sometimes shows a glyph, sometimes only text.
**Why it happens:** Icons are applied opportunistically instead of via a small shared design language.
**How to avoid:** Define 3 “core cue” icons and usage rules (where they appear and what they mean). Update all existing occurrences in one sweep.

## Code Examples

### Explicit Lucide Icon Imports (Tree-shakeable)
```tsx
// Source: https://lucide.dev/guide/packages/lucide-react
import { Lock, RotateCcw, CircleQuestionMark } from "lucide-react";

export function HelpIcon(props: React.ComponentProps<typeof CircleQuestionMark>) {
  return <CircleQuestionMark aria-hidden="true" focusable={false} {...props} />;
}

export function LockIcon(props: React.ComponentProps<typeof Lock>) {
  return <Lock aria-hidden="true" focusable={false} {...props} />;
}

export function PrestigeIcon(props: React.ComponentProps<typeof RotateCcw>) {
  return <RotateCcw aria-hidden="true" focusable={false} {...props} />;
}
```

### Responsive Overlay Modal Pattern (Match Nostalgia)
```tsx
// Source: src/ui/tabs/NostalgiaTab.tsx (overlay modal pattern)
{helpOpen && (
  <div className="help-modal" role="dialog" aria-modal="true" aria-label="Help">
    <div className="help-modal-card">
      <header className="help-modal-header">
        <h2>Help</h2>
        <button type="button" className="secondary" onClick={() => setHelpOpen(false)}>
          Close
        </button>
      </header>
      <div className="help-modal-content">...</div>
    </div>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only lock glyph (`.purchase-lock-icon`) and text-only prestige cues | Shared icon components from `lucide-react` | Phase 20 | Consistent visual language; easier onboarding comprehension |
| Ad-hoc “modal” surfaces | One reusable Help modal with responsive full-screen mobile layout | Phase 20 | Help is discoverable and accessible everywhere |

## Open Questions

1. **Desktop help interaction style (side panel vs centered modal)**
   - What we know: mobile must be full-screen modal (locked).
   - What’s unclear: whether desktop should be centered overlay, right-side drawer, or inline panel.
   - Recommendation: default to centered overlay modal on desktop (simplest; aligns with Nostalgia modal styling). Treat a right-side drawer as a future enhancement if desired.

## Sources

### Primary (HIGH confidence)
- `src/App.tsx` - tab header placement, settings persistence, coachmarks content
- `src/ui/tabs/NostalgiaTab.tsx` - overlay modal markup (`role="dialog" aria-modal="true"`)
- `src/style.css` - modal/lock icon styles and breakpoint conventions
- Context7: `/websites/lucide_dev_guide_packages` - lucide-react usage and bundle-size cautions

### Secondary (MEDIUM confidence)
- https://unpkg.com/lucide-react/package.json - version 0.563.0
- https://cdn.jsdelivr.net/npm/lucide-react@0.563.0/dist/esm/icons/lock.js - confirms `Lock` icon component
- https://cdn.jsdelivr.net/npm/lucide-react@0.563.0/dist/esm/icons/rotate-ccw.js - confirms `RotateCcw` icon component
- https://cdn.jsdelivr.net/npm/lucide-react@0.563.0/dist/esm/icons/circle-question-mark.js - confirms `CircleQuestionMark` icon component

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from `package.json` + Context7 + CDN package metadata
- Architecture: HIGH - derived from local code (`src/App.tsx`, `src/ui/tabs/*`, `src/style.css`)
- Pitfalls: MEDIUM - inferred from TypeScript `strict` + existing code patterns

**Research date:** 2026-01-26
**Valid until:** 2026-02-25
