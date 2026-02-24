import { describe, expect, it } from 'vitest'
import { createTrackingForPurchase, generateRouteForLocation, updateTrackingPackageProgress } from './trackingRoutes'

describe('tracking routes', () => {
  it('generates Oakland route with Port of Oakland', () => {
    const route = generateRouteForLocation({ type: 'oakland-ca', displayName: 'Oakland, CA' })
    expect(route[0]?.name).toBe('Shenzhen, China')
    expect(route.some((stop) => stop.name.includes('Port of Oakland'))).toBe(true)
  })

  it('generates Ann Arbor route with Chicago hub', () => {
    const route = generateRouteForLocation({ type: 'ann-arbor-mi', displayName: 'Ann Arbor, MI' })
    expect(route.some((stop) => stop.name.includes('Chicago'))).toBe(true)
  })

  it('creates tracking package with route checkpoints', () => {
    const tracking = createTrackingForPurchase({
      packageId: 'pkg-1',
      watchId: 'timex-weekender',
      dealerName: 'Jason007',
      orderedAt: 1_000,
      estimatedDelivery: 31_000,
      location: { type: 'oakland-ca', displayName: 'Oakland, CA' },
    })

    expect(tracking.route.length).toBeGreaterThan(2)
    expect(tracking.route[0]?.status).toBe('departed')
    expect(tracking.dealerName).toBe('Jason007')
  })

  it('keeps origin as departed at the beginning of shipment', () => {
    const tracking = createTrackingForPurchase({
      packageId: 'pkg-2',
      watchId: 'timex-weekender',
      dealerName: 'Lena',
      orderedAt: 1_000,
      estimatedDelivery: 31_000,
      location: { type: 'oakland-ca', displayName: 'Oakland, CA' },
    })

    const progressed = updateTrackingPackageProgress(tracking, 1_001)
    expect(progressed.route[0]?.status).toBe('departed')
  })
})
