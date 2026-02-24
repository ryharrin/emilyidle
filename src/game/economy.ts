import type { GameState } from './types'
import { MAX_CURRENCY_CENTS } from './constants'

export function clampCurrencyCents(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value <= 0) return 0
  if (value >= MAX_CURRENCY_CENTS) return MAX_CURRENCY_CENTS
  return Math.floor(value)
}

export function applyRateCentsPerSecond(rateCentsPerSecond: number, dtMs: number): number {
  // AC: rate * dtMs / 1000
  const delta = (rateCentsPerSecond * dtMs) / 1000
  if (!Number.isFinite(delta) || delta <= 0) return 0
  return Math.floor(delta)
}

export function formatCurrencyCents(cents: number): string {
  const clamped = clampCurrencyCents(cents)
  const dollars = Math.floor(clamped / 100)
  const remainder = clamped % 100
  return `$${dollars.toLocaleString()}.${String(remainder).padStart(2, '0')}`
}

export function getCurrencyDisplay(state: GameState): string {
  return formatCurrencyCents(state.currencyCents)
}
