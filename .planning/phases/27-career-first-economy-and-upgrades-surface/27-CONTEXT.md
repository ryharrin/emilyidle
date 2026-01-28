# Phase 27: Career-First Economy & Upgrades Surface - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 27 delivers a career-first cash economy and a dedicated, transparent upgrades surface:

- Cash economy is career-driven; owning watches should not become a parallel cash faucet.
- Therapist sessions: first session after prestige/reset costs 0 enjoyment; subsequent sessions spend enjoyment; rule is visible before committing.
- Upgrades are accessible from a dedicated surface/tab separate from the catalog purchase flow.
- Before buying an upgrade, the user can see the effect on cash/enjoyment rates.

Out of scope for this phase (handled in later phases): wear-one bonus (Phase 28), interactions/mini-games (Phase 29), Workshop/Atelier UX + help refresh (Phase 30).

</domain>

<decisions>
## Implementation Decisions

### Career progression & specialization
- Specialization approach: multiple specializations over time.
- Start of branching: after a few career levels (not immediately).
- Respec: free respec.
- Presentation: progression tree UI.
- Tracks: start with 3 tracks.
- Track set (names + session policy):
  - Private practice: has sessions (cash burst).
  - VA Hospital: salary-only (no sessions).
  - Research/Teaching: salary-only (no sessions).
- Active model: one active specialization at a time (switchable).
- Progression currency: earn/spend points in the tree.
- Benefit emphasis: balanced (some nodes affect salary/cash rate; some affect sessions).

### Cash economy rules
- Primary cash faucet: salary is the primary cash/sec faucet.
- Existing non-career cash/sec sources: remove or convert (do not remain as a competing faucet).
- Events: should not affect cash generation.
- Watches: a tiny cash modifier from the worn watch is acceptable, but must be clearly secondary.

Notes:
- Session payouts (where they exist) are one-time bursts and should not be averaged into cash/sec.

### Therapist sessions: cost + messaging
- Sessions only exist for some tracks (other tracks are salary-only).
- Tracks with sessions: sessions pay cash as a one-time burst reward.
- "First session costs 0 enjoyment": first session after prestige/reset.
- After the free-first session: enjoyment cost scales by active track.
- Cooldown: varies by track.
- Pre-commit messaging: inline copy + ExplainButton (no confirmation modal).
- Unavailable state: disabled button + reason badge (cooldown / need enjoyment).

### Dedicated Upgrades surface
- Location: new top-level "Upgrades" tab in main navigation.
- Scope: show all upgrades in one place (cash upgrades + Workshop upgrades + Maison upgrades; plus any new career-related upgrades).
- Organization: group by system.
- Pre-purchase preview: delta chips on the card + expand/collapse details for deeper breakdown.

### Claude's Discretion
- Exact look/feel of the delta chips and the expanded breakdown UI (must stay consistent with existing cards/details styling).
- Exact wording of the inline session-cost note (as long as it is visible pre-commit and backed by Help).

</decisions>

<specifics>
## Specific Ideas

- Reuse existing patterns where possible:
  - Rate breakdown UI in `src/ui/tabs/StatsTab.tsx` (`<details>` with base + terms).
  - Before/after preview pattern via prestige confirmation summaries (`PrestigeSummary`).
  - Explain affordance via `ExplainButton` + `HelpModal`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 27 scope.

</deferred>

---

*Phase: 27-career-first-economy-and-upgrades-surface*
*Context gathered: 2026-01-27*
