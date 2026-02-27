import type { Action, GameState, InteractionRecord, MailItem, PendingPackage, Toast, UnlockId } from './types'
import { step } from './sim'
import { evaluateUnlocks } from './discovery/evaluateUnlocks'
import { evaluateAndUnlockAchievements } from './achievements/evaluate'
import { clampCurrencyCents } from './economy'
import { getUnlockIdsForStage } from './data/homeLife'
import {
  calculateSessionCost,
  PHD_SESSION_COOLDOWN_MS,
  canAdvanceCareer,
  getNextCareerStage,
  getTherapySessionBaseIncomeCents,
} from './career'
import { CONSECUTIVE_CONFIG } from './constants'
import { getWatchById } from './data/watches'
import { getCareerStageById } from './data/careers'
import { pickDealer } from './data/dealers'
import { setMusic } from '../audio/audioService'
import { getMusicForCareerStage } from '../audio/careerMusic'
import {
  createTrackingForPurchase,
  getDefaultPlayerLocation,
  updateTrackingPackageProgress,
} from './data/trackingRoutes'
import {
  calculateWorkshopBlueprints,
  calculateMaisonHeritage,
  calculateNostalgiaPoints,
  WORKSHOP_UPGRADES,
  MAISON_UPGRADES,
  NOSTALGIA_UPGRADES,
} from './prestige'

type UnknownAction = { type: string }
type ActionOf<TType extends Action['type']> = Extract<Action, { type: TType }>

function removeFirst<T>(arr: readonly T[], predicate: (item: T) => boolean): T[] | null {
  const idx = arr.findIndex(predicate)
  if (idx === -1) return null
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)]
}

function addUnique(arr: readonly string[], value: string): string[] | null {
  if (arr.includes(value)) return null
  return [...arr, value]
}

function addUniqueUnlock(arr: readonly UnlockId[], unlockId: UnlockId): UnlockId[] | null {
  if (arr.includes(unlockId)) return null
  return [...arr, unlockId]
}

function addToast(arr: readonly Toast[], toast: Toast): Toast[] {
  return [...arr, toast]
}

function getTrackingState(state: GameState): NonNullable<GameState['packageTracking']> {
  return (
    state.packageTracking ?? {
      inTransit: [],
      delivered: [],
      playerLocation: getDefaultPlayerLocation(state.careerStage),
    }
  )
}

function createMailToast(mail: MailItem): Toast | null {
  if (mail.read) return null

  if (mail.type === 'acceptance-letter') {
    return {
      id: `mail-toast-${mail.id}`,
      title: 'Important Letter',
      message: mail.subject,
      createdAtMs: mail.receivedAtMs,
      kind: 'letter',
      sender: mail.from,
      durationMs: 5000,
    }
  }

  if (mail.type === 'shipping-notification') return null

  if (mail.type === 'package-arrived') {
    return {
      id: `mail-toast-${mail.id}`,
      title: 'Package Arrived!',
      message: `From ${mail.from}`,
      createdAtMs: mail.receivedAtMs,
      kind: 'package',
      sender: mail.from,
      watchId: mail.watchId,
      durationMs: 5000,
    }
  }

  return {
    id: `mail-toast-${mail.id}`,
    title: mail.subject,
    message: `From ${mail.from}`,
    createdAtMs: mail.receivedAtMs,
    kind: 'system',
    sender: mail.from,
    durationMs: 4000,
  }
}

function pickDeliveryDelayMs(): { delayMs: number; reason: string | null } {
  const roll = Math.random()

  if (roll < 0.75) {
    return {
      delayMs: 10_000 + Math.floor(Math.random() * 11_000),
      reason: null,
    }
  }

  if (roll < 0.95) {
    const reasons = ['Weather delay', 'Customs processing', 'Carrier routing update'] as const
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    return {
      delayMs: 20_000 + Math.floor(Math.random() * 41_000),
      reason,
    }
  }

  const reasons = ['Severe weather hold', 'International customs hold', 'Port congestion'] as const
  const reason = reasons[Math.floor(Math.random() * reasons.length)]
  return {
    delayMs: 60_000 + Math.floor(Math.random() * 61_000),
    reason,
  }
}

