/**
 * Victory Sequence Component
 * Orchestrates the endgame sequence
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { VictoryMessage } from './VictoryMessage'
import { FamilyPhotoScene } from './FamilyPhotoScene'
import { AchievementShowcase } from './AchievementShowcase'
import { Credits } from '../components/Credits'
import { VictoryComplete } from './VictoryComplete'
import { setMusic } from '../../audio/audioService'
import type { GameState } from '../../game/types'
import './victorySequence.css'

type VictoryScene = 'message' | 'photos' | 'achievements' | 'credits' | 'complete'

interface VictorySequenceProps {
  state: GameState
  onComplete: () => void
  onExit: () => void
}

const SCENE_DURATION: Record<VictoryScene, number> = {
  message: 180000,    // 3 minutes
  photos: 90000,      // 1.5 minutes
  achievements: 30000, // 30 seconds
  credits: 60000,     // 1 minute
  complete: Infinity, // Manual advance
}

/**
 * Victory Sequence
 * Manages the endgame experience
 */
export function VictorySequence({ state, onComplete, onExit }: VictorySequenceProps) {
  const [currentScene, setCurrentScene] = useState<VictoryScene>('message')
  const [autoAdvance] = useState(true)

  // Start victory music when sequence begins
  useEffect(() => {
    setMusic('ending')
    return () => {
      // Restore normal music on unmount
      setMusic(null)
    }
  }, [])

  const advanceScene = useCallback(() => {
    setCurrentScene((current) => {
      switch (current) {
        case 'message':
          return 'photos'
        case 'photos':
          return 'achievements'
        case 'achievements':
          return 'credits'
        case 'credits':
          return 'complete'
        case 'complete':
          return 'complete'
      }
    })
  }, [])

  // Auto-advance scenes
  useEffect(() => {
    if (!autoAdvance || currentScene === 'complete') return

    const duration = SCENE_DURATION[currentScene]
    const timer = setTimeout(() => {
      advanceScene()
    }, duration)

    return () => clearTimeout(timer)
  }, [advanceScene, autoAdvance, currentScene])

  const handleSceneClick = useCallback(() => {
    if (currentScene === 'complete') {
      onComplete()
    } else {
      advanceScene()
    }
  }, [currentScene, advanceScene, onComplete])

  return (
    <div className="victory-sequence" onClick={handleSceneClick}>
      <AnimatePresence mode="wait">
        {currentScene === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <VictoryMessage state={state} />
          </motion.div>
        )}

        {currentScene === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <FamilyPhotoScene state={state} />
          </motion.div>
        )}

        {currentScene === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <AchievementShowcase state={state} />
          </motion.div>
        )}

        {currentScene === 'credits' && (
          <motion.div
            key="credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Credits onComplete={advanceScene} onSkip={advanceScene} />
          </motion.div>
        )}

        {currentScene === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VictoryComplete state={state} onContinue={onComplete} onExit={onExit} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="victory-progress">
        {(['message', 'photos', 'achievements', 'credits', 'complete'] as VictoryScene[]).map(
          (scene, index) => (
            <div
              key={scene}
              className={`progress-dot ${currentScene === scene ? 'active' : ''} ${
                ['message', 'photos', 'achievements', 'credits', 'complete'].indexOf(currentScene) >
                index
                  ? 'completed'
                  : ''
              }`}
            />
          )
        )}
      </div>

      {/* Tap to continue hint */}
      {currentScene !== 'complete' && (
        <motion.p
          className="tap-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Tap to continue
        </motion.p>
      )}
    </div>
  )
}
