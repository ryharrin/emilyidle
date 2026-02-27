import { initialGameState, type GameState, type MailItem, type Result } from './types'
import { getDefaultPlayerLocation } from './data/trackingRoutes'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : []
}

function asUnlockIdArray(value: unknown): string[] {
  // UnlockId is currently an alias of string; validate as string[].
  return asStringArray(value)
}

function asUnlockIdRecord(value: unknown): Record<string, true> {
  if (!isRecord(value)) return {}
  const out: Record<string, true> = {}
  for (const [k, v] of Object.entries(value)) {
    if (v === true) out[k] = true
  }
  return out
}

function asToastArray(value: unknown): { id: string; message: string; createdAtMs: number }[] {
  if (!Array.isArray(value)) return []
  const out: {
    id: string
    message: string
    createdAtMs: number
    kind?: 'letter' | 'package' | 'system'
    title?: string
    sender?: string
    watchId?: string
    durationMs?: number
  }[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = typeof item.id === 'string' ? item.id : ''
    const message = typeof item.message === 'string' ? item.message : ''
    const createdAtMs = asNumber(item.createdAtMs, 0)
    const kind = item.kind === 'letter' || item.kind === 'package' || item.kind === 'system' ? item.kind : undefined
    const title = typeof item.title === 'string' ? item.title : undefined
    const sender = typeof item.sender === 'string' ? item.sender : undefined
    const watchId = typeof item.watchId === 'string' ? item.watchId : undefined
    const durationMs = typeof item.durationMs === 'number' ? item.durationMs : undefined
    if (!id) continue
    out.push({ id, message, createdAtMs, kind, title, sender, watchId, durationMs })
  }
  return out
}

function asInteractionArray(
  value: unknown,
): { id: string; gameType: string; perfects: number; durationMs: number; createdAtMs: number }[] {
  if (!Array.isArray(value)) return []
  const out: { id: string; gameType: string; perfects: number; durationMs: number; createdAtMs: number }[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = typeof item.id === 'string' ? item.id : ''
    const gameType = typeof item.gameType === 'string' ? item.gameType : ''
    const perfects = asNumber(item.perfects, 0)
    const durationMs = asNumber(item.durationMs, 0)
    const createdAtMs = asNumber(item.createdAtMs, 0)
    if (!id || !gameType) continue
    out.push({ id, gameType, perfects, durationMs, createdAtMs })
  }
  return out
}

function isCareerStage(value: unknown): value is GameState['careerStage'] {
  return (
    value === 'pre-phd' ||
    value === 'PhDStudent' ||
    value === 'Externship' ||
    value === 'VAHospital' ||
    value === 'PrivatePractice' ||
    value === 'GroupPractice' ||
    value === 'Retirement'
  )
}

export function serializeSave(state: GameState): string {
  // State is already serializable by design; stringify directly.
  return JSON.stringify(state)
}

export function loadSave(raw: string): Result<GameState> {
  if (!raw) return { ok: false, error: 'No save found' }
  try {
    const parsed: unknown = JSON.parse(raw)
    return migrateSave(parsed)
  } catch (e) {
    return {
      ok: false,
      error: `Invalid save: ${e instanceof Error ? e.message : 'unknown'}`,
    }
  }
}

