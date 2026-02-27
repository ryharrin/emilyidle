import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ownedWatches, getCollectionStats } from '../../game/selectors/collection'
import type { Watch, WatchTier } from '../../game/data/watches'
import { getWatchById } from '../../game/data/watches'
import { getWatchImageUrl } from '../../game/catalog'
import {
  estimatedDeliveryTime,
  inTransitPackages,
  trackingProgressPercent,
} from '../../game/selectors/tracking'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { WatchCard } from '../components/WatchCard'
import { WatchDetail } from '../components/WatchDetail'
import { TrackingProgressBar } from '../components/TrackingProgressBar'
import { Modal } from '../components/Modal'
import { QuartzCalibrationGame, type QuartzCalibrationResult } from '../mini-games/QuartzCalibrationGame'
import { ManualWindingGame, type ManualWindingResult } from '../minigames/ManualWindingGame'
import { AutomaticMovementGame, type AutomaticMovementResult } from '../minigames/AutomaticMovementGame'

type ActiveGame = {
  tier: WatchTier
  watch: Watch
} | null

export function CollectionTab() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const watches = useMemo(() => ownedWatches(state), [state])
  const collectionStats = useMemo(() => getCollectionStats(state), [state])
  const inTransit = useMemo(() => inTransitPackages(state), [state])
  const delivered = useMemo(() => {
    const ownedWatchIds = new Set(state.ownedWatchIds)
    return (state.packageTracking?.delivered ?? []).filter(
      (pkg) => !ownedWatchIds.has(pkg.watchId),
    )
  }, [state.ownedWatchIds, state.packageTracking?.delivered])

  const parentRef = useRef<HTMLDivElement | null>(null)
  // TanStack Virtual is a deliberate dependency for large collections; safe here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: watches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 6,
  })
  const virtualItems = rowVirtualizer.getVirtualItems()
  const renderRows: { index: number; start: number }[] =
    virtualItems.length > 0
      ? virtualItems.map((v) => ({ index: v.index, start: v.start }))
      : watches.map((_, index) => ({ index, start: index * 96 }))
  const totalSize = rowVirtualizer.getTotalSize() || watches.length * 96

  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null)
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)

  const handleOpenGame = (watch: Watch, tier: WatchTier) => {
    setActiveGame({ tier, watch })
  }

  const handleCloseGame = () => {
    setActiveGame(null)
  }

  const handleQuartzComplete = (result: QuartzCalibrationResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'quartz-calibration',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: state.clockMs,
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const handleManualComplete = (result: ManualWindingResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'manual-winding',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: state.clockMs,
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const handleAutomaticComplete = (result: AutomaticMovementResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'automatic-movement',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: state.clockMs,
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const getGameTitle = (tier: WatchTier): string => {
    switch (tier) {
      case 'quartz':
        return 'Quartz Calibration'
      case 'manual':
        return 'Manual Winding'
      case 'automatic':
        return 'Automatic Movement'
      case 'tourbillon':
        return 'Precision Care'
      default:
        return 'Watch Interaction'
    }
  }

  const renderGame = () => {
    if (!activeGame) return null

    const { tier, watch } = activeGame

    switch (tier) {
      case 'quartz':
        return (
          <QuartzCalibrationGame
            onComplete={handleQuartzComplete}
            watchTier={watch.tier}
          />
        )
      case 'manual':
        return <ManualWindingGame onComplete={handleManualComplete} />
      case 'automatic':
        return <AutomaticMovementGame onComplete={handleAutomaticComplete} />
      case 'tourbillon':
        // Tourbillon uses quartz calibration game as placeholder
        return (
          <QuartzCalibrationGame
            onComplete={handleQuartzComplete}
            watchTier={watch.tier}
          />
        )
      default:
        return null
    }
  }

  return (
    <section className="app-body" aria-label="Collection tab">
      <h2 className="tab-section-title">Collection</h2>
      <p className="app-subtitle">Your watches, all in one place.</p>

      {/* Collection Completion Stats (Story 5-7) */}
      <div
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          background: 'rgba(201, 146, 122, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>Collection Progress</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
            {collectionStats.overall.percentage}%
          </div>
        </div>
        
        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 8,
            background: 'var(--color-border)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${collectionStats.overall.percentage}%`,
              height: '100%',
              background: 'var(--color-accent)',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        
        <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {collectionStats.overall.owned} / {collectionStats.overall.total} watches
        </div>

        {/* Tier completion badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.values(collectionStats.byTier).map((tierStats) => (
            <div
              key={tierStats.tier}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 8,
                background: tierStats.isComplete
                  ? 'var(--color-accent)'
                  : 'rgba(16, 42, 67, 0.1)',
                color: tierStats.isComplete
                  ? 'var(--color-surface)'
                  : 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {tierStats.tier}
              {tierStats.isComplete && <span>✓</span>}
              <span style={{ opacity: 0.8 }}>({tierStats.owned}/{tierStats.total})</span>
            </div>
          ))}
        </div>

        {/* Perfect Collection Achievement */}
        {collectionStats.perfectCollection && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--color-accent)',
              color: 'var(--color-surface)',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            ⭐ The Perfect Collection ⭐
          </div>
        )}
      </div>

      <section
        aria-label="Packages"
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 253, 249, 0.78)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Packages</h3>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              marginBottom: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            In Transit ({inTransit.length})
          </div>
          {inTransit.length === 0 ? (
            <p className="app-subtitle" style={{ margin: 0 }}>
              No packages in transit.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {inTransit.map((pkg) => {
                const watch = getWatchById(pkg.watchId)
                const imageUrl = watch ? getWatchImageUrl(watch) : '/catalog/placeholder.png'
                return (
                  <article
                    key={pkg.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 12,
                      padding: 12,
                      background: 'rgba(255, 253, 249, 0.9)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '64px 1fr auto',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={watch?.name ?? 'Watch'}
                        width={64}
                        height={48}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {watch?.name ?? pkg.watchId}
                        </div>
                        <div className="app-subtitle" style={{ marginTop: 2 }}>
                          From {pkg.dealerName}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        ETA: {estimatedDeliveryTime(pkg, state.clockMs)}
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <TrackingProgressBar
                        percent={trackingProgressPercent(pkg, state.clockMs)}
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              marginBottom: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Delivered ({delivered.length})
          </div>
          {delivered.length === 0 ? (
            <p className="app-subtitle" style={{ margin: 0 }}>
              No delivered packages to open.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {delivered.map((pkg) => {
                const watch = getWatchById(pkg.watchId)
                const imageUrl = watch ? getWatchImageUrl(watch) : '/catalog/placeholder.png'
                return (
                  <article
                    key={pkg.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 12,
                      padding: 12,
                      background: 'rgba(255, 253, 249, 0.9)',
                      display: 'grid',
                      gridTemplateColumns: '64px 1fr auto',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={watch?.name ?? 'Watch'}
                      width={64}
                      height={48}
                      style={{ borderRadius: 8, objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {watch?.name ?? pkg.watchId}
                      </div>
                      <div className="app-subtitle" style={{ marginTop: 2 }}>
                        Delivered
                        {pkg.deliveredAt
                          ? ` at ${new Date(pkg.deliveredAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}`
                          : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="pill"
                      onClick={() =>
                        dispatch({ type: 'OPEN_PACKAGE', packageId: pkg.id })
                      }
                    >
                      Open Package
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div
        ref={parentRef}
        style={{
          height: 540,
          maxHeight: '62vh',
          overflow: 'auto',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 253, 249, 0.82)',
        }}
        aria-label="Owned watches list"
      >
        {watches.length === 0 ? (
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              height: '100%',
              padding: 24,
              textAlign: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>⌚</p>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                No watches in your collection yet.
              </p>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  margin: '8px 0 0',
                  fontSize: '0.9rem',
                }}
              >
                Complete therapy sessions to earn money, then purchase watches from
                the Market.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: totalSize,
              width: '100%',
              position: 'relative',
            }}
          >
            {renderRows.map((virtualRow) => {
              const w = watches[virtualRow.index]
              if (!w) return null
              return (
                <div
                  key={w.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <WatchCard watch={w} onClick={() => setSelectedWatch(w)} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedWatch ? (
        <WatchDetail
          watch={selectedWatch}
          onClose={() => {
            setSelectedWatch(null)
            handleCloseGame()
          }}
          onInteractQuartz={
            selectedWatch.tier === 'quartz'
              ? () => handleOpenGame(selectedWatch, 'quartz')
              : undefined
          }
          onInteractManual={
            selectedWatch.tier === 'manual'
              ? () => handleOpenGame(selectedWatch, 'manual')
              : undefined
          }
          onInteractAutomatic={
            selectedWatch.tier === 'automatic'
              ? () => handleOpenGame(selectedWatch, 'automatic')
              : undefined
          }
          onInteractTourbillon={
            selectedWatch.tier === 'tourbillon'
              ? () => handleOpenGame(selectedWatch, 'tourbillon')
              : undefined
          }
        />
      ) : null}

      {activeGame ? (
        <Modal title={getGameTitle(activeGame.tier)} onClose={handleCloseGame}>
          {renderGame()}
        </Modal>
      ) : null}
    </section>
  )
}
