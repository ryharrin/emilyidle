import type {
  CareerStage,
  PlayerLocation,
  TrackingCheckpoint,
  TrackingLocation,
  TrackingPackage,
  USRegion,
} from '../types'

const OAKLAND_ROUTE: TrackingLocation[] = [
  { name: 'Shenzhen, China', region: 'china' },
  { name: 'Port of Oakland', region: 'us-west' },
  { name: 'Oakland Distribution Center', region: 'us-west' },
  { name: "Emily's Address - Oakland, CA", region: 'us-west' },
]

const ANN_ARBOR_ROUTE: TrackingLocation[] = [
  { name: 'Shenzhen, China', region: 'china' },
  { name: 'Port of Long Beach, CA', region: 'us-west' },
  { name: 'Midwest Distribution Hub - Chicago, IL', region: 'us-midwest' },
  { name: 'Ann Arbor Distribution Center', region: 'us-midwest' },
  { name: "Emily's Address - Ann Arbor, MI", region: 'us-midwest' },
]

const GENERIC_ROUTES: Record<USRegion, TrackingLocation[]> = {
  northeast: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of New York/New Jersey', region: 'custom' },
    { name: 'Northeast Regional Hub', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  southeast: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Savannah, GA', region: 'custom' },
    { name: 'Southeast Regional Hub', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  southwest: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Long Beach, CA', region: 'custom' },
    { name: 'Southwest Regional Hub', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  northwest: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Seattle, WA', region: 'custom' },
    { name: 'Northwest Regional Hub', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  mountain: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Long Beach, CA', region: 'custom' },
    { name: 'Mountain Regional Hub - Denver, CO', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  midwest: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Long Beach, CA', region: 'custom' },
    { name: 'Midwest Regional Hub - Chicago, IL', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
  west: [
    { name: 'Shenzhen, China', region: 'china' },
    { name: 'Port of Oakland', region: 'us-west' },
    { name: 'West Regional Hub', region: 'custom' },
    { name: "Emily's Retirement Address", region: 'custom' },
  ],
}

export function getDefaultPlayerLocation(stage: CareerStage): PlayerLocation {
  // Emily moved to Ann Arbor in 2015 (VA Hospital stage) when she met Ryan
  // Before 2015: PhD Student and Externship in Oakland
  // 2015+: VA Hospital, Private Practice, Group Practice in Ann Arbor
  if (stage === 'VAHospital' || stage === 'PrivatePractice' || stage === 'GroupPractice') {
    return { type: 'ann-arbor-mi', displayName: 'Ann Arbor, MI' }
  }
  if (stage === 'Retirement') {
    return { type: 'custom', customRegion: 'west', displayName: 'Retirement Home' }
  }
  // PhDStudent, Externship - pre-2015, Oakland
  return { type: 'oakland-ca', displayName: 'Oakland, CA' }
}

export function generateRouteForLocation(location: PlayerLocation): TrackingLocation[] {
  if (location.type === 'oakland-ca') return OAKLAND_ROUTE
  if (location.type === 'ann-arbor-mi') return ANN_ARBOR_ROUTE
  return GENERIC_ROUTES[location.customRegion ?? 'west']
}

export function createTrackingForPurchase(input: {
  packageId: string
  watchId: string
  dealerName: string
  orderedAt: number
  estimatedDelivery: number
  location: PlayerLocation
}): TrackingPackage {
  const route = generateRouteForLocation(input.location)
  const segmentMs = Math.max(1, Math.floor((input.estimatedDelivery - input.orderedAt) / route.length))
  const checkpoints: TrackingCheckpoint[] = route.map((location, index) => ({
    location,
    status: index === 0 ? 'departed' : 'pending',
    timestamp: index === 0 ? input.orderedAt : undefined,
    estimatedArrival: input.orderedAt + segmentMs * (index + 1),
  }))

  return {
    id: input.packageId,
    watchId: input.watchId,
    dealerName: input.dealerName,
    origin: route[0] ?? { name: 'Shenzhen, China', region: 'china' },
    destination: route[route.length - 1] ?? { name: input.location.displayName, region: 'custom' },
    route: checkpoints,
    currentCheckpointIndex: 0,
    estimatedDelivery: input.estimatedDelivery,
    orderedAt: input.orderedAt,
  }
}

export function updateTrackingPackageProgress(pkg: TrackingPackage, nowMs: number): TrackingPackage {
  const total = Math.max(1, pkg.estimatedDelivery - pkg.orderedAt)
  const progressRatio = Math.max(0, Math.min(1, (nowMs - pkg.orderedAt) / total))
  const nextIndex = Math.min(pkg.route.length - 1, Math.floor(progressRatio * pkg.route.length))

  const route = pkg.route.map((checkpoint, index) => {
    if (index < nextIndex) {
      return { ...checkpoint, status: 'departed' as const, timestamp: checkpoint.timestamp ?? nowMs }
    }
    if (index === 0 && nextIndex === 0) {
      return { ...checkpoint, status: 'departed' as const, timestamp: checkpoint.timestamp ?? pkg.orderedAt }
    }
    if (index === nextIndex) {
      const status: TrackingCheckpoint['status'] =
        progressRatio > 0.85 && index === pkg.route.length - 1 ? 'out-for-delivery' : 'arrived'
      return { ...checkpoint, status, timestamp: checkpoint.timestamp ?? nowMs }
    }
    return { ...checkpoint, status: 'pending' as const }
  })

  return {
    ...pkg,
    currentCheckpointIndex: nextIndex,
    route,
  }
}
