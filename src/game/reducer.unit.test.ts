import { describe, expect, it, vi } from 'vitest'
import { gameReducer } from './reducer'
import { initialGameState, type GameState } from './types'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const v of Object.values(value as Record<string, unknown>)) {
      deepFreeze(v)
    }
  }
  return value
}

describe('gameReducer', () => {
  it('returns the same state reference for unknown action types', () => {
    const state = initialGameState
    const next = gameReducer(state, { type: 'SOME_UNKNOWN_ACTION' })
    expect(next).toBe(state)
  })

  it('returns a new state reference for a state-changing action', () => {
    const state = initialGameState
    const next = gameReducer(state, { type: 'EARN_CURRENCY_CENTS', amountCents: 1 })
    expect(next).not.toBe(state)
    expect(next.currencyCents).toBe(1)
    expect(state.currencyCents).toBe(0)
  })

  it('does not mutate input state or nested arrays', () => {
    const state: GameState = {
      ...initialGameState,
      ownedWatchIds: [],
      pendingToasts: [],
      pendingUnlocks: [],
    }
    deepFreeze(state)
    const next = gameReducer(state, { type: 'ADD_OWNED_WATCH', watchId: 'seiko-5-snk' })
    expect(next).not.toBe(state)
    expect(next.ownedWatchIds).toEqual(['seiko-5-snk'])
  })

  it('prevents currency from going negative', () => {
    const state = { ...initialGameState, currencyCents: 5 }
    const next = gameReducer(state, { type: 'SPEND_CURRENCY_CENTS', amountCents: 10 })
    expect(next).toBe(state)
  })

  it('prevents duplicate ownedWatchIds', () => {
    const state = { ...initialGameState, ownedWatchIds: ['rolex-submariner'] }
    const next = gameReducer(state, { type: 'ADD_OWNED_WATCH', watchId: 'rolex-submariner' })
    expect(next).toBe(state)
  })

  it('dismisses exactly one toast by id', () => {
    const state: GameState = {
      ...initialGameState,
      pendingToasts: [
        { id: 't-1', message: 'hi', createdAtMs: 1 },
        { id: 't-1', message: 'hi again', createdAtMs: 2 },
      ],
    }
    const next = gameReducer(state, { type: 'DISMISS_TOAST', toastId: 't-1' })
    expect(next).not.toBe(state)
    expect(next.pendingToasts).toHaveLength(1)
    expect(next.pendingToasts[0]?.createdAtMs).toBe(2)
  })

  it('acknowledges (removes) exactly one pending unlock by id', () => {
    const state: GameState = {
      ...initialGameState,
      pendingUnlocks: ['home-photo-1', 'home-photo-1'],
    }
    // Even if a bad state existed, acknowledge should remove only one entry deterministically.
    const next = gameReducer(state, { type: 'ACKNOWLEDGE_UNLOCK', unlockId: 'home-photo-1' })
    expect(next).not.toBe(state)
    expect(next.pendingUnlocks).toEqual(['home-photo-1'])
  })

  it('records interactions via RECORD_INTERACTION', () => {
    const state: GameState = {
      ...initialGameState,
      interactionHistory: [],
    }
    const next = gameReducer(state, {
      type: 'RECORD_INTERACTION',
      record: {
        id: 'i-1',
        gameType: 'quartz-alignment',
        perfects: 2,
        goods: 1,
        misses: 0,
        durationMs: 1234,
        createdAtMs: 1,
      },
    })
    expect(next).not.toBe(state)
    expect(next.interactionHistory).toHaveLength(1)
    expect(next.interactionHistory[0]?.id).toBe('i-1')
  })

  it('completes a therapy session by consuming enjoyment and awarding cash/xp with cooldown', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      enjoyment: 6,
      currencyCents: 0,
      careerXp: 0,
      therapyCooldownUntilMs: 0,
    }

    const nowMs = 1_000
    const next = gameReducer(state, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 50_00, xp: 10, nowMs },
    })
    expect(next).not.toBe(state)
    expect(next.enjoyment).toBeLessThan(state.enjoyment)
    expect(next.currencyCents).toBeGreaterThan(state.currencyCents)
    expect(next.careerXp).toBeGreaterThan(state.careerXp)
    expect(next.therapyCooldownUntilMs).toBeGreaterThan(nowMs)
    expect(next.consecutiveSessions.count).toBe(1)

    // Not enough enjoyment for consecutive cost, so this run is blocked.
    const blocked = gameReducer(next, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 50_00, xp: 10, nowMs: nowMs + 1 },
    })
    expect(blocked).toBe(next)
  })

  it('applies stage base income floor during therapy completion', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'Externship',
      onboardingComplete: true,
      enjoyment: 8,
      currencyCents: 0,
      careerXp: 0,
      therapyCooldownUntilMs: 0,
    }

    const next = gameReducer(state, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 0, xp: 10, nowMs: 10_000 },
    })

    expect(next).not.toBe(state)
    expect(next.currencyCents).toBe(25)
  })

  it('purchases a watch by deducting cash and creating a pending package', () => {
    const state: GameState = {
      ...initialGameState,
      currencyCents: 10_000,
      ownedWatchIds: [],
    }
    const next = gameReducer(state, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    expect(next).not.toBe(state)
    expect(next.currencyCents).toBeLessThan(state.currencyCents)
    // Watch is NOT immediately added to owned - it's in transit
    expect(next.ownedWatchIds).not.toContain('timex-weekender')
    // A pending package is created
    expect(next.pendingPackages.length).toBe(1)
    expect(next.pendingPackages[0]?.watchId).toBe('timex-weekender')
    expect(next.pendingPackages[0]?.dealer).toBeTruthy()
    expect(next.pendingPackages[0]?.trackingNumber).toBeTruthy()
    expect(next.packageTracking?.inTransit.length).toBe(1)
    expect(next.packageTracking?.inTransit[0]?.dealerName).toBe(next.pendingPackages[0]?.dealer)
    // Shipping notification mail is created
    expect(next.mail.length).toBeGreaterThan(state.mail.length)
    const shippingMail = next.mail.find((m) => m.type === 'shipping-notification')
    expect(shippingMail).toBeDefined()
  })

  it('creates a package toast with dealer when delivery arrives', () => {
    const purchaseState: GameState = {
      ...initialGameState,
      currencyCents: 10_000,
      pendingToasts: [],
    }

    const afterPurchase = gameReducer(purchaseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const deliveryTime = (afterPurchase.pendingPackages[0]?.arrivalAtMs ?? 0) + 1
    const afterDelivery = gameReducer(afterPurchase, { type: 'CHECK_PACKAGES', nowMs: deliveryTime })

    const packageMail = afterDelivery.mail.find((m) => m.type === 'package-arrived')
    const packageToast = afterDelivery.pendingToasts.find((t) => t.kind === 'package')

    expect(packageMail).toBeDefined()
    expect(packageMail?.from).toBeTruthy()
    expect(packageToast).toBeDefined()
    expect(packageToast?.sender).toBe(packageMail?.from)
    expect(packageToast?.watchId).toBe(packageMail?.watchId)
  })

  it('moves tracking package to delivered on SIM_TICK delivery', () => {
    const purchaseState: GameState = {
      ...initialGameState,
      currencyCents: 10_000,
      clockMs: 0,
    }

    const afterPurchase = gameReducer(purchaseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const arrivalAt = afterPurchase.pendingPackages[0]?.arrivalAtMs ?? 0
    const afterTick = gameReducer(afterPurchase, { type: 'SIM_TICK', dtMs: arrivalAt + 1 })

    expect(afterTick.pendingPackages).toHaveLength(0)
    expect(afterTick.packageTracking?.inTransit).toHaveLength(0)
    expect(afterTick.packageTracking?.delivered).toHaveLength(1)
  })

  it('opens delivered package and marks matching package-arrived mail as read', () => {
    const purchaseState: GameState = {
      ...initialGameState,
      currencyCents: 10_000,
      pendingToasts: [],
    }

    const afterPurchase = gameReducer(purchaseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const deliveryTime = (afterPurchase.pendingPackages[0]?.arrivalAtMs ?? 0) + 1
    const afterDelivery = gameReducer(afterPurchase, { type: 'CHECK_PACKAGES', nowMs: deliveryTime })
    const packageId = afterPurchase.pendingPackages[0]?.id ?? 'missing'

    const opened = gameReducer(afterDelivery, { type: 'OPEN_PACKAGE', packageId })

    expect(opened.ownedWatchIds).toContain('timex-weekender')
    expect(
      opened.mail.some(
        (m) => m.type === 'package-arrived' && m.watchId === 'timex-weekender' && m.read === false,
      ),
    ).toBe(false)
  })

  it('uses weighted delivery windows for purchase timing', () => {
    const baseState: GameState = {
      ...initialGameState,
      currencyCents: 10_000,
      ownedWatchIds: [],
    }

    const randomSpy = vi.spyOn(Math, 'random')

    randomSpy.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.0)
    const fast = gameReducer(baseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const fastDelay = (fast.pendingPackages[0]?.arrivalAtMs ?? 0) - (fast.pendingPackages[0]?.shippedAtMs ?? 0)
    expect(fastDelay).toBeGreaterThanOrEqual(10_000)
    expect(fastDelay).toBeLessThanOrEqual(20_999)

    randomSpy.mockReturnValueOnce(0.0).mockReturnValueOnce(0.9).mockReturnValueOnce(0.0).mockReturnValueOnce(0.0)
    const medium = gameReducer(baseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const mediumDelay = (medium.pendingPackages[0]?.arrivalAtMs ?? 0) - (medium.pendingPackages[0]?.shippedAtMs ?? 0)
    expect(mediumDelay).toBeGreaterThanOrEqual(20_000)
    expect(mediumDelay).toBeLessThanOrEqual(60_999)

    randomSpy.mockReturnValueOnce(0.0).mockReturnValueOnce(0.99).mockReturnValueOnce(0.0).mockReturnValueOnce(0.0)
    const long = gameReducer(baseState, { type: 'PURCHASE_WATCH', watchId: 'timex-weekender' })
    const longDelay = (long.pendingPackages[0]?.arrivalAtMs ?? 0) - (long.pendingPackages[0]?.shippedAtMs ?? 0)
    expect(longDelay).toBeGreaterThanOrEqual(60_000)
    expect(longDelay).toBeLessThanOrEqual(120_999)

    randomSpy.mockRestore()
  })

  it('creates unique package-arrived ids for multiple packages of same watch', () => {
    const state: GameState = {
      ...initialGameState,
      pendingPackages: [
        {
          id: 'package-a',
          watchId: 'timex-weekender',
          dealer: 'Ethan',
          trackingNumber: 'A',
          shippedAtMs: 1,
          arrivalAtMs: 10,
        },
        {
          id: 'package-b',
          watchId: 'timex-weekender',
          dealer: 'Lena',
          trackingNumber: 'B',
          shippedAtMs: 2,
          arrivalAtMs: 10,
        },
      ],
    }

    const next = gameReducer(state, { type: 'CHECK_PACKAGES', nowMs: 11 })
    const arrivedIds = next.mail
      .filter((mail) => mail.type === 'package-arrived')
      .map((mail) => mail.id)

    expect(new Set(arrivedIds).size).toBe(arrivedIds.length)
  })

  it('collects passive enjoyment into enjoyment and clears uncollected', () => {
    const state: GameState = {
      ...initialGameState,
      enjoyment: 0,
      uncollectedEnjoyment: 2.5,
    }
    const next = gameReducer(state, { type: 'COLLECT_PASSIVE_ENJOYMENT' })
    expect(next).not.toBe(state)
    expect(next.enjoyment).toBe(2.5)
    expect(next.uncollectedEnjoyment).toBe(0)
  })

  it('advances career stage when XP meets threshold and enqueues stage unlocks', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      careerXp: 100,
      pendingUnlocks: [],
      triggeredUnlockIds: {},
    }

    const next = gameReducer(state, { type: 'ADVANCE_CAREER' })

    expect(next).not.toBe(state)
    expect(next.careerStage).toBe('Externship')
    expect(next.pendingUnlocks).toContain('career-Externship-manual')
    expect(next.pendingUnlocks).toContain('career-Externship-celebration')
    expect(next.pendingUnlocks).toContain('home-photo-externship')
    expect(next.pendingUnlocks).toContain('ryan-message-externship')
  })

  it('does not advance career stage when XP is below threshold', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      careerXp: 99,
    }

    const next = gameReducer(state, { type: 'ADVANCE_CAREER' })
    expect(next).toBe(state)
  })

  it('prevents direct stage entry to PhDStudent from later stages', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'Externship',
      onboardingComplete: true,
    }

    const next = gameReducer(state, { type: 'SET_CAREER_STAGE', stage: 'PhDStudent' })
    expect(next).toBe(state)
  })
})