// Story 7.7: Memory Optimization - Limit interaction history to last 100 entries
const MAX_INTERACTION_HISTORY = 100
// Story 7.7: Memory Optimization - Keep last 50 mail items
const MAX_MAIL_ITEMS = 50

function addInteraction(arr: readonly InteractionRecord[], record: InteractionRecord): InteractionRecord[] {
  const newArr = [...arr, record]
  // Trim to max size from the beginning (oldest first)
  if (newArr.length > MAX_INTERACTION_HISTORY) {
    return newArr.slice(newArr.length - MAX_INTERACTION_HISTORY)
  }
  return newArr
}

// Story 7.7: Memory Optimization - Prune old mail items
function pruneMail(arr: readonly MailItem[]): MailItem[] {
  if (arr.length <= MAX_MAIL_ITEMS) return [...arr]
  // Keep last 50 items, sorted by receivedAtMs
  return [...arr]
    .sort((a, b) => a.receivedAtMs - b.receivedAtMs)
    .slice(-MAX_MAIL_ITEMS)
}

function getDecayedConsecutiveSessions(state: GameState, nowMs: number): GameState['consecutiveSessions'] {
  const current = state.consecutiveSessions
  const stageBaseCost = getCareerStageById(state.careerStage)?.enjoymentCost
  if (stageBaseCost === undefined) return current

  const { decayedCount } = calculateSessionCost(stageBaseCost, state, nowMs)
  if (decayedCount === current.count) return current

  return {
    ...current,
    count: decayedCount,
    decayStartedAt: decayedCount > 0 ? current.decayStartedAt : undefined,
  }
}

