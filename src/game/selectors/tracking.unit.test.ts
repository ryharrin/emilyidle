import { describe, expect, it } from 'vitest'
import type { GameState, TrackingPackage } from '../types'
import { estimatedDeliveryTime, inTransitPackages } from './tracking'

function baseTrackingPackage(overrides: Partial<TrackingPackage> = {}): TrackingPackage {
  return {
    id: 'pkg-1',
    watchId: 'timex-weekender',
    dealerName: 'Lena',
    origin: { name: 'Shenzhen, China', region: 'china' },
    destination: { name: 'Oakland, CA', region: 'us-west' },
    route: [
      { location: { name: 'Shenzhen, China', region: 'china' }, status: 'departed' },
      { location: { name: 'Port of Oakland', region: 'us-west' }, status: 'pending' },
    ],
    currentCheckpointIndex: 0,
    estimatedDelivery: 120_000,
    orderedAt: 0,
    ...overrides,
  }
}

function baseState(packages: TrackingPackage[]): GameState {
  return {
    version: 1,
    clockMs: 0,
    currencyCents: 0,
    enjoyment: 0,
    uncollectedEnjoyment: 0,
    love: 0,
    lastFamilyCheckIn: 0,
    careerXp: 0,
    careerStage: 'PhDStudent',
    therapyCooldownUntilMs: 0,
    ownedWatchIds: [],
    pendingToasts: [],
    pendingUnlocks: [],
    triggeredUnlockIds: {},
    interactionHistory: [],
    onboardingComplete: true,
    mail: [],
    pendingPackages: [],
    prestige: {
      workshop: { unlocked: false, blueprints: 0, upgrades: [] },
      maison: { unlocked: false, heritage: 0, upgrades: [] },
      nostalgia: { unlocked: false, points: 0, upgrades: [], museumQuality: false },
    },
    unlockedHomeItems: [],
    consecutiveSessions: { count: 0, lastSessionTime: 0 },
    packageTracking: {
      inTransit: packages,
      delivered: [],
      playerLocation: { type: 'oakland-ca', displayName: 'Oakland, CA' },
    },
  }
}

describe('tracking selectors', () => {
  it('sorts in-transit packages by nearest delivery', () => {
    const slow = baseTrackingPackage({ id: 'slow', estimatedDelivery: 300_000 })
    const fast = baseTrackingPackage({ id: 'fast', estimatedDelivery: 120_000 })
    const sorted = inTransitPackages(baseState([slow, fast]))
    expect(sorted.map((item) => item.id)).toEqual(['fast', 'slow'])
  })

  it('formats delivery time in minutes', () => {
    const pkg = baseTrackingPackage({ estimatedDelivery: 180_000 })
    expect(estimatedDeliveryTime(pkg, 0)).toBe('3 minutes')
  })

  it('returns less than a minute when close', () => {
    const pkg = baseTrackingPackage({ estimatedDelivery: 20_000 })
    expect(estimatedDeliveryTime(pkg, 0)).toBe('Less than a minute')
  })
})
