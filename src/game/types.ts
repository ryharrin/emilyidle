export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

// Career stages align to the narrative arc (GDD) and remain serializable.
export type CareerStage =
  | 'pre-phd'
  | 'PhDStudent'
  | 'Externship'
  | 'VAHospital'
  | 'PrivatePractice'
  | 'GroupPractice'
  | 'Retirement'

export type Toast = {
  id: string
  message: string
  createdAtMs: number
  kind?: 'letter' | 'package' | 'system'
  title?: string
  sender?: string
  watchId?: string
  durationMs?: number
}

// Mail types for the inbox system
export type MailType = 'acceptance-letter' | 'shipping-notification' | 'package-arrived' | 'ryan-message' | 'family-message'

export type MailItem = {
  id: string
  type: MailType
  subject: string
  from: string
  body: string
  receivedAtMs: number
  read: boolean
  // For package types
  watchId?: string
  trackingNumber?: string
}

// Package currently in transit
export type PendingPackage = {
  id: string
  watchId: string
  dealer: string
  trackingNumber: string
  shippedAtMs: number
  arrivalAtMs: number
}

export type USRegion = 'northeast' | 'southeast' | 'southwest' | 'northwest' | 'mountain' | 'midwest' | 'west'

export type PlayerLocation = {
  type: 'oakland-ca' | 'ann-arbor-mi' | 'custom'
  customRegion?: USRegion
  displayName: string
}

export type TrackingLocation = {
  name: string
  region: 'china' | 'us-west' | 'us-midwest' | 'custom'
}

export type TrackingCheckpoint = {
  location: TrackingLocation
  status: 'pending' | 'arrived' | 'departed' | 'out-for-delivery'
  timestamp?: number
  estimatedArrival?: number
}

export type TrackingPackage = {
  id: string
  watchId: string
  dealerName: string
  origin: TrackingLocation
  destination: TrackingLocation
  route: TrackingCheckpoint[]
  currentCheckpointIndex: number
  estimatedDelivery: number
  orderedAt: number
  deliveredAt?: number
}

export type PackageTrackingState = {
  inTransit: TrackingPackage[]
  delivered: TrackingPackage[]
  playerLocation: PlayerLocation
}

export type ConsecutiveSessionState = {
  count: number
  lastSessionTime: number
  decayStartedAt?: number
}

// Prestige system types (Stories 5-4, 5-5, 5-6)
export type PrestigeTier = 'workshop' | 'maison' | 'nostalgia'

export type WorkshopState = {
  unlocked: boolean
  blueprints: number
  upgrades: string[]
}

export type MaisonState = {
  unlocked: boolean
  heritage: number
  upgrades: string[]
}

export type NostalgiaState = {
  unlocked: boolean
  points: number
  upgrades: string[]
  museumQuality: boolean
}

export type PrestigeState = {
  workshop: WorkshopState
  maison: MaisonState
  nostalgia: NostalgiaState
}

// Discovery system ids will be kebab-case (enforced by convention; validated later if needed).
export type UnlockId = string

export type GameType = 'quartz-alignment' | 'therapy-session' | 'quartz-calibration' | 'manual-winding' | 'automatic-movement'

// Result passed from mini-game to parent via callback (Pattern 6)
export type InteractionResult = {
  perfects: number
  durationMs: number
}

export type InteractionRecord = {
  id: string
  gameType: GameType
  perfects: number
  goods: number
  misses: number
  durationMs: number
  createdAtMs: number
}

export type GameState = {
  version: number
  clockMs: number
  currencyCents: number
  enjoyment: number
  uncollectedEnjoyment: number
  love: number
  lastFamilyCheckIn: number
  careerXp: number
  careerStage: CareerStage
  therapyCooldownUntilMs: number
  ownedWatchIds: string[]
  pendingToasts: Toast[]
  pendingUnlocks: UnlockId[]
  triggeredUnlockIds: Record<UnlockId, true>
  interactionHistory: InteractionRecord[]
  // Onboarding state (Story 2.4)
  onboardingComplete: boolean
  // Mail system
  mail: MailItem[]
  pendingPackages: PendingPackage[]
  // Prestige system (Stories 5-4, 5-5, 5-6)
  prestige: PrestigeState
  // Home Life system (Stories 6-1 through 6-6)
  unlockedHomeItems: string[]
  // Story 2.11 package tracking system
  packageTracking?: PackageTrackingState
  // Story 2.12 consecutive session scaling
  consecutiveSessions: ConsecutiveSessionState
}

