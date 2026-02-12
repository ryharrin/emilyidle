# Interface Design System

## Product Direction
- Product: Emily Idle (watch-collection incremental game).
- Feel: precision instrument + collector lounge.
- UX goal: one-glance decision making for short sessions, with premium but calm density.
- Signature elements:
  - Caliber Blueprint Upgrade Map
  - Vault Drawer Navigation
  - Complication Stack Header

## Visual Language
- Palette foundation: gunmetal, deep navy glass, brushed steel neutrals.
- Accent palette: restrained champagne + lume-mint/cool-cyan only for actionable status.
- Avoid bright multicolor accents and generic SaaS gradient behavior.

## Depth Strategy
- Strategy: borders-first with subtle layered surfaces.
- Do not rely on heavy floating shadows for hierarchy.
- Elevation temperatures:
  - Canvas/nav shell: darkest neutral surface
  - Primary cards/panels: +1 lightness step
  - Interactive controls/chips/modules: +2 lightness step with crisp border contrast

## Spacing and Rhythm
- Base unit: 8px.
- Micro rhythm: 4px for dense instrument internals.
- Typical scales:
  - Internal compact blocks: 8-10px
  - Component spacing: 12-16px
  - Section spacing: 20-24px

## Typography
- Keep project typography stack for consistency.
- Express hierarchy through case, weight, tracking, and spacing.
- Use uppercase micro-labels for instrument metadata.
- Keep values/readouts stronger than labels.

## Reusable Component Patterns
- Vault Drawer Navigation:
  - Keep role/name contracts for tabs unchanged for tests and accessibility.
  - Use grouped drawer-style tabs in a shared rail container with subtle track texture.
  - Bucket language: Vault (primary), Atelier (progression), Ledger (system).
- Complication Stack Header:
  - Four compact modules for immediate context:
    - Power reserve (run value/cost)
    - Chronograph (cooldown readiness)
    - Date wheel (next unlock)
    - Moonphase (salary cycle state)
  - Keep module internals dense and scannable: label, value, detail.
- Career surface structure:
  - Preserve Now/Next/Deep layout.
  - Complication stack belongs in the panel header, before detailed cards.
- Overlay System (modals/help/minigames):
  - Use shared shell + card treatment (`overlay-*` + `modal-panel-*`) instead of one-off modal styling.
  - Keep dialog hierarchy dense: micro-label -> title -> short descriptor -> action rail.
  - Keep mini-game readouts instrument-like via compact strips and bordered inset bodies.
- Toast System:
  - Single visible toast in a stacked rail with queue badge for additional notifications.
  - Left accent rail communicates tone (`neutral/info/success/warning/critical`).
  - Keep copy compact: eyebrow, title, message, optional detail.
- Panel Cluster Surfaces:
  - Use cluster wrappers (`panel-cluster-*`) for collection insights, compare, and career stage cards.
  - Keep shared surface rhythm: 14-18px radius, border-led depth, restrained gradients from same hue family.
  - Use active state accents only for meaningful availability/selection signals.
- Career "Now" Focus Cluster:
  - Keep desktop split with a stronger `now` rail (`~416px`) against deep canvas content to signal action priority.
  - Treat the top "next action" card as focal: larger interior padding, stronger champagne border/gradient, and calmer surrounding cards.
  - Add a thin left accent rail on the focal card to reinforce "start here" priority without heavy shadows.
  - Use a subtle top-right radial highlight on the focal card instead of dramatic drop shadows.
  - Build the session value snapshot as instrument tiles (`minmax(144px, 1fr)`), each with micro-label + stronger readout.
  - Promote `Session cash` as the hero metric tile (spans two columns on desktop; reverts to one column on mobile).
  - Keep salary window and near-term unlock as separate inset strips with uppercase micro-labels and muted detail lines.
  - Preserve quiet interactive feedback on snapshot tiles through border/background hover shifts (no heavy lift shadows).
  - Keep secondary guidance as an inset hint strip and separate action controls with a thin divider for scanability.
  - Keep this cluster on a strict 4px rhythm for padding/gaps to maintain instrument-panel precision.
- Career Blueprint Canvas:
  - Add compact HUD/legend instruments directly on map/upgrades viewport.
  - Keep node chips/tiers/status readable at a glance without changing progression logic.
  - Preserve pan/zoom controls and existing test anchors.

## Motion
- Keep transitions short and subtle (no springy movement).
- Prioritize state clarity over decorative animation.

## Responsive Rules
- Maintain compact readability on mobile.
- Preserve sticky action rail behavior in Career compact mode.
- Prevent tab rail overflow from feeling clipped by preserving edge gradients and snap behavior.
- Collapse modal action rails to full-width controls on narrow viewports.
- Collapse panel clusters to single-column stacks at tablet widths.

## Implementation Guardrails
- Keep `data-testid` anchors stable unless tests are intentionally updated.
- Keep ARIA tab semantics stable.
- Extend existing component styles instead of introducing unrelated visual systems.
