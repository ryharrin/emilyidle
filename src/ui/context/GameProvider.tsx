import { useMemo, useReducer, type ReactNode } from 'react'
import { gameReducer } from '../../game/reducer'
import { initialGameState } from '../../game/types'
import { GameContext } from './GameContext'

export function GameProvider(props: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <GameContext.Provider value={value}>{props.children}</GameContext.Provider>
}

