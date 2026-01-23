# Phase 14: Therapist Career Economy - Research

**Researched:** 2026-01-22
**Domain:** Idle/incremental game economy design (secondary career loop as cash generator)
**Confidence:** MEDIUM

<research_summary>
## Summary

Phase 14 introduces a secondary cash generator (therapist career) alongside the primary enjoyment economy. The recurring guidance across idle economy sources is to treat every currency as a faucet-and-drain loop and to structure progression as a value chain rather than a single-step faucet. For a therapist career loop, that means cash should come from a multi-step chain (training -> sessions -> reputation -> higher-tier clients) with clear sinks (licensure costs, overhead, burnout recovery) so the cash stream does not overwhelm the enjoyment loop.

Additional themes emphasize pacing and reengagement: layered clocks (short session cycles plus longer-term reputation/certification arcs) keep players checking in without forcing long idle gaps. Inflation control is a first-class design requirement, so costs should scale with output or adopt soft caps to maintain meaningful choices.

**Primary recommendation:** Model therapist income as a value chain with explicit sinks and pacing clocks, and keep its role distinct from enjoyment so it contributes to progression without replacing it.
</research_summary>

<standard_stack>
## Standard Stack

Phase 14 is economy + loop design inside the existing game. There is no mandatory external library, but the following are commonly used in idle-economy work.

### Core (this repo)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.3.1 | UI rendering | Mature, stable React UI |
| vite | 6.0.0 | Build/dev server | Fast modern build pipeline |
| typescript | 5.8.0 | Type safety | Prevents economy regressions |
| vitest | 1.6.0 | Unit tests | Fast feedback for economy math |
| @playwright/test | 1.49.1 | E2E tests | Protects UI selectors + flows |

### Supporting (common for incremental economies)
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| Spreadsheets (Google Sheets/Excel) | N/A | Model progression curves | Any time you tweak rates/cost growth |
| decimal.js | 10.6.0 | Accurate decimal arithmetic | If you need exact decimals or soft caps |
| bignumber.js | 9.3.1 | Arbitrary-precision arithmetic | Alternative for large or precise values |
| big.js | 7.0.1 | Smaller arbitrary-precision decimals | If you want precision with a smaller lib |
| break_infinity.js | 2.2.0 | Huge numbers for incrementals | If values exceed JS Number range |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| decimal.js | break_infinity.js | break_infinity favors huge magnitudes over accuracy |
| bignumber.js | big.js | big.js is smaller but less feature-complete |

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

### Pattern 1: Value-Chain Career Loop
**What:** Structure the career as a multi-step conversion chain rather than a single faucet.
**When to use:** When adding a secondary income source that should stay distinct from enjoyment.
**Example (conceptual):**
```text
1. Training investment -> unlock session types
2. Sessions -> reputation gain
3. Reputation -> higher-tier clients
4. Higher-tier clients -> increased cash rate
```
Source: https://lostgarden.com/2021/12/12/value-chains/

### Pattern 2: Faucet-and-Drain Currency Model
**What:** Treat therapist cash as a faucet with explicit drains that scale.
**When to use:** Any time new currency is introduced.
**Example sinks:** licensure, clinic overhead, burnout recovery, continuing education.
Source: https://machinations.io/articles/what-is-game-economy-inflation-how-to-foresee-it-and-how-to-overcome-it-in-your-game-design

### Pattern 3: Reengagement Clocks
**What:** Layer short session timers with longer-term reputation or certification clocks.
**When to use:** Idle systems with both active and passive play expectations.
**Example (conceptual):**
```text
Short: 1-5 minute session cycle
Long: 1-3 hour certification progress
```
Source: https://adriancrook.com/passive-resource-systems-in-idle-games/

### Anti-Patterns to Avoid
- **Single-step faucet:** Session -> cash without gates inflates quickly and loses meaning.
- **No scaling sinks:** Flat costs become irrelevant once the cash rate increases.
- **Redundant currency:** If therapist cash is interchangeable with enjoyment, players ignore it.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but tend to accumulate edge cases:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Large number arithmetic | Custom math | break_infinity.js | Handles idle-style magnitudes safely |
| Exact decimal arithmetic | Floating point math | decimal.js / big.js | Avoid rounding surprises in rates |
| Economy tuning | "adjust constants" only | Spreadsheet modeling | Makes pacing cliffs visible |

