import { useState } from 'react'
import { getPassiveEnjoymentRate, type Watch, type WatchTier } from '../../game/data/watches'
import { getWatchImageUrl } from '../../game/catalog'
import { Modal } from './Modal'

export type WatchDetailProps = {
  watch: Watch
  onClose: () => void
  onInteractQuartz?: () => void
  onInteractManual?: () => void
  onInteractAutomatic?: () => void
  onInteractTourbillon?: () => void
}

function getTierDisplayName(tier: WatchTier): string {
  const tierNames: Record<WatchTier, string> = {
    quartz: 'Quartz',
    automatic: 'Automatic',
    manual: 'Manual',
    tourbillon: 'Tourbillon',
  }
  return tierNames[tier] ?? tier
}

function getInteractionType(tier: WatchTier): string {
  const interactionTypes: Record<WatchTier, string> = {
    quartz: 'Quartz Alignment',
    automatic: 'Self-Winding',
    manual: 'Manual Winding',
    tourbillon: 'Precision Care',
  }
  return interactionTypes[tier] ?? 'Care'
}

function getRewardFraming(tier: WatchTier): string {
  const rewards: Record<WatchTier, string> = {
    quartz: 'Enjoyment on perfect alignment',
    automatic: 'Passive enjoyment from motion',
    manual: 'Daily winding ritual reward',
    tourbillon: 'Masterpiece appreciation bonus',
  }
  return rewards[tier] ?? 'Earn enjoyment'
}

export function WatchDetail(props: WatchDetailProps) {
  const { watch, onClose, onInteractQuartz, onInteractManual, onInteractAutomatic, onInteractTourbillon } = props
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const passiveRate = getPassiveEnjoymentRate(watch)
  const wholeEnjoyment = Math.floor(passiveRate)
  const imageUrl = getWatchImageUrl(watch)

  // Generate WebP URL with JPEG fallback
  const imageSrc = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  const fallbackSrc = imageUrl

  return (
    <Modal title={watch.name} onClose={onClose}>
      <div
        style={{
          width: '100%',
          height: 220,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--color-surface)',
        }}
      >
        {/* Skeleton placeholder */}
        {!imageLoaded && !imageError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}
        {/* Error state placeholder */}
        {imageError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              color: 'var(--color-text-muted)',
            }}
          >
            ⌚
          </div>
        )}
        <picture>
          <source srcSet={imageSrc} type="image/webp" />
          <img
            src={fallbackSrc}
            alt={watch.name}
            style={{
              width: '100%',
              height: 220,
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              display: imageLoaded ? 'block' : 'none',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </picture>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="pill">Tier: {getTierDisplayName(watch.tier)}</span>
        <span className="pill">
          Passive: {wholeEnjoyment} enjoyment/sec
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          What this watch does:
        </div>
        <div style={{ lineHeight: 1.6 }}>
          <p style={{ margin: '8px 0' }}>
            <strong>Interaction:</strong> {getInteractionType(watch.tier)}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>Reward:</strong> {getRewardFraming(watch.tier)}
          </p>
          {watch.isFavorite && (
            <p style={{ margin: '8px 0', color: 'var(--color-accent, #c9a227)' }}>
              <strong>Favorite Watch</strong> - Generates 25% more passive enjoyment
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {watch.tier === 'quartz' && onInteractQuartz ? (
          <button type="button" className="pill" onClick={onInteractQuartz}>
            Calibrate Quartz
          </button>
        ) : null}
        {watch.tier === 'manual' && onInteractManual ? (
          <button type="button" className="pill" onClick={onInteractManual}>
            Wind Watch
          </button>
        ) : null}
        {watch.tier === 'automatic' && onInteractAutomatic ? (
          <button type="button" className="pill" onClick={onInteractAutomatic}>
            Wind Rotor
          </button>
        ) : null}
        {watch.tier === 'tourbillon' && onInteractTourbillon ? (
          <button type="button" className="pill" onClick={onInteractTourbillon}>
            Precision Care
          </button>
        ) : null}
      </div>
    </Modal>
  )
}
