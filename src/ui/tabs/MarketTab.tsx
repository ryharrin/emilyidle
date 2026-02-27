import { formatCurrencyCents } from '../../game/economy'
import { availableMarketWatches } from '../../game/watchSelectors'
import { isTierUnlocked, getTierRequiredStage } from '../../game/data/tierUnlocks'
import { CAREER_STAGES } from '../../game/data/careers'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { getWatchImageUrl } from '../../game/catalog'

export function MarketTab() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const tiers = ['quartz', 'manual', 'automatic', 'tourbillon'] as const
  const owned = new Set(state.ownedWatchIds)
  const marketWatches = availableMarketWatches(state)
  const trackingState = state.packageTracking
  const inTransitWatchIds = new Set<string>([
    ...state.pendingPackages.map((pkg) => pkg.watchId),
    ...(trackingState?.inTransit.map((pkg) => pkg.watchId) ?? []),
  ])
  const deliveredPackageIdsByWatch = new Map<string, string>()
  for (const pkg of trackingState?.delivered ?? []) {
    if (!deliveredPackageIdsByWatch.has(pkg.watchId)) {
      deliveredPackageIdsByWatch.set(pkg.watchId, pkg.id)
    }
  }

  // Group watches by tier
  const watchesByTier = marketWatches.reduce(
    (acc, watch) => {
      if (!acc[watch.tier]) {
        acc[watch.tier] = []
      }
      acc[watch.tier].push(watch)
      return acc
    },
    {} as Record<string, typeof marketWatches>,
  )

  const hasUnlockedTiers = tiers.some((tier) =>
    isTierUnlocked(tier, state.careerStage),
  )
  const showPreOnboardingGuidance =
    !hasUnlockedTiers &&
    (state.careerStage === 'pre-phd' || state.onboardingComplete === false)

  return (
    <section className="app-body" aria-label="Market tab">
      <h2 className="tab-section-title">Market</h2>
      <p className="app-subtitle">Browse watches and buy with Cash.</p>
      {showPreOnboardingGuidance ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            background: 'rgba(16, 42, 67, 0.06)',
          }}
        >
          <div style={{ fontWeight: 700 }}>Market purchases unlock after onboarding.</div>
          <p className="app-subtitle" style={{ marginTop: 6 }}>
            You are still in pre-onboarding, so buy controls are hidden. Read your
            acceptance letter in Mail and complete onboarding to reach PhD Student,
            then quartz market watches and Buy actions will appear.
          </p>
        </div>
      ) : null}

      {tiers.map((tier) => {
        const isUnlocked = isTierUnlocked(tier, state.careerStage)
        const requiredStage = getTierRequiredStage(tier)
        const stageInfo = requiredStage
          ? CAREER_STAGES.find((s) => s.id === requiredStage)
          : null

        if (!isUnlocked) {
          // Show locked tier with silhouette
          return (
            <div
              key={tier}
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 16,
                border: '1px solid var(--color-border)',
                background: 'rgba(16, 42, 67, 0.05)',
                opacity: 0.7,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 66,
                    borderRadius: 12,
                    background: 'var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    opacity: 0.5,
                  }}
                >
                  ⌚
                </div>
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {tier} Watches
                  </div>
                  <div
                    className="app-subtitle"
                    style={{ marginTop: 4, fontSize: '0.85rem' }}
                  >
                    Unlock at {stageInfo?.title || requiredStage}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        const tierWatches = watchesByTier[tier] || []

        return (
          <div key={tier} style={{ marginTop: 16 }}>
            <h3
              style={{
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                marginBottom: 8,
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 4,
              }}
            >
              {tier} Watches
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {tierWatches.length === 0 ? (
                <p
                  className="app-subtitle"
                  style={{ padding: 12, textAlign: 'center' }}
                >
                  All {tier} watches collected!
                </p>
              ) : (
                tierWatches.map((w) => {
                  const isOwned = owned.has(w.id)
                  const deliveredPackageId = deliveredPackageIdsByWatch.get(w.id)
                  const isInTransit = inTransitWatchIds.has(w.id)
                  const canBuy = !isOwned && !deliveredPackageId && !isInTransit
                  const canAfford = state.currencyCents >= w.priceCents
                  const remaining = Math.max(0, w.priceCents - state.currencyCents)

                  return (
                    <article
                      key={w.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '88px 1fr',
                        gap: 12,
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 16,
                        border: '1px solid var(--color-border)',
                        background: 'rgba(255, 253, 249, 0.86)',
                      }}
                    >
                      <img
                        src={getWatchImageUrl(w)}
                        alt={w.name}
                        width={88}
                        height={66}
                        style={{
                          objectFit: 'cover',
                          borderRadius: 12,
                          border: '1px solid var(--color-border)',
                        }}
                        loading="lazy"
                      />
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{w.name}</div>
                            <div
                              className="app-subtitle"
                              style={{ marginTop: 4 }}
                            >
                              {w.brand}
                              {w.isFavorite ? ' ⭐' : ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700 }}>
                              {formatCurrencyCents(w.priceCents)}
                            </div>
                            {canBuy && !canAfford ? (
                              <div
                                className="app-subtitle"
                                style={{ marginTop: 4 }}
                              >
                                Need {formatCurrencyCents(remaining)} more
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          {isOwned ? (
                            <span className="pill" aria-label="Owned">
                              Owned
                            </span>
                          ) : deliveredPackageId ? (
                            <button
                              type="button"
                              className="pill"
                              onClick={() =>
                                dispatch({
                                  type: 'OPEN_PACKAGE',
                                  packageId: deliveredPackageId,
                                })
                              }
                            >
                              Open Package
                            </button>
                          ) : isInTransit ? (
                            <span className="pill" aria-label="In Transit">
                              In Transit
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="pill"
                              disabled={!canBuy || !canAfford}
                              onClick={() =>
                                dispatch({ type: 'PURCHASE_WATCH', watchId: w.id })
                              }
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}
