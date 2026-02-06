# Phase 52-01: UX Redesign Spec

**Date:** 2026-02-06
**Type:** Design specification (before implementation)

## 1) Goals

1. Reduce scan/load time in Catalog, Career, and Stats.
2. Make primary progression actions visually unambiguous.
3. Improve one-thumb mobile usability in high-frequency flows.
4. Preserve current gameplay depth while progressively disclosing lower-priority detail.

## 2) Before/After Wireframes

### A. Desktop Catalog Card Hierarchy

#### Before (current heavy card)

```text
+---------------------------------------------------------------------+
| [TierBadge] Brand Model                           Year              |
| tags · facts · long description lines                                |
| owned: X   price: $Y   next x1.20                                    |
| [Buy] [Favorite] [Compare] [Details] [Wear] [Interact] [Dismantle]   |
| helper text + cooldown + hints                                       |
+---------------------------------------------------------------------+
```

#### After (primary + secondary split)

```text
+---------------------------------------------------------------------+
| [TierBadge] Brand Model                           Year              |
| price $Y                 owned X                delta +$ / +E       |
|                                                                     |
| [PRIMARY: Buy / Interact]      [Secondary: ☆ Favorite  ⇄ Compare]  |
| [More ▾] (opens details sheet with facts/tags/rare actions)         |
+---------------------------------------------------------------------+
```

Design intent:
- One dominant button row.
- Secondary actions visually demoted.
- Rare actions moved behind `More`/details sheet.

### B. Mobile Catalog Flow

#### Before (stacked dense feed)

```text
[Tab rail]
[Stats cards]
[Catalog filters]
[Large cards repeating full metadata/actions]
[Large cards repeating full metadata/actions]
...
```

#### After (compact list default + expandable rows)

```text
[Tab rail]
[Sticky quick actions: Filters | Sort | Show: Compact/Expanded]

┌ Row ─────────────────────────────────────────────┐
| Brand Model            Tier       $Price         |
| Owned X · +E/s · +$/s              [Buy] [⋯]    |
└──────────────────────────────────────────────────┘

Tap row/⋯ => bottom sheet:
- full facts
- compare/favorite toggles
- wear/dismantle/interaction details
```

Design intent:
- Default compact mode minimizes fatigue.
- Bottom sheet concentrates deep controls near thumb zone.

### C. Career Panel Progressive Disclosure

#### Before (parallel dense panels)

```text
[Session controls][Track panel][Planning panel]
[Timeline cards + map + progression widgets in same visual weight]
```

#### After (Now / Next / Deep sections)

```text
[Now]
- Session status + one primary CTA
- Salary window alert (if relevant)

[Next]
- Next unlock summary
- Next milestone ETA

[Deep Details ▾]
- Track matrix
- Timeline map
- full node cards
```

Design intent:
- First screen answers: "What should I do now?"
- Complex planning remains accessible but not always expanded.

### D. Stats Screen Scanability

#### Before

```text
[Rate breakdown]
[event calendar]
[journal]
(all sections same elevation/visual priority)
```

#### After

```text
[Top summary strip: total $/s, total E/s, event multiplier]
[Primary cards: Rate breakdown, Active event]
[Secondary accordion: Upcoming events, Journal, historical notes]
```

Design intent:
- Numeric summary anchors first, details second.

## 3) Component-Level Rules

| Component | Rule | File Targets |
|---|---|---|
| `PageTabRail` | Stronger active indicator, overflow edge cue, tighter badge hierarchy | `src/ui/components/PageTabRail.tsx`, `src/style.css` |
| `CatalogTab` shell | Sticky mobile quick-action row (`Filters`, `Sort`, `Density`) | `src/ui/tabs/CatalogTab.tsx`, `src/style.css` |
| Catalog cards | Primary action prominence, secondary action demotion, `More` disclosure | `src/ui/tabs/CatalogTab.tsx`, `src/style.css` |
| Catalog details sheet | Consolidate low-frequency controls and metadata | `src/ui/components/CatalogCardDetailsSheet.tsx`, `src/style.css` |
| Compare panel | Preserve function but reduce visual heaviness and improve pairing legibility | `src/ui/components/catalog/WatchComparePanel.tsx`, `src/ui/components/catalog/catalogCompare.css` |
| `CareerPanel` | `Now/Next/Deep` layout with collapsible deep section | `src/ui/tabs/career/CareerPanel.tsx`, `src/style.css` |
| `StatsTab` | Promote top metrics strip and convert secondary sections to disclosure groups | `src/ui/tabs/StatsTab.tsx`, `src/style.css` |
| `StatsHeader` | Higher contrast + clearer numerical emphasis hierarchy | `src/ui/components/StatsHeader.tsx`, `src/style.css` |
| Settings | Larger toggle hit areas and clearer section separators | `src/ui/tabs/SaveTab.tsx`, `src/style.css` |
| Help modal | Keep search + close sticky and improve result contrast tiers | `src/ui/help/HelpModal.tsx`, `src/style.css` |

## 4) Visual System Rules (Implementation Constraints)

- Minimum target size for high-frequency controls: `44x44`.
- Body copy minimum in dense cards: `13px`, line-height `1.4` minimum.
- One primary CTA style per card/panel; all other actions secondary/tertiary.
- Default card metadata lines max: `2` in compact mode.
- Use progressive disclosure for low-frequency diagnostics.
- Preserve existing `data-testid` contracts; add new anchors instead of renaming.

## 5) Success Metrics

- Reduce visible interactives in mobile catalog viewport by at least `35%` in default compact mode.
- Reduce controls below practical 44px targets in catalog and settings by at least `50%`.
- Reduce first-screen decision latency (qualitative) by making one clear primary action per major panel.
- Maintain unit/e2e green status for existing stable selectors and critical flows.

## 6) Delivery Notes

- This design spec is implemented through plans `52-01`, `52-02`, and `52-03`.
- Each rollout plan is additive and test-first, with no gameplay/economy logic changes.
