# Phase 24: UI Polish Pass - Research

**Researched:** 2026-01-26
**Domain:** React UI polish (global CSS system, accessibility, responsive layout, micro-interactions)
**Confidence:** HIGH

## Summary

This phase is primarily a CSS + layout consistency pass, not a new UI framework effort. The repo already has a shared styling vocabulary in `src/style.css` (`.panel`, `.card`, `.card-stack`, `.panel-header`, `.results-count`, global `button` styling, light-theme overrides via `[data-theme="light"]`) that most tabs use, plus a few feature-specific styles (catalog/nostalgia/workshop/maison).

The biggest planning risks are (1) breaking stable selectors used by tests (`id` and `data-testid` in `src/App.tsx` and `src/ui/tabs/*.tsx`), and (2) introducing inconsistent interactions/accessibility: global buttons and primary nav tabs have hover transitions but no global `:focus-visible` styling and no `prefers-reduced-motion` handling (only `.catalog-tab` has `:focus-visible`). Responsiveness is also uneven: only a single breakpoint (`@media (max-width: 900px)`) exists, and some layout helpers used in tabs (notably `.stats-grid`) are missing in CSS.

**Primary recommendation:** Standardize interaction + layout primitives in `src/style.css` (focus rings, reduced-motion, pressed states, missing layout classes) and then apply only low-risk class-level tweaks per tab, keeping all `id`/`data-testid` stable.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.x | UI rendering | Existing app framework |
| Vite | 6.x | Build/dev server | Existing tooling |
| Global CSS (`src/style.css`) | n/a | Design system + layout primitives | Current styling approach used across tabs |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| Playwright | 1.49.x | E2E UI verification | Verify selectors unchanged + responsive layout sanity |
| Vitest + Testing Library | Vitest 1.6.x | Unit/UI tests | Catch regressions from markup/class changes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Global CSS primitives | Tailwind / CSS-in-JS / component library | Not aligned with repo; high churn and higher selector-regression risk |

**Installation:**
```bash
# No new packages required for Phase 24.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── style.css            # global tokens + component primitives
├── App.tsx              # top-level nav (tablist) + tab composition
└── ui/
    └── tabs/            # per-tab panels; keep ids/data-testid stable
```

### Pattern 1: Shared Primitives + Tab-Specific Variants
**What:** Tabs compose shared primitives (`.panel`, `.card`, `.card-stack`, `.panel-header`) and layer scoped classes for feature identity (e.g. `catalog-*`, `nostalgia-*`, `workshop-*`).
**When to use:** Always. Phase 24 should improve consistency by strengthening primitives (not by inventing new one-off classes).
**Example:**
```tsx
// Source: src/ui/tabs/CatalogTab.tsx
// Panel base + catalog identity.
<section className="panel catalog-panel" id="catalog" role="tabpanel" aria-labelledby="catalog-tab" hidden={!isActive}>
  <header className="panel-header">
    <h3 id="catalog-collection-title">Archive shelf</h3>
    <div className="results-count" data-testid="catalog-results-count">...</div>
  </header>
  ...
</section>
```

### Pattern 2: Accessible Tabs With Roving Tabindex
**What:** `App.tsx` implements an ARIA tablist with roving `tabIndex` and Arrow/Home/End navigation; activation on Enter/Space.
**When to use:** Preserve as-is; only add visuals (focus rings) that make the existing keyboard model visible.
**Example:**
```tsx
// Source: src/App.tsx
<button
  className="page-nav-link"
  role="tab"
  id={`${tab.id}-tab`}
  aria-selected={selected}
  aria-controls={tab.id}
  tabIndex={focusable ? 0 : -1}
  onKeyDown={handleTabKeyDown}
>
  {tab.label}
</button>
```

### Anti-Patterns to Avoid
- **Changing stable selectors:** Do not rename any `id`/`data-testid` in `src/App.tsx` or `src/ui/tabs/*.tsx`.
- **One-off UI fixes in TSX:** Prefer improving shared CSS primitives over adding per-component inline styles.
- **Motion without opt-out:** Avoid adding animations/transitions without `prefers-reduced-motion` support.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard focus indication | Custom JS focus tracking | CSS `:focus-visible` styles | Keeps behavior consistent with browser heuristics; matches MDN guidance |
| Motion accessibility | Per-component flags | `@media (prefers-reduced-motion: reduce)` | Centralized opt-out; easy to verify |
| Responsive layout tweaks | Multiple bespoke breakpoints per tab | Shared responsive helpers (`.panel-header`, `.results-count`, form fields) | Prevents divergence and layout drift |

**Key insight:** The existing UI already has a “design system” (primitives + variants). Phase 24 should harden that system rather than accumulating more ad-hoc styling.

