import { useState, useCallback, type ReactElement } from 'react'
import { Modal } from '../components/Modal'
import { GameInstructions, type GameInstructionData } from '../components/GameInstructions'
import { ResultScreen } from '../components/ResultScreen'
import type { InteractionRecord, GameType, Action } from '../../game/types'
import type { WatchTier } from '../../game/data/watches'
import {
  calculateMiniGameRewards,
  type MiniGameResult,
} from '../../game/selectors/rewards'

export type InteractionResult = {
  perfects: number
  goods: number
  misses: number
  durationMs: number
}

type MiniGameShellProps = {
  title: string
  gameType: GameType
  tier: WatchTier
  instructions: GameInstructionData
  renderGame: (props: { onComplete: (result: InteractionResult) => void }) => ReactElement
  onComplete?: (result: InteractionResult) => void
  onClose: () => void
  dispatch: (action: Action) => void
}

function createInteractionRecord(
  gameType: GameType,
  result: InteractionResult,
): InteractionRecord {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    gameType,
    perfects: result.perfects,
    goods: result.goods,
    misses: result.misses,
    durationMs: result.durationMs,
    createdAtMs: now,
  }
}

export function MiniGameShell({
  title,
  gameType,
  tier,
  instructions,
  renderGame,
  onComplete,
  onClose,
  dispatch,
}: MiniGameShellProps) {
  const [showResult, setShowResult] = useState(false)
  const [gameResult, setGameResult] = useState<MiniGameResult | null>(null)

  const handleGameComplete = useCallback(
    (result: InteractionResult) => {
      // Calculate rewards with tier multiplier
      const rewards = calculateMiniGameRewards({
        gameType,
        perfects: result.perfects,
        goods: result.goods,
        misses: result.misses,
        durationMs: result.durationMs,
        tier,
      })

      setGameResult(rewards)
      setShowResult(true)

      // Dispatch enjoyment reward
      dispatch({
        type: 'GAIN_ENJOYMENT',
        delta: rewards.totalReward,
      })

      // Record the interaction
      const record = createInteractionRecord(gameType, result)
      dispatch({ type: 'RECORD_INTERACTION', record })

      onComplete?.(result)
    },
    [dispatch, gameType, onComplete, tier]
  )

  const handleCloseResult = useCallback(() => {
    setShowResult(false)
    onClose()
  }, [onClose])

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setGameResult(null)
  }, [])

  return (
    <>
      <Modal title={title} onClose={onClose}>
        <div className="mini-game-shell" style={{ maxWidth: 480 }}>
          <GameInstructions
            goal={instructions.goal}
            howToPlay={instructions.howToPlay}
            reward={instructions.reward}
          />
          <div style={{ marginTop: 20 }}>
            {renderGame({ onComplete: handleGameComplete })}
          </div>
        </div>
      </Modal>

      {/* Result Screen */}
      {showResult && gameResult && (
        <ResultScreen
          result={gameResult}
          onClose={handleCloseResult}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  )
}
