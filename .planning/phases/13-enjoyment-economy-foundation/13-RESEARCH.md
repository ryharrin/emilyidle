# Phase 13: Enjoyment Economy Foundation - Research

**Researched:** 2026-01-22
**Domain:** Idle/incremental game economy design (multiple currencies, tier-based production rates, prestige scaling)
**Confidence:** MEDIUM

<research_summary>
## Summary

Phase 13's goal ("shift core currency to enjoyment with watch tier modifiers") is a classic incremental/idle design move: make the primary resource come from explicit production sources (owned generators) rather than being derived from a proxy (e.g. total value). In practice this tends to improve player comprehension ("this watch makes X/sec") and gives you more levers for pacing, sinks, and reengagement.

Three repeated themes across economy design references:

- Treat every currency as a faucet-and-drain loop: if a currency is only a faucet (income) without meaningful drains (spending) it inflates and stops feeling valuable.
- Use exponential growth for progression but counterbalance it with exponential costs or other diminishing-return mechanisms, so players continue to "feel" progress while it slows down over time.
- When the game is client-only, security is inherently limited; the practical objective is to avoid trivial exploits and keep state validation and persistence predictable.

**Primary recommendation:** Keep enjoyment as a first-class, per-item production rate with clear sinks; avoid deriving it from collection value.
</research_summary>

<standard_stack>
## Standard Stack

This phase is primarily design + internal implementation; there is no "must-have" external library for enjoyment tiers specifically. The stack below is what experts commonly use around incremental-economy work.

### Core (this repo)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.3.1 | UI rendering | Mature, stable React UI |
| vite | 6.0.0 | Build/dev server | Fast modern build pipeline |
| typescript | 5.8.0 | Type safety | Prevents state/economy regressions |
| vitest | 1.6.0 | Unit tests | Fast feedback for economy math |
| @playwright/test | 1.49.1 | E2E tests | Protects UI selectors + flows |

### Supporting (common for incremental economies)
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| Spreadsheets (Google Sheets/Excel) | N/A | Model progression curves | Any time you tweak rates/cost growth |
| decimal.js | 10.6.0 | Accurate decimal arithmetic | If you need exact decimals (non-integer cents, rounding rules) |
| bignumber.js | 9.3.1 | Arbitrary-precision arithmetic | Similar to decimal.js; commonly used in finance-ish calcs |
| big.js | 7.0.1 | Smaller/faster arbitrary-precision decimals | If you need precision with a smaller library |
| break_infinity.js | 2.2.0 | Huge numbers for incrementals (speed over accuracy) | If numbers exceed JS Number range or you want idle-game style huge magnitudes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| decimal.js | break_infinity.js | break_infinity prioritizes speed and huge magnitudes, but trades off accuracy (per docs) |
| big.js | bignumber.js | bignumber.js is more feature-complete; big.js is smaller |

**Installation (optional numeric libs):**
```bash
npm install decimal.js
npm install bignumber.js
npm install big.js
npm install break_infinity.js
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure (matches this repo)
```
src/
├── game/state.ts         # data-driven item defs + selectors (rates, thresholds)
├── game/sim.ts           # deterministic tick loop
├── game/persistence.ts   # save/load + migrations
└── App.tsx               # UI that displays derived state
tests/                    # unit + e2e tests
```

### Pattern 1: Faucet-and-Drain Currency Model
**What:** Model each currency as "sources (faucets)" and "sinks (drains)" and track whether it stays "tight" (valuable).
**When to use:** Any time you introduce a new currency (like enjoyment) or repurpose an existing one.
**Example (text model from Lostgarden):**
```text
1. *Generate* (owned watch count, time) -> +enjoyment
2. *Spend* (-enjoyment) -> +watch purchase / unlock / upgrade
3. Watch purchase -> Collection fantasy / completion anchor
```
Source: https://lostgarden.com/2021/12/12/value-chains/

### Pattern 2: Exponential Growth + Exponential Costs (feel progress, slow pacing)
**What:** Use exponential multipliers for production and exponential growth for prices.
**When to use:** Standard idle loop: "earn -> invest -> earn faster".
**Example (principle):**
```text
production_next = production * 1.10
cost_next = cost * 1.15
```
Source: https://ericguan.substack.com/p/idle-game-design-principles

### Pattern 3: Prestige As Fractional Exponent (resets that rein in numbers)
**What:** Convert large accumulated progress into a slower-growing prestige currency using a root / fractional exponent.
**When to use:** When the main numbers grow too large or you want "ladder climbing" resets.
**Example (conceptual):**
```text
prestige_points = (lifetime_currency / scale)^(1/k)
```
Source: https://blog.kongregate.com/the-math-of-idle-games-part-iii/

### Anti-Patterns to Avoid
- **Derived currency with no per-item attribution:** Players can't form accurate mental models; harder to balance sinks per tier.
- **Currency without sinks (inflation):** Players stop caring; choices disappear ("everything is affordable").
- **Letting derived/calculated values leak into persistence:** Save files get brittle and migrations get hard.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but tend to accumulate edge cases:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Huge number arithmetic | Custom mantissa/exponent math | break_infinity.js | Designed for incremental games; handles magnitudes beyond JS Number (per docs) |
| Exact decimal arithmetic | "just use float" | decimal.js / big.js / bignumber.js | Avoids floating point surprises (e.g. 0.1 + 0.2 != 0.3) |
| Economy tuning | "tweak constants in code" only | Spreadsheets + baseline targets | Faster iteration, helps prevent pacing cliffs |

**Key insight:** In incrementals, economy problems often look like "math bugs" but are really modeling problems; spreadsheet-driven modeling makes these problems visible early.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Inflation / "currency isn't tight"
**What goes wrong:** Currency becomes abundant enough that there are no meaningful decisions.
**Why it happens:** Faucets outpace drains; sinks don't scale.
**How to avoid:** Design explicit drains and keep them relevant at each tier.
**Warning signs:** Players accumulate huge balances and stop engaging with parts of the loop.
Source: https://mobilefreetoplay.com/bible/building-lasting-free-play-economy/

### Pitfall 2: Multiple currencies that are just denominations
**What goes wrong:** Extra currencies add confusion without adding strategy.
**Why it happens:** Currencies don't gate different choices; they're interchangeable.
**How to avoid:** Make currencies specialize different playstyles/time horizons (short vs long reengagement clocks).
**Warning signs:** Players ask "why do I have currency X?".
Source: https://ericguan.substack.com/p/idle-game-design-principles

### Pitfall 3: Client-only exploitability (especially localStorage)
**What goes wrong:** Players can trivially call global functions or edit localStorage to cheat.
**Why it happens:** Public functions/state on window; unverified save payloads.
**How to avoid:** Keep internals out of global scope; validate persisted state; treat client-only security as best-effort.
**Warning signs:** Console cheats become common; save payloads are easily edited.
Source: https://seiyria.com/javascript%2C/incremental/2015/04/23/common-pitfalls-js.html
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources (numeric precision libraries):

### Decimal.js: avoid floating point surprises
```js
import Decimal from "decimal.js";

