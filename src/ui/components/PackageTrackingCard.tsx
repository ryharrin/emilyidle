import { getWatchById } from '../../game/data/watches'
import { getWatchImageUrl } from '../../game/catalog'
import type { TrackingPackage } from '../../game/types'
import { estimatedDeliveryTime, trackingProgressPercent } from '../../game/selectors/tracking'
import { TrackingProgressBar } from './TrackingProgressBar'

export function PackageTrackingCard(props: {
  tracking: TrackingPackage
  nowMs: number
  onOpen: () => void
}) {
  const watch = getWatchById(props.tracking.watchId)
  const imageUrl = watch ? getWatchImageUrl(watch) : '/catalog/placeholder.png'
  const countdown = estimatedDeliveryTime(props.tracking, props.nowMs)
  const progress = trackingProgressPercent(props.tracking, props.nowMs)
  const currentCheckpoint = props.tracking.route[props.tracking.currentCheckpointIndex]

  return (
    <button
      type="button"
      onClick={props.onOpen}
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 12,
        background: 'rgba(255,253,249,0.88)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 10, alignItems: 'center' }}>
        <img
          src={imageUrl}
          alt={watch?.name ?? 'Watch'}
          width={72}
          height={54}
          style={{ borderRadius: 8, objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontWeight: 700 }}>{watch?.name ?? props.tracking.watchId}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>From: {props.tracking.dealerName}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {currentCheckpoint?.status === 'out-for-delivery' ? 'Out for delivery' : `In transit - ${currentCheckpoint?.location.name}`}
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{countdown}</div>
      </div>
      <div style={{ marginTop: 10 }}>
        <TrackingProgressBar percent={progress} />
      </div>
    </button>
  )
}
