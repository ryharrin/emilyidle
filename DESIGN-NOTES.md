# Emily Idle Design Notes

**Last Updated:** 2026-01-29  
**Status:** v3.0 Catalog-First Economy & Interactions Milestone

---

## Game Overview

Emily Idle is a luxury watch-collecting idle/incremental game with a sophisticated, elegant theme. The game loop involves:

1. **Collecting watches** to generate "enjoyment" (primary currency)
2. **Running therapy sessions** to convert enjoyment into cash
3. **Buying more watches** with cash (gated by enjoyment requirements)
4. **Prestige systems** (Atelier, Maison, Nostalgia) for permanent progression
5. **Catalog discovery** unlocking tier bonuses and collection value

### Current Currency System

| Currency               | Purpose                           | Source                          |
| ---------------------- | --------------------------------- | ------------------------------- |
| **Vault Enjoyment**    | Primary resource, gates purchases | Watch generation                |
| **Vault Dollars**      | Buying watches                    | Therapy sessions                |
| **Memories**           | Collection value (sentimental)    | Total collection worth          |
| **Softcap Efficiency** | Diminishing returns metric        | Calculated from duplicate count |

---

## Current Design Strengths

1. **Elegant visual theme**: Dark luxury aesthetic with gold/bronze accents (`#e8c693`) fits the watch-collecting theme
2. **Accessibility focus**: Proper ARIA labels, keyboard navigation, focus-visible states, reduced-motion support
3. **Consistent card-based layout**: Cards with clear headers, content, and action areas
4. **Theme support**: Both dark and light modes with smooth CSS transitions
5. **Contextual help**: ExplainButton pattern throughout for in-context documentation
6. **Good information architecture**: Tab-based navigation keeps related content grouped

---

## Identified Usability Issues

### 1. Information Overload in Collection Tab

**Severity:** High  
**Impact:** New players feel overwhelmed; experienced players scroll excessively

The Collection tab (the primary game screen) contains:

- Catalog purchase panel with 6+ filters
- Tier bonuses panel with progress tracking
- Brand sections with watch models and interactions
- Upgrades list (can be long)
- Milestones list
- Achievements list (filterable but still verbose)
- Events list
- Set bonuses grid
- Crafting workshop with recipes and boosts
- Coachmarks (dismissible but initially present)
- Maison lines (when unlocked)

**Problems:**

- No clear visual hierarchy - everything competes for attention
- New players don't know what to focus on first
- Experienced players must scroll through irrelevant sections
- Mobile experience is especially cramped

**Recommendations:**

#### Option A: Restructure Tabs (Preferred)

Create a clearer separation of concerns:

```
Current:                    Proposed:
┌─────────┐                ┌─────────┐
│ Vault   │                │ Vault   │ ← Owned watches + interactions
│ Career  │                │ Catalog │ ← Shop + discovery
│ Workshop│                │ Career  │ ← Therapy + future career depth
│ Maison  │                │ Prestige│ ← Atelier + Maison + Nostalgia
│ Nostalgia│               │ Progress│ ← Stats + milestones + achievements
│ Stats   │                │ Save    │
│ Save    │                └─────────┘
└─────────┘
```

**Vault Tab:**

- Your owned watches (visual grid)
- Interact/Dismantle actions
- Collection value summary
- Quick link to Catalog

**Catalog Tab:**

- Shop interface (current catalog-shop)
- Filters and search
- Discovery progress
- Tier bonuses (compact view)

**Progress Tab:**

- Stats dashboard
- Milestones (with progress)
- Achievements (collapsible completed)
- Events (current and upcoming)
- Set bonuses

#### Option B: Collapsible Sections

Keep current tabs but make sections collapsible with persistence:

```
Collection Tab
├── [Next Goals] ← Always expanded, shows 2-3 upcoming unlocks
├── [Catalog Shop] ← Expanded by default
├── [Your Collection] ← Expanded by default
├── [Upgrades ▼] ← Collapsible
├── [Milestones ▼] ← Collapsible
├── [Achievements ▼] ← Collapsible (respects hide completed setting)
└── [Crafting ▼] ← Collapsible
```

---

### 2. Currency Display Confusion

**Severity:** High  
**Impact:** Players don't understand what to prioritize or how currencies relate

Current header stats:

```
Vault enjoyment    $5,678
Enjoyment / sec    +$45/s
Vault dollars      $1,234
Dollars / sec      +$12/s
Memories           $89,012
Softcap            85%
```

**Problems:**

- "Vault enjoyment" uses dollar formatting but isn't money
- Three different "values" displayed without clear relationship
- "Softcap" is a technical term without explanation
- No visual distinction between primary (enjoyment) and secondary (cash) currencies
- Rates are displayed but not explained (what affects them?)

**Recommendations:**

#### Redesigned Header Stats

