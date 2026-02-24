import { getWatchById } from '../../game/data/watches'
import type { TrackingPackage } from '../../game/types'
import { estimatedDeliveryTime, trackingProgressPercent } from '../../game/selectors/tracking'
import { TrackingProgressBar } from './TrackingProgressBar'

function formatTimestamp(value?: number): string {
  if (!value) return 'Estimated'
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function TrackingDetailView(props: { tracking: TrackingPackage; nowMs: number }) {
  const watch = getWatchById(props.tracking.watchId)
  const countdown = estimatedDeliveryTime(props.tracking, props.nowMs)
  const progress = trackingProgressPercent(props.tracking, props.nowMs)

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <img
          src={watch?.imageUrl ?? '/catalog/placeholder.png'}
          alt={watch?.name ?? 'Watch'}
          width={130}
          height={98}
          style={{ objectFit: 'cover', borderRadius: 12 }}
        />
        <div style={{ marginTop: 12, fontWeight: 700 }}>{watch?.name ?? props.tracking.watchId}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>From: {props.tracking.dealerName}</div>
        <div style={{ marginTop: 12, fontWeight: 700 }}>{countdown}</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <TrackingProgressBar percent={progress} />
      </div>

      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {props.tracking.route.map((checkpoint, index) => {
          const isCurrent = index === props.tracking.currentCheckpointIndex
          const symbol = checkpoint.status === 'pending' ? '○' : checkpoint.status === 'departed' ? '✓' : '→'
          return (
            <div
              key={`${checkpoint.location.name}-${index}`}
              style={{
                padding: 10,
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: isCurrent ? 'rgba(201,146,122,0.15)' : 'rgba(255,253,249,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  {symbol} {checkpoint.location.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{formatTimestamp(checkpoint.timestamp ?? checkpoint.estimatedArrival)}</div>
              </div>
              <div style={{ marginTop: 2, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{checkpoint.status}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
