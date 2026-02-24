import { CostComparisonDisplay } from './CostComparisonDisplay'

const WARNING_STYLES: Record<'none' | 'caution' | 'warning' | 'critical', string> = {
  none: 'rgba(42, 109, 176, 0.12)',
  caution: 'rgba(245, 158, 11, 0.14)',
  warning: 'rgba(249, 115, 22, 0.16)',
  critical: 'rgba(239, 68, 68, 0.18)',
}

export function ConsecutiveSessionIndicator(props: {
  current: number
  max: number
  warningLevel: 'none' | 'caution' | 'warning' | 'critical'
  baseCost: number
  scaledCost: number
  multiplier: number
  decayRemainingMs: number
}) {
  if (props.current <= 0) return null

  return (
    <article
      style={{
        marginTop: 10,
        padding: 10,
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        background: WARNING_STYLES[props.warningLevel],
      }}
      aria-label="Consecutive session indicator"
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Consecutive Mode - Session {props.current} of {props.max}
      </div>
      <CostComparisonDisplay
        baseCost={props.baseCost}
        scaledCost={props.scaledCost}
        multiplier={props.multiplier}
        decayRemainingMs={props.decayRemainingMs}
      />
    </article>
  )
}
