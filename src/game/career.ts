import type { CareerStage, GameState } from './types'
import { CAREER_STAGES, getCareerStageById } from './data/careers'
import { CONSECUTIVE_CONFIG } from './constants'

export const PHD_SESSION_ENJOYMENT_COST = 1 as const
export const PHD_SESSION_CASH_REWARD_CENTS = 75_00 as const
export const PHD_SESSION_XP_REWARD = 10 as const
export const PHD_SESSION_COOLDOWN_MS = 20_000 as const
export const MAX_COOLDOWN_MS = 300_000 as const // 5 minutes max guardrail
export const MAX_THERAPY_COOLDOWN_MS = 60_000 as const // therapy UI should stay under 60s
export const FAMILY_CHECKIN_COOLDOWN_MS = 300_000 as const

function getDecayAnchor(state: GameState): number {
  if (state.consecutiveSessions.decayStartedAt !== undefined) {
    return state.consecutiveSessions.decayStartedAt
  }
  return Math.max(state.consecutiveSessions.lastSessionTime, state.therapyCooldownUntilMs)
}

export function calculateDecayedCount(state: GameState, currentTime: number): number {
  const count = state.consecutiveSessions.count
  if (count <= 0) return 0

  const decayAnchor = getDecayAnchor(state)
  const elapsedMs = Math.max(0, currentTime - decayAnchor)
  const intervalsPassed = Math.floor(elapsedMs / CONSECUTIVE_CONFIG.DECAY_INTERVAL_MS)
  const decayedBy = intervalsPassed * CONSECUTIVE_CONFIG.DECAY_PER_INTERVAL
  return Math.max(0, count - decayedBy)
}

export function calculateDecayRemainingMs(state: GameState, currentCount: number, currentTime: number): number {
  if (currentCount <= 0) return 0

  const decayAnchor = getDecayAnchor(state)
  const elapsedMs = Math.max(0, currentTime - decayAnchor)
  const intervalsNeeded = Math.ceil(currentCount / CONSECUTIVE_CONFIG.DECAY_PER_INTERVAL)
  const totalDecayMs = intervalsNeeded * CONSECUTIVE_CONFIG.DECAY_INTERVAL_MS
  return Math.max(0, totalDecayMs - elapsedMs)
}

export function calculateSessionCost(baseCost: number, state: GameState, currentTime: number): {
  cost: number
  multiplier: number
  decayedCount: number
  decayRemainingMs: number
} {
  const cooldownExpired = state.therapyCooldownUntilMs > 0 && currentTime >= state.therapyCooldownUntilMs
  const decayedCount = cooldownExpired ? 0 : calculateDecayedCount(state, currentTime)
  const multiplier = CONSECUTIVE_CONFIG.BASE_MULTIPLIER + CONSECUTIVE_CONFIG.MULTIPLIER_INCREMENT * decayedCount
  const cost = Math.max(0, Math.round(baseCost * multiplier))
  return {
    cost,
    multiplier,
    decayedCount,
    decayRemainingMs: calculateDecayRemainingMs(state, decayedCount, currentTime),
  }
}

export function getTherapyCooldownRemaining(state: GameState): number {
  const remaining = Math.max(0, state.therapyCooldownUntilMs - state.clockMs)
  return Math.min(remaining, MAX_THERAPY_COOLDOWN_MS)
}

export function getFamilyCheckInCooldownRemaining(state: GameState): number {
  const lastCheckIn = state.lastFamilyCheckIn ?? 0
  // If lastCheckIn is 0, treat as "never checked in" - no cooldown
  if (lastCheckIn === 0) return 0
  const remaining = Math.max(0, lastCheckIn + FAMILY_CHECKIN_COOLDOWN_MS - state.clockMs)
  return Math.min(remaining, MAX_COOLDOWN_MS)
}

