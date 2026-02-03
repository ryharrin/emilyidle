# Phase 42 Research — Winding Refresh

## Goal

- Make the winding interaction feel more tactile by exposing real-time tension/band state, animating the crown and track, and ensuring the UI keeps pace with player input on both mouse and touch.
## Current context

- `App.tsx` opens `WindingMiniGameModal` when the player taps a winding interaction, and the modal already renders a crown, progress track, and stop button based on `useWindingRun`.
- `useWindingRun` runs a RAF loop for `progress01`, calculates a `WindingBand`, and exposes `progress`, `crownAngle`, and `tension` plus a `stop` helper.
- `WindingCrown` currently relies on CSS classes (`winding-crown-{band}` and `winding-crown-phase-{phase}`) for styling, with the visual polish handled in `src/style.css`.
- Existing CSS defines static colors for the track bands and the crown glow, but it does not animate in response to velocity or share explicit progress metadata with the DOM.

## Observations

- Band thresholds are still defined in `src/ui/components/winding/windingMath.ts`, and tests live in `tests/winding-bands.unit.test.ts`.
- `tests/winding-modal-a11y.unit.test.tsx` already proves the modal traps focus, updates its live region, and closes on Escape.
- Winding assets (crown, track segments, indicator) are all in `src/style.css` under the winding section, so the visual refresh is scoped to a few selectors.

## Opportunities

- Surface a band legend, highlight the current band, and show tension percentages live so the player can see what part of the track they are courting.
- Animate the crown and track using velocity/tension telemetry derived from `useWindingRun` so the UI looks reactive instead of static.
- Ensure the new visuals respect reduced-motion preferences and maintain 44px touch targets for mobile (the track is already a button, but height can be increased).
- Capture the new behavior with targeted unit tests for the math helpers and the modal presentation so we can guard the refreshed UX.

## Research outcome

- Winding will need a state/prop update from `useWindingRun` to tell the UI about momentum.
- The modal should derive a legend, live message, and velocity-tuned glows from that data.
- CSS updates should introduce animations/pulses tied to the new CSS variables.
- Tests should assert the legend, live text, and band math remain stable.