```
┌─────────────────────────────────────────────────────────────┐
│  Vault                                                      │
│  ┌──────────────────┬──────────────────┬─────────────────┐  │
│  │  😊 Enjoyment    │  💰 Cash         │  📈 Rates       │  │
│  │  5,678           │  $1,234          │  +45/s 😊       │  │
│  │  [?]             │  [?]             │  +$12/s 💰      │  │
│  └──────────────────┴──────────────────┴─────────────────┘  │
│                                                             │
│  Active: Event 1.5x • Set Bonus 1.2x • Softcap 85% [?]     │
└─────────────────────────────────────────────────────────────┘
```

**Key Changes:**

1. **Icons for instant recognition** - 😊 for enjoyment, 💰 for cash
2. **Primary/secondary visual hierarchy** - Enjoyment larger/more prominent
3. **Grouped rates** - Show both rates together
4. **Active bonuses summary** - One line showing current multipliers
5. **Contextual help** - [?] buttons for each currency explanation

#### Rate Breakdown Tooltip

On hover/focus of rate display, show:

```
Enjoyment Rate Breakdown:
├─ Base from watches:     +30/s
├─ Event bonus (1.5x):    +15/s
├─ Set bonus (1.2x):      +6/s
├─ Tier bonus (1.1x):     +3/s
└─ Crafted boosts:        +1/s
                          ─────
Total:                    +45/s
```

---

### 3. Catalog Shopping UX Issues

**Severity:** High  
**Impact:** Shopping is the primary loop but has friction points

**Current Catalog Card:**

```
┌─────────────────────────────┐
│  [Image]                    │
│  Undiscovered (badge)       │
├─────────────────────────────┤
│  ROLEX                      │
│  Submariner                 │
│  1967                       │
│                             │
│  Details ▼                  │
│  Description...             │
│  Year: 1967                 │
│  Tags: diver luxury         │
│  License: CC-BY             │
│                             │
│  0 owned                    │
│  $12,000                    │
│  Next x1.00                 │
│                             │
│  Requires $500 enjoyment    │
│  (Need $200 more)           │
└─────────────────────────────┘
```

**Problems:**

- Undiscovered watches shown but can't be bought (teasing without purpose)
- "Next x1.00" is unclear (duplicate multiplier)
- Gate text is verbose and buried
- No visual affordance for "can buy" vs "can't buy"
- Price and ownership info scattered
- Details section rarely useful for shopping decisions

**Recommendations:**

#### Simplified Catalog Card

```
┌─────────────────────────────┐
│  [Watch Image]              │
├─────────────────────────────┤
│  ROLEX                      │
│  Submariner                 │
│  1967 • Diver • Luxury      │
│                             │
│  ┌─────────────────────┐   │
│  │  💰 $12,000         │   │
│  │  ⏳ Need $200 more   │   │ ← Progress bar here
│  └─────────────────────┘   │
│                             │
│  Owned: 0  │  Next: 1.0x   │
│                             │
│  [    Buy    ]              │
│  or [🔒 Locked - Details]   │
└─────────────────────────────┘
```

**Key Changes:**

1. **Visual state indicators:**
   - ✅ Green border + "Buy" button = Can purchase
   - ⏳ Yellow border + progress bar = Missing enjoyment (show % progress)
   - 🔒 Gray + locked button = Undiscovered or too expensive

2. **Simplified info:**
   - Remove details section (move to "i" icon or expand)
   - Compact tags line
   - Clearer duplicate multiplier label

3. **Progressive disclosure:**
   - Default view: Only show watches you can buy or are close to buying
   - "Show All" toggle for completionists
   - "Only Show Affordable" quick filter

#### Catalog Filter Improvements

Current filters are comprehensive but overwhelming:

**Simplified Default View:**

```
┌─────────────────────────────────────────────────────────┐
│  Search [________]  [Brand ▼]  [Sort: Default ▼]  [⚙️] │
└─────────────────────────────────────────────────────────┘
```

**Advanced Filters (expandable):**

```
┌─────────────────────────────────────────────────────────┐
│  Style: [All ▼]  Era: [All ▼]  Type: [All ▼]           │
│  [✓] Show only affordable                              │
│  [✓] Show undiscovered                                 │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Progress Feedback Fragmentation

**Severity:** Medium  
**Impact:** Players don't have clear goals or sense of progress

Current progress indicators:

- `NextUnlockPanel` shows some unlocks but not all
- Individual cards show lock states
- Tab visibility changes as systems unlock
- No unified "what should I do next?" view

**Problems:**

- Easy to miss what's coming next
- No sense of how close you are to major unlocks
- Career tab just appears (no "unlock" moment)
- Workshop/Maison/Nostalgia progress shown in different places

**Recommendations:**

#### Unified "Next Goals" Panel

Always visible at top of main tab:

```
┌─────────────────────────────────────────────────────────────┐
│  NEXT GOALS                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Career Tab        [████████░░░░░░░░░░] 45%             │
│     Buy 3 more watches to unlock Career                    │
│     [Go to Catalog]                                        │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  🔒 Workshop          [████░░░░░░░░░░░░░░] 20%             │
│     Reach $50k enjoyment to unlock Atelier                 │
│     (Currently: $12k)                                       │
│                                                             │
│  [Show 3 more upcoming goals ▼]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

