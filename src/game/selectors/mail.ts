import type { GameState, MailItem, Toast } from '../types'

export function unopenedMailCount(state: GameState): number {
  return state.mail.filter((item) => !item.read).length
}

export function activeToasts(state: GameState): Toast[] {
  return state.pendingToasts
}

export function inboxItems(state: GameState): MailItem[] {
  return [...state.mail].sort((a, b) => b.receivedAtMs - a.receivedAtMs)
}
