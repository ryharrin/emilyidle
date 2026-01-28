# Draft: Phase 27 (Career-First Economy & Upgrades Surface)

## Phase Boundary (from ROADMAP.md)

- Rework cash generation to align with a career-first economy.
- Ensure owning watches does not create a parallel cash faucet.
- Therapist sessions: first session costs 0 enjoyment; subsequent sessions spend enjoyment; rule visible before committing.
- Upgrades are accessible from a dedicated surface/tab separate from the catalog purchase flow.
- Before buying an upgrade, user can see the effect it will have on cash/enjoyment rates.

## Decisions (confirmed)

### Career path & progression surface

- Specialization model: multiple specializations over time.
- Timing: first meaningful specialization choice happens after a few levels.
- Respec policy: free respec (encourage experimentation).
- Presentation: progression tree UI.
- Tracks: start with 3 tracks.
- Track set (names + session policy):
  - Private practice: has sessions (cash burst).
  - VA Hospital: salary-only (no sessions).
  - Research/Teaching: salary-only (no sessions).
- Active model: one active specialization at a time (switchable).
- Progression: earn/spend points in the tree.
- Benefit emphasis: balanced (some nodes affect salary/cash rate; some affect sessions).

### Cash economy rules

- Primary cash faucet: salary is the primary cash/sec faucet.
- Watches: tiny cash modifier from worn watch is acceptable (but should be clearly secondary).
- Existing non-career cash/sec sources: remove or convert (do not remain as a primary faucet).
- Events: should not affect cash generation.

Notes:

- Session payouts (where they exist) are one-time bursts and should not be averaged into cash/sec.

### Therapist sessions: cost + messaging

- Sessions should have cash payouts for the job titles/specializations that would have them (e.g., private practice).
- Sessions only exist for some tracks (other tracks are salary-only).
- Cash payouts should be treated as burst rewards (separate from cash/sec).
- "First session costs 0 enjoyment": first session after prestige/reset.
- After the free-first session: enjoyment cost scales by active track.
- Cooldown: varies by track.
- Pre-commit messaging: ExplainButton + inline copy (no confirmation modal).
- Unavailable state: disabled button + reason badge (e.g., cooldown / need enjoyment).

### Dedicated Upgrades surface

- Location: new top-level "Upgrades" tab in main navigation.
- Scope: show all upgrades in one place (cash upgrades + Workshop + Maison; any new career-related upgrades too).
- Organization: group by system (Career vs Vault/Cash vs Workshop vs Maison).
- Pre-purchase preview: show delta chips on the card + allow expanding to see more detailed breakdown.

## Research Findings (local codebase)

- Current therapist session is both an enjoyment cost and a cash payout, and there is also therapist salary in cash-rate breakdown.
- Current cash rate includes vault/watch-driven income, multiplicative bonuses, softcap, and event multiplier.
- There is no existing "equipped/worn" watch concept in state today.

UI/pattern references:

- Contextual explanations: `ExplainButton` opens `HelpModal` to a section id (used in `StatsTab`, `CollectionTab`, `NostalgiaTab`).
- Before/after comparison: prestige confirmations via `PrestigeSummary`; rate breakdowns use `<details>` blocks in `StatsTab`.

## Open Questions

- None (Phase 27 decisions locked).
- "First session costs 0 enjoyment": confirm it is first session after prestige/reset (no other periodic resets).
- Therapist session UX: confirm ExplainButton + inline copy is sufficient (no confirmation modal).
- Dedicated Upgrades surface: new top-level tab vs within Career vs other entry point?
- Upgrade organization: categories and ordering; how to show before/after effects (delta vs full breakdown).

## Deferred Ideas (out of scope for Phase 27)

- None captured yet.