- Always shows next 2-3 goals
- Progress bars with percentages
- Direct CTAs to make progress
- Collapsible upcoming goals
- Celebration animation when goal completes

#### Tab Progress Indicators

Show progress on locked tabs themselves:

```
┌─────────────────────────────────────────┐
│  Vault  │  Catalog  │  Career*  │  ...  │
│                    │  [45%]    │       │
└─────────────────────────────────────────┘

*Career shows progress bar when hovered
```

---

### 5. Prestige System Confusion

**Severity:** Medium  
**Impact:** Three prestige systems with overlapping concepts confuse players

Current systems:

- **Workshop/Atelier**: Trade enjoyment → Blueprints → Upgrades
- **Maison**: Trade enjoyment → Heritage/Reputation → Lines
- **Nostalgia**: Reset vault → Nostalgia points → Permanent unlocks

**Problems:**

- "Workshop" vs "Atelier" terminology inconsistency
- All three systems unlock at different times, creating confusion
- No clear explanation of which to prioritize
- Maison and Workshop both use enjoyment as input

**Recommendations:**

#### Unified Prestige Tab

```
┌─────────────────────────────────────────────────────────────┐
│  PRESTIGE SYSTEMS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔵 ATELIER (Workshop)                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Progress: [████████████████████░░░░░░░░] 65%      │   │
│  │                                                     │   │
│  │  Current: 12 Blueprints                             │   │
│  │  Next reset: +5 Blueprints                          │   │
│  │                                                     │   │
│  │  [View Upgrades]  [Reset Atelier]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🟡 MAISON                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Progress: [████████░░░░░░░░░░░░░░░░░░░░] 25%      │   │
│  │                                                     │   │
│  │  Current: 5 Heritage, 2 Reputation                  │   │
│  │  Next reset: +3 Heritage                            │   │
│  │                                                     │   │
│  │  [View Lines]  [Reset for Heritage]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🟣 NOSTALGIA                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Progress: [████░░░░░░░░░░░░░░░░░░░░░░░░] 15%      │   │
│  │                                                     │   │
│  │  Current: 50 Nostalgia Points                       │   │
│  │  Next reset: +25 Points                             │   │
│  │                                                     │   │
│  │  [View Unlock Store]  [Prestige Vault]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Changes:**

1. **Unified view** of all three systems
2. **Consistent progress visualization** (percentage bars)
3. **Clear naming** (standardize on "Atelier" or "Workshop")
4. **Current + Next values** shown clearly
5. **CTAs for each system's actions**

#### Prestige Recommendation System

Add a "Recommended" badge based on game state:

```
🔵 ATELIER [RECOMMENDED]
   "You're close to a blueprint milestone.
    Reset now for +5 Blueprints."

🟡 MAISON
   "Continue building enjoyment for Heritage."

🟣 NOSTALGIA
   "Wait until 100% for maximum points."
```

---

### 6. Wind Session Mini-Game Needs Visual Polish

**Severity:** Medium  
**Impact:** Core interaction lacks satisfying feedback

Current wind session:

```
┌─────────────────────────────┐
│  Wind Session               │
│  Round 3 / 5 · Tension 6/10 │
│                             │
│  [Steady Wind] [Push It]    │
└─────────────────────────────┘
```

**Problems:**

- No visual representation of the watch being wound
- Tension is just numbers
- No feedback on success/failure of "Push It"
- No celebration on completion
- Unclear what the reward will be

**Recommendations:**

#### Visual Wind Session

```
┌─────────────────────────────────────────┐
│  Wind Session                           │
│  Rolex Submariner                       │
├─────────────────────────────────────────┤
│                                         │
│     ┌─────────────────┐                │
│     │    [Watch       │                │
│     │     Face        │                │
│     │   Animation]    │                │
│     │                 │                │
│     │    10:42        │  ← Time ticks   │
│     └─────────────────┘                │
│                                         │
│  Tension:                               │
│  [██████░░░░] 6/10                      │
│                                         │
│  Progress: ● ● ● ○ ○  (Round 3/5)       │
│                                         │
│  [  Steady Wind  ]  [   Push It   ]    │
│  (+1 tension, safe)  (+2 tension, 60%)  │
│                                         │
│  Reward preview: +45 joy, +$5 cash     │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**

1. **Watch face visualization** - Shows the actual watch being wound
2. **Animated second hand** - Ticks as you wind (visual feedback)
3. **Tension gauge** - Visual bar instead of just numbers
4. **Round indicators** - 5 dots showing progress
5. **Risk/reward explanation** - "+2 tension, 60%" on Push It button
6. **Reward preview** - Show what you'll get before finishing

#### Completion Celebration

After round 5:

```
┌─────────────────────────────────────────┐
│  ✨ Session Complete! ✨                │
├─────────────────────────────────────────┤
│                                         │
│  Your Rolex Submariner is fully wound! │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  REWARDS                        │   │
│  │                                 │   │
│  │  😊 +245 Enjoyment              │   │
│  │  💰 +$34 Cash                   │   │
│  │  ⭐ Bonus: +10% for high tension │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Continue]  [Wind Another]             │
│                                         │
└─────────────────────────────────────────┘
```