const x = new Decimal(0.1);
const y = x.plus(0.2); // "0.3"
```
Source: https://github.com/mikemcl/decimal.js

### break_infinity.js: incremental-style large number type
```js
import Decimal from "break_infinity.js";

const x = new Decimal("1.23456789e987654321");
const y = x.times(3).plus(10).floor();
```
Source: https://patashu.github.io/break_infinity.js/index.html
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Single currency" incrementals | Multiple currencies with distinct roles | Ongoing | More strategic allocation and pacing control |
| "Bigger denominations" currencies | Currencies aligned to playstyles/clocks | Ongoing | Better retention for different reengagement patterns |
| Hand-rolled huge numbers | break_infinity.js / break_eternity.js family | 2017+ | Less time spent on numeric corner cases |

**Deprecated/outdated (in practice):**
- Treating floating point as "good enough" once values get very large or very small; precision bugs show up in display thresholds and balance checks.
</sota_updates>

<open_questions>
## Open Questions

1. **When do we need big-number arithmetic?**
   - What we know: Current code uses integer cents and JS Numbers.
   - What's unclear: Future phases may push values beyond safe integer / display ranges.
   - Recommendation: Add a check during planning for Phase 15+ (dual-currency acquisition) to decide whether to stay in cents or adopt a big-number lib.

2. **What are the long-term enjoyment sinks?**
   - What we know: Phase 13 makes enjoyment income explicit.
   - What's unclear: Subsequent phases should define how enjoyment is spent/gated so it stays tight.
   - Recommendation: In Phase 15 planning, explicitly list enjoyment drains per tier (watch purchases, unlocks, upgrades) and verify affordability curves.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- https://blog.kongregate.com/the-math-of-idle-games-part-iii/ - prestige loop math and design implications
- https://lostgarden.com/2021/12/12/value-chains/ - value chain + faucet/drain economy modeling
- https://patashu.github.io/break_infinity.js/index.html - break_infinity.js docs and rationale
- /mikemcl/decimal.js - Context7 docs: constructor, plus(), times(), set() configuration

### Secondary (MEDIUM confidence)
- https://ericguan.substack.com/p/idle-game-design-principles - reengagement clocks, multi-currency design heuristics
- https://mobilefreetoplay.com/bible/building-lasting-free-play-economy/ - currency "tightness" and inflation framing
- https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook - broad economy concepts and terminology

### Tertiary (LOW confidence - needs validation)
- https://media.gdcvault.com/gdceurope2016/presentations/Pecorella_Anthony_Quest%20for%20Progress.pdf - referenced for deeper detail, not fully extracted in-session
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: TypeScript/React incremental game implementation
- Ecosystem: numeric precision and big-number libraries; spreadsheet-based modeling
- Patterns: faucet/drain/value-chain, exponential growth/costs, prestige via root
- Pitfalls: inflation, confusing currencies, client-only exploitability

**Confidence breakdown:**
- Standard stack: HIGH - based on repo package versions + npm version checks
- Architecture: MEDIUM - mix of established design writing and repo-specific patterns
- Pitfalls: MEDIUM - sources are credible but not all are formal/peer-reviewed
- Code examples: HIGH - from official library docs

**Research date:** 2026-01-22
**Valid until:** 2026-02-21 (30 days)
</metadata>

---

*Phase: 13-enjoyment-economy-foundation*
*Research completed: 2026-01-22*
*Ready for planning: yes (note: Phase 13 is already implemented; this research primarily informs Phase 14-15 decisions)*