**Key insight:** Career loops are balancing problems first, math problems second; spreadsheet-first modeling makes cash/enjoyment interplay visible early.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Inflation from unchecked faucets
**What goes wrong:** Cash rate outpaces sinks; upgrades become trivial.
**Why it happens:** Career loop creates income without scaling drains.
**How to avoid:** Tie drains to output or progression tiers.
Source: https://machinations.io/articles/what-is-game-economy-inflation-how-to-foresee-it-and-how-to-overcome-it-in-your-game-design

### Pitfall 2: Secondary currency without a role
**What goes wrong:** Players ignore therapist cash because it does not unlock anything unique.
**Why it happens:** Currency is effectively a denomination, not a strategic choice.
**How to avoid:** Give therapist cash distinct upgrades or gates.
Source: https://ericguan.substack.com/p/idle-game-design-principles

### Pitfall 3: Reengagement gaps too long
**What goes wrong:** Players idle for too long with no meaningful actions.
**Why it happens:** Session cycles are too long, and there are no shorter loops.
**How to avoid:** Add a short session timer layered with longer certifications.
Source: https://adriancrook.com/passive-resource-systems-in-idle-games/
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources (numeric precision libraries):

### Decimal.js: avoid floating point surprises
```js
import Decimal from "decimal.js";

const rate = new Decimal(0.1);
const boosted = rate.plus(0.2); // "0.3"
```
Source: https://github.com/mikemcl/decimal.js
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single faucet idle loops | Value chains with multi-step conversion | Ongoing | More meaningful decisions and pacing |
| Flat upgrade costs | Scaling sinks + soft caps | Ongoing | Inflation control and sustained tension |
| Long idle gaps | Layered reengagement clocks | Ongoing | Higher retention with predictable check-ins |

**Deprecated/outdated (in practice):**
- Treating secondary currencies as pure denominations rather than distinct choice-making tools.
</sota_updates>

<open_questions>
## Open Questions

1. **What role does therapist cash play in the enjoyment loop?**
   - Direct upgrades, gating, or optional boosts?
2. **What is the target reengagement cadence?**
   - Minutes for sessions vs hours for certifications?
3. **Which sinks scale with career output?**
   - Overhead, burnout recovery, or reputation decay?
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- https://lostgarden.com/2021/12/12/value-chains/ - value chains and conversion framing
- https://machinations.io/articles/idle-games-and-how-to-design-them - idle design patterns and pacing
- https://machinations.io/articles/what-is-game-economy-inflation-how-to-foresee-it-and-how-to-overcome-it-in-your-game-design - inflation control and sink design

### Secondary (MEDIUM confidence)
- https://ericguan.substack.com/p/idle-game-design-principles - reengagement clocks, multi-currency roles
- https://adriancrook.com/passive-resource-systems-in-idle-games/ - passive resource system pacing
- https://blog.kongregate.com/the-math-of-idle-games-part-iii/ - exponential growth and balancing considerations

### Tertiary (LOW confidence - needs validation)
- /mikemcl/decimal.js - Context7 docs for decimal.js usage
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: TypeScript/React incremental game implementation
- Ecosystem: numeric precision + spreadsheet modeling
- Patterns: value chains, faucet/drain loops, reengagement clocks, inflation control
- Pitfalls: inflation, redundant currency, idle gaps

**Confidence breakdown:**
- Standard stack: HIGH - based on repo package versions + common tooling
- Architecture: MEDIUM - design sources are consistent but generalized
- Pitfalls: MEDIUM - broad guidance, not phase-specific telemetry
- Code examples: HIGH - from official library docs

**Research date:** 2026-01-22
**Valid until:** 2026-02-21 (30 days)
</metadata>

---

*Phase: 14-therapist-career-economy*
*Research completed: 2026-01-22*
*Ready for planning: yes*