---

### 7. Missing Visual Feedback for Purchases

**Severity:** Medium  
**Impact:** Purchases feel flat; no satisfaction from progression

Current purchase feedback:

- Brief `purchase-flash` CSS animation (700ms)
- Stats update silently
- No indication of rate changes

**Problems:**

- Buying a watch doesn't feel impactful
- No celebration for milestones
- Rate changes are invisible
- No "new thing unlocked" feedback

**Recommendations:**

#### Purchase Feedback System

**Floating Numbers:**

```
When buying a watch:

[Buy Button]
     ↓ (click)
┌──────────────┐
│  +$45/s 😊   │  ← Floats up from button
│  +$12/s 💰   │
└──────────────┘
```

**Rate Change Highlight:**

```
Before:                    After:
Enjoyment / sec   +30/s    Enjoyment / sec   +45/s  [+15]
                                         (highlighted briefly)
```

**Milestone Unlock:**

```
┌─────────────────────────────────────────┐
│  🎉 UNLOCKED: Career Tab!               │
├─────────────────────────────────────────┤
│                                         │
│  You bought your 5th watch!             │
│  The Career tab is now available.       │
│                                         │
│  [Go to Career]  [Dismiss]              │
│                                         │
└─────────────────────────────────────────┘
```

**Collection Growth Visualization:**

```
Vault Tab:

Your Collection:
┌─────────┬─────────┬─────────┬─────────┐
│ [Watch] │ [Watch] │ [Watch] │ [Watch] │
│   #1    │   #2    │   #3    │   #4    │
├─────────┼─────────┼─────────┼─────────┤
│ [Watch] │ [Watch] │ [Watch] │   +5    │ ← "+5" pulses
│   #5    │   #6    │   #7    │  more   │   when new
└─────────┴─────────┴─────────┴─────────┘
```

---

### 8. Mobile/Responsive Issues

**Severity:** Medium  
**Impact:** Game is unplayable on mobile devices

Current layout issues:

- `grid-template-columns: 1.4fr 0.8fr` doesn't collapse gracefully
- Filters in grid overflow horizontally
- Tab navigation requires horizontal scroll
- Buttons may be too small for touch

**Recommendations:**

#### Mobile Layout

```
Mobile View (< 640px):

┌─────────────────────────────────────┐
│ ≡  Emily Idle          😊 💰       │  ← Hamburger menu, compact stats
├─────────────────────────────────────┤
│                                     │
│  [    Main Content Area    ]       │
│                                     │
├─────────────────────────────────────┤
│  [Vault] [Catalog] [Career] [...]  │  ← Bottom tab bar (icon + label)
└─────────────────────────────────────┘
```

**Key Changes:**

1. **Bottom navigation** - Thumb-friendly tab switching
2. **Single column layout** - Stack everything vertically
3. **Collapsible filter bar** - Hide filters behind "Filters ▼" button
4. **Touch targets** - Minimum 44px for all interactive elements
5. **Swipe gestures** - Swipe between tabs

#### Responsive Breakpoints

```css
/* Mobile: < 640px */
- Single column
- Bottom nav
- Collapsible sections

/* Tablet: 640px - 900px */
- Two columns for some sections
- Side nav
- Expanded sections

/* Desktop: > 900px */
- Full layout
- Side panel for stats
- All sections visible
```

---

### 9. Help System Improvements

**Severity:** Medium  
**Impact:** Players don't understand mechanics without digging

Current help:

- ExplainButton (?) icons throughout
- HelpModal with sections
- Must be proactively accessed

**Problems:**

- No guided onboarding for new players
- Contextual help requires clicking
- No "first time" explanations
- Glossary exists but is buried

**Recommendations:**

#### Guided Onboarding (First Session)

```
Step 1: Welcome
┌─────────────────────────────────────────┐
│  Welcome to Emily Idle                  │
│                                         │
│  Build a luxury watch collection,       │
│  generate enjoyment, and grow your      │
│  vault.                                 │
│                                         │
│  [Start Tutorial]  [Skip]               │
└─────────────────────────────────────────┘

Step 2: First Purchase
┌─────────────────────────────────────────┐
│  💡 Tip: Buy Your First Watch           │
│                                         │
│  Watches generate "enjoyment" over      │
│  time. Start with an affordable piece.  │
│                                         │
│  [Go to Catalog →]                      │
└─────────────────────────────────────────┘

Step 3: Understanding Currencies
┌─────────────────────────────────────────┐
│  💡 Tip: Two Currencies                 │
│                                         │
│  😊 Enjoyment: Generated by watches     │
│     (used to unlock new tiers)          │
│                                         │
│  💰 Cash: Earned through Career         │
│     (used to buy watches)               │
│                                         │
│  [Next: Career →]                       │
└─────────────────────────────────────────┘
```

#### Contextual Tooltips

First time encountering a mechanic:

