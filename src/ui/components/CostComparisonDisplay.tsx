import { CONSECUTIVE_CONFIG } from '../../game/constants'

function formatDuration(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function CostComparisonDisplay(props: {
  baseCost: number
  scaledCost: number
  multiplier: number
  decayRemainingMs: number
}) {
  const premium = Math.max(0, props.scaledCost - props.baseCost)
  const percent = Math.max(0, Math.round((props.multiplier - 1) * 100))
  const activeCount = Math.max(
    0,
    Math.round(
      (props.multiplier - CONSECUTIVE_CONFIG.BASE_MULTIPLIER) / CONSECUTIVE_CONFIG.MULTIPLIER_INCREMENT,
    ),
  )
  const totalDecayMs = activeCount * CONSECUTIVE_CONFIG.DECAY_INTERVAL_MS
  const decayProgress =
    totalDecayMs > 0
      ? Math.max(0, Math.min(1, (totalDecayMs - props.decayRemainingMs) / totalDecayMs))
      : 1

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ fontWeight: 700 }}>
        Cost: {props.scaledCost} enjoyment
      </div>
      <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>
        Base: {props.baseCost} | Premium: +{premium} ({percent > 0 ? `+${percent}%` : 'base'})
      </div>
      {props.decayRemainingMs > 0 ? (
        <>
          <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>
            Returns to base in {formatDuration(props.decayRemainingMs)}
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              border: '1px solid var(--color-border)',
              background: 'rgba(255, 253, 249, 0.7)',
              overflow: 'hidden',
            }}
            role="progressbar"
            aria-label="Consecutive decay progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(decayProgress * 100)}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(decayProgress * 100)}%`,
                background: 'rgba(201, 146, 122, 0.72)',
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
