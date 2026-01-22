# Phase 12: major-updates-01-21 - Research

**Researched:** 2026-01-22
**Domain:** In-app onboarding (coachmarks/tours), dev tooling, and static deployment (Vite + GitHub Pages)
**Confidence:** MEDIUM

<research_summary>
## Summary

Phase 12 spans several implementation domains (UI gating, settings, crafting, mini-game/prestige design spikes, and GitHub Pages deployment). The remaining work items that most benefit from ecosystem research are (a) onboarding/coachmarks and dev tooling (Plan 12-07), and (b) GitHub Pages deployment via Actions (Plan 12-10). The design-spike tasks (Plans 12-08 and 12-09) are less library-driven, so research focuses on process patterns and common pitfalls rather than a “standard stack”.

Key repo-specific observation: the codebase already contains a settings schema for `coachmarksDismissed`, a rendered coachmarks panel, and dev mode gates via `?dev` plus speed multiplier + debug buttons in the Save tab. That suggests Plan 12-07 may be partially (or fully) implemented already; any further work should prioritize aligning behavior and tests rather than introducing a new onboarding stack.

**Primary recommendation:** Keep onboarding lightweight (current “coachmarks list + per-item dismiss persisted to settings” is a solid baseline). Only adopt a tour/overlay library if you truly need anchored callouts, masking, and focus management.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for onboarding tours and lightweight dev tooling in React apps.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-joyride | 2.9.3 | Guided tours / step sequencing | Mature React-first tour API; popular onboarding default. Source: https://raw.githubusercontent.com/gilbarbara/react-joyride/master/README.md |
| @reactour/tour | 3.8.0 | Tours with mask + popover | Composable “tour + mask + popover” model; good if you want highlight masking. Source: https://raw.githubusercontent.com/elrumordelaluz/reactour/main/README.md |
| driver.js | 1.4.0 | Lightweight product tours / highlights | Small, framework-agnostic option with good docs; can be wrapped in React. Source: https://driverjs.com/docs/installation |
| shepherd.js | 14.5.1 | Full-feature onboarding tours | Long-running ecosystem choice; includes keyboard navigation, focus trapping, minimal default styles. Sources: https://raw.githubusercontent.com/shipshapecode/shepherd/master/README.md and https://shepherdjs.dev/ |
| @floating-ui/react | 0.27.16 | Positioning primitives for tooltips/popovers | Best-of-breed positioning toolkit; use when you want custom coachmarks without a full tour framework. Source: https://floating-ui.com/docs/react |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| leva | 0.10.1 | Dev/debug GUI (React hook-based) | If you want a “parameter panel” UX without building UI. Source: https://raw.githubusercontent.com/pmndrs/leva/main/README.md |
| tweakpane | 4.0.5 | Dev/debug parameter pane (framework-agnostic) | If you want a strong parameter editing toolkit without React coupling; wrap manually. Source: https://raw.githubusercontent.com/cocopon/tweakpane/main/README.md |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Full tour lib (Joyride/Shepherd) | @floating-ui/react + custom state | More control + smaller UX surface area, but you must implement sequencing, focus, and accessibility behaviors yourself. |
| Custom debug panel | Leva/Tweakpane | Faster iteration and nicer UX, but adds dependencies and styling burden. |

**Installation (if you choose to add dependencies):**
```bash
npm install react-joyride
npm install @reactour/tour
npm install driver.js
npm install shepherd.js
npm install @floating-ui/react
npm install leva
npm install tweakpane
```

Note: in this repo, dependency additions should be justified; current Plan 12-07 scope may be satisfied without adding any.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure

For this repo specifically, coachmarks + dev mode are already implemented directly in `src/App.tsx` with settings persisted in localStorage. If you expand functionality, the “expert” direction is to factor the behavior into small, testable modules without destabilizing selectors.

```
src/
├── App.tsx                 # UI orchestration + feature wiring
├── game/
│   ├── state.ts            # Domain state + pure functions
│   └── persistence.ts      # Save/load for game state
└── ui/
    ├── coachmarks.ts       # (optional) coachmark definitions + helpers
    └── devtools.ts         # (optional) dev mode parsing + guard helpers
```

### Pattern 1: Feature flag gating for dev-only behavior

**What:** Gate dev-only UI/actions behind a runtime flag (URL param) and, ideally, a build-time guard.

**When to use:** Anything that mutates user state in a way that could ruin saves (grant currency, unlock milestones, reset save).