```
┌─────────────────────────────────────────┐
│  [Buy Button]                           │
│       ↑                                 │
│  ┌─────────────────────────────────┐   │
│  │  💡 This costs both cash AND    │   │
│  │  requires enough enjoyment to   │   │
│  │  unlock the tier.               │   │
│  │                                 │   │
│  │  [Got it]                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Glossary Integration

Add glossary links to all jargon:

```
Softcap: 85% [?]
          ↑
    Click for: "Softcap reduces rewards from
    duplicate watches. At 85%, you earn 85%
    of normal rewards."
```

---

### 10. Stats Tab Underutilized

**Severity:** Low  
**Impact:** Players lack insights into their progression

Current Stats tab:

- Basic currency display (redundant with header)
- Current multipliers
- Some lifetime stats

**Problems:**

- Mostly redundant with header
- No rate breakdowns
- No comparison over time
- No "best run" tracking
- Missing interesting statistics

**Recommendations:**

#### Enhanced Stats Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  STATS DASHBOARD                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  THIS RUN                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Time: 2h 34m                                       │   │
│  │  Enjoyment earned: 45,678                           │   │
│  │  Cash earned: $12,345                               │   │
│  │  Watches bought: 12                                 │   │
│  │  Sessions run: 8                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  RATE BREAKDOWN                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Enjoyment Rate:        Cash Rate:                  │   │
│  │  ├─ Base: +30/s         ├─ Base: +$5/s             │   │
│  │  ├─ Events: +15/s       ├─ Upgrades: +$5/s         │   │
│  │  ├─ Sets: +6/s          └─ Total: +$12/s           │   │
│  │  ├─ Tiers: +3/s                                     │   │
│  │  └─ Total: +45/s                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LIFETIME                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Total resets: 5                                    │   │
│  │  Total watches: 156                                 │   │
│  │  Total enjoyment: 1.2M                              │   │
│  │  Best run time: 4h 12m                              │   │
│  │  Best run earnings: $45k                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  COLLECTION                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Unique watches: 12 / 45                            │   │
│  │  Catalog discovered: 23 / 60                        │   │
│  │  Tier bonuses: 3 / 5                                │   │
│  │  Set bonuses active: 2                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Additional Ideas

### 11. Watch Detail View

When clicking a watch in your vault:

```
┌─────────────────────────────────────────┐
│  Rolex Submariner                       │
│  [Large Image]                          │
├─────────────────────────────────────────┤
│  Owned: 3                               │
│  Total enjoyment: +135/s                │
│  Duplicate multiplier: 0.85x            │
│                                         │
│  [Interact]  [Dismantle (3 parts)]      │
│                                         │
│  History:                               │
│  • Bought: 2h ago                       │
│  • Last interaction: 30m ago            │
│  • Dismantled: 1 (3 parts earned)       │
│                                         │
│  [View in Catalog]                      │
└─────────────────────────────────────────┘
```

### 12. Notification System

Instead of (or in addition to) modals:

```
Top-right corner:

┌─────────────────┐
│ ⚡ Event started │  ← Fades in
│ +1.5x income    │
└─────────────────┘
     ↓ (5s later)
     (fades out)
```

### 13. Achievement Unlocks

More satisfying achievement notifications:

```
┌─────────────────────────────────────────┐
│  🏆 Achievement Unlocked!               │
│                                         │
│  [Icon] First Five                      │
│  Collect 5 watches                      │
│                                         │
│  Reward: +5% permanent income           │
│                                         │
└─────────────────────────────────────────┘
```

### 14. Dark/Light Theme Improvements

- Add **auto theme** based on system preference
- **Theme preview** in settings (show both modes)
- **Accent color** options (gold, silver, rose gold)

### 15. Keyboard Shortcuts

Power-user features:

```
1-7: Switch tabs
B: Buy max of selected watch
Space: Run therapy session (if available)
I: Interact with selected watch
Esc: Close modals
?: Open help
```

### 16. Offline Progress Indicator

When returning after being away:

```
┌─────────────────────────────────────────┐
│  Welcome Back!                          │
│                                         │
│  While you were away (2h):              │
│  • Generated: 12,456 enjoyment          │
│  • Earned: $3,234 cash                  │
│  • Event active: +1.5x (45m remaining)  │
│                                         │
│  [Claim]                                │
└─────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Quick Wins (Low Effort, High Impact)

1. **Add icons to header stats** - Improves scannability
2. **Highlight affordable catalog items** - Better shopping UX
3. **Add "Buy Max" button** - Reduces click fatigue
4. **Show next milestone on locked tabs** - Better progress visibility
5. **Add progress bars to tier bonus cards** - Clearer progression

### Phase 2: Structural Improvements (Medium Effort)

1. **Restructure Collection tab** - Reduce information overload
2. **Unified Prestige tab** - Clarify prestige systems
3. **Enhanced wind session visuals** - Better core interaction
4. **Purchase feedback system** - More satisfying progression
5. **Unified Next Goals panel** - Clearer objectives

### Phase 3: Major Features (High Effort)

1. **Mobile responsive redesign** - Full mobile support
2. **Guided onboarding system** - Better new player experience
3. **Enhanced Stats dashboard** - Deeper insights
4. **Watch detail view** - Richer collection experience
5. **Notification system** - Better event/achievement feedback

