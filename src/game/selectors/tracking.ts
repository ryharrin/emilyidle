import type { GameState, PlayerLocation, TrackingPackage } from '../types'

function getTrackingState(state: GameState) {
  return (
    state.packageTracking ?? {
      inTransit: [],
      delivered: [],
      playerLocation: { type: 'oakland-ca', displayName: 'Oakland, CA' } as PlayerLocation,
    }
  )
}

export function inTransitPackages(state: GameState): TrackingPackage[] {
  return [...getTrackingState(state).inTransit].sort((a, b) => a.estimatedDelivery - b.estimatedDelivery)
}

export function currentLocation(state: GameState): PlayerLocation {
  return getTrackingState(state).playerLocation
}

export function getTrackingForPackage(state: GameState, packageId: string): TrackingPackage | undefined {
  const tracking = getTrackingState(state)
  return tracking.inTransit.find((item) => item.id === packageId)
}

export function estimatedDeliveryTime(pkg: TrackingPackage, nowMs: number): string {
  const remaining = pkg.estimatedDelivery - nowMs
  if (remaining <= 0) return 'Arriving now'
  if (remaining < 60_000) return 'Less than a minute'
  const minutes = Math.floor(remaining / 60_000)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

export function trackingProgressPercent(pkg: TrackingPackage, nowMs: number): number {
  const total = Math.max(1, pkg.estimatedDelivery - pkg.orderedAt)
  const ratio = Math.max(0, Math.min(1, (nowMs - pkg.orderedAt) / total))
  return Math.round(ratio * 100)
}
