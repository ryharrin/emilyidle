import { useState } from 'react'
import type { Watch } from '../../game/data/watches'

export type WatchCardProps = {
  watch: Watch
  onClick: () => void
}

export function WatchCard(props: WatchCardProps) {
  const { watch, onClick } = props
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <button
      type="button"
      aria-label={watch.name}
      onClick={onClick}
      style={{
        width: '100%',
        padding: 12,
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: 96,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '88px 1fr',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 88,
            height: 66,
            borderRadius: 12,
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
                fontSize: '1.5rem',
                color: 'var(--color-text-muted)',
              }}
            >
              ⌚
            </div>
          )}
          <img
            src={watch.imageUrl}
            alt={watch.name}
            width={88}
            height={66}
            style={{
              objectFit: 'cover',
              borderRadius: 12,
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              display: 'block',
            }}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{watch.name}</div>
          <div className="app-subtitle" style={{ marginTop: 4 }}>
            Tier: {watch.tier}
          </div>
        </div>
      </div>
    </button>
  )
}