---

## Design Principles

1. **Clarity over cleverness** - Every element should have a clear purpose
2. **Progressive disclosure** - Show basics by default, details on demand
3. **Celebrate milestones** - Make progression feel rewarding
4. **Respect player time** - Reduce clicks, show what matters
5. **Accessibility first** - Design for all players and devices
6. **Theme consistency** - Maintain luxury watch aesthetic throughout

---

## Open Questions

1. Should the game have sound effects? (currently disabled by default)
2. Should there be a "true idle" mode (no interactions required)?
3. How important is mobile play vs desktop?
4. Should there be social/sharing features?
5. Is the "therapist career" theme working, or should it be renamed?

---

_Document maintained as part of v3.0 milestone planning._

---

## Additional Design Opportunities (Post-Analysis)

### 17. Help Content Improvements

**Current State:**

- Help sections are text-only bullet points
- No visual diagrams or examples
- No search functionality
- No "related topics" linking

**Recommendations:**

#### Enhanced Help Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Help                                          [X]          │
├─────────────────────────────────────────────────────────────┤
│  [Search help...]                                           │
├─────────────────────────────────────────────────────────────┤
│  Categories: [All ▼] [Currencies] [Shopping] [Prestige]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CURRENCIES                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [Diagram showing currency flow]                   │   │
│  │                                                     │   │
│  │  Watches → Enjoyment → Sessions → Cash → Watches   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  • Enjoyment: Generated by your collection                  │
│  • Cash: Earned through career sessions                     │
│  • Memories: Tracks sentimental collection value            │
│                                                             │
│  Related: Gates | Rates | Prestige                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

1. **Search bar** - Filter help content in real-time
2. **Visual diagrams** - Show relationships between systems
3. **Category tabs** - Group related topics
4. **Related links** - Cross-reference between sections
5. **Examples** - "For example, if you have $500 enjoyment..."

---

### 18. Empty State Improvements

**Current State:**

- EmptyStateCTA component exists but is basic
- Some empty states lack CTAs
- No illustration or personality

**Recommendations:**

#### Rich Empty States

```
Catalog - No Results:
┌─────────────────────────────────────────┐
│                                         │
│     [🔍 Illustration]                   │
│                                         │
│  No watches match your filters          │
│                                         │
│  Try:                                   │
│  • Clearing the search term             │
│  • Selecting "All" brands               │
│  • Checking the "Owned" tab             │
│                                         │
│  [Clear All Filters]                    │
│                                         │
└─────────────────────────────────────────┘

Achievements - All Complete:
┌─────────────────────────────────────────┐
│                                         │
│     [🏆 Illustration]                   │
│                                         │
│  All achievements unlocked!             │
│                                         │
│  You've mastered the vault.             │
│  Consider a Nostalgia reset for         │
│  new challenges.                        │
│                                         │
│  [View Nostalgia Tab]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

### 19. Prestige Summary Enhancements

**Current State:**

- Three simple cards: Gain / Keeps / Loses
- No visual hierarchy of importance
- No "are you sure" emphasis

**Recommendations:**

#### Visual Prestige Summary

```
┌─────────────────────────────────────────────────────────────┐
│  Confirm Atelier Reset                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  YOU WILL GAIN:                    YOU WILL KEEP:          │
│  ┌─────────────────────────┐      ┌─────────────────────┐  │
│  │                         │      │                     │  │
│  │   +5                    │      │   ✓ Blueprints      │  │
│  │   BLUEPRINTS            │      │   ✓ Upgrades        │  │
│  │                         │      │   ✓ Achievements    │  │
│  │   [Large, highlighted]  │      │                     │  │
│  │                         │      │                     │  │
│  └─────────────────────────┘      └─────────────────────┘  │
│                                                             │
│  YOU WILL LOSE:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • All watches (12)                                 │   │
│  │  • All enjoyment ($45,678)                          │   │
│  │  • All cash ($12,345)                               │   │
│  │  • Career progress (Level 5)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ This cannot be undone.                                  │
│                                                             │
│  [   CANCEL   ]        [  CONFIRM RESET  ]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Changes:**

1. **Visual hierarchy** - Gain is most prominent
2. **Icons** - Checkmarks for keeps, warning for losses
3. **Quantities emphasized** - Large numbers for key values
4. **Warning prominence** - Clear "cannot be undone" message
5. **Button sizing** - Cancel is smaller than Confirm (but still accessible)

---

### 20. Settings/Save Tab Redesign

**Current State:**

- All settings in one long list
- No categorization
- Dev settings mixed with user settings
- Import/Export at bottom (hard to find)

**Recommendations:**

#### Organized Settings