export function migrateSave(rawObject: unknown): Result<GameState> {
  if (!isRecord(rawObject)) return { ok: false, error: 'Invalid save: not an object' }

  // v1 is the current schema. For forward compatibility, treat missing version as v0 and migrate to v1.
  const version = asNumber(rawObject.version, 0)
  if (version !== 0 && version !== 1) {
    return { ok: false, error: `Unsupported save version: ${version}` }
  }

  // v1 migration: fill missing fields with defaults, sanitize types.
  const clockMs = asNumber(rawObject.clockMs, initialGameState.clockMs)
  const currencyCents = asNumber(rawObject.currencyCents, initialGameState.currencyCents)
  const enjoyment = asNumber(rawObject.enjoyment, initialGameState.enjoyment)
  const uncollectedEnjoyment = asNumber(
    rawObject.uncollectedEnjoyment,
    initialGameState.uncollectedEnjoyment,
  )
  const love = asNumber(rawObject.love, initialGameState.love)
  const lastFamilyCheckIn = asNumber(rawObject.lastFamilyCheckIn, initialGameState.lastFamilyCheckIn)
  const careerXp = asNumber(rawObject.careerXp, initialGameState.careerXp)
  const careerStage = isCareerStage(rawObject.careerStage)
    ? rawObject.careerStage
    : initialGameState.careerStage
  const therapyCooldownUntilMs = asNumber(
    rawObject.therapyCooldownUntilMs,
    initialGameState.therapyCooldownUntilMs,
  )

  const ownedWatchIds = asStringArray(rawObject.ownedWatchIds)
  const pendingToasts = asToastArray(rawObject.pendingToasts)
  const pendingUnlocks = asUnlockIdArray(rawObject.pendingUnlocks)
  const triggeredUnlockIds = asUnlockIdRecord(rawObject.triggeredUnlockIds)
  const interactionHistory = asInteractionArray(rawObject.interactionHistory)
  const onboardingComplete = asBoolean(rawObject.onboardingComplete, initialGameState.onboardingComplete)
  const rawConsecutiveSessions = isRecord(rawObject.consecutiveSessions) ? rawObject.consecutiveSessions : undefined
  const consecutiveSessions: GameState['consecutiveSessions'] = {
    count: Math.max(0, asNumber(rawConsecutiveSessions?.count, initialGameState.consecutiveSessions.count)),
    lastSessionTime: asNumber(
      rawConsecutiveSessions?.lastSessionTime,
      initialGameState.consecutiveSessions.lastSessionTime,
    ),
    decayStartedAt:
      rawConsecutiveSessions && typeof rawConsecutiveSessions.decayStartedAt === 'number'
        ? rawConsecutiveSessions.decayStartedAt
        : initialGameState.consecutiveSessions.decayStartedAt,
  }

  // Extract mail system - handle both old mailbox (migration) and new mail array
  const rawMail = Array.isArray(rawObject.mail) ? rawObject.mail : []
  
  // Check for old mailbox format for migration
  const rawMailbox = isRecord(rawObject.mailbox) ? rawObject.mailbox : undefined
  
  const mail = rawMail.map((m: Record<string, unknown>) => ({
    id: String(m.id ?? ''),
    type: String(m.type ?? 'acceptance-letter') as MailItem['type'],
    subject: String(m.subject ?? ''),
    from: String(m.from ?? ''),
    body: String(m.body ?? ''),
    receivedAtMs: Number(m.receivedAtMs ?? 0),
    read: Boolean(m.read ?? false),
    watchId: m.watchId ? String(m.watchId) : undefined,
    trackingNumber: m.trackingNumber ? String(m.trackingNumber) : undefined,
  }))

  // Migration: if no mail but has old mailbox, create acceptance letter
  const migratedMail = mail.length === 0 && rawMailbox ? [
    {
      id: 'acceptance-letter-initial',
      type: 'acceptance-letter' as const,
      subject: 'Your Admission Decision',
      from: 'Graduate Division',
      body: '',
      receivedAtMs: 0,
      read: false,
    }
  ] : mail

  const pendingPackages = Array.isArray(rawObject.pendingPackages) 
    ? rawObject.pendingPackages.map((p: Record<string, unknown>) => ({
      id: String(p.id ?? ''),
      watchId: String(p.watchId ?? ''),
      dealer: String(p.dealer ?? 'Ethan'),
      trackingNumber: String(p.trackingNumber ?? ''),
        shippedAtMs: Number(p.shippedAtMs ?? 0),
        arrivalAtMs: Number(p.arrivalAtMs ?? 0),
      }))
    : []

  const rawPackageTracking = isRecord(rawObject.packageTracking) ? rawObject.packageTracking : undefined
  const rawTrackingInTransit = Array.isArray(rawPackageTracking?.inTransit) ? rawPackageTracking.inTransit : []
  const rawTrackingDelivered = Array.isArray(rawPackageTracking?.delivered) ? rawPackageTracking.delivered : []
  const rawPlayerLocation = isRecord(rawPackageTracking?.playerLocation)
    ? rawPackageTracking.playerLocation
    : undefined

  const fallbackLocation = getDefaultPlayerLocation(careerStage)
  const playerLocation: NonNullable<GameState['packageTracking']>['playerLocation'] = {
    type:
      rawPlayerLocation?.type === 'oakland-ca' ||
      rawPlayerLocation?.type === 'ann-arbor-mi' ||
      rawPlayerLocation?.type === 'custom'
        ? rawPlayerLocation.type
        : fallbackLocation.type,
    customRegion:
      typeof rawPlayerLocation?.customRegion === 'string'
        ? rawPlayerLocation.customRegion as NonNullable<GameState['packageTracking']>['playerLocation']['customRegion']
        : fallbackLocation.customRegion,
    displayName:
      typeof rawPlayerLocation?.displayName === 'string'
        ? rawPlayerLocation.displayName
        : fallbackLocation.displayName,
  }

  const parseTrackingPackage = (item: unknown) => {
    if (!isRecord(item)) return null
    if (typeof item.id !== 'string') return null
    if (typeof item.watchId !== 'string') return null
    const route = Array.isArray(item.route)
      ? item.route
          .map((checkpoint) => {
            if (!isRecord(checkpoint) || !isRecord(checkpoint.location)) return null
            if (typeof checkpoint.location.name !== 'string') return null
            const region = checkpoint.location.region
            const validRegion =
              region === 'china' || region === 'us-west' || region === 'us-midwest' || region === 'custom'
            if (!validRegion) return null
            const status = checkpoint.status
            const validStatus =
              status === 'pending' ||
              status === 'arrived' ||
              status === 'departed' ||
              status === 'out-for-delivery'
            if (!validStatus) return null
            return {
              location: {
                name: checkpoint.location.name,
                region,
              },
              status,
              timestamp: typeof checkpoint.timestamp === 'number' ? checkpoint.timestamp : undefined,
              estimatedArrival:
                typeof checkpoint.estimatedArrival === 'number' ? checkpoint.estimatedArrival : undefined,
            }
          })
          .filter(Boolean)
      : []

    return {
      id: item.id,
      watchId: item.watchId,
      dealerName: typeof item.dealerName === 'string' ? item.dealerName : 'Ethan',
      origin:
        isRecord(item.origin) && typeof item.origin.name === 'string'
          ? {
              name: item.origin.name,
              region:
                item.origin.region === 'china' ||
                item.origin.region === 'us-west' ||
                item.origin.region === 'us-midwest' ||
                item.origin.region === 'custom'
                  ? item.origin.region
                  : 'custom',
            }
          : { name: 'Shenzhen, China', region: 'china' as const },
      destination:
        isRecord(item.destination) && typeof item.destination.name === 'string'
          ? {
              name: item.destination.name,
              region:
                item.destination.region === 'china' ||
                item.destination.region === 'us-west' ||
                item.destination.region === 'us-midwest' ||
                item.destination.region === 'custom'
                  ? item.destination.region
                  : 'custom',
            }
          : { name: playerLocation.displayName, region: 'custom' as const },
      route,
      currentCheckpointIndex: asNumber(item.currentCheckpointIndex, 0),
      estimatedDelivery: asNumber(item.estimatedDelivery, 0),
      orderedAt: asNumber(item.orderedAt, 0),
      deliveredAt: typeof item.deliveredAt === 'number' ? item.deliveredAt : undefined,
    }
  }

  const packageTracking: NonNullable<GameState['packageTracking']> = {
    inTransit: rawTrackingInTransit.map(parseTrackingPackage).filter(Boolean) as NonNullable<GameState['packageTracking']>['inTransit'],
    delivered: rawTrackingDelivered.map(parseTrackingPackage).filter(Boolean) as NonNullable<GameState['packageTracking']>['delivered'],
    playerLocation,
  }

  // Handle prestige migration
  const rawPrestige = isRecord(rawObject.prestige) ? rawObject.prestige : {}
  const prestige: GameState['prestige'] = {
    workshop: {
      unlocked: asBoolean((rawPrestige.workshop as UnknownRecord)?.unlocked, false),
      blueprints: asNumber((rawPrestige.workshop as UnknownRecord)?.blueprints, 0),
      upgrades: asStringArray((rawPrestige.workshop as UnknownRecord)?.upgrades),
    },
    maison: {
      unlocked: asBoolean((rawPrestige.maison as UnknownRecord)?.unlocked, false),
      heritage: asNumber((rawPrestige.maison as UnknownRecord)?.heritage, 0),
      upgrades: asStringArray((rawPrestige.maison as UnknownRecord)?.upgrades),
    },
    nostalgia: {
      unlocked: asBoolean((rawPrestige.nostalgia as UnknownRecord)?.unlocked, false),
      points: asNumber((rawPrestige.nostalgia as UnknownRecord)?.points, 0),
      upgrades: asStringArray((rawPrestige.nostalgia as UnknownRecord)?.upgrades),
      museumQuality: asBoolean((rawPrestige.nostalgia as UnknownRecord)?.museumQuality, false),
    },
  }

  const migrated: GameState = {
    version: 1,
    clockMs,
    currencyCents,
    enjoyment,
    uncollectedEnjoyment,
    love,
    lastFamilyCheckIn,
    careerXp,
    careerStage,
    therapyCooldownUntilMs,
    ownedWatchIds,
    pendingToasts,
    pendingUnlocks,
    triggeredUnlockIds,
    interactionHistory: interactionHistory as GameState['interactionHistory'],
    onboardingComplete,
    consecutiveSessions,
    mail: migratedMail as GameState['mail'],
    pendingPackages: pendingPackages as GameState['pendingPackages'],
    prestige,
    // Home Life system (Stories 6-1 through 6-6)
    unlockedHomeItems: asStringArray(rawObject.unlockedHomeItems),
    packageTracking,
    // Story 7.4: Achievement system
    unlockedAchievementIds: asStringArray(rawObject.unlockedAchievementIds),
  }

  return { ok: true, value: migrated }
}