**Example:**
```ts
// Source: Vite env variables guide
// https://vite.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
  // code inside here will be tree-shaken in production builds
  console.log("Dev mode");
}
```

In this repo today, runtime enabling is already done via URL parsing:
- `const params = new URLSearchParams(window.location.search);`
- `const enabled = params.has("dev");`

### Pattern 2: Persistent dismissals for onboarding content

**What:** Coachmarks should be dismissible, and dismissals should persist (per-id) so users do not repeatedly see the same guidance.

**When to use:** Any onboarding that is “nice-to-have” and should not interrupt the core loop.

**Implementation tip:** Store a map of `{[coachmarkId]: boolean}` in the existing settings blob (as already done).

### Pattern 3: Accessibility-first overlay semantics

If you add anchored coachmarks/tooltips:

- Tooltips should not receive focus; trigger retains focus; Escape dismisses. Source: WAI-ARIA APG tooltip pattern https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- If your coachmark contains focusable controls or behaves like an interruptive overlay, it is closer to a dialog (focus trap, Escape closes). Source: WAI-ARIA APG modal dialog pattern https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

### Anti-Patterns to Avoid
- **Shipping “dev mode” controls in production builds unintentionally:** Prefer `import.meta.env.DEV` gates for destructive tools.
- **Hand-rolling popover positioning:** Edge cases (viewport collision, scrolling, zoom) are non-trivial; use `@floating-ui/react` if you need anchored UI.
- **Onboarding that blocks gameplay:** In idle/incremental loops, interruptions hurt; use optional, dismissible guidance rather than forced tours.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Anchored coachmarks / popovers | DIY DOM measurements + scroll listeners | `@floating-ui/react` | Handles positioning, flipping, auto-updates on scroll/resize, and provides testing guidance. Source: https://floating-ui.com/docs/react |
| Full onboarding tour (step sequencing + highlight + mask + keyboard) | Custom overlay framework | `react-joyride`, `@reactour/tour`, `driver.js`, or `shepherd.js` | These packages have solved lots of edge cases (scrolling to targets, overlay/mask, step navigation). Sources above. |
| GitHub Pages deployment plumbing | Custom scripts for artifact upload + deployment | GitHub Pages Actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`) | GitHub documents required permissions and job structure. Source: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages |

**Key insight:** For Phase 12, the risk is not that “we can’t implement it,” it’s that we implement the 80% happy path and miss accessibility/positioning/deploy edge cases that the ecosystem already solved.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Coachmarks become noise
**What goes wrong:** Users ignore repetitive callouts; it becomes UI clutter.
**Why it happens:** Coachmarks are shown unconditionally and don’t persist dismissal.
**How to avoid:** Make coachmarks dismissible and persist per-id state (already implemented); consider showing only on “fresh save” moments.
**Warning signs:** Players repeatedly dismiss the same cards; tests require large fixture data to hide them.

### Pitfall 2: "Tooltip" semantics for something that is actually a dialog
**What goes wrong:** Keyboard/screen reader behavior is incorrect; focus can get lost.
**Why it happens:** Coachmarks often contain buttons/links and behave like an overlay.
**How to avoid:** If it contains interactive controls, treat it as a dialog/popover with proper focus management, not a tooltip. Sources: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ and https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
**Warning signs:** Tab escapes the overlay, or Escape doesn’t close, or screen readers don’t announce context.

### Pitfall 3: Dev tooling corrupts saves
**What goes wrong:** Dev controls permanently mutate localStorage or produce impossible state.
**Why it happens:** Debug actions bypass domain invariants.
**How to avoid:** Route mutations through existing domain functions where feasible; keep “reset save” explicit; consider disabling dev tools in production builds via `import.meta.env.DEV`.
**Warning signs:** Tests start depending on dev-mode-only states; bug reports cite "my save broke" after experimenting.

### Pitfall 4: GitHub Pages base path and asset URLs drift
**What goes wrong:** Site works locally but assets 404 on Pages due to `/repo/` base.
**Why it happens:** Missing or incorrect Vite `base` config; dynamic URL concatenation not using `import.meta.env.BASE_URL`.
**How to avoid:** Set `base` appropriately and use `import.meta.env.BASE_URL` for dynamic concatenation. Source: Vite build docs https://vite.dev/guide/build.html#public-base-path
**Warning signs:** 404s for JS chunks, images, CSS on deployed site.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Vite base path and runtime BASE_URL
```ts
// Source: Vite build docs (Public Base Path)
// https://vite.dev/guide/build.html#public-base-path
// When dynamically concatenating URLs at runtime:
const base = import.meta.env.BASE_URL;
const url = `${base}catalog/some-image.jpg`;
```

### Vite dev-only gates
```ts
// Source: Vite env variables guide
// https://vite.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
  console.log("Dev mode");
}
```

### Floating UI: basic positioning
```tsx
// Source: Floating UI React docs
// https://floating-ui.com/docs/react
function App() {
  const { refs, floatingStyles } = useFloating();

  return (
    <>
      <button ref={refs.setReference}>Button</button>
      <div ref={refs.setFloating} style={floatingStyles}>
        Tooltip
      </div>
    </>
  );
}
```

### GitHub Pages custom workflow (core actions)
```yaml
# Source: GitHub Docs (custom workflows for Pages)
# https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- name: Setup Pages
  uses: actions/configure-pages@v5