```
┌─────────────────────────────────────────────────────────────┐
│  SETTINGS                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  APPEARANCE                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Theme: [System ▼]                                  │   │
│  │  [✓] Reduced motion                                 │   │
│  │  [✓] Compact mode (hide descriptions)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  GAMEPLAY                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [✓] Confirm prestige resets                        │   │
│  │  [✓] Confirm nostalgia unlocks                      │   │
│  │  [ ] Hide completed achievements                    │   │
│  │  [ ] Auto-buy when affordable                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  AUDIO                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [✓] Sound effects                                  │   │
│  │  [ ] Background music                               │   │
│  │       Volume: [━━━●────]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  DATA MANAGEMENT                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Export Save] [Import Save]                        │   │
│  │                                                     │   │
│  │  Last saved: 2 minutes ago                          │   │
│  │  Play time: 12h 34m                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TAB VISIBILITY                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [✓] Vault    [✓] Catalog   [✓] Career             │   │
│  │  [✓] Prestige [✓] Progress  [✓] Save               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  DANGER ZONE                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Reset All Progress]                               │   │
│  │                                                     │   │
│  │  (Dev mode only:)                                   │   │
│  │  Speed: [1x ▼]  [Grant $500k] [Unlock All]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 21. Unlock Hint Visual Improvements

**Current State:**

- Simple progress bar
- Text labels only
- No visual indication of "how close"

**Recommendations:**

#### Enhanced Unlock Hints

```
Standard:
┌─────────────────────────────────────────┐
│  NEXT UNLOCK: Career Tab                │
│                                         │
│  Buy 3 more watches                     │
│                                         │
│  [████████████░░░░░░░░░░░░░░] 45%      │
│                                         │
│  Current: 2 / Needed: 5                 │
│                                         │
│  [Go to Catalog]                        │
└─────────────────────────────────────────┘

Close to Unlock (80%+):
┌─────────────────────────────────────────┐
│  🔓 ALMOST UNLOCKED: Career Tab         │
│                                         │
│  Just 1 more watch!                     │
│                                         │
│  [████████████████████░░░░░] 80%       │
│   ↑ pulsing glow                        │
│                                         │
│  Current: 4 / Needed: 5                 │
│                                         │
│  [Go to Catalog →]                      │
└─────────────────────────────────────────┘
```

---

### 22. Stats Tab Enhancements

**Current State:**

- Basic grid of numbers
- Rate breakdown in collapsible details
- Journal section shows lore

**Recommendations:**

#### Visual Stats Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  VAULT STATS                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CURRENT STATUS                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   😊 45,678    💰 $12,345    ⏱️ 2h 34m            │   │
│  │                                                     │   │
│  │   +45/s        +$12/s         This run            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  RATE BREAKDOWN                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Enjoyment Rate (45/s)                              │   │
│  │  [████████████████████████████████████░░░░░░░░░░]  │   │
│  │  Base: 30 | Events: +15                             │   │
│  │                                                     │   │
│  │  Cash Rate ($12/s)                                  │   │
│  │  [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░]  │   │
│  │  Base: $5 | Salary: $5 | Events: +$2               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  THIS RUN                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Time: 2h 34m          Watches bought: 12           │   │
│  │  Enjoyment earned: 45k Sessions run: 8              │   │
│  │  Cash earned: $12k     Best session: $450          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LIFETIME                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Total resets: 5         Total watches: 156         │   │
│  │  Total enjoyment: 1.2M   Total cash: $340k          │   │
│  │  Best run: 4h 12m        Achievements: 23/45        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  COLLECTION                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Unique watches: 12/45    [░░░░░░░░░░░░░░░░░░░░]   │   │
│  │  Catalog discovered: 23/60 [████████████████░░░░]  │   │
│  │  Tier bonuses: 3/5        [████████████░░░░░░░░░░] │   │
│  │  Set bonuses active: 2                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [View Full Report]  [Export Stats]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 23. Coachmarks Redesign

**Current State:**

- Simple cards with title/text
- Dismiss button
- Stacked in a panel

**Recommendations:**

#### Interactive Coachmarks

```
Option A: Inline Highlights
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  CATALOG SHOP                   │   │
│  │                                 │   │
│  │  [Watch] [Watch] [Watch]       │   │
│  │                                 │   │
│  │  💡 Buy watches here to grow   │   │ ← Inline tip
│  │     your collection            │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

Option B: Spotlight Tour
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  CATALOG SHOP                   │   │
│  │  ╔═══════════════════════════╗  │   │ ← Highlighted
│  │  ║ [Watch] [Watch] [Watch]   ║  │   │
│  │  ╚═══════════════════════════╝  │   │
│  └─────────────────────────────────┘   │
│                                         │
┌─────────────────────────────────────────┐
│  💡 Tip 1 of 5                          │
│                                         │
│  Buy watches in the Catalog to grow     │
│  your collection and generate           │
│  enjoyment.                             │
│                                         │
│  [Skip Tour]  [Next →]                  │
└─────────────────────────────────────────┘
```

---

### 24. Event Notification System

**Current State:**

- Events shown in a list
- No active notification when events start/end
- Current multiplier shown but not prominent

**Recommendations:**

#### Event Notifications

```
Event Start:
┌─────────────────────────────────────────┐
│  ⚡ EVENT STARTED                       │
│                                         │
│  "Weekend Windfall"                     │
│  +1.5x income for 2 hours               │
│                                         │
│  [Dismiss]                              │
└─────────────────────────────────────────┘

