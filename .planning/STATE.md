# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07 closeout sync)

**Core value:** A satisfying watch-collecting idle loop that saves reliably and stays pleasant to play and maintain.
**Current focus:** Milestone v5.0 planning is now defined from unfinished-note inputs; next execution should route into Phase 57 plan authoring and implementation.

## Current Position

Phase: 56 complete; next planned phase is 57 (v5.0 start)
Plan: v5.0 planning artifacts authored (`v5.0-REQUIREMENTS.md`, `v5.0-ROADMAP.md`)
Status: Phase 54/55/56 execution packages are complete; milestone v5.0 is now staged from unfinished work in `NOTES-02-07-26.yaml`.
Last activity: 2026-02-10 — Created milestone v5.0 planning package and wired living planning docs.
Progress: Phase 50 complete (5/5 executed) [██████████], Phase 51 complete (5/5 executed) [██████████], Phase 52 complete (3/3) [██████████], Phase 53 complete (6/6) [██████████], Phase 54 complete (7/7) [██████████], Phase 55 complete (8/8) [██████████], Phase 56 complete (9/9) [██████████]
Next Phase: Route `/prompts:plan 57` to begin milestone v5.0 execution sequencing.

## Accumulated Context

### v4.0 Focus

- Deepen watch interactions (winding + set time/date + strap change)
- Make per-watch enjoyment/cash rates visible for better decisions
- Expand catalog variety across low/mid/lux tiers with complete assets
- Improve mobile navigation, touch targets, and UI readability

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Remove Collection Book/Archive Shelf and fix interaction ownership checks | 2026-02-02 | c40c2aa | [001-remove-archive-shelf](./quick/001-remove-archive-shelf/) |

### Carried Gaps / Tech Debt

- Catalog image contract now validates the shared `BASE_URL` constant so `LOCAL_CATALOG_ROOT` stays aligned with `import.meta.env.BASE_URL` when `pnpm test:unit -- tests/mobile-responsive.unit.test.tsx` runs.

### Decisions Made