export function gameReducer(state: GameState, action: Action | UnknownAction): GameState {
  let next: GameState = state
  switch (action.type) {
    case 'EARN_CURRENCY_CENTS': {
      const { amountCents } = action as ActionOf<'EARN_CURRENCY_CENTS'>
      next = { ...state, currencyCents: clampCurrencyCents(state.currencyCents + amountCents) }
      break
    }
    case 'SPEND_CURRENCY_CENTS': {
      const { amountCents } = action as ActionOf<'SPEND_CURRENCY_CENTS'>
      const remaining = state.currencyCents - amountCents
      if (remaining < 0) return state
      next = { ...state, currencyCents: clampCurrencyCents(remaining) }
      break
    }
    case 'GAIN_ENJOYMENT': {
      const { delta } = action as ActionOf<'GAIN_ENJOYMENT'>
      next = { ...state, enjoyment: state.enjoyment + delta }
      break
    }
    case 'GAIN_LOVE': {
      const { delta } = action as ActionOf<'GAIN_LOVE'>
      next = { ...state, love: state.love + delta }
      break
    }
    case 'GAIN_CAREER_XP': {
      const { delta } = action as ActionOf<'GAIN_CAREER_XP'>
      next = { ...state, careerXp: state.careerXp + delta }
      break
    }
    case 'SET_CAREER_STAGE': {
      const { stage } = action as ActionOf<'SET_CAREER_STAGE'>
      if (stage === 'PhDStudent' && state.careerStage !== 'pre-phd' && state.careerStage !== 'PhDStudent') {
        return state
      }
      // Unlock home life items for the new stage
      const unlockIds = getUnlockIdsForStage(stage)
      const newUnlockedItems = unlockIds.filter((id) => !state.unlockedHomeItems.includes(id))
      const newUnlockedHomeItems = newUnlockedItems.length > 0
        ? [...state.unlockedHomeItems, ...newUnlockedItems]
        : state.unlockedHomeItems
      const tracking = getTrackingState(state)
      const nextLocation = stage === 'Retirement' ? tracking.playerLocation : getDefaultPlayerLocation(stage)
      next = {
        ...state,
        careerStage: stage,
        unlockedHomeItems: newUnlockedHomeItems,
        packageTracking: { ...tracking, playerLocation: nextLocation },
      }
      // Update music for new career stage
      setMusic(getMusicForCareerStage(stage))
      break
    }
    case 'ADVANCE_CAREER': {
      if (!canAdvanceCareer(state)) return state
      const nextCareerStage = getNextCareerStage(state)
      if (!nextCareerStage) return state
      // Unlock home life items for the new stage
      const unlockIds = getUnlockIdsForStage(nextCareerStage)
      const newUnlockedItems = unlockIds.filter((id) => !state.unlockedHomeItems.includes(id))
      const newUnlockedHomeItems = newUnlockedItems.length > 0
        ? [...state.unlockedHomeItems, ...newUnlockedItems]
        : state.unlockedHomeItems
      const tracking = getTrackingState(state)
      const nextLocation =
        nextCareerStage === 'Retirement' ? tracking.playerLocation : getDefaultPlayerLocation(nextCareerStage)
      next = {
        ...state,
        careerStage: nextCareerStage,
        unlockedHomeItems: newUnlockedHomeItems,
        packageTracking: { ...tracking, playerLocation: nextLocation },
      }
      // Update music for new career stage
      setMusic(getMusicForCareerStage(nextCareerStage))
      break
    }
    case 'ADD_OWNED_WATCH': {
      const { watchId } = action as ActionOf<'ADD_OWNED_WATCH'>
      const ownedWatchIds = addUnique(state.ownedWatchIds, watchId)
      if (!ownedWatchIds) return state
      next = { ...state, ownedWatchIds }
      break
    }
    case 'SIM_TICK': {
      const { dtMs } = action as ActionOf<'SIM_TICK'>
      let ticked = step(state, dtMs)
      ticked = {
        ...ticked,
        consecutiveSessions: getDecayedConsecutiveSessions(ticked, ticked.clockMs),
      }
      const trackingState = getTrackingState(ticked)
      const progressedInTransit = trackingState.inTransit.map((pkg) =>
        updateTrackingPackageProgress(pkg, ticked.clockMs),
      )

      // Check for arrived packages
      const arrived = ticked.pendingPackages.filter((p) => p.arrivalAtMs <= ticked.clockMs)
      if (arrived.length > 0) {
        // Create package-arrived mail for each arrived package
        const arrivedMail = arrived.map((p) => ({
          id: `package-arrived-${p.watchId}-${p.arrivalAtMs}`,
          type: 'package-arrived' as const,
          subject: 'Package Delivered',
          from: p.dealer,
          body: `Your watch has arrived! Click to open your package.`,
          receivedAtMs: p.arrivalAtMs,
          read: false,
          watchId: p.watchId,
          trackingNumber: p.trackingNumber,
        }))
        const arrivedToasts = arrivedMail
          .map((mail) => createMailToast(mail))
          .filter((toast): toast is Toast => toast !== null)
        const remainingPackages = ticked.pendingPackages.filter((p) => p.arrivalAtMs > ticked.clockMs)
        const deliveredPackageIds = new Set(arrived.map((p) => p.id))
        const deliveredFromTransit = progressedInTransit
          .filter((pkg) => deliveredPackageIds.has(pkg.id))
          .map((pkg) => ({ ...pkg, deliveredAt: ticked.clockMs }))
        const stillInTransit = progressedInTransit.filter((pkg) => !deliveredPackageIds.has(pkg.id))

        ticked = {
          ...ticked,
          pendingPackages: remainingPackages,
          mail: pruneMail([...ticked.mail, ...arrivedMail]),
          pendingToasts: [...ticked.pendingToasts, ...arrivedToasts],
          packageTracking: {
            ...trackingState,
            inTransit: stillInTransit,
            delivered: [...trackingState.delivered, ...deliveredFromTransit],
          },
        }
      } else {
        ticked = {
          ...ticked,
          packageTracking: {
            ...trackingState,
            inTransit: progressedInTransit,
          },
        }
      }
      next = ticked
      break
    }
    case 'LOAD_SAVE': {
      const { state: loadedState } = action as ActionOf<'LOAD_SAVE'>
      next = loadedState
      break
    }
    case 'QUEUE_TOAST': {
      const { toast } = action as ActionOf<'QUEUE_TOAST'>
      next = { ...state, pendingToasts: addToast(state.pendingToasts, toast) }
      break
    }
    case 'DISMISS_TOAST': {
      const { toastId } = action as ActionOf<'DISMISS_TOAST'>
      const pendingToasts = removeFirst(state.pendingToasts, (t) => t.id === toastId)
      if (!pendingToasts) return state
      next = { ...state, pendingToasts }
      break
    }
    case 'QUEUE_UNLOCK': {
      const { unlockId } = action as ActionOf<'QUEUE_UNLOCK'>
      const pendingUnlocks = addUniqueUnlock(state.pendingUnlocks, unlockId)
      if (!pendingUnlocks) return state
      next = { ...state, pendingUnlocks }
      break
    }
    case 'ACKNOWLEDGE_UNLOCK': {
      const { unlockId } = action as ActionOf<'ACKNOWLEDGE_UNLOCK'>
      const pendingUnlocks = removeFirst(
        state.pendingUnlocks,
        (id) => id === unlockId,
      )
      if (!pendingUnlocks) return state
      next = { ...state, pendingUnlocks }
      break
    }
    case 'RECORD_INTERACTION': {
      const { record } = action as ActionOf<'RECORD_INTERACTION'>
      next = { ...state, interactionHistory: addInteraction(state.interactionHistory, record) }
      break
    }
    case 'COMPLETE_THERAPY_SESSION': {
      const { payload } = action as ActionOf<'COMPLETE_THERAPY_SESSION'>
      // Only complete if onboarding is done and not in pre-phd stage
      if (!state.onboardingComplete) return state
      if (state.careerStage === 'pre-phd') return state

      const baseEnjoymentCost = getCareerStageById(state.careerStage)?.enjoymentCost
      if (baseEnjoymentCost === undefined) return state

      const costInfo = calculateSessionCost(baseEnjoymentCost, state, payload.nowMs)
      if (costInfo.decayedCount >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE) return state

      const stageBaseIncomeCents = getTherapySessionBaseIncomeCents(state)
      if (stageBaseIncomeCents === null) return state
      // Check if enough enjoyment to pay cost
      if (state.enjoyment < costInfo.cost) return state

      const cashRewardCents = Math.max(stageBaseIncomeCents, payload.cashCents)
      const nextConsecutiveCount = Math.min(costInfo.decayedCount + 1, CONSECUTIVE_CONFIG.MAX_CONSECUTIVE)

      next = {
        ...state,
        enjoyment: Math.max(0, state.enjoyment - costInfo.cost),
        currencyCents: clampCurrencyCents(state.currencyCents + cashRewardCents),
        careerXp: state.careerXp + payload.xp,
        therapyCooldownUntilMs: payload.nowMs + PHD_SESSION_COOLDOWN_MS,
        consecutiveSessions: {
          count: nextConsecutiveCount,
          lastSessionTime: payload.nowMs,
          decayStartedAt: payload.nowMs + PHD_SESSION_COOLDOWN_MS,
        },
      }
      break
    }
    case 'PURCHASE_WATCH': {
      const { watchId } = action as ActionOf<'PURCHASE_WATCH'>
      if (state.ownedWatchIds.includes(watchId)) return state
      const trackingState = getTrackingState(state)
      if (state.pendingPackages.some((pkg) => pkg.watchId === watchId)) return state
      if (trackingState.inTransit.some((pkg) => pkg.watchId === watchId)) return state
      if (trackingState.delivered.some((pkg) => pkg.watchId === watchId)) return state
      const watch = getWatchById(watchId)
      if (!watch) return state
      if (watch.priceCents > state.currencyCents) return state
      // Awarded watches cannot be purchased
      if (watch.isAwarded) return state

      const currencyCents = clampCurrencyCents(state.currencyCents - watch.priceCents)

      // Generate tracking number and create pending package
      const nowMs = state.clockMs
      const dealer = pickDealer()
      const trackingNumber = `W${Date.now().toString(36).toUpperCase()}`
      const { delayMs, reason: delayReason } = pickDeliveryDelayMs()
      const pendingPackage: PendingPackage = {
        id: `package-${watchId}-${nowMs}`,
        watchId,
        dealer,
        trackingNumber,
        shippedAtMs: nowMs,
        arrivalAtMs: nowMs + delayMs,
      }
      const tracking = createTrackingForPurchase({
        packageId: pendingPackage.id,
        watchId,
        dealerName: dealer,
        orderedAt: nowMs,
        estimatedDelivery: pendingPackage.arrivalAtMs,
        location: trackingState.playerLocation,
      })

      // Create shipping notification mail
      const shippingMail: MailItem = {
        id: `shipping-${watchId}-${nowMs}`,
        type: 'shipping-notification',
        subject: `Order Confirmed by ${dealer}`,
        from: dealer,
        body: `Your ${watch.name} has shipped from ${dealer}.\n\nTracking number: ${trackingNumber}\n\nEstimated arrival: ${Math.max(1, Math.round(delayMs / 1000))} seconds${delayReason ? `\nDelay reason: ${delayReason}` : ''}`,
        receivedAtMs: nowMs,
        read: true, // Mark shipping notification as read since it's just info
        watchId,
        trackingNumber,
      }

      next = {
        ...state,
        currencyCents,
        pendingPackages: [...state.pendingPackages, pendingPackage],
        mail: pruneMail([...state.mail, shippingMail]),
        packageTracking: {
          ...trackingState,
          inTransit: [...trackingState.inTransit, tracking],
        },
      }
      break
    }
    case 'COLLECT_PASSIVE_ENJOYMENT': {
      if (state.uncollectedEnjoyment <= 0) return state
      next = {
        ...state,
        enjoyment: state.enjoyment + state.uncollectedEnjoyment,
        uncollectedEnjoyment: 0,
      }
      break
    }
    case 'FAMILY_CHECKIN': {
      const { loveGained, nowMs } = action as ActionOf<'FAMILY_CHECKIN'>
      const lastCheckIn = state.lastFamilyCheckIn ?? 0
      const cooldownRemaining = lastCheckIn + 5 * 60 * 1000 - nowMs
      if (cooldownRemaining > 0) return state

      next = {
        ...state,
        love: state.love + loveGained,
        lastFamilyCheckIn: nowMs,
      }
      break
    }
    // Story 2.4: Onboarding and therapy session actions
    case 'COMPLETE_ONBOARDING': {
      // Check if acceptance letter has been read first
      const acceptanceLetter = state.mail.find((m) => m.type === 'acceptance-letter')
      if (!acceptanceLetter || !acceptanceLetter.read) return state
      if (state.onboardingComplete) return state
      if (state.careerStage !== 'pre-phd') return state
      // Unlock home life items for PhDStudent stage
      const unlockIds = getUnlockIdsForStage('PhDStudent')
      const newUnlockedItems = unlockIds.filter((id) => !state.unlockedHomeItems.includes(id))
      const newUnlockedHomeItems = newUnlockedItems.length > 0
        ? [...state.unlockedHomeItems, ...newUnlockedItems]
        : state.unlockedHomeItems
      next = {
        ...state,
        careerStage: 'PhDStudent',
        onboardingComplete: true,
        unlockedHomeItems: newUnlockedHomeItems,
        packageTracking: {
          ...getTrackingState(state),
          playerLocation: getDefaultPlayerLocation('PhDStudent'),
        },
      }
      break
    }
    case 'READ_ACCEPTANCE_LETTER': {
      // Mark the acceptance letter as read
      const letterMail = state.mail.find((m) => m.type === 'acceptance-letter')
      if (!letterMail) return state
      if (letterMail.read) return state
      next = {
        ...state,
        mail: state.mail.map((m) =>
          m.type === 'acceptance-letter' ? { ...m, read: true } : m,
        ),
      }
      break
    }
    case 'START_THERAPY_SESSION': {
      const { enjoymentCost } = action as ActionOf<'START_THERAPY_SESSION'>
      const baseEnjoymentCost = getCareerStageById(state.careerStage)?.enjoymentCost
      if (baseEnjoymentCost === undefined) return state
      const costInfo = calculateSessionCost(baseEnjoymentCost, state, state.clockMs)
      // Validate enjoymentCost matches expected cost
      if (enjoymentCost !== costInfo.cost) return state
      // Can only start therapy if onboarding is complete and career stage is past pre-phd
      if (!state.onboardingComplete) return state
      if (state.careerStage === 'pre-phd') return state
      if (costInfo.decayedCount >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE) return state
      // Check if enough enjoyment (but don't consume yet - only on completion)
      if (state.enjoyment < costInfo.cost) return state
      // Just validate - consumption happens on completion
      // Return new state object to maintain immutability
      next = {
        ...state,
        consecutiveSessions:
          costInfo.decayedCount !== state.consecutiveSessions.count
            ? {
                ...state.consecutiveSessions,
                count: costInfo.decayedCount,
                decayStartedAt: costInfo.decayedCount > 0 ? state.consecutiveSessions.decayStartedAt : undefined,
              }
            : state.consecutiveSessions,
      }
      break
    }
    // Mail system actions
    case 'ADD_MAIL': {
      const { mail } = action as ActionOf<'ADD_MAIL'>
      const toast = createMailToast(mail)
      next = {
        ...state,
        mail: pruneMail([...state.mail, mail]),
        pendingToasts: toast ? [...state.pendingToasts, toast] : state.pendingToasts,
      }
      break
    }
    case 'MARK_MAIL_READ': {
      const { mailId } = action as ActionOf<'MARK_MAIL_READ'>
      next = {
        ...state,
        mail: state.mail.map((m) => (m.id === mailId ? { ...m, read: true } : m)),
      }
      break
    }
    case 'OPEN_PACKAGE': {
      const { packageId } = action as ActionOf<'OPEN_PACKAGE'>
      const pkg = state.pendingPackages.find((p) => p.id === packageId)
      const trackingState = getTrackingState(state)
      const tracked =
        trackingState.inTransit.find((item) => item.id === packageId) ??
        trackingState.delivered.find((item) => item.id === packageId)
      const watchId = pkg?.watchId ?? tracked?.watchId
      if (!watchId) return state
      // Add watch to owned
      const ownedWatchIds = addUnique(state.ownedWatchIds, watchId)
      if (!ownedWatchIds) return state
      // Remove from pending packages
      const pendingPackages = state.pendingPackages.filter((p) => p.id !== packageId)

      next = {
        ...state,
        ownedWatchIds,
        pendingPackages,
        mail: state.mail.map((m) =>
          m.type === 'package-arrived' && m.watchId === watchId ? { ...m, read: true } : m,
        ),
      }
      break
    }
    case 'CHECK_PACKAGES': {
      const { nowMs } = action as ActionOf<'CHECK_PACKAGES'>
      const trackingState = getTrackingState(state)
      const progressedInTransit = trackingState.inTransit.map((pkg) => updateTrackingPackageProgress(pkg, nowMs))

      const arrived = state.pendingPackages.filter((p) => p.arrivalAtMs <= nowMs)
      if (arrived.length === 0) {
        next = {
          ...state,
          packageTracking: {
            ...trackingState,
            inTransit: progressedInTransit,
          },
        }
        break
      }
      // Create package-arrived mail for each arrived package
      const arrivedMail = arrived.map((p) => ({
        id: `package-arrived-${p.id}`,
        type: 'package-arrived' as const,
        subject: 'Package Delivered',
        from: p.dealer,
        body: `Your watch has arrived! Click to open your package.`,
        receivedAtMs: nowMs,
        read: false,
        watchId: p.watchId,
        trackingNumber: p.trackingNumber,
      }))
      const arrivedToasts = arrivedMail
        .map((mail) => createMailToast(mail))
        .filter((toast): toast is Toast => toast !== null)
      const remainingPackages = state.pendingPackages.filter((p) => p.arrivalAtMs > nowMs)
      const deliveredPackageIds = new Set(arrived.map((p) => p.id))
      const deliveredFromTransit = progressedInTransit
        .filter((pkg) => deliveredPackageIds.has(pkg.id))
        .map((pkg) => ({ ...pkg, deliveredAt: nowMs }))
      const stillInTransit = progressedInTransit.filter((pkg) => !deliveredPackageIds.has(pkg.id))

      next = {
        ...state,
        pendingPackages: remainingPackages,
        mail: pruneMail([...state.mail, ...arrivedMail]),
        pendingToasts: [...state.pendingToasts, ...arrivedToasts],
        packageTracking: {
          ...trackingState,
          inTransit: stillInTransit,
          delivered: [...trackingState.delivered, ...deliveredFromTransit],
        },
      }
      break
    }
    case 'CREATE_TRACKING': {
      const { tracking } = action as ActionOf<'CREATE_TRACKING'>
      const trackingState = getTrackingState(state)
      next = {
        ...state,
        packageTracking: {
          ...trackingState,
          inTransit: [...trackingState.inTransit, tracking],
        },
      }
      break
    }
    case 'UPDATE_TRACKING_PROGRESS': {
      const { packageId, nowMs } = action as ActionOf<'UPDATE_TRACKING_PROGRESS'>
      const trackingState = getTrackingState(state)
      next = {
        ...state,
        packageTracking: {
          ...trackingState,
          inTransit: trackingState.inTransit.map((pkg) =>
            pkg.id === packageId ? updateTrackingPackageProgress(pkg, nowMs) : pkg,
          ),
        },
      }
      break
    }
    case 'MARK_DELIVERED': {
      const { packageId, deliveredAt } = action as ActionOf<'MARK_DELIVERED'>
      const trackingState = getTrackingState(state)
      const item = trackingState.inTransit.find((pkg) => pkg.id === packageId)
      if (!item) return state
      next = {
        ...state,
        packageTracking: {
          ...trackingState,
          inTransit: trackingState.inTransit.filter((pkg) => pkg.id !== packageId),
          delivered: [...trackingState.delivered, { ...item, deliveredAt }],
        },
      }
      break
    }
    case 'SET_RETIREMENT_LOCATION': {
      const { location } = action as ActionOf<'SET_RETIREMENT_LOCATION'>
      const trackingState = getTrackingState(state)
      next = {
        ...state,
        packageTracking: {
          ...trackingState,
          playerLocation: location,
        },
      }
      break
    }
    case 'TICK_TRACKING': {
      const { nowMs } = action as ActionOf<'TICK_TRACKING'>
      const trackingState = getTrackingState(state)
      next = {
        ...state,
        packageTracking: {
          ...trackingState,
          inTransit: trackingState.inTransit.map((pkg) => updateTrackingPackageProgress(pkg, nowMs)),
        },
      }
      break
    }
    // Story 5-4: Workshop prestige actions
    case 'UNLOCK_WORKSHOP': {
      // Workshop can only be unlocked once
      if (state.prestige.workshop.unlocked) return state
      // Calculate blueprints based on career progress and owned watches
      const blueprints = calculateWorkshopBlueprints(state)
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          workshop: {
            unlocked: true,
            blueprints,
            upgrades: [],
          },
        },
      }
      break
    }
    case 'SPEND_BLUEPRINTS': {
      const { amount, upgradeId } = action as ActionOf<'SPEND_BLUEPRINTS'>
      if (!state.prestige.workshop.unlocked) return state
      if (state.prestige.workshop.blueprints < amount) return state
      if (state.prestige.workshop.upgrades.includes(upgradeId)) return state
      // Validate upgrade exists
      const workshopUpgrade = WORKSHOP_UPGRADES.find((u) => u.id === upgradeId)
      if (!workshopUpgrade) return state
      if (workshopUpgrade.cost !== amount) return state
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          workshop: {
            ...state.prestige.workshop,
            blueprints: state.prestige.workshop.blueprints - amount,
            upgrades: [...state.prestige.workshop.upgrades, upgradeId],
          },
        },
      }
      break
    }
    case 'GAIN_BLUEPRINTS': {
      const { amount } = action as ActionOf<'GAIN_BLUEPRINTS'>
      if (!state.prestige.workshop.unlocked) return state
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          workshop: {
            ...state.prestige.workshop,
            blueprints: state.prestige.workshop.blueprints + amount,
          },
        },
      }
      break
    }
    // Story 5-5: Maison prestige actions
    case 'UNLOCK_MAISON': {
      // Maison can only be unlocked once
      if (state.prestige.maison.unlocked) return state
      // Calculate heritage based on career progress
      const heritage = calculateMaisonHeritage(state)
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          maison: {
            unlocked: true,
            heritage,
            upgrades: [],
          },
        },
      }
      break
    }
    case 'SPEND_HERITAGE': {
      const { amount, upgradeId } = action as ActionOf<'SPEND_HERITAGE'>
      if (!state.prestige.maison.unlocked) return state
      if (state.prestige.maison.heritage < amount) return state
      if (state.prestige.maison.upgrades.includes(upgradeId)) return state
      // Validate upgrade exists
      const maisonUpgrade = MAISON_UPGRADES.find((u) => u.id === upgradeId)
      if (!maisonUpgrade) return state
      if (maisonUpgrade.cost !== amount) return state
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          maison: {
            ...state.prestige.maison,
            heritage: state.prestige.maison.heritage - amount,
            upgrades: [...state.prestige.maison.upgrades, upgradeId],
          },
        },
      }
      break
    }
    case 'GAIN_HERITAGE': {
      const { amount } = action as ActionOf<'GAIN_HERITAGE'>
      if (!state.prestige.maison.unlocked) return state
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          maison: {
            ...state.prestige.maison,
            heritage: state.prestige.maison.heritage + amount,
          },
        },
      }
      break
    }
    // Story 5-6: Nostalgia prestige actions
    case 'UNLOCK_NOSTALGIA': {
      // Nostalgia can only be unlocked once
      if (state.prestige.nostalgia.unlocked) return state
      // Calculate nostalgia points based on collection completion
      const points = calculateNostalgiaPoints(state)
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          nostalgia: {
            unlocked: true,
            points,
            upgrades: [],
            museumQuality: false,
          },
        },
      }
      break
    }
    case 'SPEND_NOSTALGIA_POINTS': {
      const { amount, upgradeId } = action as ActionOf<'SPEND_NOSTALGIA_POINTS'>
      if (!state.prestige.nostalgia.unlocked) return state
      if (state.prestige.nostalgia.points < amount) return state
      if (state.prestige.nostalgia.upgrades.includes(upgradeId)) return state
      // Validate upgrade exists
      const nostalgiaUpgrade = NOSTALGIA_UPGRADES.find((u) => u.id === upgradeId)
      if (!nostalgiaUpgrade) return state
      if (nostalgiaUpgrade.cost !== amount) return state

      // Check if this is the museum status upgrade
      const isMuseumUpgrade = upgradeId === 'museum-status'
      const museumQuality = isMuseumUpgrade
        ? true
        : state.prestige.nostalgia.museumQuality

      next = {
        ...state,
        prestige: {
          ...state.prestige,
          nostalgia: {
            ...state.prestige.nostalgia,
            points: state.prestige.nostalgia.points - amount,
            upgrades: [...state.prestige.nostalgia.upgrades, upgradeId],
            museumQuality,
          },
        },
      }
      break
    }
    case 'GAIN_NOSTALGIA_POINTS': {
      const { amount } = action as ActionOf<'GAIN_NOSTALGIA_POINTS'>
      if (!state.prestige.nostalgia.unlocked) return state
      next = {
        ...state,
        prestige: {
          ...state.prestige,
          nostalgia: {
            ...state.prestige.nostalgia,
            points: state.prestige.nostalgia.points + amount,
          },
        },
      }
      break
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const { achievementId } = action as ActionOf<'UNLOCK_ACHIEVEMENT'>
      const currentIds = state.unlockedAchievementIds ?? []
      if (currentIds.includes(achievementId)) return state
      next = {
        ...state,
        unlockedAchievementIds: [...currentIds, achievementId],
      }
      break
    }
    case 'RESET_ACHIEVEMENTS': {
      next = {
        ...state,
        unlockedAchievementIds: [],
      }
      break
    }
    default:
      return state
  }

  if (next === state) return state

  // LOAD_SAVE should restore persisted achievement state as-is.
  if (action.type === 'LOAD_SAVE') {
    return evaluateUnlocks(next)
  }

  const afterUnlocks = evaluateUnlocks(next)
  return evaluateAndUnlockAchievements(afterUnlocks)
}
