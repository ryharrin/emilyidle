/**
 * Victory Complete Component
 * Final screen showing completion stats and options
 */

import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { GameState } from '../../game/types'
import './victoryComplete.css'

interface VictoryCompleteProps {
  state: GameState
  onContinue: () => void
  onExit: () => void
}

/**
 * Victory Complete Screen
 * Shows final stats and provides options to continue or exit
 */
export function VictoryComplete({ state, onContinue, onExit }: VictoryCompleteProps) {
  const stats = useMemo(() => {
    const hoursPlayed = Math.floor(state.clockMs / (1000 * 60 * 60))
    const completionDate = new Date().toLocaleDateString()

    return {
      hoursPlayed,
      watchesOwned: state.ownedWatchIds.length,
      homeItems: state.unlockedHomeItems.length,
      careerXp: state.careerXp.toLocaleString(),
      completionDate,
    }
  }, [state])

  return (
    <div className="victory-complete">
      <motion.div
        className="victory-badge"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <span className="badge-icon">🏆</span>
      </motion.div>

      <h1 className="victory-title">Journey Complete</h1>
      <p className="victory-subtitle">At Last</p>

      <div className="victory-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.hoursPlayed}</span>
          <span className="stat-label">Hours Played</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.watchesOwned}</span>
          <span className="stat-label">Watches Collected</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.homeItems}</span>
          <span className="stat-label">Memories Unlocked</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.careerXp}</span>
          <span className="stat-label">Career XP</span>
        </div>
      </div>

      <p className="completion-date">Completed on {stats.completionDate}</p>

      <div className="victory-actions">
        <button className="victory-button primary" onClick={onContinue} type="button">
          Continue Playing
        </button>
        <button className="victory-button secondary" onClick={onExit} type="button">
          Return to Home
        </button>
      </div>
    </div>
  )
}