export const initialGameState: GameState = {
  version: 1,
  clockMs: 0,
  currencyCents: 0,
  enjoyment: 10, // Enough to run 2 therapy sessions after onboarding
  uncollectedEnjoyment: 0,
  love: 0,
  lastFamilyCheckIn: 0,
  careerXp: 0,
  careerStage: 'pre-phd',
  therapyCooldownUntilMs: 0,
  ownedWatchIds: [],
  pendingToasts: [],
  pendingUnlocks: [],
  triggeredUnlockIds: {},
  interactionHistory: [],
  onboardingComplete: false,
  mail: [
    {
      id: 'acceptance-letter-initial',
      type: 'acceptance-letter',
      subject: 'Your Admission Decision',
      from: 'Graduate Division',
      body: '',
      receivedAtMs: 0,
      read: false,
    },
  ],
  pendingPackages: [],
  // Prestige system (Stories 5-4, 5-5, 5-6)
  prestige: {
    workshop: { unlocked: false, blueprints: 0, upgrades: [] },
    maison: { unlocked: false, heritage: 0, upgrades: [] },
    nostalgia: { unlocked: false, points: 0, upgrades: [], museumQuality: false },
  },
  // Home Life system (Stories 6-1 through 6-6)
  unlockedHomeItems: [],
  packageTracking: {
    inTransit: [],
    delivered: [],
    playerLocation: {
      type: 'oakland-ca',
      displayName: 'Oakland, CA',
    },
  },
  consecutiveSessions: {
    count: 0,
    lastSessionTime: 0,
    decayStartedAt: undefined,
  },
}

export type Action =
  | { type: 'EARN_CURRENCY_CENTS'; amountCents: number }
  | { type: 'SPEND_CURRENCY_CENTS'; amountCents: number }
  | { type: 'GAIN_ENJOYMENT'; delta: number }
  | { type: 'GAIN_LOVE'; delta: number }
  | { type: 'GAIN_CAREER_XP'; delta: number }
  | { type: 'SET_CAREER_STAGE'; stage: CareerStage }
  | { type: 'ADVANCE_CAREER' }
  | { type: 'ADD_OWNED_WATCH'; watchId: string }
  | { type: 'SIM_TICK'; dtMs: number }
  | { type: 'LOAD_SAVE'; state: GameState }
  | { type: 'QUEUE_TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; toastId: string }
  | { type: 'QUEUE_UNLOCK'; unlockId: UnlockId }
  | { type: 'ACKNOWLEDGE_UNLOCK'; unlockId: UnlockId }
  | { type: 'RECORD_INTERACTION'; record: InteractionRecord }
  | { type: 'COMPLETE_THERAPY_SESSION'; payload: { cashCents: number; xp: number; nowMs: number } }
  | { type: 'PURCHASE_WATCH'; watchId: string }
  | { type: 'COLLECT_PASSIVE_ENJOYMENT' }
  | { type: 'FAMILY_CHECKIN'; loveGained: number; nowMs: number }
  // Story 2.4: Onboarding and therapy session actions
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'READ_ACCEPTANCE_LETTER' }
  | { type: 'START_THERAPY_SESSION'; enjoymentCost: number }
  // Mail system actions
  | { type: 'ADD_MAIL'; mail: MailItem }
  | { type: 'MARK_MAIL_READ'; mailId: string }
  | { type: 'OPEN_PACKAGE'; packageId: string }
  | { type: 'CHECK_PACKAGES'; nowMs: number }
  | { type: 'CREATE_TRACKING'; tracking: TrackingPackage }
  | { type: 'UPDATE_TRACKING_PROGRESS'; packageId: string; nowMs: number }
  | { type: 'MARK_DELIVERED'; packageId: string; deliveredAt: number }
  | { type: 'SET_RETIREMENT_LOCATION'; location: PlayerLocation }
  | { type: 'TICK_TRACKING'; nowMs: number }
  // Prestige system actions (Stories 5-4, 5-5, 5-6)
  | { type: 'UNLOCK_WORKSHOP' }
  | { type: 'UNLOCK_MAISON' }
  | { type: 'UNLOCK_NOSTALGIA' }
  | { type: 'SPEND_BLUEPRINTS'; amount: number; upgradeId: string }
  | { type: 'SPEND_HERITAGE'; amount: number; upgradeId: string }
  | { type: 'SPEND_NOSTALGIA_POINTS'; amount: number; upgradeId: string }
  | { type: 'GAIN_BLUEPRINTS'; amount: number }
  | { type: 'GAIN_HERITAGE'; amount: number }
  | { type: 'GAIN_NOSTALGIA_POINTS'; amount: number }
