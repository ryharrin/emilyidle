import { useContext } from 'react'
import { GameContext } from '../context/GameContext'
import type { Action, GameState } from '../../game/types'

export function useGameState(): GameState {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameState must be used inside GameProvider')
  return ctx.state
}

export function useGameDispatch(): React.Dispatch<Action> {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameDispatch must be used inside GameProvider')
  return ctx.dispatch
}