Active Event Banner:
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Weekend Windfall active · 1:45:32 remaining · +1.5x    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Rest of game UI...]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Event End:
┌─────────────────────────────────────────┐
│  ✓ Event ended                          │
│                                         │
│  "Weekend Windfall" has ended.          │
│  You earned an extra $4,567!            │
│                                         │
│  [Dismiss]                              │
└─────────────────────────────────────────┘
```

---

### 25. Data Visualization Ideas

**Collection Growth Chart:**

```
Your Collection Over Time:

Enjoyment
  │
45k ┤                    ╭────
    │                 ╭──╯
30k ┤              ╭──╯
    │           ╭──╯
15k ┤        ╭──╯
    │     ╭──╯
 0k ┼────╯
    └──────────────────────
      1h   2h   3h   4h   Time
```

**Currency Flow Diagram:**

```
┌──────────┐    generates    ┌──────────┐
│  Watches │ ───────────────→│ Enjoyment│
└──────────┘                 └────┬─────┘
                                  │
                                  │ spent on
                                  ▼
┌──────────┐    generates    ┌──────────┐
│   Cash   │←────────────────│ Sessions │
└────┬─────┘                 └──────────┘
     │
     │ spent on
     ▼
┌──────────┐
│  Watches │
└──────────┘
```

---

## Micro-Interaction Ideas

### Button Hover States

```css
/* Current: Simple lift */
button:hover {
  transform: translateY(-1px);
}

/* Enhanced: Glow + lift */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(232, 198, 147, 0.3);
}

/* Primary action emphasis */
button.primary:hover {
  background: linear-gradient(135deg, #f6f1e8, #ffffff);
  box-shadow: 0 8px 25px rgba(232, 198, 147, 0.4);
}
```

### Number Ticking Animation

```
When rate changes:

Before: +45/s
During: +46/s (brief highlight/glow)
After:  +46/s
```

### Card Purchase Animation

```
When buying a watch:

1. Card flashes gold
2. "Owned" count increments with pop
3. Duplicate multiplier updates
4. Confetti (subtle) for milestone purchases
```

### Progress Bar Animations

```
When progress increases:

[████████░░░░░░░░░░] 45%
        ↓
[██████████░░░░░░░░] 50%
        ↑
   Smooth fill animation
   Color pulse when segment complete
```

---

## Accessibility Enhancements

### Screen Reader Improvements

**Current Gaps:**

- Rate changes not announced
- Purchase success not announced
- Tab changes not announced

**Recommendations:**

```jsx
// Live region for rate changes
<div aria-live="polite" aria-atomic="true" className="visually-hidden">
  {rateChanged && `Enjoyment rate increased to ${newRate} per second`}
</div>

// Live region for purchases
<div aria-live="assertive" aria-atomic="true" className="visually-hidden">
  {purchaseMade && `Purchased ${watchName}. Now owned: ${count}`}
</div>

// Tab change announcement
<div aria-live="polite" className="visually-hidden">
  {`Now viewing ${activeTabName} tab`}
</div>
```

### Focus Management

```
Modal opens:
  ↓
Focus moves to modal title
  ↓
Tab cycles within modal
  ↓
Modal closes:
  ↓
Focus returns to trigger button
```

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  .card {
    border: 2px solid currentColor;
  }

  .button {
    border: 2px solid currentColor;
  }

  .muted {
    opacity: 1;
    color: #666;
  }
}
```

---

## Additional Quick Wins

### 26. Consistent Iconography

Add icons throughout for faster scanning:

```
Tabs:
[🏛️ Vault] [📖 Catalog] [💼 Career] [🔄 Prestige] [📊 Progress] [⚙️ Save]

Stats:
😊 Enjoyment
💰 Cash
⏱️ Time
📈 Rate
🎯 Goals
🏆 Achievements

Actions:
[🛒 Buy] [🔧 Interact] [🔨 Dismantle] [⏩ Run Session]
```

### 27. Keyboard Shortcuts

Power-user features:

| Key   | Action                             |
| ----- | ---------------------------------- |
| 1-7   | Switch tabs                        |
| B     | Buy max of selected watch          |
| Space | Run therapy session (if available) |
| I     | Interact with selected watch       |
| Esc   | Close modals                       |
| ?     | Open help                          |
| /     | Focus search                       |

### 28. Compact Mode

For experienced players who want density:

```
[✓] Compact mode

Effects:
- Hide card descriptions
- Smaller padding
- Collapse all sections by default
- Show only essential stats
```

### 29. Rate Change History

Show recent rate changes:

```
Recent Changes:
• +5/s from buying Rolex Submariner (2m ago)
• +2/s from event "Weekend Windfall" starting (15m ago)
• +10/s from unlocking tier bonus (1h ago)
```

### 30. Collection Value Visualization

Show collection growing:

```
Collection Value: $89,012

[████████████████████░░░░░░░░░░░░░░░░░░░░] 23%

Next milestone: $100k (Archive Guide unlock)
```

---

_Additional ideas added after deeper component analysis._