function getCareerStageIndex(stage: CareerStage): number {
  if (stage === 'pre-phd') return -1
  return CAREER_STAGES.findIndex((item) => item.id === stage)
}

function getNextCareerStageId(stage: CareerStage): Exclude<CareerStage, 'pre-phd'> | null {
  const index = getCareerStageIndex(stage)
  if (index === -1) return CAREER_STAGES[0]?.id ?? null
  return CAREER_STAGES[index + 1]?.id ?? null
}

export function getNextStageXpTarget(stage: CareerStage): number | null {
  const nextStageId = getNextCareerStageId(stage)
  if (!nextStageId) return null
  const nextStage = getCareerStageById(nextStageId)
  return nextStage?.xpRequired ?? null
}

export function getCareerProgress(state: GameState): {
  stage: CareerStage
  xp: number
  nextTargetXp: number | null
  ratio: number
} {
  if (state.careerStage === 'pre-phd') {
    return {
      stage: state.careerStage,
      xp: state.careerXp,
      nextTargetXp: 0,
      ratio: 0,
    }
  }

  const currentStage = getCareerStageById(state.careerStage)
  const nextTargetXp = getNextStageXpTarget(state.careerStage)
  const currentStageXp = currentStage?.xpRequired ?? 0
  const xpSpan = nextTargetXp === null ? 0 : nextTargetXp - currentStageXp

  const ratio =
    nextTargetXp === null || xpSpan <= 0
      ? 1
      : Math.max(0, Math.min(1, (state.careerXp - currentStageXp) / xpSpan))

  return { stage: state.careerStage, xp: state.careerXp, nextTargetXp, ratio }
}

export function canAdvanceCareer(state: GameState): boolean {
  if (state.careerStage === 'pre-phd') return false
  const nextTargetXp = getNextStageXpTarget(state.careerStage)
  if (nextTargetXp === null) return false
  return state.careerXp >= nextTargetXp
}

export function getNextCareerStage(state: GameState): Exclude<CareerStage, 'pre-phd'> | null {
  return getNextCareerStageId(state.careerStage)
}

export function getTherapySessionEnjoymentCost(state: GameState): number | null {
  const currentStage = getCareerStageById(state.careerStage)
  if (!currentStage) return null

  const { cost } = calculateSessionCost(currentStage.enjoymentCost, state, state.clockMs)
  return cost
}

export function getTherapySessionBaseIncomeCents(state: GameState): number | null {
  const currentStage = getCareerStageById(state.careerStage)
  if (!currentStage) return null
  return currentStage.incomePerSecCents
}

export function canCompleteTherapySession(state: GameState, nowMs: number): boolean {
  if (!state.onboardingComplete) return false
  if (state.careerStage === 'pre-phd') return false

  const baseCost = getCareerStageById(state.careerStage)?.enjoymentCost
  if (baseCost === undefined) return false

  const { cost, decayedCount } = calculateSessionCost(baseCost, state, nowMs)
  if (decayedCount >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE) return false

  return state.enjoyment >= cost
}

export function getConsecutiveSessionCostState(state: GameState): {
  baseCost: number
  scaledCost: number
  multiplier: number
  consecutiveCount: number
  canAfford: boolean
  decayRemainingMs: number
  isAtMaxConsecutive: boolean
} | null {
  const currentStage = getCareerStageById(state.careerStage)
  if (!currentStage) return null

  const baseCost = currentStage.enjoymentCost
  const costInfo = calculateSessionCost(baseCost, state, state.clockMs)
  return {
    baseCost,
    scaledCost: costInfo.cost,
    multiplier: costInfo.multiplier,
    consecutiveCount: costInfo.decayedCount,
    canAfford: state.enjoyment >= costInfo.cost,
    decayRemainingMs: costInfo.decayRemainingMs,
    isAtMaxConsecutive: costInfo.decayedCount >= CONSECUTIVE_CONFIG.MAX_CONSECUTIVE,
  }
}