- name: Upload GitHub Pages artifact
  uses: actions/upload-pages-artifact@v4
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Popper.js as default positioning primitive | Floating UI as a modern primitive | Ongoing | If you build custom popovers/coachmarks, `@floating-ui/react` is the go-to primitive. |
| Manual Pages deploy scripts | GitHub Pages Actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`) | Current GitHub Pages guidance | Prefer the official workflow model for reliability and least surprise. |

**New tools/patterns to consider:**
- **`import.meta.env.DEV` (Vite):** simple, tree-shakeable dev-only gating.

**Deprecated/outdated:**
- **Relying on `window.location.pathname` hacks for Pages:** prefer Vite `base` and `import.meta.env.BASE_URL`.
</sota_updates>

<open_questions>
## Open Questions

1. **Should coachmarks be anchored to UI sections or remain in a side panel?**
   - What we know: Side-panel coachmarks are already implemented and tested.
   - What's unclear: If “inline anchored coachmarks” are required for UX, that changes scope and may justify `@floating-ui/react` or a full tour library.
   - Recommendation: During planning/execution, decide whether Plan 12-07 is “alignment + polish” (keep current) or “real anchored tours” (add deps).

2. **Should dev mode tools exist in production builds (GitHub Pages) behind `?dev`?**
   - What we know: Runtime gating via `?dev` exists.
   - What's unclear: Whether players could discover and use destructive dev tools in prod.
   - Recommendation: Prefer `import.meta.env.DEV` gating for destructive actions, or remove/disable them in production builds.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- Vite: Public base path + `import.meta.env.BASE_URL` https://vite.dev/guide/build.html#public-base-path
- Vite: Env variables + `import.meta.env.DEV` https://vite.dev/guide/env-and-mode.html
- Vite: GitHub Pages deploy guidance (including sample workflow) https://vite.dev/guide/static-deploy.html#github-pages
- GitHub Pages: Custom workflow actions + required permissions https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- WAI-ARIA APG Tooltip pattern https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- WAI-ARIA APG Modal dialog pattern https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

### Secondary (MEDIUM confidence)
- Floating UI React docs https://floating-ui.com/docs/react
- react-joyride README https://raw.githubusercontent.com/gilbarbara/react-joyride/master/README.md
- reactour README https://raw.githubusercontent.com/elrumordelaluz/reactour/main/README.md
- driver.js docs https://driverjs.com/docs/installation
- shepherd README https://raw.githubusercontent.com/shipshapecode/shepherd/master/README.md
- shepherd site https://shepherdjs.dev/

### Tertiary (LOW confidence - needs validation)
- None (library choices may still need validation against bundle size and desired UX once requirements are finalized).
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: React + Vite (static deploy), localStorage-backed settings, onboarding callouts
- Ecosystem: Joyride, Reactour, Driver.js, Shepherd, Floating UI; Leva/Tweakpane for dev GUIs
- Patterns: dev gating, persistent dismissals, accessible tooltip/dialog semantics
- Pitfalls: a11y, save corruption from dev tools, GH Pages base-path drift

**Confidence breakdown:**
- Standard stack: MEDIUM - versions verified via npm registry, but adoption depends on whether we truly need anchored tours
- Architecture: HIGH - Vite/GitHub guidance is explicit and current
- Pitfalls: HIGH for a11y and Pages base-path issues; MEDIUM for onboarding UX pitfalls (product-dependent)
- Code examples: HIGH - all taken from official docs

**Research date:** 2026-01-22
**Valid until:** 2026-02-21 (30 days; ecosystem mostly stable)
</metadata>

---

*Phase: 12-major-updates-01-21*
*Research completed: 2026-01-22*
*Ready for planning: yes*
