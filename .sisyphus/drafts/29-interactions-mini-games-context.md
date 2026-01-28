# Draft: Phase 29 (Interactions & Mini-Games)

## Phase Boundary (from ROADMAP.md)

- Winding available only for non-automatic watches; automatic watches do not show winding.
- Winding includes a visible winding animation.
- Winding provides clear success/failure cues and communicates rewards.
- Winding is skill/timing-based (player input matters beyond a single button).
- Automatic watches have at least one distinct interaction mini-game and its rewards are communicated.

## Research Findings (local codebase)

- Existing manual interaction: "Wind session" modal in `src/App.tsx` (5 rounds, tension, Steady vs Push), applying rewards via `applyWindSessionRewards` and a manual event `wind-up`.
- Manual event system exists via `activateManualEvent` and `EventId` includes `wind-up`.
- Interaction entry point in UI: "Interact" button on watch cards in `src/ui/tabs/CollectionTab.tsx` calls `onInteract(item.id)`.
- Reward math exists in `src/game/selectors/index.ts` (`getWindSessionCashPayoutCents`, `getWindUpIncomeMultiplierForTension`).
- UI motion is primarily CSS-driven in `src/style.css` (no animation framework; has active/selected styles like `.catalog-tab-active` and badge patterns like `.catalog-badge`).

Additional notes:

- There is no explicit watch attribute for "automatic" vs "manual" today; only 4 watch ids exist (`starter`, `classic`, `chronograph`, `tourbillon`) and "Classic Automatic" is currently just a name string (`src/game/data/items.ts`).
- Current wind-up mini-game is chance-based (Push has a random success) and ends after 5 rounds; it always triggers the same manual event id (`wind-up`).
- Existing motion primitives to reuse: button hover/active transitions, progress fill width transitions, and modal overlay patterns; reduced-motion is handled globally.

## Decisions (confirmed)

### Winding mechanic design

- Input: timing bar (tap when indicator hits a sweet spot).
- Duration per attempt: short (3-5 seconds).
- Failure: partial success (you still get something, but less).
- Skill impact: reward scales with performance (better timing = larger reward).

### Winding rewards & messaging

- Primary reward: enjoyment burst (immediate enjoyment gain).
- Pre-play preview: inline preview on the button (show a reward range).
- Cost/cooldown: cooldown only (no resource cost).
- Outcome messaging: 3 tiers (Miss / Good / Perfect).

### Automatic watch mini-game

- Concept: should relate to a watch getting wound by wearing it (automatic/rotor motion theme); exact mechanic is Claude's discretion.
- Duration per attempt: medium (8-15 seconds).
- Reward: power reserve meter.
- Failure: partial success (always get something; better play yields more).

### Gating + where it appears

- Interaction controls appear in Vault/Collection only.
- When unavailable (cooldown): keep button visible but disabled + show reason.

Additional gating decisions:

- Interactions are available for any owned eligible watch (not restricted to the worn watch).
- Cooldown feel: per-watch cooldown.
- Button labels should change by interaction type (not generic "Interact").
- Quartz interaction concept: a mini-game based on setting the time.

## Open Questions

- Mapping/gating: user wants "starter" to be treated as Quartz, and "classic" to be manual; also wants an "automatic" level/category.
  - Note: adding/renaming watch tiers is likely a separate earlier-phase concern; Phase 29 needs a movement-type gate regardless.
- Winding: whether to replace the existing 5-round Steady/Push model entirely, or keep any of its flavor.
- Winding: whether to replace the existing 5-round Steady/Push model entirely, or keep any of its flavor.
- Automatic mini-game: decide what the "different reward" is (e.g., short-lived enjoyment multiplier, power-reserve style buff, etc.).
- Gating: decide whether Quartz gets any interaction in Phase 29.
- Quartz time-setting mini-game: decide reward type + whether it uses the same Miss/Good/Perfect tiering.
- Automatic power reserve meter: decide how it behaves (duration vs drain; how it displays).
- Where interactions surface: Vault/Collection only vs also Catalog; how to message gating and why an action is unavailable.

## Scope Boundaries

- INCLUDE: winding + automatic interaction mini-game(s) with clear UI feedback.
- EXCLUDE: wear-one bonus (Phase 28), workshop/atelier UX revamp/docs (Phase 30).