| Phase | Decision | Rationale |
| ----- | -------- | --------- |
| 42 | Keep telemetry math inside `useWindingRun` and feed CSS via variables | Prevents recomputing identical math in the modal and keeps animation state centralized |
| 42 | Announce the legend with visually hidden copy and add a hidden focus sentinel | Enriching the legend shifted tab order, so the sentinel keeps focus trapped without exposing extra text nodes |
| 42 | Normalize hook telemetry output so CSS variables and tests consume the same progress/tension/velocity numbers | Keeps animation math centralized and avoids divergence between UI and tests |
| 42 | Target the stop control via `data-testid`/aria label instead of role-based queries | Prevents selector collisions with the track (also a button) when locking down automation |
| 43 | Widened the Good window while keeping Perfect reserved for the tightest hits to reduce starter misses | Broadens the forgiving sweet spot without diluting the prestige of perfect timing |
| 43 | Exported the quartz outcome helpers so regression tests consume the same deterministic math as the modal | Prevents divergent thresholds between UI and tests and lets future plans reuse the helpers |
| 44 | Align outcome visibility + reward feedback across winding, quartz, and automatic mini-games | Ensures every interaction mini-game emits clear tiered messaging tied to precision while keeping reduced-motion/touch contracts intact |
| 44 | Centralized helper functions now own live-region + reward copy for each modal | Keeps UI and regression tests synchronized with a single source of truth |
| 44 | Exposed `data-live-state` / `data-outcome-state` attributes across the modals | Lets automation/tests detect running vs resolved states without relying on copy text |
| 44 | Added tier badges, glows, and multiplier-aware reward copy for Miss/Good/Perfect | Keeps styling, messaging, and econometric math aligned across UI and regressions |
| 45 | Rendered per-watch enjoyment/cash summaries with `formatRateFromCentsPerSec` | Keeps UI strings deterministic for the new regression test while preserving the career cash label semantics |
| 45 | Kept per-watch sort/filter toggles in-memory instead of persisting them | Avoids touching guardrail localStorage keys so existing schema contracts stay valid |
| 45 | Keep cash rows tied to the therapist career salary and document the explanation string for UI/test consumers | Prevents inventing per-watch cash allocations while the view model honors the career salary anchor |
| 46 | Used CSS Scroll Snap for tab strip (native browser feature, no JS snapping) | Avoids JS snap bugs and keeps implementation lightweight |
| 46 | Kept sticky tab bar in separate DOM layer above horizontally-transformed carousel | Preserves `position: sticky` semantics and prevents CSS transform conflicts |
| 46 | Reused existing modal patterns (scroll lock, focus trap, reduced-motion) from WindingMiniGameModal | Standardizes mobile interaction patterns without introducing new modal framework |
| 47 | Tier badges use CSS variables for color theming to enable easy customization | Allows theme adjustments without touching component code |
| 47 | TierBadge metadata plus CSS variable theming drive catalog and per-watch badges | Synchronizes tier copy and colors across data + UI so the catalog and stats surfaces share the same cues while remaining configurable |
| 47 | Catalog cards now source tier badge metadata directly from watch models | Keeps badge colors and tooltip copy consistent across unowned and owned catalog rows without repeating the inference logic |
| 47 | Collection summary links the tier badges to the help section so Starter, Mid-tier, and Luxury meanings stay explained | Aligns the Collection copy with catalog tooltips while surfacing counts for each variety |
| 47 | Reinforced mobile regression guardrails with helper-based Playwright assertions | Keeps scroll-snap, sticky tabs, and help modal flows uniform across both iPhone 12 and Pixel 5 viewport tests |
| 47 | Centralized Playwright mobile projects around Pixel 5 + iPhone 12 | Guarantees Chrome and WebKit mobile runs are both exercised every suite instead of being optional |
| 47 | Isolated `HelpModal` inside `#app-shell` so the background can be inerted and focus restored cleanly | Enables the WebKit focus trap fix without leaking focus to background elements |
| 47 | Intercepted Tab/Shift+Tab between the help search input and close button for WebKit accessibility | Keeps iOS Safari keyboard navigation inside the modal without relying on native `aria-modal`
| 48 | Normalize nowMs + premium window before charging session cost | Guarantees premium resets after 2× cooldown and keeps costs stable for the first session after a break
| 48 | Surface premium label/note from selectors into the Career UI row | Keeps UI copy/test hooks synchronized with policy math and explains the multiplier
| 48 | Keep the prestige multiplier breakdown inside selectors before exposing it to the UI | Ensures the workshop tooltip math always matches the authoritative domain value
| 48 | Anchor the Atelier bonus tooltip next to the blueprint cost instead of duplicating math elsewhere | Keeps the bonus narrative close to the reset call-to-action without cluttering the panel
| 48 | Keep power reserve labels and explanations inside selectors so every surface reuses the same writing | Stops every UI surface from rewording reserve math and keeps the explanation deterministic
| 48 | Inline the tooltip badge next to catalog metadata while keeping the selectors as the source of truth | Keeps the dynamic reserve explanation close to the card without re-implementing the helper
| 48 | Keep salary alert thresholds inside selectors so every alert is deterministic | Prevents UI from inventing its own soon/urgent cutoffs and stays in sync with the domain timer
| 48 | Render the salary alert as a muted banner inside the sessions card for context-sensitive warnings | Lets players see the remaining time where session information already lives without extra rows
| 48 | Smooth gauge display with a CSS spring-progress variable while leaving telemetry math untouched | Lets the arc feel responsive without jittering the crown’s real data
| 48 | Wrap the crown in a tier-aware glow shell so reduced-motion users still see resolved states | Keeps glow styling separate from the crown markup and preserves accessibility overrides
| 48 | Surface the next-unlock effect summary via selector math in the featured preview row | Prevents the UI from drifting from authoritative requirement values while still highlighting the effect.
| 48 | Keep the catalog lanes wrapped in the `catalog-grid` anchor before splitting into lanes | Preserves regression selectors while allowing visual lane groupings for Starter/Mid/Lux tiers.
| 49 | Keep tab metadata inside `tabMeta.ts` so bucket/group data can evolve without renaming stable IDs. | Lets buckets be surfaced without touching legacy selectors or anchor names. | ✓ Good |
| 49 | PageTabRail owns the tablist DOM so App can keep ref/focus wiring concentrated on state transitions. | Future mobile polish can reuse the component while preserving accessible semantics. | ✓ Good |
| 49 | Render brand/year sort results as a dedicated list instead of re-bucketing into lanes when non-default order is requested. | Keeps alphabetical/year ordering deterministic for automation without altering the lane copy guards. | ✓ Good |
| 49 | When focus leaves the help button via Tab, cycle back to the collection tab so the skeleton + navrail focus story stays intact. | Keeps keyboard navigation anchored inside the primary nav and lets the new contract test resolve reliably. | ✓ Good |
| 49 | Portal the Clear Save modal through `document.body` instead of inside the fieldset stack. | Keeps the confirmation dialog atop the new layout so Pixel 5 automation can click through. | ✓ Good |
| 49 | Group settings controls into explicit fieldsets (Save, Audio, Preferences, Import) with clear legends and spacing. | Clarifies hierarchy while preserving existing DOM ids/data-testids for automation. | ✓ Good |
| 49 | Group hero stats into primary, progression, and system buckets via the new `StatsHeader` so the hero panel stays scannable while keeping stable ids/data-testids. | Keeps the metrics contract consistent for regressions while exposing the grouped context. | ✓ Good |
| 49 | Render the Stats tab breakdown panel even when the tab is inactive so relocated anchors like `#softcap` and `stats-event-multiplier` stay in the DOM for automation. | Prevents automated checks from losing the relocated softcap detail when the tab defaults to Collection. | ✓ Good |
| 49 | Collapse catalog filters into an accessible toggle with an active-count badge | Keeps mobile real estate calm while preserving the DOM ids/data-testids automation and keyboard flows rely upon |
| 49 | Sort default catalog results by ascending price (brand/model tie-breakers) | Highlights affordable discoveries deterministically and keeps regression expectations matched to the authoritative math |
| 49 | Virtualize the catalog only once entry counts exceed 200 rows | Keeps the lane/tier layout stable while speeding up long lists that would otherwise bloat the DOM |
| 49 | Portal the catalog detail sheet through `CatalogCardDetailsSheet` and restore focus to the trigger | Reuses the existing detail markup while keeping keyboard/focus contracts intact |
| 49 | Keep HelpModal search and close within a shared header action strip for mobile | Keeps both controls within 44px targets while preserving keyboard trapping and focus sentinels |
| 49 | Drive modal motion states through `data-live-state`/`data-outcome-state` pointers and CSS transitions | Lets winding, automatic, and quartz overlays share consistent animation polish while honoring reduced-motion |
| 49 | Animate hero stats via ValueTicker while centralizing currency/upgrade icons in `coreIcons.tsx`. | Keeps metric readouts animated, accessible, and visually coherent for automation and reduced-motion audiences. | ✓ Good |
| 49 | Send nostalgia resets through FloatingDelta + ToastStack feedback instead of blocking modals. | Lets destructive confirmations stay in modals while the toast stack surfaces dismissible +X cues. | ✓ Good |
| 50 | Keep the timeline summary and upcoming choice cards tied directly to the career selectors for progress and choice state | Prevents UI copy from drifting away from the authoritative progression math shared with tests |
| 50 | Hide the timeline meta on viewports narrower than 620px and gate pointer events so the Career map stays interactive | Keeps Pixel 5 map interactions responsive despite the new overlay cards |
| 50 | Force Playwright hover/click actions for the Career map zoom controls when overlays still intercept the DOM | Lets the regression validate zoom persistence without uninstallable pointer conflicts |
| 50 | Keyword metadata + normalized ranking keeps help search deterministic without renaming IDs | Ensures Tier badge keywords steer ordering before falling back to body text matches |
| 50 | Related chips use section metadata so Tier badge education links to catalog-first/catalog-shopping guidance | Keeps quick links stable while reusing existing IDs and anchors |
| 49 | Derive Collection anchors via `CollectionSectionNavLink` so nav copy, automation selectors, and scroll targets stay synchronized. | Keeps the new Collection subnav predictable while enabling future guts to reuse the same definition. | ✓ Good |
| 49 | Persist onboarding dismissals in `settings.coachmarksDismissed` so no additional storage keys are introduced. | Honors existing settings guardrails while letting coachmarks pause for returning players. | ✓ Good |
| 49 | Derive the new career timeline from `CAREER_STAGES` metadata and selector outputs so UI copy/test anchors stay in sync. | Prevents duplicating progression math while letting the timeline reuse the same progression sources as the career map. | ✓ Good |
| 50 | Expose `data-active-section` on the CollectionSectionNav and stop relying on `aria-current` alone | Keeps Playwright nav assertions stable even when readiness badges append extra text to tab labels |
| 50 | Pause automatic active-section detection for ~400 ms after programmatic jumps | Prevents the sticky nav from flipping back to `collection-overview` before automation captures the intended anchor |
| 50 | Relax the Owned tab matcher to `/^Owned/` and click via `evaluate` so viewport restrictions do not block the script | Guards the winding and automatic interaction flows even when readiness badges change the tab copy |
| 50 | Harden help/explanations e2e interactions with mobile-safe click paths and align stats-rate assertions to card line items | Removes mobile pointer-interception flake and keeps the verification suite aligned with current StatsTab markup |
| 51 | Keep offline progress on the runtime step path instead of inventing a separate economy flow | Keeps the economy deterministic across live play and subsequent loads |
| 51 | Route every save import (paste or file) through the persistence decoder before mutating state | Ensures invalid payloads are rejected centrally and no progress is lost |
| 51 | Include favorites state in Catalog's stable-entry signature | Prevents favorites-only filters from showing stale results after toggles |
| 51 | Keep latest-purchase undo bounded to a single validated snapshot | Ensures undo cannot corrupt inventory/currency state or rewind arbitrarily |
| 51 | Make practice mode reward-free and keep streak bonuses normal-mode only | Preserves economy integrity while allowing skill training loops |
| 53 | Canonicalize persistence writes to save v3 while preserving v1/v2 decode + legacy key migration | Allows additive persistence evolution without breaking existing player saves |
| 53 | Keep career summary messaging selector-driven (session delta + salary window + next unlock) | Prevents UI text/math drift and keeps decision cues deterministic |
| 53 | Force therapist-session e2e to assert persisted save deltas via reload boundaries | Verifies real save side effects instead of only transient UI state |
| 54 | Prefer unique `data-testid` selectors over ambiguous role/text queries in e2e assertions | Eliminates strict-mode collisions and stabilizes locator intent across responsive variants |
| 54 | Keep desktop-only expectations scoped to desktop projects in Playwright matrix | Prevents deterministic mobile false-failures from viewport-incompatible assertions |
| 55 | Treat primary-action visibility as a UX contract: toast/overlay layers cannot obscure core loop controls | Keeps high-frequency actions continuously available and reduces interruption friction |
| 55 | Use concise taxonomy-driven gating reasons instead of verbose repeated copy | Improves scan speed and actionability while preserving deterministic selector/assertion anchors |
| 56 | Lock global tab order to `Career -> Catalog -> Collection` and keep tab labels discoverable on narrow screens | Preserves primary IA intent from audit findings and removes navigation ambiguity in mobile first view |
| 56 | Define one-primary-action-first contract per tab and prohibit overlay occlusion of that zone | Reduces decision paralysis and interruption friction in high-frequency gameplay loops |
| 56 | Execute full UI audit captures as tab-scoped tests that emit per-tab manifests and coverage summaries | Improves failure isolation and keeps audit evidence deterministic for desktop/mobile regressions |
| 56 | Generate rubric-tagged audit indexes/checklists (`nav`, `cta`, `overlay`, `density`, `gating`, `meta`) from manifests | Eliminates manual file crawling and speeds review triage across 396 captured artifacts |

## Session Continuity

Last session: 2026-02-07T12:59:35Z
Stopped at: Completed Phase 56 closeout (`56-09-SUMMARY.md`) and published indexed desktop/mobile audit evidence
Resume file: None