## Common Pitfalls

### Pitfall 1: Breaking tests by touching selectors
**What goes wrong:** Playwright/Vitest assertions fail because `id`/`data-testid` values changed.
**Why it happens:** UI polish often includes renaming/reshaping markup.
**How to avoid:** Treat `id`/`data-testid` as API; restrict changes to CSS and classNames only.
**Warning signs:** Large TSX diffs in `src/App.tsx` or `src/ui/tabs/*.tsx` that include attribute edits.

### Pitfall 2: Focus becomes invisible (keyboard a11y regression)
**What goes wrong:** Keyboard users can navigate tabs but cannot see where focus is.
**Why it happens:** Current CSS has hover transitions but almost no global `:focus-visible` styling (only `.catalog-tab`).
**How to avoid:** Add consistent focus rings for `button`, `.page-nav-link`, anchors, and form controls.
**Warning signs:** Tabbing through `.page-nav-link` shows no visual indicator.

### Pitfall 3: Motion sickness / discomfort
**What goes wrong:** Hover/focus transitions and transform-based effects trigger discomfort.
**Why it happens:** No `prefers-reduced-motion` rules exist.
**How to avoid:** Disable/shorten non-essential transforms/shadows/transitions under reduced motion.
**Warning signs:** Motion remains when OS "Reduce motion" is enabled.

### Pitfall 4: Responsive layout drift
**What goes wrong:** Badge + header wrapping looks broken on small screens.
**Why it happens:** Minimal responsive rules (one breakpoint only) and flex layouts not tuned for narrow widths.
**How to avoid:** Add shared small-screen adjustments for `.panel-header`, `.results-count`, and form fields.
**Warning signs:** `.panel-header` wraps into 3+ lines; badges break mid-token.

### Pitfall 5: Theme mismatch (dark vs light)
**What goes wrong:** New colors/shadows work in one theme but not the other.
**Why it happens:** Styles often added only in default theme.
**How to avoid:** Any new token or effect must be specified for both default and `[data-theme="light"]`.
**Warning signs:** Focus rings too dim/too bright in one theme.

## Code Examples

### Global Focus Ring (Apply to Buttons + Links + Inputs)
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible */

/* Recommended: centralize colors via CSS variables (names are illustrative). */
:root {
  --focus-ring: rgba(232, 198, 147, 0.65);
}

[data-theme="light"] {
  --focus-ring: rgba(154, 106, 47, 0.55);
}

button:focus-visible,
.page-nav-link:focus-visible,
.source-links a:focus-visible,
.filter-field input:focus-visible,
.filter-field select:focus-visible,
.controls select:focus-visible,
#import-save-text:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

### Reduced Motion Opt-Out
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion */

@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Fill In Missing Layout Helper (`.stats-grid`)
```css
/* Source: src/ui/tabs/StatsTab.tsx (uses dl.stats-grid) */

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin: 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Styling focus with `:focus` only (or removing focus) | Use `:focus-visible` for modality-aware focus rings | Modern browsers (widely available) | Keeps keyboard nav accessible without always showing focus rings |
| Ignoring motion preferences | Use `prefers-reduced-motion` | Widely available since 2020 | Avoids vestibular triggers from non-essential animations |

**Deprecated/outdated:**
- Removing outlines without replacement: breaks keyboard accessibility.

## Open Questions

1. **What exactly are POLISH-01..04 requirements?**
   - What we know: Phase success criteria mention hierarchy, card/layout consistency, color/contrast, micro-interactions.
   - What's unclear: Whether specific UI surfaces (e.g. Catalog filters, Workshop reset, Save import/export) are explicitly targeted.
   - Recommendation: Planner should map each POLISH-* item to specific screens and selectors before task breakdown.

2. **Font intent: Inter-only vs multi-font stack**
   - What we know: `index.html` loads Inter from Google Fonts; `src/style.css` lists "Sora" and "Space Grotesk" first.
   - What's unclear: Whether those fonts are expected (but not loaded) or should be removed.
   - Recommendation: Decide whether to load those fonts (adds network weight) or simplify the stack to Inter to avoid inconsistent typography across machines.

## Sources

### Primary (HIGH confidence)
- `src/style.css` - global primitives, theme overrides, transitions
- `src/App.tsx` - ARIA tablist + keyboard navigation implementation
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified in `package.json`
- Architecture: HIGH - verified via `src/App.tsx`, `src/ui/tabs/*.tsx`, `src/style.css`
- Pitfalls: HIGH - based on repo patterns + MDN accessibility guidance

**Research date:** 2026-01-26
**Valid until:** 2026-02-25
